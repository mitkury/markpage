# Renderer API

The renderer module provides classes and functions for managing content and navigation in your applications.

## Classes

### `NavigationTree`

Manages navigation structure and provides navigation utilities.

```typescript
import { NavigationTree } from 'markpage/renderer';

const navigation = new NavigationTree(navigationData);
```

#### Constructor

**Parameters:**
- `navigationData` (NavigationData): Navigation structure data

#### Methods

##### `findItemByPath(path: string): NavigationItem | undefined`

Finds a navigation item by its file path.

**Parameters:**
- `path` (string): File path to search for

**Returns:** NavigationItem | undefined

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

##### `getNextSibling(path: string): NavigationItem | undefined`

Gets the next sibling item.

**Parameters:**
- `path` (string): Current file path

**Returns:** NavigationItem | undefined

**Example:**
```typescript
const next = navigation.getNextSibling('guides/installation.md');
if (next) {
  console.log('Next page:', next.label);
}
```

##### `getPreviousSibling(path: string): NavigationItem | undefined`

Gets the previous sibling item.

**Parameters:**
- `path` (string): Current file path

**Returns:** NavigationItem | undefined

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

##### `findItemByName(name: string): NavigationItem | undefined`

Finds a navigation item by its name.

**Parameters:**
- `path` (string): Item name to search for

**Returns:** NavigationItem | undefined

**Example:**
```typescript
const item = navigation.findItemByName('installation');
if (item) {
  console.log('Found item:', item.label);
}
```

##### `isExpanded(path: string): boolean`

Checks if a section is expanded.

**Parameters:**
- `path` (string): Path to check

**Returns:** boolean

**Example:**
```typescript
const expanded = navigation.isExpanded('guides');
console.log('Guides section expanded:', expanded);
```

##### `toggleExpanded(path: string): void`

Toggles the expanded state of a section.

**Parameters:**
- `path` (string): Path to toggle

**Example:**
```typescript
navigation.toggleExpanded('guides');
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
import { ContentLoader } from 'markpage/renderer';

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

**Returns:** Promise<string | undefined>

**Example:**
```typescript
import { loadContent } from 'markpage/renderer';

const content = await loadContent('getting-started.md', contentBundle);
```

### `extractHeadings(content: string): Heading[]`

Extracts headings from markdown content.

**Parameters:**
- `content` (string): Markdown content to extract headings from

**Returns:** Heading[]

**Example:**
```typescript
import { extractHeadings } from 'markpage/renderer';

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
import { extractTableOfContents } from 'markpage/renderer';

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
import { addTableOfContents } from 'markpage/renderer';

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
import { NavigationTree } from 'markpage/renderer';
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
import { ContentLoader, loadContent } from 'markpage/renderer';
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
} from 'markpage/renderer';

// Extract headings
const headings = extractHeadings(content);

// Generate table of contents
const toc = extractTableOfContents(content);

// Add table of contents to content
const contentWithToc = addTableOfContents(content, toc);
```

### Custom Content Processing
### Svelte Markdown: Custom Components and Extensions

Render markdown in Svelte with custom components and extensions using the new `MarkpageOptions` API:

#### Custom Components with Nested Content

```svelte
<script lang="ts">
  import { Markdown, MarkpageOptions } from '@markpage/svelte';
  import Button from '$lib/components/Button.svelte';
  import Alert from '$lib/components/Alert.svelte';
  import Card from '$lib/components/Card.svelte';

  const options = new MarkpageOptions()
    .addCustomComponent('Button', Button)
    .addCustomComponent('Alert', Alert)
    .addCustomComponent('Card', Card);

  const source = `
<Card title="Nested Components Example">
  <Alert variant="info">
    This alert contains **markdown** content and other components:
    
    <Button variant="primary">Nested Button</Button>
  </Alert>
</Card>
  `;
</script>

