<script>
	import { MarkdownRenderer } from '$lib/index.js';
	import TestButton from '$lib/TestButton.svelte';
	
	const components = new Map([
		['TestButton', TestButton]
	]);
	
	const content = `
# Test Markdown

This is a test of the MarkdownRenderer component.

<TestButton>Click me!</TestButton>

More markdown content here.
	`;
</script>

<h1>Markpage Svelte Package Test</h1>

<MarkdownRenderer {content} {components} enableComponents={true} ssr={true} />
