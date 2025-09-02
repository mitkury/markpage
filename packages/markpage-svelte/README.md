# @markpage/svelte

Svelte integration for Markpage with component support in markdown files.

## Features

- **Component Registration**: Register Svelte components for use in markdown
- **Markdown Parsing**: Automatically detect and parse component usage in markdown
- **Type Safety**: Full TypeScript support for component registration and usage
- **Flexible Props**: Support for various prop types (strings, numbers, booleans)
- **Children Support**: Components can contain markdown children content

## Installation

```bash
npm install @markpage/svelte
```

## Quick Start

```typescript
import { MarkpageSvelte } from '@markpage/svelte';
import { NavigationTree } from 'markpage';
import MyComponent from './MyComponent.svelte';

// Create instance with navigation and content
const mp = new MarkpageSvelte(navigation, content);

// Register components
mp.addComponent('MyComponent', MyComponent);

// Use in your Svelte app
<mp.Render path="features/components" />
```

## API Reference

### MarkpageSvelte

The main class for managing components and content.

#### Constructor

```typescript
new MarkpageSvelte(
  navigation: NavigationItem[],
  content: Record<string, string>,
  options?: MarkpageSvelteOptions
)
```

#### Methods

##### `addComponent(name, component, options?)`

Register a component for use in markdown.

```typescript
mp.addComponent('Button', ButtonComponent);
mp.addComponent('Alert', AlertComponent, { 
  defaultProps: { variant: 'info' } 
});
```

##### `removeComponent(name)`

Remove a registered component.

```typescript
mp.removeComponent('Button');
```

##### `getComponent(name)`

Get a registered component.

```typescript
const Button = mp.getComponent('Button');
```

##### `hasComponent(name)`

Check if a component is registered.

```typescript
if (mp.hasComponent('Button')) {
  // Component is available
}
```

##### `getRegisteredComponents()`

Get all registered component names.

```typescript
const components = mp.getRegisteredComponents();
// ['Button', 'Alert', 'Card']
```

##### `parseContent(content)`

Parse markdown content and extract components.

```typescript
const components = mp.parseContent(markdownContent);
```

##### `hasComponents(content)`

Check if content contains any components.

```typescript
if (mp.hasComponents(content)) {
  // Content has components
}
```

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

## Configuration Options

```typescript
interface MarkpageSvelteOptions {
  enableComponents?: boolean;  // Default: true
  strictMode?: boolean;        // Default: false
}
```

### Strict Mode

When enabled, strict mode validates component names:

```typescript
const mp = new MarkpageSvelte(navigation, content, { 
  strictMode: true 
});

// This will throw an error
mp.addComponent('button', ButtonComponent); // ❌ lowercase
mp.addComponent('my-component', Component); // ❌ hyphen
mp.addComponent('Button', ButtonComponent); // ✅ valid
```

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

## Contributing

This package is part of the Markpage monorepo. See the main [README](../../README.md) for contribution guidelines.

## License

MIT License - see [LICENSE](../../LICENSE) file for details.