<script lang="ts">
	import type { PageData } from './$types';
	import { MarkdownRenderer } from '@markpage/svelte';
	import TestButton from '$lib/components/TestButton.svelte';

	let { data } = $props<{ data: PageData }>();

	// Component registry
	const components = new Map([
		['TestButton', TestButton]
	]);

	type NavItem = { name: string; type: 'page' | 'section'; label: string; path?: string; items?: NavItem[] };
	const navItems = (data.navigation as unknown as NavItem[]) || [];

	function hrefFor(item: NavItem, parentPath = '') {
		return parentPath ? `/${parentPath}/${item.name}` : `/${item.name}`;
	}
</script>

<div class="docs-layout">
	{#if data?.navigation}
		<nav class="docs-sidebar">
			<header class="docs-header">
				<h1>Markpage</h1>
				<p class="docs-subtitle">Documentation</p>
			</header>

			{#each navItems as item}
				{#if item.type === 'section'}
					<div class="nav-section">
						<div class="nav-section-header">{item.label}</div>
						{#if item.items}
							{#each item.items as sub}
								{#if sub.type === 'section'}
									<div class="nav-section">
										<div class="nav-section-header">{sub.label}</div>
										{#if sub.items}
											{#each sub.items as sub2}
												<a href={hrefFor(sub2, `${item.name}/${sub.name}`)} class="nav-link {data.contentPath === sub2.path ? 'active' : ''}">{sub2.label}</a>
											{/each}
										{/if}
									</div>
								{:else}
									<a href={hrefFor(sub, item.name)} class="nav-link {data.contentPath === sub.path ? 'active' : ''}">{sub.label}</a>
								{/if}
							{/each}
						{/if}
					</div>
				{:else}
					<a href={hrefFor(item)} class="nav-link {data.contentPath === item.path ? 'active' : ''}">{item.label}</a>
				{/if}
			{/each}
		</nav>

		<div class="docs-content">
			{#if data?.content}
				<MarkdownRenderer content={data.content} components={components} enableComponents={true} ssr={true} />
			{:else}
				<div>No content selected</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	/* Keep existing styles in original file (omitted here for brevity) */
</style>
