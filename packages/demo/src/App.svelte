<script lang="ts">
  import { MarkpageSvelte } from '@markpage/svelte';
  import { NavigationTree } from 'markpage';
  import MarkdownRenderer from '../markpage-svelte/src/MarkdownRenderer.svelte';
  import Button from './components/Button.svelte';
  import Alert from './components/Alert.svelte';
  import Card from './components/Card.svelte';

  // Sample navigation and content
  const navigation = [
    {
      name: 'getting-started',
      type: 'page',
      label: 'Getting Started',
      path: 'getting-started'
    },
    {
      name: 'components',
      type: 'page',
      label: 'Components',
      path: 'components'
    }
  ];

  const content = {
    'getting-started': `# Getting Started

Welcome to Markpage with Svelte components!

This is a regular markdown paragraph with some **bold** and *italic* text.

<Button variant="primary" size="large">
  Get Started
</Button>

<Alert variant="info">
  This is an informational alert with some **markdown** content inside.
</Alert>

<Card title="Quick Example" subtitle="Component with children">
  This card component demonstrates how components can contain markdown children.
  
  - List item 1
  - List item 2
  - List item 3
</Card>

## Next Steps

Continue reading to learn more about available components and how to use them.`,

    'components': `# Available Components

## Button Component

<Button>Default Button</Button>
<Button variant="primary">Primary Button</Button>
<Button variant="secondary" size="small">Small Secondary</Button>
<Button variant="danger" disabled>Disabled Button</Button>

## Alert Component

<Alert variant="info">
  This is an informational message.
</Alert>

<Alert variant="warning">
  This is a warning message with **bold text**.
</Alert>

<Alert variant="error">
  This is an error message with [a link](https://example.com).
</Alert>

<Alert variant="success">
  This is a success message!
</Alert>

## Card Component

<Card title="Component Features" subtitle="What you can do">
  - Use any markdown syntax inside components
  - Pass props to customize appearance
  - Nest components within each other
  - Maintain full markdown formatting
</Card>

<Card title="Code Example">
  \`\`\`markdown
  <Button variant="primary" size="large">
    Click me
  </Button>
  \`\`\`
</Card>`
  };

  // Create MarkpageSvelte instance
  const mp = new MarkpageSvelte(navigation, content);

  // Register components
  mp.addComponent('Button', Button);
  mp.addComponent('Alert', Alert);
  mp.addComponent('Card', Card);

  let currentPath = 'getting-started';
</script>

<main>
  <header>
    <h1>Markpage Svelte Demo</h1>
    <nav>
      {#each navigation as item}
        <button 
          class:active={currentPath === item.path}
          onclick={() => currentPath = item.path!}
        >
          {item.label}
        </button>
      {/each}
    </nav>
  </header>

  <div class="content">
    <MarkdownRenderer 
      content={mp.getContent(currentPath) || ''}
      components={new Map([
        ['Button', Button],
        ['Alert', Alert],
        ['Card', Card]
      ])}
      enableComponents={true}
    />
  </div>

  <footer>
    <p>Registered components: {mp.getRegisteredComponents().join(', ')}</p>
  </footer>
</main>

<style>
  main {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  header {
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 2px solid #eee;
  }

  h1 {
    color: #333;
    margin-bottom: 1rem;
  }

  nav {
    display: flex;
    gap: 1rem;
  }

  nav button {
    padding: 0.5rem 1rem;
    border: 1px solid #ddd;
    background: white;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;
  }

  nav button:hover {
    background: #f5f5f5;
  }

  nav button.active {
    background: #007acc;
    color: white;
    border-color: #007acc;
  }

  .content {
    min-height: 400px;
    line-height: 1.6;
  }

  footer {
    margin-top: 3rem;
    padding-top: 1rem;
    border-top: 1px solid #eee;
    color: #666;
    font-size: 0.9rem;
  }
</style>