# Types

Complete type definitions and interfaces for svelte-markdown-pages.

## Core Types

### NavigationItem

Represents a navigation item in the documentation structure.

```typescript
interface NavigationItem {
  name: string;
  type: 'page' | 'section';
  label: string;
  items?: NavigationItem[];
  collapsed?: boolean;
  url?: string;
}
```

**Properties:**
- `name` (string): File/directory name without extension
- `type` ('page' | 'section'): Type of navigation item
- `label` (string): Display label for the item
- `items` (NavigationItem[], optional): Child items for sections
- `collapsed` (boolean, optional): Whether section is collapsed by default
- `url` (string, optional): External URL for the item

### NavigationData

Complete navigation structure for the documentation.

```typescript
interface NavigationData {
  items: NavigationItem[];
}
```

**Properties:**
- `items` (NavigationItem[]): Root-level navigation items

### ContentBundle

Bundle containing all content data indexed by file path.

```typescript
interface ContentBundle {
  [path: string]: string;
}
```

**Properties:**
- `[path: string]` (string): Content indexed by file path

## Builder Types

### BuildOptions

Configuration options for the `buildPages` function.

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
- `includeContent` (boolean, optional): Whether to include content in output bundles
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
- `includeIndex` (boolean, optional): Whether to generate an index page
- `indexTitle` (string, optional): Title for the generated index page
- `processor` (ContentProcessor, optional): Custom content processor
- `plugins` (Plugin[], optional): Array of plugins to apply

### BuildResult

Result object returned by `buildPages`.

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



## Renderer Types

### ContentMetadata

Metadata for a content file.

```typescript
interface ContentMetadata {
  title: string;
  description?: string;
  lastModified: Date;
  wordCount: number;
  readingTime: number;
}
```

**Properties:**
- `title` (string): Content title
- `description` (string, optional): Content description
- `lastModified` (Date): Last modification date
- `wordCount` (number): Number of words in content
- `readingTime` (number): Estimated reading time in minutes

### Heading

Represents a markdown heading.

```typescript
interface Heading {
  level: number;
  text: string;
  id: string;
  line: number;
}
```

**Properties:**
- `level` (number): Heading level (1-6)
- `text` (string): Heading text
- `id` (string): Generated heading ID
- `line` (number): Line number in source

### TableOfContentsItem

Represents a table of contents item.

```typescript
interface TableOfContentsItem {
  level: number;
  text: string;
  id: string;
  children: TableOfContentsItem[];
}
```

**Properties:**
- `level` (number): Heading level
- `text` (string): Heading text
- `id` (string): Heading ID
- `children` (TableOfContentsItem[]): Child items

## Plugin Types



## Processor Types

### ContentProcessor

Interface for content processors.

```typescript
interface ContentProcessor {
  process(content: string): string;
}
```

**Methods:**
- `process(content: string): string`: Process and transform content

### ProcessorOptions

Options for content processors.

```typescript
interface ProcessorOptions {
  markdown?: boolean;
  html?: boolean;
  custom?: boolean;
}
```

**Properties:**
- `markdown` (boolean, optional): Whether to process markdown
- `html` (boolean, optional): Whether to process HTML
- `custom` (boolean, optional): Whether to apply custom processing

## Error Types

### BuildError

Error thrown during build process.

```typescript
interface BuildError extends Error {
  code: string;
  path?: string;
  details?: any;
}
```

**Properties:**
- `code` (string): Error code
- `path` (string, optional): File path where error occurred
- `details` (any, optional): Additional error details

### ContentError

Error thrown during content processing.

```typescript
interface ContentError extends Error {
  code: string;
  path: string;
  content?: string;
}
```

**Properties:**
- `code` (string): Error code
- `path` (string): Content file path
- `content` (string, optional): Content that caused error

## Utility Types

### DeepPartial

Makes all properties in T optional recursively.

```typescript
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
```

### RequiredKeys

Extracts keys of T that are required.

```typescript
type RequiredKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
}[keyof T];
```

### OptionalKeys

Extracts keys of T that are optional.

```typescript
type OptionalKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? K : never;
}[keyof T];
```

## Type Guards

### Type Guards for Runtime Validation

