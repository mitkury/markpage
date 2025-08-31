# Configuration

Learn how to configure the package for your needs.

## Basic Configuration

The package can be configured through the build options:

```typescript
import { buildPages } from 'svelte-markdown-pages/builder';

await buildPages('./content', {
  appOutput: './src/lib/content',
  websiteOutput: './src/lib/content',
  includeContent: true
});
```

## Advanced Configuration

### Custom Content Processor

You can provide a custom content processor:

```typescript
const processor = {
  process(content: string): string {
    // Custom processing logic
    return content.replace(/\[\[(.+?)\]\]/g, '[$1]($1)');
  }
};

await buildPages('./content', {
  appOutput: './src/lib/content',
  processor
});
```

### Static Site Options

For static site generation:

```typescript
import { generateStaticSite } from 'svelte-markdown-pages/builder';

await generateStaticSite('./content', './dist', {
  title: 'My Documentation',
  baseUrl: 'https://example.com',
  css: 'body { font-family: sans-serif; }',
  includeIndex: true
});
```