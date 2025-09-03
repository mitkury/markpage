<script lang="ts">
	import type { PageData } from './$types';
	import { MarkdownRenderer } from '@markpage/svelte';
	import TestButton from '$lib/components/TestButton.svelte';

	let { data } = $props<{ data: PageData }>();

	// Component registry
	const components = new Map([
		['TestButton', TestButton]
	]);
</script>

<div class="docs-layout">
	{#if data?.navigation}
		<nav class="docs-sidebar">
			<header class="docs-header">
				<h1>Markpage</h1>
				<p class="docs-subtitle">Documentation</p>
			</header>
			{@html (data.navigation as any[]).map((item: any) => {
				function render(items: any[], parentPath: string = ''): string {
					return items.map((it) => {
						if (it.type === 'section') {
							const currentPath = parentPath ? `${parentPath}/${it.name}` : it.name;
							return `<div class=\"nav-section\"><div class=\"nav-section-header\">${it.label}</div>${render(it.items || [], currentPath)}</div>`;
						}
						const href = parentPath ? `/${parentPath}/${it.name}` : `/${it.name}`;
						const isActive = data.contentPath === it.path;
						return `<a href=\"${href}\" class=\"nav-link ${isActive ? 'active' : ''}\">${it.label}</a>`;
					}).join('');
				}
				return render([item]);
			}).join('')}
		</nav>

		<div class="docs-content">
			{#if data?.content}
				<MarkdownRenderer content={data.content} components={components} enableComponents={true} />
			{:else}
				<div>No content selected</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	/* Keep existing styles in original file (omitted here for brevity) */
</style>
