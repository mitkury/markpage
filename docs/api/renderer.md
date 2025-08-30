# Renderer API

The renderer module provides classes and functions for rendering content and managing navigation in your Svelte applications.

## Classes

### `NavigationTree`

Manages navigation structure and provides navigation utilities.

```typescript
import { NavigationTree } from 'svelte-markdown-pages/renderer';

const navigation = new NavigationTree(navigationData);
```

#### Constructor

**Parameters:**
- `navigationData` (NavigationData): Navigation structure data

#### Methods

##### `findItemByPath(path: string): NavigationItem | null`

Finds a navigation item by its file path.

**Parameters:**
- `path` (string): File path to search for

**Returns:** NavigationItem | null

**Example:**
```typescript
const item = navigation.findItemByPath('guides/installation.md');
if (item) {
  console.log('Found item:', item.label);
}
```

##### `getBreadcrumbs(path: string): NavigationItem[]`

Gets the breadcrumb trail for a given path.

**Parameters:**
- `path` (string): File path to get breadcrumbs for

**Returns:** NavigationItem[]

**Example:**
```typescript
const breadcrumbs = navigation.getBreadcrumbs('guides/advanced/customization.md');
// Returns: [root, guides, advanced, customization]
```

##### `getSiblings(path: string): NavigationItem[]`

Gets sibling items for a given path.

**Parameters:**
- `path` (string): File path to get siblings for

**Returns:** NavigationItem[]

**Example:**
```typescript
const siblings = navigation.getSiblings('guides/installation.md');
// Returns: [installation, configuration, advanced]
```

##### `getNextSibling(path: string): NavigationItem | null`

Gets the next sibling item.

**Parameters:**
- `path` (string): Current file path

**Returns:** NavigationItem | null

**Example:**
```typescript
const next = navigation.getNextSibling('guides/installation.md');
if (next) {
  console.log('Next page:', next.label);
}
```

##### `getPreviousSibling(path: string): NavigationItem | null`

Gets the previous sibling item.

**Parameters:**
- `path` (string): Current file path

**Returns:** NavigationItem | null

**Example:**
```typescript
const prev = navigation.getPreviousSibling('guides/configuration.md');
if (prev) {
  console.log('Previous page:', prev.label);
}
```

##### `getChildren(path: string): NavigationItem[]`

Gets child items for a given path.

**Parameters:**
- `path` (string): Parent path to get children for

**Returns:** NavigationItem[]

**Example:**
```typescript
const children = navigation.getChildren('guides');
// Returns: [installation, configuration, advanced]
```

##### `getParent(path: string): NavigationItem | null`

Gets the parent item for a given path.

**Parameters:**
- `path` (string): Child path to get parent for

**Returns:** NavigationItem | null

**Example:**
```typescript
const parent = navigation.getParent('guides/installation.md');
if (parent) {
  console.log('Parent section:', parent.label);
}
```

### `ContentLoader`

Manages content loading and processing.

```typescript
import { ContentLoader } from 'svelte-markdown-pages/renderer';

const loader = new ContentLoader(contentBundle);
```

#### Constructor

**Parameters:**
- `contentBundle` (ContentBundle): Content bundle data

#### Methods

##### `loadAndProcess(path: string, processor?: ContentProcessor): string`

Loads and processes content for a specific path.

**Parameters:**
- `path` (string): Content path to load
- `processor` (ContentProcessor, optional): Custom content processor

**Returns:** string

**Example:**
```typescript
const content = loader.loadAndProcess('getting-started.md');
console.log('Content loaded:', content.length, 'characters');
```

##### `hasContent(path: string): boolean`

Checks if content exists for a given path.

**Parameters:**
- `path` (string): Content path to check

**Returns:** boolean

**Example:**
```typescript
if (loader.hasContent('guides/installation.md')) {
  console.log('Installation guide exists');
}
```

##### `getAvailablePaths(): string[]`

Gets all available content paths.

**Returns:** string[]

**Example:**
```typescript
const paths = loader.getAvailablePaths();
console.log('Available content:', paths);
```

