# Builder API

The builder module provides functionality for processing markdown content and generating build outputs.

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
- `options`: Build configuration options

**Returns:** Promise resolving to build result

**Example:**
```typescript
import { buildDocs } from 'svelte-markdown-pages/builder';

const result = await buildDocs('./docs', {
  appOutput: './src/lib/content',
  websiteOutput: './src/lib/content',
  includeContent: true
});
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
- `outputPath`: Path for output files
- `options`: Static site configuration

**Returns:** Promise resolving to static site result

## Types

### BuildOptions

```typescript
interface BuildOptions {
  appOutput?: string;
  websiteOutput?: string;
  staticOutput?: string;
  includeContent?: boolean;
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