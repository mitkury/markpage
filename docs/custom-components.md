# Custom Components

Learn how to create and use custom Svelte components in your markdown files.

## Overview

With `@markpage/svelte`, you can embed interactive Svelte components directly in markdown files. Components can contain markdown content and even other components.

## Basic Usage

### Register and Use Components

```svelte
<script>
  import { Markdown, MarkpageOptions } from '@markpage/svelte';
  import Button from './Button.svelte';
  import Alert from './Alert.svelte';
  import Card from './Card.svelte';
  import TestButton from './TestButton.svelte';

  const options = new MarkpageOptions()
    .addCustomComponent('Button', Button)
    .addCustomComponent('Alert', Alert)
    .addCustomComponent('Card', Card)
    .addCustomComponent('TestButton', TestButton);

  const source = `
# My Documentation

Here's a regular paragraph.

<Button variant="primary">Click me</Button>
<Alert variant="info">This is an alert</Alert>
  `;
</script>

<Markdown {source} {options} />
```

## Component Examples

### Button Component

**Markdown source:**
```markdown
<Button variant="primary">Primary Button</Button>
<Button variant="secondary">Secondary Button</Button>
<Button variant="danger">Danger Button</Button>
<Button variant="default" disabled>Disabled Button</Button>

Different sizes:
<Button variant="primary" size="small">Small</Button>
<Button variant="primary" size="medium">Medium</Button>
<Button variant="primary" size="large">Large</Button>
```

**Rendered result:**
<Button variant="primary">Primary Button</Button>
<Button variant="secondary">Secondary Button</Button>
<Button variant="danger">Danger Button</Button>
<Button variant="default" disabled>Disabled Button</Button>

Different sizes:
<Button variant="primary" size="small">Small</Button>
<Button variant="primary" size="medium">Medium</Button>
<Button variant="primary" size="large">Large</Button>

### Alert Component

**Markdown source:**
```markdown
<Alert variant="info">
  This alert contains **markdown** content:
  
  - List items work
  - **Bold text** works
  - [Links](https://example.com) work too
</Alert>

<Alert variant="warning">
  This is a warning alert with an icon
</Alert>

<Alert variant="success">
  Success! Your operation completed successfully.
</Alert>

<Alert variant="error">
  Error! Something went wrong. Please try again.
</Alert>
```

**Rendered result:**
<Alert variant="info">
  This alert contains **markdown** content:
  
  - List items work
  - **Bold text** works
  - [Links](https://example.com) work too
</Alert>

<Alert variant="warning">
  This is a warning alert with an icon
</Alert>

<Alert variant="success">
  Success! Your operation completed successfully.
</Alert>

<Alert variant="error">
  Error! Something went wrong. Please try again.
</Alert>

### TestButton Component

**Markdown source:**
```markdown
<TestButton text="Click me!" variant="primary" />
<TestButton text="Success" variant="success" />
<TestButton text="Warning" variant="warning" />
<TestButton text="Danger" variant="danger" />
```

**Rendered result:**
<TestButton text="Click me!" variant="primary" />
<TestButton text="Success" variant="success" />
<TestButton text="Warning" variant="warning" />
<TestButton text="Danger" variant="danger" />

### Card Component (Nested Components)

**Markdown source:**
```markdown
<Card title="Nested Components" subtitle="Components can contain other components">
  <Alert variant="info">
    This alert is **inside** a card component!
  </Alert>
  
  <Button variant="primary">Button in card</Button>
  <TestButton text="Test Button" variant="success" />
</Card>
```

**Rendered result:**
<Card title="Nested Components" subtitle="Components can contain other components">
  <Alert variant="info">
    This alert is **inside** a card component!
  </Alert>
  
  <Button variant="primary">Button in card</Button>
  <TestButton text="Test Button" variant="success" />
</Card>

## What's Next?

- **[Token Overrides](token-overrides.md)** - Override built-in markdown tokens and create extensions
- **[Getting Started](getting-started.md)** - Back to the basics