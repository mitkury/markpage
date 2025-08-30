<script lang="ts">
	import { NavigationTree, loadContent } from 'svelte-markdown-pages/renderer';
	import { createDocsSidebar, createDocsContent } from 'svelte-markdown-pages/components';
	
	// This would normally come from your built content
	const navigationData = {
		items: [
			{ name: "getting-started", type: "page", label: "Getting Started", path: "getting-started.md" },
			{ name: "guides", type: "section", label: "Guides", items: [
				{ name: "installation", type: "page", label: "Installation", path: "guides/installation.md" }
			]}
		]
	};
	
	const contentBundle = {
		"getting-started.md": "# Getting Started\n\nWelcome to the svelte-markdown-pages example!",
		"guides/installation.md": "# Installation\n\nFollow these steps to install the package."
	};
	
	let navigation = $state(new NavigationTree(navigationData));
	let currentPage = $state("getting-started.md");
	let pageContent = $state<string | null>(null);
	
	$effect(() => {
		if (currentPage) {
			loadContent(currentPage, contentBundle).then(content => {
				pageContent = content;
			});
		}
	});
	
	// Create component instances
	let sidebar = $state(createDocsSidebar({
		navigation,
		currentPage,
		onPageSelect: (path: string) => {
			currentPage = path;
		}
	}));
	
	let content = $state(createDocsContent({
		content: pageContent
	}));
	
	// Update components when state changes
	$effect(() => {
		sidebar = createDocsSidebar({
			navigation,
			currentPage,
			onPageSelect: (path: string) => {
				currentPage = path;
			}
		});
	});
	
	$effect(() => {
		content = createDocsContent({
			content: pageContent
		});
	});
</script>

<div class="docs-layout">
	{@html sidebar.render()}
	{@html content.render()}
</div>

<style>
	.docs-layout {
		display: flex;
		min-height: 100vh;
	}
	
	:global(.docs-sidebar) {
		width: 250px;
		background: #f5f5f5;
		border-right: 1px solid #ddd;
		padding: 1rem;
		overflow-y: auto;
	}
	
	:global(.docs-content) {
		flex: 1;
		padding: 2rem;
		overflow-y: auto;
	}
	
	:global(.nav-link) {
		display: block;
		padding: 0.5rem;
		color: #333;
		text-decoration: none;
		border-radius: 4px;
		margin-bottom: 0.25rem;
	}
	
	:global(.nav-link:hover) {
		background: #e0e0e0;
	}
	
	:global(.nav-link.active) {
		background: #007acc;
		color: white;
	}
	
	:global(.nav-section-header) {
		font-weight: bold;
		color: #666;
		margin-bottom: 0.5rem;
		font-size: 0.9rem;
		text-transform: uppercase;
	}
</style>
