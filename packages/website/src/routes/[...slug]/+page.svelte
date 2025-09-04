<script lang="ts">
	import type { PageData } from './$types';
	import { MarkdownRenderer } from '@markpage/svelte';
	import TestButton from '$lib/components/TestButton.svelte';
	import Button from '$lib/components/Button.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import Card from '$lib/components/Card.svelte';

	let { data } = $props<{ data: PageData }>();

	// Component registry
	const components = new Map([
		['TestButton', TestButton],
		['Button', Button],
		['Alert', Alert],
		['Card', Card]
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
				<MarkdownRenderer content={data.content} components={components} enableComponents={true} />
			{:else}
				<div>No content selected</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.docs-layout {
		display: flex;
		min-height: 100vh;
	}

	.docs-sidebar {
		width: 250px;
		background: #f8f9fa;
		border-right: 1px solid #e9ecef;
		padding: 1rem;
		overflow-y: auto;
	}

	.docs-header {
		margin-bottom: 2rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid #e9ecef;
	}

	.docs-header h1 {
		margin: 0 0 0.5rem 0;
		font-size: 1.5rem;
		color: #333;
	}

	.docs-subtitle {
		margin: 0;
		color: #666;
		font-size: 0.9rem;
	}

	.nav-section {
		margin-bottom: 1.5rem;
	}

	.nav-section-header {
		font-weight: 600;
		color: #333;
		margin-bottom: 0.5rem;
		font-size: 0.9rem;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.nav-link {
		display: block;
		padding: 0.5rem 0;
		color: #666;
		text-decoration: none;
		border-radius: 4px;
		transition: color 0.2s;
	}

	.nav-link:hover {
		color: #007acc;
	}

	.nav-link.active {
		color: #007acc;
		font-weight: 500;
		background: #e3f2fd;
		padding: 0.5rem 0.75rem;
		border-radius: 4px;
	}

	.docs-content {
		flex: 1;
		padding: 2rem;
		max-width: 800px;
	}

	/* Markdown content styles */
	:global(.markdown-renderer) {
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
		line-height: 1.6;
		color: #333;
	}

	:global(.markdown-text) { 
		margin-bottom: 1rem; 
		font-family: inherit;
	}

	:global(.markdown-text h1) {
		font-size: 2rem;
		margin: 2rem 0 1rem 0;
		color: #333;
		border-bottom: 2px solid #e9ecef;
		padding-bottom: 0.5rem;
	}

	:global(.markdown-text h2) {
		font-size: 1.5rem;
		margin: 1.5rem 0 1rem 0;
		color: #333;
	}

	:global(.markdown-text h3) {
		font-size: 1.25rem;
		margin: 1.25rem 0 0.75rem 0;
		color: #333;
	}

	:global(.markdown-text p) {
		margin: 1rem 0;
	}

	:global(.markdown-text code) {
		background: #f1f3f4;
		padding: 0.2rem 0.4rem;
		border-radius: 3px;
		font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
		font-size: 0.9em;
		color: #d73a49;
		border: 1px solid #e1e4e8;
	}

	:global(.markdown-text pre) {
		background: #f6f8fa;
		padding: 1rem;
		border-radius: 6px;
		overflow-x: auto;
		margin: 1rem 0;
		border: 1px solid #e1e4e8;
		box-shadow: 0 1px 3px rgba(0,0,0,0.1);
	}

	:global(.markdown-text pre code) {
		background: none;
		padding: 0;
		color: #24292e;
		border: none;
	}

	:global(.markdown-text ul, .markdown-text ol) {
		margin: 1rem 0;
		padding-left: 2rem;
	}

	:global(.markdown-text li) {
		margin: 0.5rem 0;
	}

	:global(.markdown-text blockquote) {
		border-left: 4px solid #007acc;
		padding-left: 1rem;
		margin: 1rem 0;
		color: #666;
		font-style: italic;
	}

	:global(.component-error) {
		margin: 1rem 0;
		padding: 1rem;
		border: 2px solid #f44336;
		border-radius: 4px;
		background-color: #ffebee;
		color: #c62828;
	}
</style>
