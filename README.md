# magic-images

A powerful and flexible command-line tool for converting images between different formats with support for batch processing and ZIP output.

## 🚀 Features

- **Format Conversion**: Convert images between JPG, PNG, and WebP formats
- **Batch Processing**: Process entire directories of images at once
- **Recursive Processing**: Optionally process subdirectories recursively
- **Quality Control**: Set JPEG quality (1-100) for output images
- **ZIP Output**: Optionally package results as a ZIP archive
- **Preserve Structure**: Maintains directory structure during conversion
- **Interactive Prompts**: Asks for confirmation when overwriting directories

## 🔧 Installation

```bash
npm install -g @m9ch/magic-images
```

## 📖 Usage

### Basic Command Structure

```bash
magic-images convert <path> [options]
```

### Options

| Option | Alias | Description | Default |
|--------|-------|-------------|---------|
| `--format <format>` | `-f` | Output format (webp, jpg, png) | `jpg` |
| `--quality <number>` | `-q` | JPEG quality (1-100) | `95` |
| `--output <output>` | `-o` | Output directory | `./output` |
| `--recursive` | `-r` | Process subdirectories recursively | `false` |
| `--zip` | | Output as a ZIP archive instead of directory | `false` |

### Examples

#### Convert a single file to PNG

```bash
magic-images convert image.jpg -f png
```

#### Convert a single file with custom quality

```bash
magic-images convert image.jpg -f jpg -q 80
```

#### Process entire directory (non-recursive)

```bash
magic-images convert /path/to/images -f webp -o /path/to/output
```

#### Process directory recursively

```bash
magic-images convert /path/to/images -f png -r
```

#### Output as ZIP archive

```bash
magic-images convert /path/to/images --zip -f jpg -o my-converted-images.zip
```

## 🛠️ Development

### Prerequisites

- Node.js (v18 or higher)
- pnpm (recommended)

### Setup

```bash
# Clone the repository
git clone https://github.com/your-username/magic-images.git
cd magic-images

# Install dependencies
pnpm install

# Build the project
pnpm build
```

### Scripts

- `pnpm build` - Build the project
- `pnpm dev` - Build in watch mode
- `pnpm format` - Format code with Prettier
- `pnpm lint` - Lint code
- `pnpm test` - Run tests

### Architecture

The project is built using:

- **[rslib](https://rslib.rs/)** - For building the library
- **[sharp](https://sharp.pixelplumbing.com/)** - For image processing
- **[commander.js](https://github.com/tj/commander.js)** - For CLI parsing
- **[archiver](https://www.archiverjs.com/)** - For ZIP creation
- **TypeScript** - For type safety

## 🧪 Tests

Run the test suite:

```bash
pnpm test
```

The project includes comprehensive unit tests covering:

- Image format detection
- File validation and error handling
- Directory processing with recursive option
- ZIP functionality
- Output directory handling

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### How to contribute

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for your changes
5. Run the test suite (`pnpm test`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

## 🐛 Issues

If you encounter any issues or have feature requests, please [create an issue](https://github.com/your-username/magic-images/issues) on GitHub.

## ✨ Acknowledgments

- [sharp](https://sharp.pixelplumbing.com/) - The fastest image processing library for Node.js
- [commander.js](https://github.com/tj/commander.js) - Elegant CLI framework
- [archiver](https://www.archiverjs.com/) - Streaming archive interface

## 🧠 Developed with Qwen-Code

This project was developed using **Qwen-Code** - an AI-powered coding assistant that helps with code generation, debugging, and project development.

Qwen-Code provides intelligent code completion, bug detection, and project scaffolding capabilities to accelerate development workflows.
