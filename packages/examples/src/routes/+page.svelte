<script lang="ts">
	import { NavigationTree, loadContent } from 'svelte-markdown-pages/renderer';
	import type { NavigationItem } from 'svelte-markdown-pages';
	
	// This would normally come from your built content
	const navigationData = {
		items: [
			{ name: "getting-started", type: "page", label: "Getting Started", path: "getting-started.md" },
			{ name: "guides", type: "section", label: "Guides", items: [
				{ name: "installation", type: "page", label: "Installation", path: "guides/installation.md" },
				{ name: "configuration", type: "page", label: "Configuration", path: "guides/configuration.md" }
			]},
			{ name: "api", type: "section", label: "API Reference", items: [
				{ name: "builder", type: "page", label: "Builder", path: "api/builder.md" },
				{ name: "renderer", type: "page", label: "Renderer", path: "api/renderer.md" }
			]}
		]
	};
	
	const contentBundle = {
		"getting-started.md": "# Getting Started\n\nWelcome to the svelte-markdown-pages example!\n\nThis is a comprehensive example showing how to use the svelte-markdown-pages package to build documentation sites with distributed navigation.",
		"guides/installation.md": "# Installation\n\nFollow these steps to install the package.\n\n## Prerequisites\n\n- Node.js 18+\n- npm or yarn\n\n## Quick Install\n\n```bash\nnpm install svelte-markdown-pages\n```\n\n## Manual Setup\n\n1. Create a new SvelteKit project\n2. Install the package\n3. Set up your content structure\n4. Build your documentation",
		"guides/configuration.md": "# Configuration\n\nLearn how to configure svelte-markdown-pages for your project.\n\n## Basic Configuration\n\n```typescript\nimport { buildDocs } from 'svelte-markdown-pages/builder';\n\nawait buildDocs('./content', {\n  appOutput: './src/lib/content',\n  websiteOutput: './src/lib/content',\n  includeContent: true\n});\n```\n\n## Advanced Options\n\n- Custom processors\n- Multiple output formats\n- Static site generation",
		"api/builder.md": "# Builder API\n\nComplete API reference for the builder module.\n\n## Functions\n\n### buildDocs\n\nBuilds documentation from a content directory.\n\n```typescript\nfunction buildDocs(\n  contentPath: string,\n  options?: BuildOptions\n): Promise<BuildResult>\n```\n\n### generateStaticSite\n\nGenerates a complete static HTML site.\n\n```typescript\nfunction generateStaticSite(\n  contentPath: string,\n  outputPath: string,\n  options?: StaticSiteOptions\n): Promise<StaticSiteResult>\n```",
		"api/renderer.md": "# Renderer API\n\nComplete API reference for the renderer module.\n\n## Classes\n\n### NavigationTree\n\nManages navigation structure and provides navigation utilities.\n\n```typescript\nclass NavigationTree {\n  constructor(data: NavigationTree);\n  findItemByPath(path: string): NavigationItem | null;\n  getBreadcrumbs(path: string): NavigationItem[];\n  getSiblings(path: string): NavigationItem[];\n  getNextSibling(path: string): NavigationItem | null;\n  getPreviousSibling(path: string): NavigationItem | null;\n}\n```\n\n### ContentLoader\n\nManages content loading and processing.\n\n```typescript\nclass ContentLoader {\n  constructor(contentBundle: Record<string, string>);\n  loadAndProcess(path: string): string;\n  hasContent(path: string): boolean;\n  getAvailablePaths(): string[];\n}\n```"
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
	
	function handlePageSelect(path: string) {
		currentPage = path;
	}
	
	function renderNavigationItems(items: NavigationItem[]): string {
		return items.map(item => {
			if (item.type === 'section') {
				return `
					<div class="nav-section">
						<div class="nav-section-header">${item.label}</div>
						${item.items ? renderNavigationItems(item.items) : ''}
					</div>
				`;
			} else {
				const isActive = currentPage === item.path;
				return `
					<button 
						class="nav-link ${isActive ? 'active' : ''}"
						onclick="window.dispatchEvent(new CustomEvent('pageSelect', { detail: '${item.path}' }))">
						${item.label}
					</button>
				`;
			}
		}).join('');
	}
	
	// Set up event listener when component mounts
	if (typeof window !== 'undefined') {
		window.addEventListener('pageSelect', (event: any) => {
			handlePageSelect(event.detail);
		});
	}
</script>

<div class="docs-layout">
	<nav class="docs-sidebar">
		{@html renderNavigationItems(navigation.items)}
	</nav>
	
	<div class="docs-content">
		{@html pageContent || 'No content selected'}
	</div>
</div>

<style>
	.docs-layout {
		display: flex;
		min-height: 100vh;
	}
	
	.docs-sidebar {
		width: 250px;
		background: #f5f5f5;
		border-right: 1px solid #ddd;
		padding: 1rem;
		overflow-y: auto;
	}
	
	.docs-content {
		flex: 1;
		padding: 2rem;
		overflow-y: auto;
	}
	
	:global(.nav-link) {
		display: block;
		width: 100%;
		padding: 0.5rem;
		color: #333;
		text-decoration: none;
		border: none;
		background: none;
		text-align: left;
		border-radius: 4px;
		margin-bottom: 0.25rem;
		cursor: pointer;
		font-size: inherit;
		font-family: inherit;
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
