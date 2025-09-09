# How to Contribute

This document is for contributors who want to work on the Markpage project.

## Project Structure

This is a monorepo with the following packages:

- **`packages/markpage`** - The main package that gets published to npm
- **`packages/markpage-svelte`** - Svelte integration package (components in markdown)
- **`packages/tests`** - Comprehensive test suite for the package
- **`packages/website`** - This documentation website

## Prerequisites

- Node.js 18+
- npm

## Setup

```bash
# Install dependencies for all packages
npm ci

# Build all packages
npm run build:pkgs

# Run tests
npm test
```

## Package Scripts

### Root Scripts
- `npm run build` - Build all packages and the website
- `npm run build:pkgs` - Build markpage and markpage-svelte packages
- `npm test` - Build packages and run all tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run dev:website` - Start the documentation website
- `npm run build:website` - Build the documentation website

### Individual Package Scripts
- `npm run dev --workspace=markpage` - Watch mode for the main package
- `npm run build --workspace=@markpage/svelte` - Build the Svelte package
- `npm run check --workspace=@markpage/website` - Run Svelte type checks

## Development Workflow

### Building

The main package uses [tsup](https://github.com/egoist/tsup) for building:

```bash
# Build all packages
npm run build:pkgs

# Or build individual packages
npm run build --workspace=markpage
npm run build --workspace=@markpage/svelte
```

### Testing

Tests are run using Vitest and must be kept green:

```bash
# Run all tests (builds packages first)
npm test

# Watch mode for development
npm run test:watch

# Coverage report
npm run test:coverage
```

### Website Development

The documentation website is built with SvelteKit and auto-builds content from `./docs`:

```bash
# Start dev server (auto-builds content)
npm run dev:website

# Build for production
npm run build:website

# Preview production build
npm --workspace=@markpage/website run preview
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
- Svelte 5 with runes mode for components
- Comprehensive test coverage (keep tests green)
- Follow existing patterns and conventions

## Package Publishing

Packages are published from their respective directories:

```bash
# Main package
cd packages/markpage
npm publish

# Svelte integration
cd packages/markpage-svelte
npm publish
```

## License

MIT License - see [LICENSE](https://github.com/mitkury/markpage/blob/main/LICENSE) file for details.
