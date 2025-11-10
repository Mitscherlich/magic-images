import * as fsPromises from 'fs/promises';
import * as path from 'path';
import * as readline from 'readline';
import { createWriteStream } from 'fs';
import Sharp from 'sharp';
import Archiver from 'archiver';

export interface ConvertOptions {
  format: string;
  quality: string;
  output?: string;
  recursive: boolean;
  zip: boolean;
}


/**
 * Determines the image format by reading the file's magic bytes
 */
export async function getImageFormat(filePath: string): Promise<string | null> {
  try {
    const buffer = await fsPromises.readFile(filePath);
    const header = buffer.slice(0, 12);
    
    // Check for JPEG
    if (header[0] === 0xFF && header[1] === 0xD8 && header[2] === 0xFF) {
      return 'jpg';
    }
    
    // Check for PNG
    if (
      header[0] === 0x89 && 
      header[1] === 0x50 && 
      header[2] === 0x4E && 
      header[3] === 0x47 && 
      header[4] === 0x0D && 
      header[5] === 0x0A && 
      header[6] === 0x1A && 
      header[7] === 0x0A
    ) {
      return 'png';
    }
    
    // Check for WebP
    if (
      header[0] === 0x52 && 
      header[1] === 0x49 && 
      header[2] === 0x46 && 
      header[3] === 0x46 && 
      header[8] === 0x57 && 
      header[9] === 0x45 && 
      header[10] === 0x42 && 
      header[11] === 0x50
    ) {
      return 'webp';
    }
    
    return null;
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return null;
  }
}

/**
 * Validates the output format
 */
function validateFormat(format: string): boolean {
  const supportedFormats = ['jpg', 'jpeg', 'png', 'webp'];
  return supportedFormats.includes(format.toLowerCase());
}

/**
 * Validates the quality value
 */
function validateQuality(quality: string): boolean {
  const num = parseInt(quality, 10);
  return !isNaN(num) && num >= 1 && num <= 100;
}

/**
 * Prompts user for confirmation
 */
async function confirmAction(message: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  
  return new Promise((resolve) => {
    rl.question(`${message} (y/N): `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase().startsWith('y'));
    });
  });
}

/**
 * Converts an image to specified format
 */
async function convertImage(inputPath: string, outputPath: string, format: string, quality: number): Promise<void> {
  const image = Sharp(inputPath);
  
  let outputOptions = {};
  if (format === 'jpg' || format === 'jpeg') {
    outputOptions = { quality };
  }
  
  // Map formats to sharp-compatible format
  const sharpFormat = format === 'jpeg' ? 'jpg' : format;
  
  await image
    .toFormat(sharpFormat as keyof import('sharp').FormatEnum, outputOptions)
    .toFile(outputPath);
}

/**
 * Creates the output directory if it doesn't exist
 */
async function ensureOutputDirectory(outputDir: string): Promise<void> {
  try {
    await fsPromises.access(outputDir);
    // Directory exists, ask for permission to overwrite
    const confirmed = await confirmAction(`Output directory "${outputDir}" already exists. Do you want to proceed and potentially overwrite contents?`);
    if (!confirmed) {
      throw new Error('Operation cancelled by user');
    }
  } catch {
    // Directory doesn't exist, create it
    await fsPromises.mkdir(outputDir, { recursive: true });
  }
}

/**
 * Processes a single file
 */
async function processFile(inputPath: string, baseInputDir: string, outputDir: string, format: string, quality: number): Promise<void> {
  const inputFormat = await getImageFormat(inputPath);
  
  if (!inputFormat) {
    console.warn(`Skipping unsupported file: ${inputPath}`);
    return;
  }
  
  const fileName = path.basename(inputPath, path.extname(inputPath));
  const outputFileName = `${fileName}.${format}`;
  
  // Preserve directory structure relative to the base input directory
  const relativePath = path.relative(baseInputDir, inputPath);
  const relativeDir = path.dirname(relativePath);
  
  let outputFileDir = outputDir;
  if (relativeDir !== '.') {
    outputFileDir = path.join(outputDir, relativeDir);
    await fsPromises.mkdir(outputFileDir, { recursive: true });
  }
  
  const outputPath = path.join(outputFileDir, outputFileName);
  await convertImage(inputPath, outputPath, format, quality);
  
  console.log(`Converted: ${inputPath} -> ${outputPath}`);
}

