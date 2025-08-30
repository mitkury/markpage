# Builder API

The builder module provides functions for building documentation from markdown content and generating various output formats.

## Functions

### `buildDocs(contentPath, options?)`

Builds documentation from a content directory.

**Parameters:**
- `contentPath` (string): Path to the content directory
- `options` (BuildOptions, optional): Build configuration options

**Returns:** Promise<BuildResult>

**Example:**
```typescript
import { buildDocs } from 'svelte-markdown-pages/builder';

const result = await buildDocs('./docs', {
  appOutput: './src/lib/content',
  websiteOutput: './src/lib/content',
  includeContent: true
});
```

### `generateStaticSite(contentPath, outputPath, options?)`

Generates a complete static HTML site from markdown content.

**Parameters:**
- `contentPath` (string): Path to the content directory
- `outputPath` (string): Path where the static site will be generated
- `options` (StaticSiteOptions, optional): Static site configuration options

**Returns:** Promise<StaticSiteResult>

**Example:**
```typescript
import { generateStaticSite } from 'svelte-markdown-pages/builder';

const result = await generateStaticSite('./docs', './dist', {
  title: 'My Documentation',
  baseUrl: 'https://example.com',
  includeIndex: true
});
```

## Types

### BuildOptions

Configuration options for the `buildDocs` function.

```typescript
interface BuildOptions {
  appOutput?: string;
  websiteOutput?: string;
  staticOutput?: string;
  includeContent?: boolean;
}
```

**Properties:**
- `appOutput` (string, optional): Directory for app-specific output files
- `websiteOutput` (string, optional): Directory for website-specific output files
- `staticOutput` (string, optional): Directory for static site output
- `includeContent` (boolean, optional): Whether to include content in output bundles (default: false)

### StaticSiteOptions

Configuration options for the `generateStaticSite` function.

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

**Properties:**
- `title` (string, optional): Site title for generated HTML
- `baseUrl` (string, optional): Base URL for the site
- `css` (string, optional): Custom CSS content to include
- `js` (string, optional): Custom JavaScript content to include
- `processor` (ContentProcessor, optional): Custom content processor
- `includeIndex` (boolean, optional): Whether to generate an index page (default: false)
- `indexTitle` (string, optional): Title for the generated index page

### BuildResult

Result object returned by `buildDocs`.

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

**Properties:**
- `navigation` (NavigationTree): Generated navigation structure
- `content` (Record<string, string>, optional): Content bundle (if includeContent is true)
- `pages` (Array, optional): Array of generated pages with path, content, and HTML

### StaticSiteResult

Result object returned by `generateStaticSite`.

```typescript
interface StaticSiteResult {
  files: string[];
  stats: BuildStats;
  urls: string[];
}
```

**Properties:**
- `files` (string[]): List of generated files
- `stats` (BuildStats): Build statistics
- `urls` (string[]): List of generated URLs

### ContentProcessor

Interface for custom content processors.

```typescript
interface ContentProcessor {
  process(content: string): string;
}
```

**Methods:**
- `process(content: string): string`: Process and transform content

### Plugin

Interface for plugins.

```typescript
interface Plugin {
  name: string;
  version: string;
  process?: (content: string) => string;
  transform?: (content: string) => string;
  validate?: (content: string) => boolean;
  beforeBuild?: () => void;
  afterBuild?: (result: any) => void;
}
```

**Properties:**
- `name` (string): Plugin name
- `version` (string): Plugin version
- `process` (function, optional): Content processing function
- `transform` (function, optional): Content transformation function
- `validate` (function, optional): Content validation function
- `beforeBuild` (function, optional): Pre-build hook
- `afterBuild` (function, optional): Post-build hook

### BuildHooks

Lifecycle hooks for the build process.

```typescript
interface BuildHooks {
  beforeBuild?: (contentPath: string) => void | Promise<void>;
  afterBuild?: (result: BuildResult) => void | Promise<void>;
  onError?: (error: Error) => void;
}
```

**Properties:**
- `beforeBuild` (function, optional): Called before build starts
- `afterBuild` (function, optional): Called after build completes
- `onError` (function, optional): Called when build errors occur



## Examples

### Basic Build

```typescript
import { buildDocs } from 'svelte-markdown-pages/builder';

const result = await buildDocs('./docs', {
  appOutput: './src/lib/content',
  includeContent: true
});

console.log(`Built navigation with ${result.navigation.items.length} root items`);
```

### Advanced Build with Custom Processor

```typescript
import { buildDocs } from 'svelte-markdown-pages/builder';

const customProcessor = {
  process(content: string): string {
    return content.replace(/:::(.+?):::/g, '<CustomComponent>$1</CustomComponent>');
  }
};

const result = await buildDocs('./docs', {
  appOutput: './src/lib/content',
  websiteOutput: './src/lib/content',
  includeContent: true,
  processor: customProcessor
});
```

### Static Site Generation

```typescript
import { generateStaticSite } from 'svelte-markdown-pages/builder';

const result = await generateStaticSite('./docs', './dist', {
  title: 'My Documentation',
  baseUrl: 'https://docs.example.com',
  css: `
    body { font-family: 'Inter', sans-serif; }
    .docs-content { max-width: 800px; margin: 0 auto; }
  `,
  js: `
    // Add syntax highlighting
    hljs.highlightAll();
  `,
  includeIndex: true,
  indexTitle: 'Documentation Home'
});

console.log(`Generated ${result.pages?.length || 0} pages`);
console.log(`Available URLs: ${result.urls.join(', ')}`);
```

### Error Handling

```typescript
import { buildDocs } from 'svelte-markdown-pages/builder';

try {
  const result = await buildDocs('./docs', {
    appOutput: './src/lib/content',
    includeContent: true
  });
  
  if (result.stats.errors.length > 0) {
    console.error('Build completed with errors:', result.stats.errors);
  }
  
  if (result.stats.warnings.length > 0) {
    console.warn('Build completed with warnings:', result.stats.warnings);
  }
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}
```

## Error Codes

The builder functions may throw errors with specific error codes:

- `ENOENT`: Content directory not found
- `INVALID_INDEX`: Invalid `.index.json` file
- `MISSING_CONTENT`: Required content file missing
- `PROCESSING_ERROR`: Content processing failed
- `PLUGIN_ERROR`: Plugin execution failed

## Performance Considerations

### Large Documentation Sites

For large documentation sites, consider:

1. **Disable content inclusion** if not needed:
   ```typescript
   await buildDocs('./docs', {
     appOutput: './src/lib/content',
     includeContent: false
   });
   ```

2. **Use efficient processors**:
   ```typescript
   const efficientProcessor = {
     process(content: string): string {
       // Use efficient string operations
       return content.replace(/pattern/g, 'replacement');
     }
   };
   ```

3. **Implement caching**:
   ```typescript
   const cache = new Map();
   
   const cachedProcessor = {
     process(content: string): string {
       const hash = createHash(content);
       if (cache.has(hash)) {
         return cache.get(hash);
       }
       
       const result = processContent(content);
       cache.set(hash, result);
       return result;
     }
   };
   ```

## Related

- [Renderer API](./renderer.md) - Content rendering and navigation
- [Types](./types.md) - Type definitions and interfaces
