# Installation

Follow this guide to install and set up svelte-markdown-pages in your project.

## Prerequisites

Before installing svelte-markdown-pages, make sure you have:

- **Node.js 18+** - Required for modern JavaScript features
- **npm or yarn** - Package manager for installing dependencies
- **Svelte 5+** - The package is designed for Svelte 5 and later

## Quick Install

Install the package using npm:

```bash
npm install svelte-markdown-pages
```

Or using yarn:

```bash
yarn add svelte-markdown-pages
```

## Manual Setup

### 1. Create a New SvelteKit Project (Optional)

If you're starting from scratch, create a new SvelteKit project:

```bash
npm create svelte@latest my-docs-site
cd my-docs-site
npm install
```

### 2. Install svelte-markdown-pages

```bash
npm install svelte-markdown-pages
```

### 3. Set Up Your Content Structure

Create a directory for your documentation content:

```bash
mkdir docs
```

### 4. Create Your First Content

Create a basic documentation structure:

```bash
# Create the main index file
echo '{
  "items": [
    { "name": "getting-started", "type": "page", "label": "Getting Started" }
  ]
}' > docs/.index.json

# Create your first markdown file
echo '# Getting Started

Welcome to your documentation site!

This is your first page created with svelte-markdown-pages.' > docs/getting-started.md
```

### 5. Build Your Documentation

Create a build script in your `package.json`:

```json
{
  "scripts": {
    "build:docs": "node -e \"import('svelte-markdown-pages/builder').then(({buildDocs}) => buildDocs('./docs', {appOutput: './src/lib/content', includeContent: true}))\""
  }
}
```

Or create a build script file:

```typescript
// scripts/build-docs.js
import { buildDocs } from 'svelte-markdown-pages/builder';

await buildDocs('./docs', {
  appOutput: './src/lib/content',
  websiteOutput: './src/lib/content',
  includeContent: true
});
```

### 6. Use in Your SvelteKit App

Create a documentation page in your SvelteKit app:

```svelte
<!-- src/routes/docs/+page.svelte -->
<script lang="ts">
  import { NavigationTree, loadContent } from 'svelte-markdown-pages/renderer';
  import navigationData from '$lib/content/navigation.json';
  import contentBundle from '$lib/content/content.json';
  
  let navigation = $state(new NavigationTree(navigationData));
  let currentPage = $state("getting-started.md");
  let pageContent = $state<string | null>(null);
  
  $effect(() => {
    if (currentPage && contentBundle) {
      loadContent(currentPage, contentBundle).then(content => {
        pageContent = content;
      });
    }
  });
</script>

<div class="docs-layout">
  <nav class="sidebar">
    <!-- Navigation will go here -->
  </nav>
  <main class="content">
    {@html pageContent || 'Loading...'}
  </main>
</div>
```

## Content Structure

### Basic Structure

Your documentation should follow this structure:

```
docs/
├── .index.json              # Root navigation
├── getting-started.md        # Getting started page
├── guides/
│   ├── .index.json          # Guides section navigation
│   ├── installation.md      # Installation guide
│   └── configuration.md     # Configuration guide
└── api/
    ├── .index.json          # API section navigation
    └── reference.md         # API reference
```

### Index.json Format

Each `.index.json` file defines the navigation structure for that directory:

```json
{
  "items": [
    {
      "name": "page-name",
      "type": "page",
      "label": "Page Display Name"
    },
    {
      "name": "section-name",
      "type": "section",
      "label": "Section Display Name"
    }
  ]
}
```

### Item Properties

- `name`: File/directory name (without extension)
- `type`: Either `"page"` or `"section"`
- `label`: Display label for navigation
- `collapsed`: Optional boolean to collapse sections by default
- `url`: Optional external URL

## Build Configuration

### Basic Build

```typescript
import { buildDocs } from 'svelte-markdown-pages/builder';

await buildDocs('./docs', {
  appOutput: './src/lib/content',
  includeContent: true
});
```

### Advanced Build Options

```typescript
await buildDocs('./docs', {
  appOutput: './src/lib/content',
  websiteOutput: './src/lib/content',
  staticOutput: './dist',
  includeContent: true,
  processor: customProcessor,
  
});
```

## CLI Usage

You can also use the CLI for quick builds:

```bash
# Build for app integration
npx svelte-markdown-pages build ./docs --output ./src/lib/content

# Generate static site
npx svelte-markdown-pages static ./docs --output ./dist
```

## Next Steps

Now that you have svelte-markdown-pages installed, check out:

- [Configuration](./configuration.md) - Learn about build options and customization
- [API Reference](../api/builder.md) - Complete API documentation
- [Examples](../../packages/examples) - Working examples in the examples package

## Troubleshooting

### Common Issues

**Module not found errors**: Make sure you're using Node.js 18+ and have installed the package correctly.

**Build errors**: Check that your `.index.json` files are valid JSON and follow the correct format.

**Content not loading**: Verify that your markdown files exist and are referenced correctly in the navigation.

### Getting Help

- Check the [API Reference](../api/builder.md) for detailed documentation
- Look at the [examples](../../packages/examples) for working implementations
- Review the [test suite](../../packages/tests) for usage patterns