/**
 * Processes all files in a directory
 */
async function processDirectory(currentDir: string, baseInputDir: string, outputDir: string, format: string, quality: number, recursive: boolean): Promise<void> {
  const items = await fsPromises.readdir(currentDir);
  
  for (const item of items) {
    const inputPath = path.join(currentDir, item);
    const stat = await fsPromises.stat(inputPath);
    
    if (stat.isDirectory()) {
      if (recursive) {
        // Recursively process the subdirectory
        await processDirectory(inputPath, baseInputDir, outputDir, format, quality, recursive);
      }
    } else {
      const imageFormat = await getImageFormat(inputPath);
      if (imageFormat) {
        await processFile(inputPath, baseInputDir, outputDir, format, quality);
      }
    }
  }
}

/**
 * Creates a zip archive from a directory
 */
async function createZipArchive(sourceDir: string, outputPath: string): Promise<void> {
  const output = createWriteStream(outputPath);
  const archive = Archiver('zip', {
    zlib: { level: 9 } // Sets the compression level
  });

  return new Promise((resolve, reject) => {
    output.on('close', () => {
      console.log(`Zipped ${archive.pointer()} total bytes`);
      resolve();
    });

    archive.on('error', (err: Error) => {
      reject(err);
    });

    archive.pipe(output);
    
    // Append all files from the source directory
    archive.directory(sourceDir, false);
    
    archive.finalize();
  });
}

/**
 * Main function to convert images
 */
export async function convertImages(inputPath: string, options: ConvertOptions): Promise<void> {
  const { format: rawFormat, quality: rawQuality, output: outputDir, recursive, zip } = options;
  const format = rawFormat.toLowerCase();
  
  // Validate format
  if (!validateFormat(format)) {
    throw new Error(`Unsupported format: ${format}. Supported formats: webp, jpg, png`);
  }
  
  // Validate quality if format is JPEG
  let quality = 95;
  if (format === 'jpg' || format === 'jpeg') {
    if (!validateQuality(rawQuality)) {
      throw new Error(`Invalid quality value: ${rawQuality}. Quality must be between 1 and 100`);
    }
    quality = parseInt(rawQuality, 10);
  }
  
  // Determine if input is a file or directory
  const inputStat = await fsPromises.stat(inputPath);
  const isFile = inputStat.isFile();
  
  if (zip) {
    // When zip is enabled, use a temporary directory for processing
    const tempDir = path.join(process.cwd(), '.magic-images-tmp-' + Date.now());
    let effectiveOutputDir = outputDir || './output.zip';
    
    // Ensure the output file has .zip extension
    if (!effectiveOutputDir.endsWith('.zip')) {
      effectiveOutputDir += '.zip';
    }
    
    try {
      // Process to temporary directory
      await ensureOutputDirectory(tempDir);
      
      if (isFile) {
        // Single file mode
        const inputFormat = await getImageFormat(inputPath);
        if (!inputFormat) {
          throw new Error(`Unsupported file format: ${inputPath}`);
        }
        
        await processFile(inputPath, inputPath, tempDir, format, quality);
      } else {
        // Directory mode - pass the base input directory for relative path calculation
        await processDirectory(inputPath, inputPath, tempDir, format, quality, recursive);
      }
      
      // Create zip archive from temporary directory
      await createZipArchive(tempDir, effectiveOutputDir);
      
      // Clean up temporary directory
      await fsPromises.rm(tempDir, { recursive: true, force: true });
      
      console.log(`Conversion completed successfully! Output: ${effectiveOutputDir}`);
    } catch (error) {
      // Clean up temporary directory on error
      await fsPromises.rm(tempDir, { recursive: true, force: true });
      throw error;
    }
  } else {
    // Regular directory output mode
    const effectiveOutputDir = outputDir || './output';
    
    // Ensure output directory exists
    await ensureOutputDirectory(effectiveOutputDir);
    
    if (isFile) {
      // Single file mode
      const inputFormat = await getImageFormat(inputPath);
      if (!inputFormat) {
        throw new Error(`Unsupported file format: ${inputPath}`);
      }
      
      await processFile(inputPath, inputPath, effectiveOutputDir, format, quality);
    } else {
      // Directory mode - pass the base input directory for relative path calculation
      await processDirectory(inputPath, inputPath, effectiveOutputDir, format, quality, recursive);
    }
    
    console.log('Conversion completed successfully!');
  }
}
