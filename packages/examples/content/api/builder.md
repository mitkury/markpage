# Builder API

Complete API reference for the builder module.

## Functions

### buildDocs

Builds documentation from a content directory.

```typescript
function buildDocs(
  contentPath: string,
  options?: BuildOptions
): Promise<BuildResult>
```

**Parameters:**
- `contentPath`: Path to the content directory
- `options`: Optional build configuration

**Returns:** Promise that resolves to a BuildResult

**Example:**
```typescript
import { buildDocs } from 'svelte-markdown-pages/builder';

const result = await buildDocs('./content', {
  appOutput: './src/lib/content',
  websiteOutput: './src/lib/content',
  includeContent: true
});

console.log(result.navigation);
console.log(result.content);
```

### generateStaticSite

Generates a complete static HTML site.

```typescript
function generateStaticSite(
  contentPath: string,
  outputPath: string,
  options?: StaticSiteOptions
): Promise<StaticSiteResult>
```

**Parameters:**
- `contentPath`: Path to the content directory
- `outputPath`: Directory where static files will be generated
- `options`: Optional static site configuration

**Returns:** Promise that resolves to a StaticSiteResult

**Example:**
```typescript
import { generateStaticSite } from 'svelte-markdown-pages/builder';

const result = await generateStaticSite('./content', './dist', {
  title: 'My Documentation',
  baseUrl: 'https://example.com',
  includeIndex: true
});

console.log(`Generated ${result.pages.length} pages`);
```

## Types

### BuildOptions

```typescript
interface BuildOptions {
  appOutput?: string;
  websiteOutput?: string;
  staticOutput?: string;
  includeContent?: boolean;
  processor?: ContentProcessor;
  plugins?: Plugin[];
}
```

### BuildResult

```typescript
interface BuildResult {
  navigation: NavigationTree;
  content?: Record<string, string>;
  pages?: Array<{
    path: string;
    content: string;
    html: string;
  }>;
}
```

### StaticSiteOptions

```typescript
interface StaticSiteOptions {
  title?: string;
  baseUrl?: string;
  css?: string;
  js?: string;
  processor?: ContentProcessor;
  includeIndex?: boolean;
  indexTitle?: string;
}
```

### StaticSiteResult

```typescript
interface StaticSiteResult {
  pages: Array<{
    path: string;
    content: string;
    html: string;
  }>;
  index?: {
    path: string;
    html: string;
  };
}
```

## CLI Commands

### Build Command

```bash
npx svelte-markdown-pages build <content-path> [options]
```

**Options:**
- `--output, -o`: Output directory
- `--include-content`: Include content in output
- `--processor`: Custom processor file
- `--plugins`: Plugin configuration file

### Static Command

```bash
npx svelte-markdown-pages static <content-path> <output-path> [options]
```

**Options:**
- `--title`: Site title
- `--base-url`: Base URL for the site
- `--css`: Custom CSS file
- `--js`: Custom JavaScript file
- `--include-index`: Generate index page

## Error Handling

The builder functions throw errors for common issues:

```typescript
try {
  const result = await buildDocs('./content');
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

Next: Learn about the [Renderer API](./renderer.md).