##### `getContentMetadata(path: string): ContentMetadata | null`

Gets metadata for a content file.

**Parameters:**
- `path` (string): Content path to get metadata for

**Returns:** ContentMetadata | null

**Example:**
```typescript
const metadata = loader.getContentMetadata('getting-started.md');
if (metadata) {
  console.log('Title:', metadata.title);
  console.log('Last modified:', metadata.lastModified);
}
```

## Functions

### `loadContent(path, contentBundle, processor?)`

Loads and processes content for a specific path.

**Parameters:**
- `path` (string): Content path to load
- `contentBundle` (ContentBundle): Content bundle data
- `processor` (ContentProcessor, optional): Custom content processor

**Returns:** Promise<string>

**Example:**
```typescript
import { loadContent } from 'svelte-markdown-pages/renderer';

const content = await loadContent('getting-started.md', contentBundle);
```

### `extractHeadings(content: string): Heading[]`

Extracts headings from markdown content.

**Parameters:**
- `content` (string): Markdown content to extract headings from

**Returns:** Heading[]

**Example:**
```typescript
import { extractHeadings } from 'svelte-markdown-pages/renderer';

const headings = extractHeadings(content);
headings.forEach(heading => {
  console.log(`${'#'.repeat(heading.level)} ${heading.text}`);
});
```

### `extractTableOfContents(content: string): TableOfContentsItem[]`

Extracts table of contents from markdown content.

**Parameters:**
- `content` (string): Markdown content to extract TOC from

**Returns:** TableOfContentsItem[]

**Example:**
```typescript
import { extractTableOfContents } from 'svelte-markdown-pages/renderer';

const toc = extractTableOfContents(content);
toc.forEach(item => {
  console.log(`${'  '.repeat(item.depth)}- ${item.text}`);
});
```

### `addTableOfContents(content: string, toc?: TableOfContentsItem[]): string`

Adds a table of contents to markdown content.

**Parameters:**
- `content` (string): Markdown content to add TOC to
- `toc` (TableOfContentsItem[], optional): Pre-generated TOC

**Returns:** string

**Example:**
```typescript
import { addTableOfContents } from 'svelte-markdown-pages/renderer';

const contentWithToc = addTableOfContents(content);
```

## Types

### NavigationItem

Represents a navigation item.

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
- `name` (string): File/directory name (without extension)
- `type` ('page' | 'section'): Item type
- `label` (string): Display label
- `items` (NavigationItem[], optional): Child items (for sections)
- `collapsed` (boolean, optional): Whether section is collapsed by default
- `url` (string, optional): External URL

### NavigationData

Complete navigation structure.

```typescript
interface NavigationData {
  items: NavigationItem[];
}
```

### ContentBundle

Bundle containing all content data.

```typescript
interface ContentBundle {
  [path: string]: string;
}
```

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

### ContentProcessor

Interface for content processors.

```typescript
interface ContentProcessor {
  process(content: string): string;
}
```

## Examples

### Basic Navigation Usage

```typescript
import { NavigationTree } from 'svelte-markdown-pages/renderer';
import navigationData from './content/navigation.json';

const navigation = new NavigationTree(navigationData);

// Find current page
const currentPage = navigation.findItemByPath('guides/installation.md');

// Get breadcrumbs
const breadcrumbs = navigation.getBreadcrumbs('guides/installation.md');

// Get navigation siblings
const nextPage = navigation.getNextSibling('guides/installation.md');
const prevPage = navigation.getPreviousSibling('guides/installation.md');
```

### Content Loading

```typescript
import { ContentLoader, loadContent } from 'svelte-markdown-pages/renderer';
import contentBundle from './content/content.json';

// Using ContentLoader class
const loader = new ContentLoader(contentBundle);
const content = loader.loadAndProcess('getting-started.md');

// Using loadContent function
const content = await loadContent('getting-started.md', contentBundle);
```

### Table of Contents

