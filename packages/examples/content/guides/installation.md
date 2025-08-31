# Installation

Follow these steps to install the package.

## Prerequisites

- Node.js 18+
- npm or yarn

## Quick Install

```bash
npm install svelte-markdown-pages
```

## Manual Setup

1. Create a new SvelteKit project
2. Install the package
3. Set up your content structure
4. Build your documentation

## Content Structure

Create a directory with your markdown content and `.index.json` files:

```
my-content/
├── .index.json
├── getting-started.md
└── guides/
    ├── .index.json
    └── installation.md
```

## Define Navigation

**Root level** (`my-content/.index.json`):
```json
{
  "items": [
    { "name": "getting-started", "type": "page", "label": "Getting Started" },
    { "name": "guides", "type": "section", "label": "Guides" }
  ]
}
```

**Section level** (`my-content/guides/.index.json`):
```json
{
  "items": [
    { "name": "installation", "type": "page", "label": "Installation" }
  ]
}
```

## Build Documentation

```typescript
import { buildPages } from 'svelte-markdown-pages/builder';

await buildPages('./my-content', {
  appOutput: './src/lib/content',
  websiteOutput: './src/lib/content',
  includeContent: true
});
```

## Use in Your App

```typescript
import { NavigationTree, loadContent } from 'svelte-markdown-pages/renderer';
import navigationData from './src/lib/content/navigation.json';
import contentBundle from './src/lib/content/content.json';

const navigation = new NavigationTree(navigationData);
const content = await loadContent('getting-started.md', contentBundle);
```

Next: Learn about [Configuration](./configuration.md) options.
