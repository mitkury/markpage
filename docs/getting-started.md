# Getting Started

Welcome to **svelte-markdown-pages** - a powerful, flexible solution for building documentation sites with distributed navigation structure for Svelte projects.

## What is svelte-markdown-pages?

svelte-markdown-pages is a standalone npm package that transforms your markdown content into a fully-featured documentation site. It provides:

- **Distributed Navigation**: Each folder defines its own structure with `.index.json` files
- **Multiple Output Formats**: App bundles, website navigation, and static HTML sites
- **Type-Safe**: Full TypeScript support with Zod validation
- **Framework Agnostic**: Svelte 5 components that work in any Svelte project
- **Flexible**: Point to any directory with markdown and `.index.json` files
- **Comprehensive Testing**: >90% test coverage with comprehensive test suite

## Key Features

### 🗂️ Distributed Navigation
Organize your documentation with a distributed navigation system. Each folder can define its own structure using `.index.json` files, making it easy to maintain large documentation sites.

### 📦 Multiple Output Formats
Generate different outputs for different use cases:
- **App bundles** for integration into existing Svelte applications
- **Website navigation** for standalone documentation sites
- **Static HTML sites** for deployment to any hosting platform

### 🔧 Type-Safe Development
Built with TypeScript and Zod validation, providing excellent developer experience with full type safety and runtime validation.

### 🎨 Framework Agnostic
Svelte 5 components that work seamlessly in any Svelte project, including SvelteKit applications.

### ⚡ Flexible & Extensible
Point to any directory with markdown content and `.index.json` files. Customize everything from styling to content processing with custom processors.

## Quick Start

### 1. Install the Package

```bash
npm install svelte-markdown-pages
```

### 2. Create Your Content Structure

Create a directory with your markdown content and `.index.json` files:

```
my-docs/
├── .index.json
├── getting-started.md
└── guides/
    ├── .index.json
    └── installation.md
```

### 3. Define Navigation

**Root level** (`my-docs/.index.json`):
```json
{
  "items": [
    { "name": "getting-started", "type": "page", "label": "Getting Started" },
    { "name": "guides", "type": "section", "label": "Guides" }
  ]
}
```

**Section level** (`my-docs/guides/.index.json`):
```json
{
  "items": [
    { "name": "installation", "type": "page", "label": "Installation" }
  ]
}
```

### 4. Build Your Documentation

```typescript
import { buildPages } from 'svelte-markdown-pages/builder';

await buildPages('./my-docs', {
  appOutput: './src/lib/content',
  includeContent: true
});
```

### 5. Use in Your App

```typescript
import { NavigationTree, loadContent } from 'svelte-markdown-pages/renderer';
import navigationData from './src/lib/content/navigation.json';
import contentBundle from './src/lib/content/content.json';

const navigation = new NavigationTree(navigationData);
const content = await loadContent('getting-started.md', contentBundle);
```

## Use Cases

### Documentation Sites
Perfect for project documentation, API references, and user guides.

### Blog Systems
Create blog systems with hierarchical organization and easy content management.

### Knowledge Bases
Build comprehensive knowledge bases with distributed content management.

### Static Sites
Generate complete static HTML sites for deployment to any hosting platform.

## What's Next?

Ready to get started? Check out the [Installation](./guides/installation.md) guide to set up your first documentation site!

## Examples

- **This Website**: Built using svelte-markdown-pages itself
- **Example Project**: See the `packages/examples` directory for a complete working example
- **Test Suite**: Comprehensive examples in the `packages/tests` directory
