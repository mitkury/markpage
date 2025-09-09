# Getting Started

Let's get you set up with Markpage in just a few steps.

> 📖 **This is the detailed getting started guide. For a quick overview, see the [main README](https://github.com/mitkury/markpage/blob/main/README.md).**

- **Distributed Navigation**: Each folder can define its own structure with `.index.json` files (optional)
- **Multiple Output Formats**: App bundles, website navigation
- **Framework Agnostic**: Works with React, Vue, Svelte, Angular, or vanilla JavaScript
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
  import { Markdown, MarkpageOptions } from '@markpage/svelte';
  import Button from './Button.svelte';
  import Alert from './Alert.svelte';

  const options = new MarkpageOptions()
    .addCustomComponent('Button', Button)
    .addCustomComponent('Alert', Alert);

  const markdown = `
  ## Examples

  <Button variant="primary">Primary Button</Button>

  <Alert variant="info">
    This is an informational alert with **markdown** content inside.
  </Alert>
  `;
</script>

<Markdown source={markdown} {options} />
```

## CLI Usage

### Build for App/Website

```bash
npx markpage build ./my-docs --output ./src/lib/content
```


## Use Cases

### Content Sites
Perfect for documentation, blogs, knowledge bases, and any markdown-based content.

### Websites
Create websites with organized content and easy navigation management.


## What's Next?

Ready to get started? Check out the [Installation](./guides/installation.md) guide to set up your first content site!

## Examples

- **Test Suite**: Comprehensive examples in the [tests directory](https://github.com/mitkury/markpage/tree/main/packages/tests)
