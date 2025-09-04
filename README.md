# Markpage

Markpage helps to render Markdown files on html pages with any framework.

You point Markpage at a directory with markdown files and get navigation structure and content that you can use to render in your app.

## What it does

Point Markpage at a directory with markdown files and `.index.json` files, and get:
- **Organized navigation structure** for your content
- **Multiple output formats** (app bundles, website navigation, static HTML)
- **Framework-agnostic** utilities that work with React, Vue, Svelte, Angular, or vanilla JavaScript
- **Component system** for embedding interactive components in markdown (Svelte support included)

## Quick Start

```bash
npm install markpage
```

```typescript
import { buildPages } from 'markpage/builder';

await buildPages('./my-content', {
  appOutput: './src/lib/content',
  includeContent: true
});
```

## Component System

Markpage supports embedding interactive components directly in markdown files, similar to MDX but simpler:

```markdown
# My Documentation

Here's a regular paragraph.

<TestButton variant="primary" text="Click me" />
<TestButton /> <!-- Uses default props -->
```

Components are registered and used with the `MarkdownRenderer` component:

```svelte
<script>
  import { MarkdownRenderer } from '@markpage/svelte';
  import TestButton from './TestButton.svelte';
  
  const components = new Map([
    ['TestButton', TestButton]
  ]);
</script>

<MarkdownRenderer 
  content={markdownContent} 
  components={components} 
/>
```

### Framework Integrations

- Svelte: `@markpage/svelte` is available on npm.

```bash
npm install @markpage/svelte
```

- React: not available yet — feel free to contribute an official `@markpage/react` integration (PRs welcome).

## Getting Started

For detailed step-by-step instructions, see the [Getting Started Guide](https://github.com/mitkury/markpage/blob/main/docs/getting-started.md).

## Examples

- **Test suite** - Comprehensive examples in the [tests directory](https://github.com/mitkury/markpage/tree/main/packages/tests)

## Contributing

👨‍💻 **For contributors: [How to Contribute](https://github.com/mitkury/markpage/blob/main/docs/how-to-contribute.md)**

## License

MIT License

