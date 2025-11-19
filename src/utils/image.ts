import * as fsPromises from 'fs/promises';

/**
 * Determines the image format by reading the file's magic bytes
 * This is more efficient than using Sharp for format detection alone
 */
export async function getImageFormat(filePath: string): Promise<string | null> {
  try {
    const fileHandle = await fsPromises.open(filePath, 'r');
    try {
      // Read first 12 bytes to check magic numbers
      const buffer = Buffer.alloc(12);
      const { bytesRead } = await fileHandle.read(buffer, 0, 12, 0);
      
      if (bytesRead < 4) {
        return null; // File too small to be an image
      }
      
      // Check for JPEG (starts with 0xFFD8)
      if (buffer[0] === 0xFF && buffer[1] === 0xD8) {
        return 'jpg'; // Normalize to 'jpg' for consistency with the API
      }
      
      // Check for PNG (starts with 0x89PNG\r\n\x1A\n)
      if (
        buffer[0] === 0x89 && 
        buffer[1] === 0x50 && 
        buffer[2] === 0x4E && 
        buffer[3] === 0x47
      ) {
        return 'png';
      }
      
      // Check for WebP (has RIFF header and WEBP signature)
      if (
        buffer[0] === 0x52 && // 'R'
        buffer[1] === 0x49 && // 'I' 
        buffer[2] === 0x46 && // 'F'
        buffer[3] === 0x46 && // 'F'
        bytesRead >= 12 &&
        buffer[8] === 0x57 && // 'W'
        buffer[9] === 0x45 && // 'E'
        buffer[10] === 0x42 && // 'B'
        buffer[11] === 0x50   // 'P'
      ) {
        return 'webp';
      }
      
      return null;
    } finally {
      await fileHandle.close();
    }
  } catch {
    return null;
  }
}


