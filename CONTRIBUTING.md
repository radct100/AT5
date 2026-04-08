# Contributing Guidelines

Thank you for your interest in contributing to the Homebridge Air Touch 5 plugin!

## How to Contribute

### Reporting Bugs

- Check if the bug has already been reported in the [Issues](https://github.com/radct100/AT5/issues) section
- Provide detailed information about:
  - Your Air Touch 5 system configuration
  - Homebridge version
  - Node.js version
  - Steps to reproduce the bug
  - Error logs from Homebridge

### Suggesting Features

- Clearly describe the feature or enhancement
- Explain why it would be useful
- Provide examples if possible

### Submitting Pull Requests

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes
4. Ensure code follows the project's style guidelines:
   ```bash
   npm run lint
   ```
5. Build the project:
   ```bash
   npm run build
   ```
6. Test your changes thoroughly
7. Commit with clear, descriptive messages
8. Push to your fork
9. Submit a pull request with:
   - Clear description of changes
   - Reference to any related issues
   - Details about testing performed

## Development Setup

### Clone and Install

```bash
git clone https://github.com/radct100/AT5.git
cd AT5
npm install
```

### Build and Watch

```bash
# Build once
npm run build

# Watch for changes
npm run watch
```

### Testing with Mock Server

```bash
# Terminal 1: Start the mock server
node mock-server.js 8080

# Terminal 2: Configure Homebridge with the mock server and run it
homebridge -U ~/.homebridge -D
```

### Code Style

- Use TypeScript for all source files
- Follow the ESLint configuration
- Use 2-space indentation
- Use single quotes for strings
- Use descriptive variable and function names

## Project Structure

```
/workspaces/AT5/
├── src/
│   ├── index.ts          # Plugin entry point
│   ├── settings.ts       # Constants
│   ├── platform.ts       # Main platform class
│   ├── accessory.ts      # Accessory implementation
│   └── client.ts         # API client
├── dist/                 # Compiled JavaScript (generated)
├── package.json          # Project dependencies
├── tsconfig.json         # TypeScript configuration
├── .eslintrc.json        # ESLint configuration
└── README.md             # Project documentation
```

## Testing Checklist

Before submitting a PR, ensure:

- [ ] Code builds without errors: `npm run build`
- [ ] No lint errors: `npm run lint`
- [ ] Plugin loads in Homebridge without errors
- [ ] System control works (power, mode, temperature)
- [ ] Zone control works (power, percentage)
- [ ] Status updates properly
- [ ] Tested with both real device and mock server

## Release Process

1. Update version in `package.json`
2. Update `CHANGELOG.md` (if exists)
3. Commit changes
4. Create a git tag: `git tag v1.0.0`
5. Push changes and tags
6. Publish to npm: `npm publish`

## Questions or Need Help?

- Open an issue on GitHub
- Check the documentation files:
  - [README.md](README.md) - Main documentation
  - [QUICKSTART.md](QUICKSTART.md) - Quick start guide
  - [API.md](API.md) - API specification

## License

By contributing to this project, you agree that your contributions will be licensed under the Apache 2.0 License.
