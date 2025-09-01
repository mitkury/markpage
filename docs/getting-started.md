# Getting Started

Welcome to **Markpage** - a tool that builds and manages markdown content with organized navigation.

**What it does**: Point at a directory with markdown files and get navigation structure and content that you can use to render in your app.

## What is Markpage?

Markpage is a standalone npm package that transforms your markdown content into structured data and navigation. It provides:

- **Distributed Navigation**: Each folder defines its own structure with `.index.json` files
- **Multiple Output Formats**: App bundles, website navigation, and static HTML sites
- **Type-Safe**: Full TypeScript support with Zod validation
- **Framework Agnostic**: Works with any framework or no framework at all
- **Flexible**: Point to any directory with markdown and `.index.json` files
- **Comprehensive Testing**: >90% test coverage with comprehensive test suite

## Key Features

### 🗂️ Organized Navigation
Organize your content with a navigation system. Each folder can define its own structure using `.index.json` files, making it easy to maintain large content sites.

### 📦 Multiple Output Formats
Generate different outputs for different use cases:
- **App bundles** for integration into existing applications
- **Website navigation** for standalone content sites
- **Static HTML sites** for deployment to any hosting platform

### 🔧 Type-Safe Development
Built with TypeScript and Zod validation, providing excellent developer experience with full type safety and runtime validation.

### 🎨 Framework Agnostic
Pure JavaScript/TypeScript utilities that work seamlessly with any framework - React, Vue, Svelte, Angular, or vanilla JS.

### ⚡ Content Management
Point to any directory with markdown content and `.index.json` files. Customize everything from styling to content processing with custom processors.

## Quick Start

### 1. Install the Package

```bash
npm install markpage
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
import { buildPages } from 'markpage/builder';

await buildPages('./my-docs', {
  appOutput: './src/lib/content',
  includeContent: true
});
```

### 5. Use in Your App

```typescript
import { NavigationTree, loadContent } from 'markpage/renderer';
import navigationData from './src/lib/content/navigation.json';
import contentBundle from './src/lib/content/content.json';

const navigation = new NavigationTree(navigationData);
const content = await loadContent('getting-started.md', contentBundle);
```

## Use Cases

### Content Sites
Perfect for documentation, blogs, knowledge bases, and any markdown-based content.

### Websites
Create websites with organized content and easy navigation management.

### Static Sites
Generate complete static HTML sites for deployment to any hosting platform.

## What's Next?

Ready to get started? Check out the [Installation](./guides/installation.md) guide to set up your first content site!

## Examples

- **This Website**: Built using Markpage itself
- **Test Suite**: Comprehensive examples in the `packages/tests` directory