```typescript
function isNavigationItem(obj: any): obj is NavigationItem {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.name === 'string' &&
    typeof obj.type === 'string' &&
    (obj.type === 'page' || obj.type === 'section') &&
    typeof obj.label === 'string'
  );
}

function isNavigationData(obj: any): obj is NavigationData {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    Array.isArray(obj.items) &&
    obj.items.every(isNavigationItem)
  );
}

function isContentBundle(obj: any): obj is ContentBundle {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    Object.keys(obj).every(key => typeof obj[key] === 'string')
  );
}

function isPlugin(obj: any): obj is Plugin {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.name === 'string' &&
    typeof obj.version === 'string'
  );
}
```

## Zod Schemas

### Validation Schemas

```typescript
import { z } from 'zod';

const NavigationItemSchema = z.object({
  name: z.string(),
  type: z.enum(['page', 'section']),
  label: z.string(),
  items: z.array(z.lazy(() => NavigationItemSchema)).optional(),
  collapsed: z.boolean().optional(),
  url: z.string().url().optional()
});

const NavigationDataSchema = z.object({
  items: z.array(NavigationItemSchema)
});

const ContentBundleSchema = z.record(z.string(), z.string());

const PluginSchema = z.object({
  name: z.string(),
  version: z.string(),
  process: z.function().args(z.string()).returns(z.string()).optional(),
  transform: z.function().args(z.string()).returns(z.string()).optional(),
  validate: z.function().args(z.string()).returns(z.boolean()).optional(),
  beforeBuild: z.function().returns(z.void()).optional(),
  afterBuild: z.function().args(z.any()).returns(z.void()).optional()
});

const BuildOptionsSchema = z.object({
  appOutput: z.string().optional(),
  websiteOutput: z.string().optional(),
  staticOutput: z.string().optional(),
  includeContent: z.boolean().optional(),
  processor: z.object({
    process: z.function().args(z.string()).returns(z.string())
  }).optional(),
  plugins: z.array(PluginSchema).optional(),
  hooks: z.object({
    beforeBuild: z.function().args(z.string()).returns(z.union([z.void(), z.promise(z.void())])).optional(),
    afterBuild: z.function().args(z.any()).returns(z.union([z.void(), z.promise(z.void())])).optional(),
    onError: z.function().args(z.instanceof(Error)).returns(z.void()).optional()
  }).optional()
});
```

## Usage Examples

### Type-Safe Navigation

```typescript
import type { NavigationItem, NavigationData } from 'svelte-markdown-pages';

function validateNavigation(data: unknown): NavigationData {
  if (!isNavigationData(data)) {
    throw new Error('Invalid navigation data');
  }
  return data;
}

function findPage(items: NavigationItem[], name: string): NavigationItem | null {
  for (const item of items) {
    if (item.name === name && item.type === 'page') {
      return item;
    }
    if (item.items) {
      const found = findPage(item.items, name);
      if (found) return found;
    }
  }
  return null;
}
```

### Type-Safe Content Processing

```typescript
import type { ContentProcessor, ContentBundle } from 'svelte-markdown-pages';

function createProcessor(options: ProcessorOptions): ContentProcessor {
  return {
    process(content: string): string {
      let processed = content;
      
      if (options.markdown) {
        processed = processMarkdown(processed);
      }
      
      if (options.html) {
        processed = processHtml(processed);
      }
      
      if (options.custom) {
        processed = processCustom(processed);
      }
      
      return processed;
    }
  };
}

function validateContentBundle(bundle: unknown): ContentBundle {
  if (!isContentBundle(bundle)) {
    throw new Error('Invalid content bundle');
  }
  return bundle;
}
```

### Type-Safe Plugin Development

```typescript
import type { Plugin, PluginConfig } from 'svelte-markdown-pages';

function createPlugin(config: PluginConfig): Plugin {
  return {
    name: 'my-plugin',
    version: '1.0.0',
    process(content: string): string {
      if (!config.enabled) {
        return content;
      }
      
      // Apply plugin processing based on config.options
      return content;
    }
  };
}

function validatePlugin(plugin: unknown): Plugin {
  if (!isPlugin(plugin)) {
    throw new Error('Invalid plugin');
  }
  return plugin;
}
```

## Related

- [Builder API](./builder.md) - Content building and generation
- [Renderer API](./renderer.md) - Content rendering and navigation
