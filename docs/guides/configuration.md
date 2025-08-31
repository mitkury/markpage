# Configuration

Learn how to configure svelte-markdown-pages for your project with detailed options and examples.

## Basic Configuration

The simplest way to build your documentation:

```typescript
import { buildPages } from 'svelte-markdown-pages/builder';

await buildPages('./docs', {
  appOutput: './src/lib/content',
  includeContent: true
});
```

## Build Options

### `appOutput`
Directory where app-specific files will be generated.

```typescript
await buildPages('./docs', {
  appOutput: './src/lib/content'
});
```

**Generated files:**
- `navigation.json` - Navigation structure
- `content.json` - Content bundle (if `includeContent: true`)

### `websiteOutput`
Directory where website-specific files will be generated.

```typescript
await buildPages('./docs', {
  websiteOutput: './src/lib/content'
});
```

**Generated files:**
- `navigation.json` - Navigation structure
- `content.json` - Content bundle (if `includeContent: true`)

### `includeContent`
Whether to include content in the output bundle.

```typescript
await buildPages('./docs', {
  appOutput: './src/lib/content',
  includeContent: true  // Default: false
});
```

### `staticOutput`
Directory for static site generation.

```typescript
await buildPages('./docs', {
  staticOutput: './dist'
});
```

## Advanced Options

### Custom Processors

You can provide custom content processors for advanced transformations:

```typescript
const processor = {
  process(content: string): string {
    // Add table of contents
    return addTableOfContents(content);
  }
};

const result = await buildPages('./docs', {
  appOutput: './src/lib/content',
  processor
});
```

 

## Static Site Generation

Generate a complete static HTML site:

```typescript
import { generateStaticSite } from 'svelte-markdown-pages/builder';

const result = await generateStaticSite('./docs', './dist', {
  title: 'My Documentation',
  baseUrl: 'https://example.com',
  includeIndex: true
});
```

### Static Site Options

#### `title`
Site title for the generated HTML.

```typescript
await generateStaticSite('./docs', './dist', {
  title: 'My Awesome Documentation'
});
```

#### `baseUrl`
Base URL for the site (used for absolute links).

```typescript
await generateStaticSite('./docs', './dist', {
  baseUrl: 'https://docs.example.com'
});
```

#### `css`
Custom CSS content to include in the generated HTML.

```typescript
await generateStaticSite('./docs', './dist', {
  css: `
    body { font-family: 'Inter', sans-serif; }
    .docs-content { max-width: 800px; margin: 0 auto; }
  `
});
```

#### `js`
Custom JavaScript content to include in the generated HTML.

```typescript
await generateStaticSite('./docs', './dist', {
  js: `
    // Add syntax highlighting
    hljs.highlightAll();
  `
});
```

#### `includeIndex`
Whether to generate an index page.

```typescript
await generateStaticSite('./docs', './dist', {
  includeIndex: true  // Default: false
});
```

#### `indexTitle`
Title for the generated index page.

```typescript
await generateStaticSite('./docs', './dist', {
  includeIndex: true,
  indexTitle: 'Documentation Home'
});
```

## CLI Usage

### Build Command

Build documentation for app integration:

```bash
npx svelte-markdown-pages build <content-path> --output <output-path>
```

**Options:**
- `--output`: Output directory (required)

**Examples:**
```bash
# Basic build
npx svelte-markdown-pages build ./docs --output ./src/lib/content
```

### Static Command

Generate a complete static HTML site:

```bash
npx svelte-markdown-pages static <content-path> --output <output-path>
```

**Options:**
- `--output`: Output directory (required)

**Examples:**
```bash
# Basic static site
npx svelte-markdown-pages static ./docs --output ./dist
```

## Environment Variables

Configure behavior using environment variables:

### `SMP_DEBUG`
Enable debug logging.

```bash
SMP_DEBUG=1 npx svelte-markdown-pages build ./docs
```

### `SMP_VERBOSE`
Enable verbose output.

```bash
SMP_VERBOSE=1 npx svelte-markdown-pages build ./docs
```

## Configuration Files

### Package.json Scripts

Add build scripts to your `package.json`:

```json
{
  "scripts": {
    "build:docs": "svelte-markdown-pages build ./docs --output ./src/lib/content --include-content",
    "build:static": "svelte-markdown-pages static ./docs ./dist --title \"My Documentation\" --include-index",
    "dev:docs": "npm run build:docs && npm run dev"
  }
}
```

### Build Scripts

Create dedicated build scripts for complex configurations:

```typescript
// scripts/build-docs.js
import { buildPages } from 'svelte-markdown-pages/builder';
import { syntaxHighlightingPlugin } from 'svelte-markdown-pages/plugins';

const processor = {
  process(content: string): string {
    // Custom processing logic
    return content.replace(/:::(.+?):::/g, '<CustomComponent>$1</CustomComponent>');
  }
};

await buildPages('./docs', {
  appOutput: './src/lib/content',
  websiteOutput: './src/lib/content',
  includeContent: true,
  processor,
  plugins: [syntaxHighlightingPlugin]
});
```

## Error Handling

The builder functions throw errors for common issues:

```typescript
try {
  const result = await buildPages('./docs');
} catch (error) {
  if (error.code === 'ENOENT') {
    console.error('Content directory not found');
  } else if (error.code === 'INVALID_INDEX') {
    console.error('Invalid .index.json file');
  } else {
    console.error('Build failed:', error.message);
  }
}
```

## Performance Optimization

### Large Documentation Sites

For large documentation sites, consider:

```typescript
// Build only what you need
await buildPages('./docs', {
  appOutput: './src/lib/content',
  includeContent: false,  // Don't include content if not needed
  processor: {
    process(content: string): string {
      // Optimize content processing
      return content;
    }
  }
});
```

### Caching

Implement caching for faster rebuilds:

```typescript
import { buildPages } from 'svelte-markdown-pages/builder';
import { existsSync, readFileSync } from 'fs';

const cacheFile = './.docs-cache.json';

// Check if cache exists and is valid
if (existsSync(cacheFile)) {
  const cache = JSON.parse(readFileSync(cacheFile, 'utf8'));
  // Use cache if valid
}

const result = await buildPages('./docs', {
  appOutput: './src/lib/content',
  includeContent: true
});

// Save cache
// ...
```

## Next Steps

Now that you understand configuration, explore:

- [Advanced Customization](./advanced/customization.md) - Learn about custom components and styling

- [API Reference](../api/builder.md) - Complete API documentation
