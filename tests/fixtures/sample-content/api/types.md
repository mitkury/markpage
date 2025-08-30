# Type Definitions

Complete type definitions for the package.

## Core Types

### DocItemType

```typescript
type DocItemType = "section" | "page"
```

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

### IndexFile

```typescript
interface IndexFile {
  items: DocItem[];
}
```

## Navigation Types

### NavigationItem

```typescript
interface NavigationItem extends DocItem {
  path?: string;
  items?: NavigationItem[];
  parent?: NavigationItem;
}
```

### NavigationTree

```typescript
interface NavigationTree {
  items: NavigationItem[];
}
```

## Build Types

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

### ContentProcessor

```typescript
interface ContentProcessor {
  process(content: string): string;
}
```

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

### DocsContentProps

```typescript
interface DocsContentProps {
  content?: string | null;
  title?: string;
  loading?: boolean;
  error?: string | null;
}
```

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

## Zod Schemas

### DocItemTypeSchema

```typescript
const DocItemTypeSchema = z.enum(["section", "page"]);
```

### DocItemSchema

```typescript
const DocItemSchema = z.object({
  name: z.string().min(1),
  type: DocItemTypeSchema,
  label: z.string().min(1),
  collapsed: z.boolean().optional(),
  url: z.string().url().optional()
});
```

### IndexSchema

```typescript
const IndexSchema = z.object({
  items: z.array(DocItemSchema)
});
```