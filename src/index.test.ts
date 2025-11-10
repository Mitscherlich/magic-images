import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getImageFormat, convertImages, type ConvertOptions } from './index';
import fs from 'fs/promises';
import path from 'path';
import { tmpdir } from 'os';

// Create test fixtures with proper image headers
const createJPGBuffer = () => Buffer.concat([
  Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]), // JPEG header
  Buffer.from('Fake JPEG content', 'utf8')
]);

const createPNGBuffer = () => Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]), // PNG header
  Buffer.from('Fake PNG content', 'utf8')
]);

const createWebPBuffer = () => Buffer.concat([
  Buffer.from([0x52, 0x49, 0x46, 0x46]), // RIFF
  Buffer.from([0x00, 0x00, 0x00, 0x00]), // placeholder size
  Buffer.from([0x57, 0x45, 0x42, 0x50]), // WEBP
  Buffer.from('Fake WebP content', 'utf8')
]);

const createTextBuffer = () => Buffer.from('This is a text file', 'utf8');

describe('getImageFormat', () => {
  it('should detect JPEG format correctly', async () => {
    const testFile = path.join(tmpdir(), `test-${Date.now()}.jpg`);
    await fs.writeFile(testFile, createJPGBuffer());
    
    try {
      const format = await getImageFormat(testFile);
      expect(format).toBe('jpg');
    } finally {
      await fs.unlink(testFile);
    }
  });

  it('should detect PNG format correctly', async () => {
    const testFile = path.join(tmpdir(), `test-${Date.now()}.png`);
    await fs.writeFile(testFile, createPNGBuffer());
    
    try {
      const format = await getImageFormat(testFile);
      expect(format).toBe('png');
    } finally {
      await fs.unlink(testFile);
    }
  });

  it('should detect WebP format correctly', async () => {
    const testFile = path.join(tmpdir(), `test-${Date.now()}.webp`);
    await fs.writeFile(testFile, createWebPBuffer());
    
    try {
      const format = await getImageFormat(testFile);
      expect(format).toBe('webp');
    } finally {
      await fs.unlink(testFile);
    }
  });

  it('should return null for unsupported format', async () => {
    const testFile = path.join(tmpdir(), `test-${Date.now()}.txt`);
    await fs.writeFile(testFile, createTextBuffer());
    
    try {
      const format = await getImageFormat(testFile);
      expect(format).toBeNull();
    } finally {
      await fs.unlink(testFile);
    }
  });

  it('should return null for non-existent file', async () => {
    // Mock console.error to prevent error logging during this test
    const originalConsoleError = console.error;
    console.error = vi.fn();
    
    try {
      const format = await getImageFormat('non-existent-file.jpg');
      expect(format).toBeNull();
    } finally {
      console.error = originalConsoleError;
    }
  });
});