```typescript
import { 
  extractHeadings, 
  extractTableOfContents, 
  addTableOfContents 
} from 'svelte-markdown-pages/renderer';

// Extract headings
const headings = extractHeadings(content);

// Generate table of contents
const toc = extractTableOfContents(content);

// Add table of contents to content
const contentWithToc = addTableOfContents(content, toc);
```

### Custom Content Processing

```typescript
import { loadContent } from 'svelte-markdown-pages/renderer';

const customProcessor = {
  process(content: string): string {
    // Add custom processing
    return content
      .replace(/:::(.+?):::/g, '<CustomComponent>$1</CustomComponent>')
      .replace(/\[\[(.+?)\]\]/g, '<InternalLink>$1</InternalLink>');
  }
};

const processedContent = await loadContent(
  'getting-started.md', 
  contentBundle, 
  customProcessor
);
```

### Svelte Component Integration

```svelte
<script lang="ts">
  import { NavigationTree, loadContent } from 'svelte-markdown-pages/renderer';
  import type { NavigationItem } from 'svelte-markdown-pages';
  import navigationData from '$lib/content/navigation.json';
  import contentBundle from '$lib/content/content.json';
  
  let navigation = $state(new NavigationTree(navigationData));
  let currentPage = $state<string>("getting-started.md");
  let pageContent = $state<string | null>(null);
  
  $effect(() => {
    if (currentPage && contentBundle) {
      loadContent(currentPage, contentBundle).then(content => {
        pageContent = content;
      });
    }
  });
  
  function handlePageSelect(path: string) {
    currentPage = path;
  }
  
  function renderNavigationItems(items: NavigationItem[]): string {
    return items.map(item => {
      if (item.type === 'section') {
        return `
          <div class="nav-section">
            <h3>${item.label}</h3>
            ${renderNavigationItems(item.items || [])}
          </div>
        `;
      } else {
        const isActive = currentPage === item.name + '.md';
        return `
          <button 
            class="nav-link ${isActive ? 'active' : ''}"
            onclick="window.dispatchEvent(new CustomEvent('pageSelect', { detail: '${item.name}.md' }))"
          >
            ${item.label}
          </button>
        `;
      }
    }).join('');
  }
  
  // Set up event listener
  if (typeof window !== 'undefined') {
    window.addEventListener('pageSelect', (event: any) => {
      handlePageSelect(event.detail);
    });
  }
</script>

<div class="docs-layout">
  <nav class="docs-sidebar">
    {@html renderNavigationItems(navigation.items)}
  </nav>
  
  <div class="docs-content">
    {@html pageContent || 'No content selected'}
  </div>
</div>
```

## Error Handling

### Content Loading Errors

```typescript
import { loadContent } from 'svelte-markdown-pages/renderer';

try {
  const content = await loadContent('non-existent.md', contentBundle);
} catch (error) {
  if (error.code === 'CONTENT_NOT_FOUND') {
    console.error('Content not found');
  } else {
    console.error('Failed to load content:', error.message);
  }
}
```

### Navigation Errors

```typescript
import { NavigationTree } from 'svelte-markdown-pages/renderer';

try {
  const navigation = new NavigationTree(navigationData);
  const item = navigation.findItemByPath('invalid/path.md');
  
  if (!item) {
    console.warn('Navigation item not found');
  }
} catch (error) {
  console.error('Navigation error:', error.message);
}
```

## Performance Considerations

### Lazy Loading

For large content bundles, consider lazy loading:

```typescript
const lazyLoader = {
  async loadContent(path: string): Promise<string> {
    // Load content on demand
    const response = await fetch(`/api/content/${path}`);
    return response.text();
  }
};
```

### Caching

Implement caching for frequently accessed content:

```typescript
const contentCache = new Map();

async function loadContentWithCache(path: string, contentBundle: any): Promise<string> {
  if (contentCache.has(path)) {
    return contentCache.get(path);
  }
  
  const content = await loadContent(path, contentBundle);
  contentCache.set(path, content);
  return content;
}
```

## Related

- [Builder API](./builder.md) - Content building and generation
- [Types](./types.md) - Type definitions and interfaces
