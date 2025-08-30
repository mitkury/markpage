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
  processor?: ContentProcessor;
  plugins?: Plugin[];
  hooks?: BuildHooks;
}
```

**Properties:**
- `appOutput` (string, optional): Directory for app-specific output files
- `websiteOutput` (string, optional): Directory for website-specific output files
- `staticOutput` (string, optional): Directory for static site output
- `includeContent` (boolean, optional): Whether to include content in output bundles (default: false)
- `processor` (ContentProcessor, optional): Custom content processor
- `plugins` (Plugin[], optional): Array of plugins to apply
- `hooks` (BuildHooks, optional): Build lifecycle hooks

### StaticSiteOptions

Configuration options for the `generateStaticSite` function.

```typescript
interface StaticSiteOptions {
  title?: string;
  baseUrl?: string;
  css?: string;
  js?: string;
  includeIndex?: boolean;
  indexTitle?: string;
  processor?: ContentProcessor;
  plugins?: Plugin[];
}
```

**Properties:**
- `title` (string, optional): Site title for generated HTML
- `baseUrl` (string, optional): Base URL for the site
- `css` (string, optional): Custom CSS content to include
- `js` (string, optional): Custom JavaScript content to include
- `includeIndex` (boolean, optional): Whether to generate an index page (default: false)
- `indexTitle` (string, optional): Title for the generated index page
- `processor` (ContentProcessor, optional): Custom content processor
- `plugins` (Plugin[], optional): Array of plugins to apply

### BuildResult

Result object returned by `buildDocs`.

```typescript
interface BuildResult {
  navigation: NavigationData;
  content?: ContentBundle;
  files: string[];
  stats: BuildStats;
}
```

**Properties:**
- `navigation` (NavigationData): Generated navigation structure
- `content` (ContentBundle, optional): Content bundle (if includeContent is true)
- `files` (string[]): List of generated files
- `stats` (BuildStats): Build statistics

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

### BuildStats

Statistics about the build process.

```typescript
interface BuildStats {
  pages: number;
  sections: number;
  totalFiles: number;
  buildTime: number;
  errors: string[];
  warnings: string[];
}
```

**Properties:**
- `pages` (number): Number of pages processed
- `sections` (number): Number of sections processed
- `totalFiles` (number): Total number of files processed
- `buildTime` (number): Build time in milliseconds
- `errors` (string[]): List of build errors
- `warnings` (string[]): List of build warnings

## Examples

### Basic Build

```typescript
import { buildDocs } from 'svelte-markdown-pages/builder';

const result = await buildDocs('./docs', {
  appOutput: './src/lib/content',
  includeContent: true
});

console.log(`Built ${result.stats.pages} pages in ${result.stats.buildTime}ms`);
```

### Advanced Build with Plugins

```typescript
import { buildDocs } from 'svelte-markdown-pages/builder';

const customProcessor = {
  process(content: string): string {
    return content.replace(/:::(.+?):::/g, '<CustomComponent>$1</CustomComponent>');
  }
};

const customPlugin = {
  name: 'custom-plugin',
  version: '1.0.0',
  process(content: string): string {
    return content.replace(/\[\[(.+?)\]\]/g, '<InternalLink>$1</InternalLink>');
  }
};

const result = await buildDocs('./docs', {
  appOutput: './src/lib/content',
  websiteOutput: './src/lib/content',
  includeContent: true,
  processor: customProcessor,
  plugins: [customPlugin],
  hooks: {
    beforeBuild: (contentPath) => {
      console.log(`Starting build for: ${contentPath}`);
    },
    afterBuild: (result) => {
      console.log(`Build completed: ${result.files.length} files generated`);
    },
    onError: (error) => {
      console.error('Build error:', error.message);
    }
  }
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

console.log(`Generated ${result.files.length} files`);
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
