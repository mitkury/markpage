<script lang="ts">
	import { NavigationTree, loadContent } from 'svelte-markdown-pages/renderer';
	import { DocsSidebar, DocsContent } from 'svelte-markdown-pages/components';
	
	// This would normally come from your built content
	const navigationData = {
		items: [
			{ name: "getting-started", type: "page", label: "Getting Started" },
			{ name: "guides", type: "section", label: "Guides" }
		]
	};
	
	const contentBundle = {
		"getting-started.md": "# Getting Started\n\nWelcome to the svelte-markdown-pages example!"
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
</script>

<div class="docs-layout">
	<DocsSidebar {navigation} bind:currentPage />
	<DocsContent content={pageContent} />
</div>

<style>
	.docs-layout {
		display: flex;
		min-height: 100vh;
	}
</style>
