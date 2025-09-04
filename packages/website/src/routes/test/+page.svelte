<script lang="ts">
	import { MarkdownRenderer } from '@markpage/svelte';
	import TestButton from '$lib/components/TestButton.svelte';

	// Component registry
	const components = new Map([
		['TestButton', TestButton]
	]);

	const testContent = `
# Test Page

This is a simple test of the MarkdownRenderer component.

<TestButton>Test Button</TestButton>

More content here.
	`;
</script>

<h1>Test Page</h1>

<MarkdownRenderer content={testContent} components={components} enableComponents={true} />
