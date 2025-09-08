<script lang="ts">
	import { Markdown } from '@markpage/svelte';
	import TestButton from '$lib/components/TestButton.svelte';
	import Button from '$lib/components/Button.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import Card from '$lib/components/Card.svelte';

	// Component registry
	const components = new Map<string, any>([
		['TestButton', TestButton],
		['Button', Button],
		['Alert', Alert],
		['Card', Card]
	]);

	const testContent = `
# Component Showcase

This page demonstrates all available components in the Markpage Svelte integration.

## TestButton Component

<TestButton variant="primary" text="Primary TestButton" />
<TestButton variant="success" text="Success TestButton" />
<TestButton variant="warning" text="Warning TestButton" />
<TestButton variant="danger" text="Danger TestButton" />

## Button Component

<Button variant="default">Default Button</Button>
<Button variant="primary">Primary Button</Button>
<Button variant="secondary">Secondary Button</Button>
<Button variant="danger">Danger Button</Button>

### Button Sizes

<Button variant="primary" size="small">Small Button</Button>
<Button variant="primary" size="medium">Medium Button</Button>
<Button variant="primary" size="large">Large Button</Button>

## Alert Component

<Alert variant="info">
  This is an informational alert with some **bold text** and a [link](https://example.com).
</Alert>

<Alert variant="warning">
  This is a warning alert. Please pay attention to this message.
</Alert>

<Alert variant="error">
  This is an error alert. Something went wrong!
</Alert>

<Alert variant="success">
  This is a success alert. Everything worked perfectly!
</Alert>

## Card Component

<Card title="Component Features" subtitle="What you can do with Markpage">
  - Use any markdown syntax inside components
  - Pass props to customize appearance
  - Nest components within each other
  - Maintain full markdown formatting
  
  Here's some **bold text** and *italic text* inside a card.
</Card>

<Card title="Code Example" subtitle="How to use components">
  \`\`\`markdown
  <Button variant="primary" size="large">
    Click me
  </Button>
  
  <Alert variant="info">
    This is an alert with **markdown** content.
  </Alert>
  \`\`\`
</Card>

## Mixed Components

<Card title="Interactive Example">
  <Alert variant="info">
    Try clicking the buttons below:
  </Alert>
  
  <Button variant="primary">Primary Action</Button>
  <Button variant="secondary">Secondary Action</Button>
  <Button variant="danger">Dangerous Action</Button>
</Card>
	`;
</script>

<h1>Test Page</h1>

<Markdown source={testContent} components={components} markedInstance={md} />
