# Configuration

Learn how to configure svelte-markdown-pages for your project.

## Basic Configuration

```typescript
import { buildDocs } from 'svelte-markdown-pages/builder';

await buildDocs('./content', {
  appOutput: './src/lib/content',
  websiteOutput: './src/lib/content',
  includeContent: true
});
```

## Build Options

### `appOutput`
Directory where app-specific files will be generated.

### `websiteOutput`
Directory where website-specific files will be generated.

### `includeContent`
Whether to include content in the output bundle.

### `staticOutput`
Directory for static site generation.

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

const result = await buildDocs('./content', {
  appOutput: './src/lib/content',
  processor
});
```

### Static Site Generation

Generate a complete static HTML site:

```typescript
import { generateStaticSite } from 'svelte-markdown-pages/builder';

const result = await generateStaticSite('./content', './dist', {
  title: 'My Documentation',
  baseUrl: 'https://example.com',
  includeIndex: true
});
```

## CLI Usage

### Build for App/Website

```bash
npx svelte-markdown-pages build ./content --output ./src/lib/content
```

### Generate Static Site

```bash
npx svelte-markdown-pages static ./content --output ./dist
```

## Environment Variables

- `SMP_DEBUG`: Enable debug logging
- `SMP_VERBOSE`: Enable verbose output

Next: Explore [Advanced](./advanced/customization.md) customization options.
