This is a context for AI editor/agent about the project. It's generated with a tool Airul (https://github.com/mitkury/airul) out of 6 sources. Edit .airul.json to change sources or enabled outputs. After any change to sources or .airul.json, run `airul gen` to regenerate the context.

# From README.md:

# Markpage

Markpage helps you render Markdown files as HTML pages with any framework.

Point Markpage at a directory with markdown files and get organized navigation structure and content that you can use to render in your app.

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

## CLI Usage

### Build for App/Website

```bash
npx markpage build ./my-docs --output ./src/lib/content
```

### Generate Static Site

```bash
npx markpage static ./my-docs --output ./dist
```

## Use Cases

### Content Sites
Perfect for documentation, blogs, knowledge bases, and any markdown-based content.

### Websites
Create websites with organized content and easy navigation management.

### Static Sites
Generate complete static HTML sites for deployment to any hosting platform.

## Examples

- **Test suite** - Comprehensive examples in the [tests directory](https://github.com/mitkury/markpage/tree/main/packages/tests)

## Contributing

👨‍💻 **Want to contribute? See our [How to Contribute](docs/how-to-contribute.md) guide.**

## License

MIT License
---

# From docs/getting-started.md:

# Getting Started

Let's get you set up with Markpage in just a few steps.

> 📖 **This is the detailed getting started guide. For a quick overview, see the [main README](https://github.com/mitkury/markpage/blob/main/README.md).**

- **Distributed Navigation**: Each folder can define its own structure with `.index.json` files (optional)
- **Multiple Output Formats**: App bundles, website navigation, and static HTML sites
- **Framework Agnostic**: Works with React, Vue, Svelte, Angular, or vanilla JavaScript
- **Component System**: Embed interactive components directly in markdown files
- **Flexible**: Point to any directory with markdown files

## Quick Start

### 1. Install the Package

```bash
npm install markpage
```

### 2. Create Your Content Structure

Create a directory with your markdown content. You can optionally add `.index.json` files to organize the navigation:

```
my-docs/
├── .index.json          # Optional: defines custom navigation order
├── getting-started.md
└── guides/
    ├── .index.json      # Optional: organizes this section
    └── installation.md
```

**Without `.index.json` files**: Markdown files are automatically discovered in alphabetical order.

### 3. Define Navigation (Optional)

If you want custom navigation order, create `.index.json` files:

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

## Component System (via @markpage/svelte)

Markpage supports components in markdown files via the `@markpage/svelte` package. Render markdown with the `Markdown` component and provide a `components` map for custom tags or token overrides.

### TestButton Component

<TestButton variant="primary" text="Primary Button" />
<TestButton variant="success" text="Success Button" />
<TestButton variant="warning" text="Warning Button" />
<TestButton variant="danger" text="Danger Button" />

### Button Component

<Button variant="primary">Primary Button</Button>
<Button variant="secondary">Secondary Button</Button>
<Button variant="danger">Danger Button</Button>

### Alert Component

<Alert variant="info">
  This is an informational alert with **markdown** content inside.
</Alert>

<Alert variant="success">
  This is a success message! Components work perfectly.
</Alert>

### Card Component

<Card title="Component Features" subtitle="What you can do">
  - Use any markdown syntax inside components
  - Pass props to customize appearance
  - Nest components within each other
  - Maintain full markdown formatting
</Card>

### Unknown Component Fallback

When a component isn't registered, it's rendered as plain text instead of showing an error:

<UnknownComponent variant="demo" title="This component doesn't exist">
  This content will be displayed as plain text
</UnknownComponent>

<AnotherMissingComponent size="large" />

Components are registered upfront and can receive props like `variant`, `size`, `title`, etc.

### Usage in Svelte

```svelte
<script lang="ts">
  import { Markdown } from '@markpage/svelte';
  import Button from './Button.svelte';
  import Alert from './Alert.svelte';

  const components = new Map([
    ['Button', Button],
    ['Alert', Alert]
  ]);

  const markdown = `
  ## Examples

  <Button variant="primary">Primary Button</Button>

  <Alert variant="info">
    This is an informational alert with **markdown** content inside.
  </Alert>
  `;
</script>

<Markdown source={markdown} components={components} />
```

## CLI Usage

### Build for App/Website

```bash
npx markpage build ./my-docs --output ./src/lib/content
```

### Generate Static Site

```bash
npx markpage static ./my-docs --output ./dist
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

- **Test Suite**: Comprehensive examples in the [tests directory](https://github.com/mitkury/markpage/tree/main/packages/tests)
---

# From docs/how-to-contribute.md:

# How to Contribute

This document is for contributors who want to work on the Markpage project.

## Project Structure

This is a monorepo with the following packages:

- **`packages/markpage`** - The main package that gets published to npm
- **`packages/markpage-svelte`** - Svelte integration package (components in markdown)
- **`packages/tests`** - Comprehensive test suite for the package
- **`packages/website`** - This documentation website

## Prerequisites

- Node.js 18+
- npm

## Setup

```bash
# Install dependencies for all packages
npm ci

# Build all packages
npm run build:pkgs

# Run tests
npm test
```

## Package Scripts

### Root Scripts
- `npm run build` - Build all packages and the website
- `npm run build:pkgs` - Build markpage and markpage-svelte packages
- `npm test` - Build packages and run all tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run dev:website` - Start the documentation website
- `npm run build:website` - Build the documentation website

### Individual Package Scripts
- `npm run dev --workspace=markpage` - Watch mode for the main package
- `npm run build --workspace=@markpage/svelte` - Build the Svelte package
- `npm run check --workspace=@markpage/website` - Run Svelte type checks

## Development Workflow

### Building

The main package uses [tsup](https://github.com/egoist/tsup) for building:

```bash
# Build all packages
npm run build:pkgs

# Or build individual packages
npm run build --workspace=markpage
npm run build --workspace=@markpage/svelte
```

### Testing

Tests are run using Vitest and must be kept green:

```bash
# Run all tests (builds packages first)
npm test

# Watch mode for development
npm run test:watch

# Coverage report
npm run test:coverage
```

### Website Development

The documentation website is built with SvelteKit and auto-builds content from `./docs`:

```bash
# Start dev server (auto-builds content)
npm run dev:website

# Build for production
npm run build:website

# Preview production build
npm --workspace=@markpage/website run preview
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## Code Style

- TypeScript for all source code
- Svelte 5 with runes mode for components
- Comprehensive test coverage (keep tests green)
- Follow existing patterns and conventions

## Package Publishing

Packages are published from their respective directories:

```bash
# Main package
cd packages/markpage
npm publish

# Svelte integration
cd packages/markpage-svelte
npm publish
```

## License

MIT License - see [LICENSE](https://github.com/mitkury/markpage/blob/main/LICENSE) file for details.
---

# From package.json:

{
  "name": "markpage-monorepo",
  "version": "0.0.2",
  "description": "Monorepo for markpage - markdown content management system",
  "private": true,
  "workspaces": [
    "packages/*"
  ],
  "scripts": {
    "build": "npm run build:pkgs && npm run build:website",
    "build:pkgs": "npm run copy-readme && npm run build --workspace=markpage && npm run build --workspace=@markpage/svelte",
    "dev": "npm run dev --workspace=markpage",
    "test": "npm run build:pkgs && npm run test --workspace=@markpage/tests",
    "test:watch": "npm run test:watch --workspace=@markpage/tests",
    "test:coverage": "npm run test:coverage --workspace=@markpage/tests",
    "build:website": "npm run build --workspace=@markpage/website",
    "dev:website": "npm run dev --workspace=@markpage/website",
    "copy-readme": "cp README.md packages/markpage/README.md",
    "prepublishOnly": "npm run build && npm run test"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0"
  },
  "repository": "https://github.com/mitkury/markpage",
  "license": "MIT",
  "overrides": {
    "@sveltejs/vite-plugin-svelte": "^4.0.0-next.6"
  }
}
---

# From docs/for-ai/rules.md:

# Basics for AI agents

# Git commits
Use imperative mood and use a prefix for the type of change.
Examples:
feat(auth): add user login
fix(payment): resolve gateway timeout
ci: update release workflow
docs: update README
dev: add the core and the client as aliases to the sveltkit config

## Commit types
Any product-related feature - "feature(name): description"
Any product-related fix - "fix(name): description"
Anything related to building and releasing (including fixes of CI) - "ci: description"
Anything related to testing - "tests: description"
Anything related to documentation - "docs: description"
Anything related to the build pipelines and dev convinience - "dev: description"
---

# From docs/for-ai/svelte.md:

New in SvelteKit 5:

# Runes

## Reactivity

Reactivity with `let x = "hello"` at component top-level is replaced with:

```js
let x: string = $state("hello")
```

This makes x reactive in the component, and also in any js functions that operate on it.

Don't use `$state<T>()` to pass the type. Always use `let x: Type =`. Variables declared with `let x = "hello"` are no longer reactive.

## Derived values

Old style:
```js
$: b = a + 1
```

New style:
```js
let b = $derived(a + 1)
```

Or for more complex use cases:
```js
let b = $derived.by(() => {
    // ... more complex logic
    return a + 1;
})
```

`$derived()` takes an expression. `$derived.by()` takes a function.

## Effect

```js
let a = $state(1);
let b = $state(2);
let c;

// This will run when the component is mounted, and for every updates to a and b.
$effect(() => {
    c = a + b;
});
```

Note: 
- Values read asynchronously (promises, setTimeout) inside `$effect` are not tracked.
- Values inside objects are not tracked directly inside `$effect`:

```js
// This will run once, because `state` is never reassigned (only mutated)
$effect(() => {
    state;
});

// This will run whenever `state.value` changes
$effect(() => {
    state.value;
});
```

An effect only depends on the values that it read the last time it ran.

```js
$effect(() => {
    if (a || b) {
        // ...
    }
});
```

If `a` was true, `b` was not read, and the effect won't run when `b` changes.

## Props

Old way to pass props to a component:
```js
export let a = "hello";
export let b;
```

New way:
```js
let {a = "hello", b, ...everythingElse} = $props()
```

`a` and `b` are reactive.

Types:
```js
let {a = "hello", b}: {a: string, b: number} = $props()
```

Note: Do NOT use this syntax for types:
```js
let { x = 42 } = $props<{ x?: string }>();  // ❌ Incorrect
```

# Slots and snippets

Instead of using `<slot />` in a component, you should now do:

```js
let { children } = $props()
// ...
{@render children()}  // This replaces <slot />
```

# Event Handling

In Svelte 5 the events do not use `on:event` syntax, they use `onevent` syntax.

In Svelte 5 `on:click` syntax is not allowed. Event handlers have been given a facelift in Svelte 5. Whereas in Svelte 4 we use the `on:` directive to attach an event listener to an element, in Svelte 5 they are properties like any other (in other words - remove the colon):

```svelte
<button onclick={() => count++}>
  clicks: {count}
</button>
```

`preventDefault` and `once` are removed in Svelte 5. Normal HTML event management is advised:

```svelte
<script>
  function once(fn) {
    return function(event) {
      if (fn) fn.call(this, event);
      fn = null;
    };
  }

  function preventDefault(fn) {
    return function(event) {
      event.preventDefault();
      fn.call(this, event);
    };
  }
</script>

<button onclick={once(preventDefault(handler))}>...</button>
```