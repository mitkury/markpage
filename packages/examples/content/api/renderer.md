# Renderer API

Complete API reference for the renderer module.

## Classes

### NavigationTree

Manages navigation structure and provides navigation utilities.

```typescript
class NavigationTree {
  constructor(data: NavigationTree);
  findItemByPath(path: string): NavigationItem | null;
  getBreadcrumbs(path: string): NavigationItem[];
  getSiblings(path: string): NavigationItem[];
  getNextSibling(path: string): NavigationItem | null;
  getPreviousSibling(path: string): NavigationItem | null;
}
```

**Constructor:**
```typescript
const navigation = new NavigationTree(navigationData);
```

**Methods:**

#### findItemByPath
```typescript
findItemByPath(path: string): NavigationItem | null
```
Finds a navigation item by its path.

#### getBreadcrumbs
```typescript
getBreadcrumbs(path: string): NavigationItem[]
```
Gets the breadcrumb trail for a given path.

#### getSiblings
```typescript
getSiblings(path: string): NavigationItem[]
```
Gets all siblings of the item at the given path.

#### getNextSibling
```typescript
getNextSibling(path: string): NavigationItem | null
```
Gets the next sibling of the item at the given path.

#### getPreviousSibling
```typescript
getPreviousSibling(path: string): NavigationItem | null
```
Gets the previous sibling of the item at the given path.

**Example:**
```typescript
import { NavigationTree } from 'svelte-markdown-pages/renderer';

const navigation = new NavigationTree(navigationData);

// Find a specific page
const item = navigation.findItemByPath('guides/installation.md');

// Get breadcrumbs
const breadcrumbs = navigation.getBreadcrumbs('guides/installation.md');

// Get siblings
const siblings = navigation.getSiblings('guides/installation.md');
const nextSibling = navigation.getNextSibling('guides/installation.md');
const prevSibling = navigation.getPreviousSibling('guides/installation.md');
```

### ContentLoader

Manages content loading and processing.

```typescript
class ContentLoader {
  constructor(contentBundle: Record<string, string>);
  loadAndProcess(path: string): string;
  hasContent(path: string): boolean;
  getAvailablePaths(): string[];
}
```

**Constructor:**
```typescript
const loader = new ContentLoader(contentBundle);
```

**Methods:**

#### loadAndProcess
```typescript
loadAndProcess(path: string): string
```
Loads and processes content for a specific path.

#### hasContent
```typescript
hasContent(path: string): boolean
```
Checks if content exists for a given path.

#### getAvailablePaths
```typescript
getAvailablePaths(): string[]
```
Gets all available content paths.

**Example:**
```typescript
import { ContentLoader } from 'svelte-markdown-pages/renderer';

const loader = new ContentLoader(contentBundle);

// Load content
const content = loader.loadAndProcess('getting-started.md');

// Check availability
const hasContent = loader.hasContent('guides/installation.md');
const paths = loader.getAvailablePaths();
```

## Functions

### loadContent

Loads and processes content for a specific path.

```typescript
function loadContent(
  path: string,
  contentBundle: Record<string, string>,
  processor?: ContentProcessor
): Promise<string>
```

**Parameters:**
- `path`: Path to the content file
- `contentBundle`: Bundle containing all content
- `processor`: Optional content processor

**Returns:** Promise that resolves to processed content

**Example:**
```typescript
import { loadContent } from 'svelte-markdown-pages/renderer';

const content = await loadContent('getting-started.md', contentBundle);

// With custom processor
const processor = {
  process(content: string): string {
    return addTableOfContents(content);
  }
};

const processedContent = await loadContent('page.md', contentBundle, processor);
```

## Utility Functions

### extractHeadings

Extracts headings from markdown content.

```typescript
function extractHeadings(content: string): Array<{
  level: number;
  text: string;
  id: string;
}>
```

### extractTableOfContents

Generates a table of contents from markdown content.

```typescript
function extractTableOfContents(content: string): Array<{
  level: number;
  text: string;
  id: string;
  children?: Array<{ level: number; text: string; id: string }>;
}>
```

### addTableOfContents

Adds a table of contents to markdown content.

```typescript
function addTableOfContents(content: string): string
```

**Example:**
```typescript
import { 
  extractHeadings, 
  extractTableOfContents, 
  addTableOfContents 
} from 'svelte-markdown-pages/renderer';

// Extract headings from markdown
const headings = extractHeadings(content);

// Generate table of contents
const toc = extractTableOfContents(content);

// Add table of contents to content
const contentWithToc = addTableOfContents(content);
```

## Types

### NavigationItem

```typescript
interface NavigationItem {
  name: string;
  type: 'page' | 'section';
  label: string;
  path?: string;
  items?: NavigationItem[];
  parent?: NavigationItem;
  collapsed?: boolean;
  url?: string;
}
```

### NavigationTree

```typescript
interface NavigationTree {
  items: NavigationItem[];
}
```

### ContentProcessor

```typescript
interface ContentProcessor {
  process(content: string): string;
}
```

Next: Learn about [Type Definitions](./types.md).
