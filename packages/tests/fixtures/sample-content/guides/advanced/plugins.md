# Plugins

Extend the package functionality with plugins.

## Plugin System

The package supports a plugin system for extending functionality:

```typescript
interface Plugin {
  name: string;
  version: string;
  processContent?(content: string): string;
  processNavigation?(navigation: NavigationTree): NavigationTree;
}
```

## Creating a Plugin

Here's an example of a simple plugin:

```typescript
const tocPlugin: Plugin = {
  name: 'table-of-contents',
  version: '1.0.0',
  processContent(content: string): string {
    // Add table of contents to content
    return addTableOfContents(content);
  }
};
```

## Using Plugins

Register plugins when building:

```typescript
import { buildDocs } from 'svelte-markdown-pages/builder';

await buildDocs('./content', {
  appOutput: './src/lib/content',
  plugins: [tocPlugin, otherPlugin]
});
```

## Built-in Plugins

The package includes several built-in plugins:

- **Table of Contents**: Automatically adds TOC to pages
- **Syntax Highlighting**: Adds code syntax highlighting
- **Link Processing**: Processes internal links