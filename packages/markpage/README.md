# Markpage

Markpage helps to render Markdown files on html pages with any framework.

You point Markpage at a directory with markdown files and get navigation structure and content that you can use to render in your app.

## Monorepo structure

This repository contains multiple packages:

- `packages/markpage` – core builder, renderer and types
- `packages/markpage-svelte` – Svelte integration (components in markdown)
- `packages/website` – documentation site built with SvelteKit and Markpage
- `packages/tests` – test suite covering builder/renderer and Svelte integration

## What it does

Point Markpage at a directory with markdown files and `.index.json` files, and get:
- **Organized navigation structure** for your content
- **Multiple output formats** (app bundles, website navigation, static HTML)
- **Framework-agnostic** utilities that work with React, Vue, Svelte, Angular, or vanilla JavaScript
- **Optional component system** for embedding interactive components in markdown (via separate framework packages; Svelte support available)

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

### Scripts (root)

Useful root scripts for local development:

- `npm test` – builds local packages and runs the test suite (`packages/tests`)
- `npm run build` – builds local packages then the documentation website
- `npm run dev:website` – starts the SvelteKit docs website (auto-builds content from `./docs`)
- `npm run build:website` – production build of the website

Inside `packages/website`:

- `npm run check` – Svelte type checks (`svelte-check`) for the website
- `npm run preview` – preview production build locally

## Component System (via @markpage/svelte)

Component embedding is provided by the separate `@markpage/svelte` package (React version is not available yet — contributions welcome). It lets you embed interactive Svelte components directly in markdown files, similar to MDX but simpler:

```markdown
# My Documentation

Here's a regular paragraph.

<TestButton variant="primary" text="Click me" />
<TestButton /> <!-- Uses default props -->
```

Components are registered and rendered with the `Markdown` component:

```svelte
<script>
  import { Markdown } from '@markpage/svelte';
  import TestButton from './TestButton.svelte';

  const components = new Map([
    ['TestButton', TestButton]
  ]);
</script>

<Markdown 
  source={markdownContent}
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

For detailed step-by-step instructions, see the [Getting Started Guide](docs/getting-started.md).

## Developing locally

1) Install dependencies

```bash
npm ci
```

2) Run tests (kept green)

```bash
npm test
```

3) Run the website (auto-builds docs from `./docs`)

```bash
npm run dev:website
```

4) Build and preview the website

```bash
npm run build:website
npm --workspace=@markpage/website run preview
```

## Examples

- **Test suite** - Comprehensive examples in the [tests directory](https://github.com/mitkury/markpage/tree/main/packages/tests)

## Contributing

👨‍💻 **For contributors: [How to Contribute](https://github.com/mitkury/markpage/blob/main/docs/how-to-contribute.md)**

## License

MIT License

