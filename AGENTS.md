# magic-images - Project Specifications for AI Assistants

## Project Overview
- **Name**: magic-images
- **Type**: Command-line tool for image format conversion
- **Language**: TypeScript
- **Build System**: rslib (ESM/CJS dual builds)
- **Architecture**: Node.js CLI application with modular design

## Core Functionality

### Main Command
- `magic-images convert <path> [options]`
- Converts images between formats (webp, jpg, png)
- Supports single file and batch directory processing

### Key Features
1. **Format Conversion**: 
   - Supports webp, jpg, png formats
   - Default output format: jpg
   - JPEG quality control (1-100, default 95)

2. **Input Modes**:
   - Single file conversion
   - Directory batch processing
   - Recursive directory processing with `-r` flag

3. **Output Modes**:
   - Directory output (default: ./output)
   - ZIP archive output with `--zip` flag
   - Preserves directory structure

4. **User Experience**:
   - Interactive prompts for directory overwrite confirmation
   - Clear error messages for unsupported formats
   - Format validation and quality validation

### Image Format Detection
- Uses magic byte signatures to detect file formats
- JPEG: 0xFFD8FFxx
- PNG: 0x89504E470D0A1A0A
- WebP: RIFFxxxxxxWEBP

### Technical Implementation
- **File I/O**: Uses Node.js native modules (fs/promises, path)
- **Image Processing**: Sharp library for conversion
- **CLI Parsing**: Commander.js for command-line interface
- **ZIP Creation**: Archiver library
- **Interactive Prompts**: Node.js readline interface
- **Directory Traversal**: Recursive file system operations
- **Error Handling**: Comprehensive validation and error reporting

## Code Structure
- `src/index.ts`: Main implementation with modular functions
- `bin/magic-images.js`: CLI entry point
- `tests/`: Unit tests using Vitest

## Key Functions
- `convertImages()`: Main orchestrator function
- `getImageFormat()`: Format detection using magic bytes
- `processFile()`: Single file processing with directory preservation
- `processDirectory()`: Recursive directory processing
- `createZipArchive()`: ZIP creation functionality
- `ensureOutputDirectory()`: Output directory handling with user prompts

## Error Handling
- Validates input formats
- Validates quality parameters for JPEG
- Handles file system errors
- Provides user-friendly error messages

## Testing
- Comprehensive unit tests with Vitest
- Tests cover all major functionality paths
- Mock files used for testing without requiring real image data
- Error scenario testing included

## Dependencies
- `sharp`: Image processing
- `commander`: CLI parsing
- `archiver`: ZIP creation
- `rslib`: Build system
- Development: Vitest, TypeScript, ESLint

## Development Workflow
- Uses pnpm for package management
- Build with `pnpm build`
- Test with `pnpm test`
- Format with `pnpm format`
- Lint with `pnpm lint`

## Additional Information

### Rslib Commands

- `pnpm run build` - Build the library for production
- `pnpm run dev` - Turn on watch mode, watch for changes and rebuild the library

### Rslib Documentation

- Rslib: https://rslib.rs/zh/guide/start/quick-start
- Rsbuild: https://rsbuild.dev/
- Rspack: https://rspack.dev/

### Testing and Code Quality Tools

#### Vitest

- Run `pnpm run test` to test your code

#### ESLint

- Run `pnpm run lint` to lint your code

#### Prettier

- Run `pnpm run format` to format your code
