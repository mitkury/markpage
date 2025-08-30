# Type Definitions

Complete type definitions for the svelte-markdown-pages package.

## Core Types

### DocItemType

```typescript
type DocItemType = "section" | "page"
```

Defines the possible types for documentation items.

### DocItem

```typescript
interface DocItem {
  name: string;
  type: DocItemType;
  label: string;
  collapsed?: boolean;
  url?: string;
}
```

Base interface for all documentation items.

**Properties:**
- `name`: Unique identifier for the item
- `type`: Type of the item (section or page)
- `label`: Display label for navigation
- `collapsed`: Optional boolean to collapse sections by default
- `url`: Optional external URL

### IndexFile

```typescript
interface IndexFile {
  items: DocItem[];
}
```

Structure for `.index.json` files.

## Navigation Types

### NavigationItem

```typescript
interface NavigationItem extends DocItem {
  path?: string;
  items?: NavigationItem[];
  parent?: NavigationItem;
}
```

Extended interface for navigation items with additional properties.

**Additional Properties:**
- `path`: File path for the item
- `items`: Child navigation items (for sections)
- `parent`: Reference to parent navigation item

### NavigationTree

```typescript
interface NavigationTree {
  items: NavigationItem[];
}
```

Root structure for navigation data.

## Build Types

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

Configuration options for the build process.

**Properties:**
- `appOutput`: Directory for app-specific output
- `websiteOutput`: Directory for website-specific output
- `staticOutput`: Directory for static site generation
- `includeContent`: Whether to include content in output
- `processor`: Custom content processor
- `plugins`: Array of plugins to apply

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

Result of the build process.

**Properties:**
- `navigation`: Generated navigation structure
- `content`: Optional content bundle
- `pages`: Optional array of generated pages

### ContentProcessor

```typescript
interface ContentProcessor {
  process(content: string): string;
}
```

Interface for custom content processors.

## Static Site Types

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

Configuration options for static site generation.

**Properties:**
- `title`: Site title
- `baseUrl`: Base URL for the site
- `css`: Custom CSS content
- `js`: Custom JavaScript content
- `processor`: Content processor
- `includeIndex`: Whether to generate index page
- `indexTitle`: Title for the index page

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

Result of static site generation.

**Properties:**
- `pages`: Array of generated pages
- `index`: Optional index page

## Component Types

### DocsSidebarProps

```typescript
interface DocsSidebarProps {
  navigation: NavigationTree;
  currentPage?: string | null;
  onPageSelect?: (path: string) => void;
  collapsed?: boolean;
}
```

Props for the DocsSidebar component.

### DocsContentProps

```typescript
interface DocsContentProps {
  content?: string | null;
  title?: string;
  loading?: boolean;
  error?: string | null;
}
```

Props for the DocsContent component.

### DocsLayoutProps

```typescript
interface DocsLayoutProps {
  navigation: NavigationTree;
  currentPage?: string | null;
  content?: string | null;
  onPageSelect?: (path: string) => void;
  sidebarCollapsed?: boolean;
  onSidebarToggle?: () => void;
}
```

Props for the DocsLayout component.

## Plugin Types

### Plugin

```typescript
interface Plugin {
  name: string;
  process(content: string): string;
  transform?(navigation: NavigationTree): NavigationTree;
}
```

Interface for custom plugins.

**Properties:**
- `name`: Unique plugin name
- `process`: Function to process content
- `transform`: Optional function to transform navigation

### PluginConfig

```typescript
interface PluginConfig {
  [key: string]: any;
}
```

Configuration object for plugins.

## Utility Types

### Heading

```typescript
interface Heading {
  level: number;
  text: string;
  id: string;
}
```

Structure for extracted headings.

### TableOfContentsItem

```typescript
interface TableOfContentsItem {
  level: number;
  text: string;
  id: string;
  children?: TableOfContentsItem[];
}
```

Structure for table of contents items.

## Type Guards

### isNavigationItem

```typescript
function isNavigationItem(item: any): item is NavigationItem
```

Type guard to check if an object is a NavigationItem.

### isNavigationTree

```typescript
function isNavigationTree(tree: any): tree is NavigationTree
```

Type guard to check if an object is a NavigationTree.

## Usage Examples

### Creating Navigation Data

```typescript
import type { NavigationTree, NavigationItem } from 'svelte-markdown-pages';

const navigationData: NavigationTree = {
  items: [
    {
      name: "getting-started",
      type: "page",
      label: "Getting Started",
      path: "getting-started.md"
    },
    {
      name: "guides",
      type: "section",
      label: "Guides",
      items: [
        {
          name: "installation",
          type: "page",
          label: "Installation",
          path: "guides/installation.md"
        }
      ]
    }
  ]
};
```

### Custom Content Processor

```typescript
import type { ContentProcessor } from 'svelte-markdown-pages';

const myProcessor: ContentProcessor = {
  process(content: string): string {
    // Add custom processing logic
    return content.replace(/:::(.+?):::/g, '<CustomComponent>$1</CustomComponent>');
  }
};
```

### Custom Plugin

```typescript
import type { Plugin, NavigationTree } from 'svelte-markdown-pages';

const myPlugin: Plugin = {
  name: 'my-plugin',
  
  process(content: string): string {
    return content;
  },
  
  transform(navigation: NavigationTree): NavigationTree {
    // Transform navigation structure
    return navigation;
  }
};
```
