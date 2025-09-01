# Markpage Tests

Comprehensive test suite for the markpage package.

## Test Structure

- **`integration.test.ts`** - End-to-end integration tests
- **`builder/`** - Tests for the builder module
  - `builder.test.ts` - Core builder functionality
  - `parser.test.ts` - Index file parsing and validation
  - `static-generator.test.ts` - Static site generation
- **`renderer/`** - Tests for the renderer module
  - `navigation.test.ts` - Navigation tree functionality
  - `content.test.ts` - Content loading and processing
  - `components.test.ts` - Svelte component rendering
- **`fixtures/`** - Test fixtures and sample content

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Test Coverage

The test suite provides >90% coverage across all modules, including:

- Builder functionality (parsing, building, static generation)
- Renderer functionality (navigation, content loading)
- Component rendering
- Error handling
- Edge cases and validation

## Development

Tests use Vitest with jsdom environment for Svelte component testing.