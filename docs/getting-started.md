# Getting Started

Let's get you set up with Markpage in just a few steps.

> 📖 **This is the core getting started guide. For advanced features, see the [Custom Components](custom-components.md) and [Token Overrides](token-overrides.md) guides.**

## What is Markpage?

Markpage helps you render Markdown files as HTML pages with any framework. It provides:

- **Organized navigation structure** for your content
- **Framework-agnostic** utilities that work with React, Vue, Svelte, Angular, or vanilla JavaScript
- **Component system** for embedding interactive components in markdown (via `@markpage/svelte`)

## Core Usage

### 1. Install the Package

```bash
npm install markpage
```

### 2. Create Your Content Structure

Create a directory with your markdown content:

```
my-docs/
├── getting-started.md
├── installation.md
└── guides/
    ├── basic-usage.md
    └── advanced-features.md
```

### 3. Build Your Documentation

```typescript
import { buildPages } from 'markpage/builder';

await buildPages('./my-docs', {
  appOutput: './src/lib/content',
  includeContent: true
});
```

### 4. Use in Your App

```typescript
import { NavigationTree, loadContent } from 'markpage/renderer';
import navigationData from './src/lib/content/navigation.json';
import contentBundle from './src/lib/content/content.json';

const navigation = new NavigationTree(navigationData);
const content = await loadContent('getting-started.md', contentBundle);
```

## Svelte Integration

For Svelte apps, use the `@markpage/svelte` package to render markdown with components:

### 1. Install the Svelte Package

```bash
npm install @markpage/svelte
```

### 2. Basic Markdown Rendering

```svelte
<script>
  import { Markdown } from '@markpage/svelte';

  const source = `
# Hello World

This is **bold** text and this is *italic*.

- List item 1
- List item 2

[Visit our website](https://example.com)
  `;
</script>

<Markdown {source} />
```

### 3. With Custom Components

```svelte
<script>
  import { Markdown, MarkpageOptions } from '@markpage/svelte';
  import Button from './Button.svelte';

  const options = new MarkpageOptions()
    .addCustomComponent('Button', Button);

  const source = `
# My Documentation

Here's a regular paragraph.

<Button variant="primary">Click me</Button>
  `;
</script>

<Markdown {source} {options} />
```

## Navigation Structure

### Automatic Discovery

By default, Markpage automatically discovers markdown files in alphabetical order:

```
my-docs/
├── getting-started.md    # 1st
├── installation.md       # 2nd
└── guides/
    ├── basic-usage.md    # 3rd
    └── advanced.md       # 4th
```

### Custom Navigation (Optional)

Create `.index.json` files to define custom navigation order:

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
    { "name": "basic-usage", "type": "page", "label": "Basic Usage" },
    { "name": "advanced", "type": "page", "label": "Advanced Features" }
  ]
}
```

## CLI Usage

### Build for App/Website

```bash
npx markpage build ./my-docs --output ./src/lib/content
```

## What's Next?

- **[Custom Components](custom-components.md)** - Learn how to create and use custom components in markdown
- **[Token Overrides](token-overrides.md)** - Override built-in markdown tokens and create extensions
- **[Installation Guide](guides/installation.md)** - Detailed installation instructions
