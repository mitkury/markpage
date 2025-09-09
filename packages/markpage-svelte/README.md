# @markpage/svelte

Svelte integration for Markpage with component support in markdown files.

## Features

- **Component Registration**: Register Svelte components for use in markdown
- **Markdown Parsing**: Automatically detect and parse component usage in markdown
- **SSR Support**: Full server-side rendering support for SvelteKit
- **Type Safety**: Full TypeScript support for component registration and usage
- **Flexible Props**: Support for various prop types (strings, numbers, booleans)
- **Children Support**: Components can contain markdown children content

## Installation

```bash
npm install @markpage/svelte
```

## Quick Start

```svelte
<script lang="ts">
  import { MarkdownRenderer } from '@markpage/svelte';
  import MyComponent from './MyComponent.svelte';

  const components = new Map([
    ['MyComponent', MyComponent]
  ]);

  const content = `
  # Example
  
  <MyComponent someProp="value" />
  `;
</script>

<MarkdownRenderer content={content} components={components} enableComponents={true} />
```

## API Reference

### Exports

- `MarkdownRenderer.svelte` – render markdown with embedded Svelte components
- `ComponentParser` – parse component tags embedded in markdown
- Types – `ComponentNode`, `ComponentOptions`, `RegisteredComponent`, `ParsedContent`

### Component Registration Options

```typescript
interface ComponentOptions {
  defaultProps?: Record<string, any>;
  validate?: (props: Record<string, any>) => boolean | string;
}
```

#### Default Props

Set default values for component props:

```typescript
mp.addComponent('Button', ButtonComponent, {
  defaultProps: { 
    variant: 'primary',
    size: 'medium' 
  }
});
```

#### Validation

Add custom validation for component props:

```typescript
mp.addComponent('CodeBlock', CodeBlockComponent, {
  validate: (props) => {
    if (!props.language) {
      return 'Language prop is required';
    }
    if (!props.code) {
      return 'Code prop is required';
    }
    return true;
  }
});
```

## Component Usage in Markdown

### Basic Component

```markdown
<Button>Click me</Button>
<Button variant="primary" size="large">Submit</Button>
```

### Component with Props

```markdown
<Alert variant="warning" title="Important">
  This is a warning message.
</Alert>
```

### Component with Children

```markdown
<Card title="Example" subtitle="With content">
  This is **bold** text with [a link](https://example.com).
  
  - List item 1
  - List item 2
</Card>
```

### Component Detection Rules

Components are detected when they:
- Start with a capital letter
- Appear outside of code blocks (```)
- Appear outside of inline code (`)
- Follow the pattern `<ComponentName />` or `<ComponentName>content</ComponentName>`

## Example Components

### Button Component

```svelte
<script>
  export let variant = 'default';
  export let size = 'medium';
  export let disabled = false;
  let { children } = $props();
</script>

<button class="btn btn-{variant} btn-{size}" {disabled}>
  {@render children()}
</button>
```

### Alert Component

```svelte
<script>
  export let variant = 'info';
  export let title = '';
  let { children } = $props();
</script>

<div class="alert alert-{variant}">
  {#if title}<h4>{title}</h4>{/if}
  {@render children()}
</div>
```

## Options

`MarkdownRenderer` props:

- `content: string` – HTML string produced by a markdown parser (e.g. `marked.parse`)
- `components: Map<string, Component>` – registry of Svelte components
- `enableComponents?: boolean` – default `true`; when false, renders markdown only
- `onComponentEvent?: (e: { component: string; event: any }) => void` – external event hook

## SSR Support

- Built using `@sveltejs/package` for SvelteKit compatibility
- Works in SSR; avoid direct browser globals in your components during SSR

## TypeScript Support

Full TypeScript support is included:

```typescript
import type { 
  ComponentNode, 
  ComponentOptions, 
  MarkpageSvelteOptions 
} from '@markpage/svelte';

// All types are properly exported
```

## Security

- Components must be registered upfront
- No arbitrary code execution
- No dynamic imports
- Component names are validated in strict mode

## Performance

- Components are registered once at startup
- Parsing is done on-demand
- No runtime compilation overhead
- Efficient component lookup using Map

## Development

This package is part of the Markpage monorepo. For development, you can switch between using the local `markpage` package and the published version:

### Using Local Markpage (for development)

```bash
# Use local markpage version
npm run dev:local

# Or manually link
npm run link:local
npm run dev
```

### Using Published Markpage (for testing)

```bash
# Use published markpage version
npm run dev:published

# Or manually unlink and reinstall
npm run unlink:local
npm run dev
```

### Development Scripts

- `npm run dev:local` - Start development with local markpage
- `npm run dev:published` - Start development with published markpage
- `npm run link:local` - Link to local markpage package
- `npm run unlink:local` - Unlink and reinstall published markpage

## Contributing

This package is part of the Markpage monorepo. See the main [README](../../README.md) for contribution guidelines.

## License

MIT License - see [LICENSE](../../LICENSE) file for details.