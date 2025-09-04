# Markdown Components Proposal

## Overview

This proposal outlines a feature to enable component usage in regular markdown files within Markpage, similar to MDX but simpler and more controlled. Components would be registered upfront in a framework-specific instance rather than allowing arbitrary imports.

## Goals

- Enable component usage in markdown files without changing the file format
- Maintain simplicity by requiring upfront component registration
- Provide framework-specific implementations (starting with Svelte)
- Keep the core markdown parsing clean and extensible

## Design Principles

1. **No arbitrary imports**: Components must be registered in the Markpage instance
2. **Framework agnostic core**: The core component parsing should work with any framework
3. **Simple syntax**: Use `<ComponentName />` syntax when outside of code blocks/quotes
4. **Type safety**: Full TypeScript support for component registration and usage

## Proposed Architecture

### Core Component Parser

A new package `@markpage/components` that provides:

```typescript
interface ComponentNode {
  name: string;
  props: Record<string, any>;
  children?: string;
  position: { start: number; end: number };
}

interface ComponentParser {
  parse(content: string): Array<ComponentNode | string>;
  extractComponents(content: string): ComponentNode[];
}
```

### Framework-Specific Implementations

Each framework gets its own package (e.g., `@markpage/svelte`, `@markpage/react`) that provides:

```typescript
interface MarkpageFramework<T = any> {
  addComponent(name: string, component: T): void;
  removeComponent(name: string): void;
  getComponent(name: string): T | undefined;
  render(content: string, components: ComponentNode[]): string;
}
```

## Svelte Implementation

### Package Structure

```
packages/markpage-svelte/
├── src/
│   ├── index.ts
│   ├── MarkpageSvelte.ts
│   ├── MarkdownRenderer.svelte
│   └── types.ts
├── package.json
└── tsconfig.json
```

### API Design

```typescript
import { MarkpageSvelte } from '@markpage/svelte';
import { NavigationTree } from 'markpage';
import MyComponent from './MyComponent.svelte';

// Create instance with navigation and content
const mp = new MarkpageSvelte(navigation, content);

// Register components
mp.addComponent('MyComponent', MyComponent);
mp.addComponent('Alert', AlertComponent);

// Use in Svelte
<mp.Render path="features/components" />
```

### Component Registration

Components can be registered with:

```typescript
// Simple component
mp.addComponent('Button', ButtonComponent);

// Component with default props
mp.addComponent('Alert', AlertComponent, { variant: 'info' });

// Component with validation
mp.addComponent('CodeBlock', CodeBlockComponent, {
  validate: (props) => props.language && props.code
});
```

## Implementation Details

### 1. Markdown Parsing

Parse markdown content to identify component usage:

```markdown
# Regular Markdown

This is a paragraph with <Button>Click me</Button> component.

<Alert variant="warning">
  This is a warning message.
</Alert>

```code
// Code blocks are ignored
<Component />
```
```

### 2. Component Detection

Components are detected when:
- They appear outside of code blocks (```)
- They appear outside of inline code (`)
- They follow the pattern `<ComponentName />` or `<ComponentName>content</ComponentName>`

### 3. Props Parsing

Support basic props parsing:

```markdown
<Button variant="primary" size="large" disabled>
  Submit Form
</Button>
```

Props are parsed as strings initially, with optional type conversion.

### 4. Children Support

Components can have markdown children:

```markdown
<Card title="Example">
  This is **bold** text with [a link](https://example.com).
  
  - List item 1
  - List item 2
</Card>
```

Children are parsed as markdown and passed to the component.

## Usage Examples

### Basic Component

```svelte
<!-- MyComponent.svelte -->
<script>
  export let text = '';
</script>

<div class="my-component">
  {text}
</div>
```

```markdown
<MyComponent text="Hello World" />
```

### Component with Children

```svelte
<!-- Alert.svelte -->
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

```markdown
<Alert variant="warning" title="Important">
  This is a **warning** message with [more details](link).
</Alert>
```

## Benefits

1. **Enhanced Content**: Rich, interactive content in markdown
2. **Reusable Components**: Consistent UI patterns across documentation
3. **Type Safety**: Full TypeScript support for component registration
4. **Framework Integration**: Native Svelte components with proper reactivity
5. **Performance**: Components are registered upfront, no dynamic imports

## Challenges and Considerations

1. **Security**: Component registration prevents arbitrary code execution
2. **Parsing Complexity**: Need to handle nested components and complex markdown
3. **Performance**: Component rendering adds overhead to markdown processing
4. **Debugging**: Component errors in markdown can be harder to debug

## Next Steps

1. Create the core `@markpage/components` package
2. Implement the Svelte-specific package `@markpage/svelte`
3. Add comprehensive tests for component parsing and rendering
4. Create documentation and examples
5. Consider other framework implementations (React, Vue, etc.)

## Alternative Approaches

### 1. MDX-like Syntax

Use JSX-like syntax with imports:

```markdown
import { Button } from './components';

<Button variant="primary">Click me</Button>
```

**Pros**: Familiar to React developers
**Cons**: Requires build-time processing, more complex

### 2. Custom Syntax

Use a different syntax to avoid conflicts:

```markdown
::Button{variant="primary"}Click me::Button
```

**Pros**: No conflicts with HTML-like syntax
**Cons**: Less intuitive, harder to read

### 3. Frontmatter + Components

Define components in frontmatter:

```markdown
---
components:
  - Button
  - Alert
---

<Button>Click me</Button>
```

**Pros**: Clear component dependencies
**Cons**: More verbose, harder to maintain

## Conclusion

The proposed approach provides a good balance between simplicity and functionality. By requiring upfront component registration, we maintain security while enabling rich, interactive content in markdown files. The Svelte implementation will serve as a proof of concept and can be extended to other frameworks.

The key is to keep the core parsing simple and extensible, while providing framework-specific implementations that handle the actual component rendering.