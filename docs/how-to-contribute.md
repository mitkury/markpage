# How to Contribute

This document is for contributors who want to work on the Markpage project.

## Project Structure

This is a monorepo with the following packages:

- **`packages/markpage`** - The main package that gets published to npm
- **`packages/tests`** - Comprehensive test suite for the package
- **`packages/website`** - This documentation website

## Prerequisites

- Node.js 18+
- npm

## Setup

```bash
# Install dependencies for all packages
npm install

# Build the main package
npm run build

# Run tests
npm test
```

## Package Scripts

- `npm run build` - Build the main markpage package
- `npm run dev` - Watch mode for the main package
- `npm test` - Run all tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report

## Development Workflow

### Building

The main package uses [tsup](https://github.com/egoist/tsup) for building:

```bash
cd packages/markpage
npm run build
```

### Testing

Tests are run using Vitest:

```bash
npm test
npm run test:watch
npm run test:coverage
```

### Website Development

The documentation website is built with SvelteKit:

```bash
cd packages/website
npm run dev
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## Code Style

- TypeScript for all source code
- ESLint for linting
- Prettier for code formatting
- Comprehensive test coverage (>90%)

## Package Publishing

The main package is published from `packages/markpage/`:

```bash
cd packages/markpage
npm publish
```

## License

MIT License - see [LICENSE](https://github.com/mitkury/markpage/blob/main/LICENSE) file for details.