<Markdown {source} {options} />
```

#### Markdown Extensions (LaTeX Math)

```svelte
<script lang="ts">
  import { Markdown, MarkpageOptions } from '@markpage/svelte';
  import MathInline from '$lib/components/MathInline.svelte';
  import MathBlock from '$lib/components/MathBlock.svelte';

  function mathExtension() {
    return {
      extensions: [
        {
          name: 'math_block',
          level: 'block' as const,
          component: MathBlock,
          start: (src: string) => {
            const i = src.indexOf('$$');
            return i < 0 ? undefined : i;
          },
          tokenizer(src: string) {
            if (!src.startsWith('$$')) return;
            const end = src.indexOf('$$', 2);
            if (end === -1) return;
            const raw = src.slice(0, end + 2);
            const text = src.slice(2, end).trim();
            return { type: 'math_block', raw, text } as any;
          }
        },
        {
          name: 'math_inline',
          level: 'inline' as const,
          component: MathInline,
          start: (src: string) => {
            const i = src.indexOf('$');
            return i < 0 ? undefined : i;
          },
          tokenizer(src: string) {
            if (src.startsWith('$$')) return; // let block handle
            if (!src.startsWith('$')) return;
            const end = src.indexOf('$', 1);
            if (end === -1) return;
            const raw = src.slice(0, end + 1);
            const text = src.slice(1, end).trim();
            return { type: 'math_inline', raw, text } as any;
          }
        }
      ]
    };
  }

  const options = new MarkpageOptions()
    .extendMarkdown(mathExtension());

  const source = 'Here is inline $E = mc^2$ and a block:\n\n$$\n\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}\n$$';
</script>

<Markdown {source} {options} />
```

#### Override Built-in Tokens

```svelte
<script lang="ts">
  import { Markdown, MarkpageOptions } from '@markpage/svelte';
  import CustomCodeSpan from '$lib/components/CustomCodeSpan.svelte';
  import CustomHeading from '$lib/components/CustomHeading.svelte';

  const options = new MarkpageOptions()
    .overrideBuiltinToken('codespan', CustomCodeSpan)
    .overrideBuiltinToken('heading', CustomHeading);

  const source = `
# Custom Heading

Here is \`inline code\` with custom styling!
  `;
</script>

<Markdown {source} {options} />
```

#### Advanced: Manual Marked Instance

```svelte
<script lang="ts">
  import { Markdown, MarkpageOptions, Marked } from '@markpage/svelte';

  const markedInstance = new Marked();
  // Add custom Marked configuration
  markedInstance.setOptions({ breaks: true });

  const options = new MarkpageOptions()
    .addCustomComponent('Button', Button)
    .useMarkedInstance(markedInstance);

  const source = 'Line breaks are now preserved\n\n<Button>Custom Button</Button>';
</script>

<Markdown {source} {options} />
```

```typescript
import { loadContent } from 'markpage/renderer';

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

### React Component Integration

```tsx
// src/components/DocsLayout.tsx
import React, { useState, useEffect } from 'react';
import { NavigationTree, loadContent } from 'markpage/renderer';
import type { NavigationItem } from 'markpage';
import navigationData from '../content/navigation.json';
import contentBundle from '../content/content.json';

function DocsLayout() {
  const [navigation] = useState(() => new NavigationTree(navigationData));
  const [currentPage, setCurrentPage] = useState<string>("getting-started.md");
  const [pageContent, setPageContent] = useState<string | null>(null);
  
  useEffect(() => {
    if (currentPage && contentBundle) {
      loadContent(currentPage, contentBundle).then(setPageContent);
    }
  }, [currentPage]);
  
  function handlePageSelect(path: string) {
    setCurrentPage(path);
  }
  
  function renderNavigationItems(items: NavigationItem[]) {
    return items.map(item => {
      if (item.type === 'section') {
        return (
          <div key={item.name} className="nav-section">
            <h3>{item.label}</h3>
            {renderNavigationItems(item.items || [])}
          </div>
        );
      } else {
        const isActive = currentPage === item.name + '.md';
        return (
          <button 
            key={item.name}
            className={`nav-link ${isActive ? 'active' : ''}`}
            onClick={() => handlePageSelect(item.name + '.md')}
          >
            {item.label}
          </button>
        );
      }
    });
  }
  
  return (
    <div className="docs-layout">
      <nav className="docs-sidebar">
        {renderNavigationItems(navigation.items)}
      </nav>
      
      <div className="docs-content">
        {pageContent ? <div dangerouslySetInnerHTML={{ __html: pageContent }} /> : 'No content selected'}
      </div>
    </div>
  );
}
```

## Error Handling

### Content Loading Errors

```typescript
import { loadContent } from 'markpage/renderer';

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
import { NavigationTree } from 'markpage/renderer';

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
