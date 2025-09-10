# Types

Complete type definitions and interfaces for markpage.

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
import type { NavigationItem, NavigationData } from 'markpage';

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
import type { ContentProcessor, ContentBundle } from 'markpage';

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
import type { Plugin, PluginConfig } from 'markpage';

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

## Svelte Package Types

### MarkpageOptions

Configuration class for the Markdown component in `@markpage/svelte`. This class provides a fluent interface for setting up component registration, token overrides, and markdown extensions.

```typescript
class MarkpageOptions {
  addCustomComponent(name: string, component: Component): this;
  overrideBuiltinToken(name: string, component: Component): this;
  extendMarkdown(extensions: MarkdownExtensionSet | MarkdownExtensionSet[]): this;
  useMarkedInstance(instance: Marked): this;
  useMarkedFactory(factory: () => Marked): this;
  getComponents(): Map<string, Component>;
  getExtensionComponents(): Map<string, Component>;
  getMarked(): Marked;
  getExtensions(): MarkdownExtensionSet[];
}
```

**Public Methods:**
- `addCustomComponent(name, component)`: Register a custom component for use as a tag in markdown. Components can contain nested markdown content and other components.
- `overrideBuiltinToken(name, component)`: Override a built-in markdown token with a custom component (e.g., `paragraph`, `heading`, `list`, etc.)
- `extendMarkdown(extensions)`: Register markdown extensions with their associated components. Extensions can add completely new markdown syntax.
- `useMarkedInstance(instance)`: Use a specific Marked instance for parsing. Useful for advanced customization.
- `useMarkedFactory(factory)`: Use a factory function to create Marked instances. Allows for dynamic instance creation.

**Internal Methods:**
- `getComponents()`: Get the Map of registered custom components
- `getExtensionComponents()`: Get the Map of extension and override components
- `getMarked()`: Get the configured Marked instance (creates default with extensions if none set)
- `getExtensions()`: Get all registered markdown extensions

### MarkdownExtension

Represents a markdown extension with an associated component.

```typescript
interface MarkdownExtension {
  name: string;
  level: 'block' | 'inline';
  component: Component;
  start(src: string): number | undefined;
  tokenizer(src: string): any;
}
```

**Properties:**
- `name` (string): Name of the token type
- `level` ('block' | 'inline'): Whether the extension is block or inline level
- `component` (Component): Svelte component to render the token
- `start(src: string): number | undefined`: Function to find the start position of the token
- `tokenizer(src: string): any`: Function to parse the token from source

### MarkdownExtensionSet

Collection of markdown extensions.

```typescript
interface MarkdownExtensionSet {
  extensions: MarkdownExtension[];
}
```

**Properties:**
- `extensions` (MarkdownExtension[]): Array of markdown extensions

### ComponentName

Type for component names in the markdown system.

```typescript
type ComponentName = string;
```

### ComponentNode

Represents a component node parsed from markdown.

```typescript
interface ComponentNode {
  name: string;
  props: Record<string, any>;
  children?: string;
  position: { start: number; end: number };
}
```

**Properties:**
- `name` (string): Component name
- `props` (Record<string, any>): Component props
- `children` (string, optional): Component children content
- `position` (object): Start and end positions in source

### ComponentOptions

Options for component registration.

```typescript
interface ComponentOptions {
  defaultProps?: Record<string, any>;
  validate?: (props: Record<string, any>) => boolean | string;
}
```

**Properties:**
- `defaultProps` (Record<string, any>, optional): Default props for the component
- `validate` (function, optional): Validation function for component props

### RegisteredComponent

Information about a registered component.

```typescript
interface RegisteredComponent {
  component: Component;
  options: ComponentOptions;
}
```

**Properties:**
- `component` (Component): The Svelte component
- `options` (ComponentOptions): Component configuration options

### ParsedContent

Result of parsing content.

```typescript
interface ParsedContent {
  type: 'text' | 'component';
  content: string | ComponentNode;
}
```

**Properties:**
- `type` ('text' | 'component'): Type of parsed content
- `content` (string | ComponentNode): The parsed content

### MarkpageSvelteOptions

Options for the MarkpageSvelte instance.

```typescript
interface MarkpageSvelteOptions {
  enableComponents?: boolean;
  strictMode?: boolean;
}
```

**Properties:**
- `enableComponents` (boolean, optional): Whether to enable component parsing
- `strictMode` (boolean, optional): Whether to use strict parsing mode

### RenderContext

Context for component rendering.

```typescript
interface RenderContext {
  path: string;
  navigation: NavigationItem[];
  content: Record<string, string>;
}
```

**Properties:**
- `path` (string): Current content path
- `navigation` (NavigationItem[]): Navigation structure
- `content` (Record<string, string>): Available content

## Related

- [Builder API](./builder.md) - Content building and generation
- [Renderer API](./renderer.md) - Content rendering and navigation