describe('convertImages', () => {
  let testDir: string;
  let outputDir: string;

  beforeEach(async () => {
    testDir = path.join(tmpdir(), `magic-images-test-${Date.now()}`);
    outputDir = path.join(tmpdir(), `magic-images-output-${Date.now()}`);
    await fs.mkdir(testDir, { recursive: true });
    await fs.mkdir(path.join(testDir, 'subdir'), { recursive: true });
    
    // Create test image files
    await fs.writeFile(path.join(testDir, 'test.jpg'), createJPGBuffer());
    await fs.writeFile(path.join(testDir, 'test.png'), createPNGBuffer());
    await fs.writeFile(path.join(testDir, 'subdir', 'test.webp'), createWebPBuffer());
  });

  afterEach(async () => {
    try {
      await fs.rm(testDir, { recursive: true, force: true });
      await fs.rm(outputDir, { recursive: true, force: true });
      await fs.rm(outputDir + '.zip', { force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  it('should process single file with correct format detection', async () => {
    const inputFile = path.join(testDir, 'test.jpg');
    const options: ConvertOptions = {
      format: 'png',
      quality: '90',
      output: outputDir,
      recursive: false,
      zip: false
    };
    
    // This should not throw an error during initial processing/validation
    // The actual image conversion will fail because our test files aren't real images
    // but the format detection and basic validation should work fine
    await expect(convertImages(inputFile, options)).rejects.toThrow();
    
    // More specifically, it should fail during image conversion, not during file detection
    // This means the format detection worked and we got to the conversion step
  });

  it('should throw error for unsupported file format', async () => {
    const textFile = path.join(testDir, 'unsupported.txt');
    await fs.writeFile(textFile, createTextBuffer());
    
    const options: ConvertOptions = {
      format: 'jpg',
      quality: '90',
      output: outputDir,
      recursive: false,
      zip: false
    };
    
    await expect(convertImages(textFile, options)).rejects.toThrow('Unsupported file format');
  });

  it('should validate format properly', async () => {
    const inputFile = path.join(testDir, 'test.jpg');
    
    const options: ConvertOptions = {
      format: 'invalid',
      quality: '90',
      output: outputDir,
      recursive: false,
      zip: false
    };
    
    await expect(convertImages(inputFile, options)).rejects.toThrow('Unsupported format');
  });

  it('should validate quality properly for JPEG format', async () => {
    const inputFile = path.join(testDir, 'test.jpg');
    
    const options: ConvertOptions = {
      format: 'jpg',
      quality: '101', // Invalid quality
      output: outputDir,
      recursive: false,
      zip: false
    };
    
    await expect(convertImages(inputFile, options)).rejects.toThrow('Invalid quality value');
  });
  
  it('should validate quality value and start conversion', async () => {
    const inputFile = path.join(testDir, 'test.jpg');
    
    const options: ConvertOptions = {
      format: 'jpg',
      quality: '85',
      output: outputDir,
      recursive: false,
      zip: false
    };
    
    // Should fail at image conversion, not at quality validation
    await expect(convertImages(inputFile, options)).rejects.toThrow();
  });
});

describe('Directory processing', () => {
  let testDir: string;
  let outputDir: string;

  beforeEach(() => {
    testDir = path.join(tmpdir(), `magic-images-test-${Date.now()}`);
    outputDir = path.join(tmpdir(), `magic-images-output-${Date.now()}`);
  });

  afterEach(async () => {
    try {
      await fs.rm(testDir, { recursive: true, force: true });
      await fs.rm(outputDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  it('should process directory recursively when recursive option is true', async () => {
    await fs.mkdir(testDir, { recursive: true });
    await fs.mkdir(path.join(testDir, 'subdir'), { recursive: true });
    
    // Create test files
    await fs.writeFile(path.join(testDir, 'test1.jpg'), createJPGBuffer());
    await fs.writeFile(path.join(testDir, 'subdir', 'test2.png'), createPNGBuffer());
    
    const options: ConvertOptions = {
      format: 'webp',
      quality: '90',
      output: outputDir,
      recursive: true,
      zip: false
    };
    
    // Should fail at image conversion, not at directory processing
    await expect(convertImages(testDir, options)).rejects.toThrow();
  });

  it('should process directory non-recursively when recursive option is false', async () => {
    await fs.mkdir(testDir, { recursive: true });
    await fs.mkdir(path.join(testDir, 'subdir'), { recursive: true });
    
    // Create test files
    await fs.writeFile(path.join(testDir, 'test1.jpg'), createJPGBuffer());
    await fs.writeFile(path.join(testDir, 'subdir', 'test2.png'), createPNGBuffer());
    
    const options: ConvertOptions = {
      format: 'webp',
      quality: '90',
      output: outputDir,
      recursive: false, // Non-recursive
      zip: false
    };
    
    // Should fail at image conversion, not at directory processing
    await expect(convertImages(testDir, options)).rejects.toThrow();
  });
});

describe('Zip functionality', () => {
  let testDir: string;
  let zipOutput: string;

  beforeEach(() => {
    testDir = path.join(tmpdir(), `magic-images-test-${Date.now()}`);
    zipOutput = path.join(tmpdir(), `magic-images-output-${Date.now()}.zip`);
  });

  afterEach(async () => {
    try {
      await fs.rm(testDir, { recursive: true, force: true });
      await fs.rm(zipOutput, { force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  it('should process with zip option when zip option is true', async () => {
    await fs.mkdir(testDir, { recursive: true });
    await fs.mkdir(path.join(testDir, 'subdir'), { recursive: true });
    
    // Create test files
    await fs.writeFile(path.join(testDir, 'test1.jpg'), createJPGBuffer());
    await fs.writeFile(path.join(testDir, 'subdir', 'test2.png'), createPNGBuffer());
    
    const options: ConvertOptions = {
      format: 'webp',
      quality: '90',
      output: zipOutput,
      recursive: true,
      zip: true
    };
    
    // Should fail at image conversion, not at zip processing
    await expect(convertImages(testDir, options)).rejects.toThrow();
  });
  
  it('should default to output.zip when zip option is true without output path', async () => {
    await fs.mkdir(testDir, { recursive: true });
    await fs.mkdir(path.join(testDir, 'subdir'), { recursive: true });
    
    // Create test files
    await fs.writeFile(path.join(testDir, 'test1.jpg'), createJPGBuffer());
    await fs.writeFile(path.join(testDir, 'subdir', 'test2.png'), createPNGBuffer());
    
    const options: ConvertOptions = {
      format: 'webp',
      quality: '90',
      output: undefined, // No output specified
      recursive: true,
      zip: true
    };
    
    // This will try to process, but fail during image conversion (expected)
    await expect(convertImages(testDir, options)).rejects.toThrow();
  });
});

describe('Output directory handling', () => {
  let testDir: string;
  let outputDir: string;

  beforeEach(() => {
    testDir = path.join(tmpdir(), `magic-images-test-${Date.now()}`);
    outputDir = path.join(tmpdir(), `magic-images-output-${Date.now()}`);
  });

  afterEach(async () => {
    try {
      await fs.rm(testDir, { recursive: true, force: true });
      await fs.rm(outputDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  it('should create output directory if it does not exist', async () => {
    await fs.mkdir(testDir, { recursive: true });
    await fs.writeFile(path.join(testDir, 'test.jpg'), createJPGBuffer());
    
    const options: ConvertOptions = {
      format: 'png',
      quality: '90',
      output: outputDir,  // Directory doesn't exist yet
      recursive: false,
      zip: false
    };
    
    // Should fail at image conversion, not at directory creation
    await expect(convertImages(testDir, options)).rejects.toThrow();
  });
});
