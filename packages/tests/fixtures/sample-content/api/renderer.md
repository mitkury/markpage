# Renderer API

The renderer module provides runtime functionality for navigation and content rendering.

## Classes

### NavigationTree

Manages navigation structure and provides navigation utilities.

```typescript
class NavigationTree {
  constructor(data: NavigationTree)
  
  get items(): NavigationItem[]
  get flatItems(): NavigationItem[]
  
  findItemByPath(path: string): NavigationItem | undefined
  findItemByName(name: string): NavigationItem | undefined
  getBreadcrumbs(path: string): NavigationItem[]
  getSiblings(path: string): NavigationItem[]
  getNextSibling(path: string): NavigationItem | undefined
  getPreviousSibling(path: string): NavigationItem | undefined
  getChildren(path: string): NavigationItem[]
  isExpanded(path: string): boolean
  toggleExpanded(path: string): void
}
```

**Example:**
```typescript
import { NavigationTree } from 'markpage/renderer';

const navigation = new NavigationTree(navigationData);
const item = navigation.findItemByPath('guides/installation.md');
const breadcrumbs = navigation.getBreadcrumbs('guides/installation.md');
```

### ContentLoader

Manages content loading and processing.

```typescript
class ContentLoader {
  constructor(content: Record<string, string>, processor?: ContentProcessor)
  
  loadContent(path: string): string | undefined
  loadAndProcess(path: string): string | undefined
  processContent(content: string): string
  hasContent(path: string): boolean
  getAvailablePaths(): string[]
  getContentSize(path: string): number
  getTotalContentSize(): number
}
```

**Example:**
```typescript
import { ContentLoader } from 'markpage/renderer';

const loader = new ContentLoader(contentBundle);
const content = loader.loadAndProcess('guides/installation.md');
```

## Functions

### loadContent

Loads and processes content for a specific path.

```typescript
function loadContent(
  path: string,
  contentBundle: Record<string, string>,
  processor?: ContentProcessor
): Promise<string | undefined>
```

### createNavigationTree

Creates a NavigationTree instance.

```typescript
function createNavigationTree(data: NavigationTree): NavigationTree
```

### createContentLoader

Creates a ContentLoader instance.

```typescript
function createContentLoader(
  contentBundle: Record<string, string>,
  processor?: ContentProcessor
): ContentLoader
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
function extractTableOfContents(content: string): string
```

### addTableOfContents

Adds a table of contents to markdown content.

```typescript
function addTableOfContents(content: string): string
```