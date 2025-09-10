# Custom Components

Learn how to create and use custom Svelte components in your markdown files.

## Overview

With `@markpage/svelte`, you can embed interactive Svelte components directly in markdown files. Components can contain markdown content and even other components.

## Basic Usage

### 1. Create a Component

Create a simple Svelte component:

**Button.svelte:**
```svelte
<script>
  export let variant = 'default';
  export let size = 'medium';
  let { children } = $props();
</script>

<button class="btn btn-{variant} btn-{size}">
  {@render children()}
</button>

<style>
  .btn {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
  }
  
  .btn-primary { background: #007bff; color: white; }
  .btn-secondary { background: #6c757d; color: white; }
  .btn-success { background: #28a745; color: white; }
  .btn-danger { background: #dc3545; color: white; }
  
  .btn-small { padding: 4px 8px; font-size: 12px; }
  .btn-large { padding: 12px 24px; font-size: 16px; }
</style>
```

### 2. Register and Use the Component

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
<Button variant="secondary" size="large">Large Button</Button>
  `;
</script>

<Markdown {source} {options} />
```

## Components with Content

Components can contain markdown content and other components:

### Alert Component

**Alert.svelte:**
```svelte
<script>
  export let variant = 'info';
  export let title = '';
  let { children } = $props();
</script>

<div class="alert alert-{variant}">
  {#if title}<h4>{title}</h4>{/if}
  <div class="alert-content">
    {@render children()}
  </div>
</div>

<style>
  .alert {
    padding: 16px;
    border-radius: 4px;
    margin: 16px 0;
  }
  
  .alert-info { background: #d1ecf1; border: 1px solid #bee5eb; }
  .alert-success { background: #d4edda; border: 1px solid #c3e6cb; }
  .alert-warning { background: #fff3cd; border: 1px solid #ffeaa7; }
  .alert-danger { background: #f8d7da; border: 1px solid #f5c6cb; }
  
  .alert h4 {
    margin: 0 0 8px 0;
    font-size: 16px;
  }
</style>
```

### Usage with Markdown Content

```svelte
<script>
  import { Markdown, MarkpageOptions } from '@markpage/svelte';
  import Alert from './Alert.svelte';

  const options = new MarkpageOptions()
    .addCustomComponent('Alert', Alert);

  const source = `
<Alert variant="info" title="Important">
  This alert contains **markdown** content:
  
  - List items work
  - **Bold text** works
  - [Links](https://example.com) work too
</Alert>
  `;
</script>

<Markdown {source} {options} />
```

## Nested Components

Components can contain other components:

### Card Component

**Card.svelte:**
```svelte
<script>
  export let title = '';
  export let subtitle = '';
  let { children } = $props();
</script>

<div class="card">
  {#if title}<h3>{title}</h3>{/if}
  {#if subtitle}<p class="subtitle">{subtitle}</p>{/if}
  <div class="card-content">
    {@render children()}
  </div>
</div>

<style>
  .card {
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 20px;
    margin: 16px 0;
    background: white;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  
  .card h3 {
    margin: 0 0 8px 0;
    color: #333;
  }
  
  .subtitle {
    margin: 0 0 16px 0;
    color: #666;
    font-style: italic;
  }
</style>
```

### Nested Usage

```svelte
<script>
  import { Markdown, MarkpageOptions } from '@markpage/svelte';
  import Card from './Card.svelte';
  import Alert from './Alert.svelte';
  import Button from './Button.svelte';

  const options = new MarkpageOptions()
    .addCustomComponent('Card', Card)
    .addCustomComponent('Alert', Alert)
    .addCustomComponent('Button', Button);

  const source = `
<Card title="Nested Components" subtitle="Components can contain other components">
  <Alert variant="info">
    This alert is **inside** a card component!
  </Alert>
  
  <Button variant="primary">Button in card</Button>
</Card>
  `;
</script>

<Markdown {source} {options} />
```

## Component Props

Components can receive props to customize their appearance and behavior:

### Advanced Button Component

**AdvancedButton.svelte:**
```svelte
<script>
  export let variant = 'default';
  export let size = 'medium';
  export let disabled = false;
  export let href = '';
  let { children } = $props();
  
  function handleClick() {
    if (!disabled && href) {
      window.open(href, '_blank');
    }
  }
</script>

{#if href}
  <a href={href} class="btn btn-{variant} btn-{size}" class:disabled on:click={handleClick}>
    {@render children()}
  </a>
{:else}
  <button class="btn btn-{variant} btn-{size}" class:disabled {disabled}>
    {@render children()}
  </button>
{/if}

<style>
  .btn {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    text-decoration: none;
    display: inline-block;
  }
  
  .btn:disabled, .btn.disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  .btn-primary { background: #007bff; color: white; }
  .btn-secondary { background: #6c757d; color: white; }
  .btn-success { background: #28a745; color: white; }
  .btn-danger { background: #dc3545; color: white; }
  
  .btn-small { padding: 4px 8px; font-size: 12px; }
  .btn-large { padding: 12px 24px; font-size: 16px; }
</style>
```

### Usage with Props

```svelte
<script>
  import { Markdown, MarkpageOptions } from '@markpage/svelte';
  import AdvancedButton from './AdvancedButton.svelte';

  const options = new MarkpageOptions()
    .addCustomComponent('Button', AdvancedButton);

  const source = `
<Button variant="primary" size="large">Primary Button</Button>
<Button variant="secondary" disabled>Disabled Button</Button>
<Button variant="success" href="https://example.com">External Link</Button>
  `;
</script>

<Markdown {source} {options} />
```

## Unknown Components

When a component isn't registered, it's rendered as plain text instead of showing an error:

```svelte
<script>
  import { Markdown } from '@markpage/svelte';

  const source = `
<UnknownComponent variant="demo" title="This component doesn't exist">
  This content will be displayed as plain text
</UnknownComponent>
  `;
</script>

<Markdown {source} />
```

This provides a graceful fallback and prevents your markdown from breaking when components are missing.

## Best Practices

### 1. Keep Components Simple

Focus on single responsibilities. Create small, focused components rather than large, complex ones.

### 2. Use Semantic Props

Choose prop names that clearly describe what they do:

```svelte
<!-- Good -->
<Button variant="primary" size="large" disabled>

<!-- Avoid -->
<Button type="1" big="true" off>
```

### 3. Provide Default Values

Always provide sensible defaults for your props:

```svelte
<script>
  export let variant = 'default';  // Good default
  export let size = 'medium';      // Good default
</script>
```

### 4. Handle Missing Content

Components should work even when no content is provided:

```svelte
<script>
  let { children } = $props();
</script>

<div class="component">
  {#if children}
    {@render children()}
  {:else}
    <p>No content provided</p>
  {/if}
</div>
```

## What's Next?

- **[Token Overrides](token-overrides.md)** - Override built-in markdown tokens and create extensions
- **[Getting Started](getting-started.md)** - Back to the basics