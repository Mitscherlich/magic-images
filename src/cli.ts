#!/usr/bin/env node

import { program } from 'commander';
import { convertImages } from './index.js';

// Define the CLI
program
  .name('magic-images')
  .description('CLI tool for image format conversion')
  .version('1.0.0');

program
  .command('convert')
  .description('Convert image format')
  .argument('<path>', 'path to image file or directory')
  .option('-f, --format <format>', 'output format (webp, jpg, png)', 'jpg')
  .option('-q, --quality <number>', 'JPEG quality (1-100)', '95')
  .option('-o, --output <output>', 'output directory')
  .option('-r, --recursive', 'convert files in subdirectories recursively')
  .option('--zip', 'output as a zip archive instead of directory')
  .action(async (path, options) => {
    try {
      await convertImages(path, options);
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error:', error.message);
      } else {
        console.error('Error:', String(error));
      }
      process.exit(1);
    }
  });

program.parse();