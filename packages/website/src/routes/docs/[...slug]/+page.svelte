<script lang="ts">
	import { NavigationTree, loadContent } from 'svelte-markdown-pages/renderer';
	import type { NavigationItem } from 'svelte-markdown-pages';
	import { page } from '$app/stores';
	
	// Build docs from the docs directory
	let navigation = $state<any>(null);
	let contentBundle = $state<any>(null);
	let currentPage = $state<string>("getting-started.md");
	let pageContent = $state<string | null>(null);
	let loading = $state(true);
	let error = $state<string | null>(null);
	
	// Map URL path to content path
	function getContentPathFromUrl(urlPath: string): string {
		const cleanPath = urlPath.replace(/^\/docs\/?/, '').replace(/^\/+/, '');
		if (!cleanPath || cleanPath === 'getting-started') {
			return 'getting-started.md';
		}
		
		// Use the navigation data to find the correct path
		if (navigation) {
			const findPath = (items: any[], targetPath: string, parentPath: string = ''): string | null => {
				for (const item of items) {
					const currentPath = parentPath ? `${parentPath}/${item.name}` : item.name;
					if (item.path && targetPath === currentPath) {
						return item.path;
					}
					if (item.items) {
						const found = findPath(item.items, targetPath, currentPath);
						if (found) return found;
					}
				}
				return null;
			};
			
			// Try to find the path in navigation
			const foundPath = findPath(navigation.items, cleanPath);
			if (foundPath) {
				return foundPath;
			}
		}
		
		// Fallback mapping
		const pathMap: Record<string, string> = {
			'guides/installation': 'guides/installation.md',
			'guides/configuration': 'guides/configuration.md',
			'guides/advanced/customization': 'guides/advanced/customization.md',
			'guides/advanced/plugins': 'guides/advanced/plugins.md',
			'api/builder': 'api/builder.md',
			'api/renderer': 'api/renderer.md',
			'api/types': 'api/types.md'
		};
		return pathMap[cleanPath] || 'getting-started.md';
	}
	
	// Load navigation and content bundle
	$effect(() => {
		import('$lib/content/navigation.json').then(navData => {
			navigation = navData.default;
		}).catch(err => {
			console.error('Failed to load navigation:', err);
			error = 'Failed to load navigation';
			loading = false;
		});
		
		import('$lib/content/content.json').then(contentData => {
			contentBundle = contentData.default;
		}).catch(err => {
			console.error('Failed to load content bundle:', err);
			error = 'Failed to load content bundle';
			loading = false;
		});
	});
	
	// Update current page when URL changes
	$effect(() => {
		const urlPath = $page.url.pathname;
		currentPage = getContentPathFromUrl(urlPath);
	});
	
	// Load content when current page or content bundle changes
	$effect(() => {
		if (currentPage && contentBundle) {
			loading = true;
			error = null;
			loadContent(currentPage, contentBundle).then(content => {
				pageContent = content;
				loading = false;
			}).catch(err => {
				console.error('Failed to load content:', err);
				pageContent = 'Failed to load content';
				error = err instanceof Error ? err.message : 'Failed to load content';
				loading = false;
			});
		}
	});
	
	function handlePageSelect(path: string) {
		// Find the URL path from navigation data
		if (navigation) {
			const findUrlPath = (items: any[], targetPath: string, parentPath: string = ''): string | null => {
				for (const item of items) {
					if (item.path === targetPath) {
						const fullPath = parentPath ? `${parentPath}/${item.name}` : item.name;
						return `/docs/${fullPath}`;
					}
					if (item.items) {
						const currentPath = parentPath ? `${parentPath}/${item.name}` : item.name;
						const found = findUrlPath(item.items, targetPath, currentPath);
						if (found) return found;
					}
				}
				return null;
			};
			
			const urlPath = findUrlPath(navigation.items, path);
			if (urlPath) {
				window.history.pushState({}, '', urlPath);
				currentPage = path;
				return;
			}
		}
		
		// Fallback mapping
		const urlPathMap: Record<string, string> = {
			'getting-started.md': '/docs/getting-started',
			'guides/installation.md': '/docs/guides/installation',
			'guides/configuration.md': '/docs/guides/configuration',
			'guides/advanced/customization.md': '/docs/guides/advanced/customization',
			'guides/advanced/plugins.md': '/docs/guides/advanced/plugins',
			'api/builder.md': '/docs/api/builder',
			'api/renderer.md': '/docs/api/renderer',
			'api/types.md': '/docs/api/types'
		};
		const urlPath = urlPathMap[path] || '/docs/getting-started';
		window.history.pushState({}, '', urlPath);
		currentPage = path;
	}
	
	function renderNavigationItems(items: any[]): string {
		return items.map(item => {
			if (item.type === 'section') {
				const sectionItems = renderNavigationItems(item.items || []);
				return `
					<div class="nav-section">
						<div class="nav-section-header">${item.label}</div>
						${sectionItems}
					</div>
				`;
			} else {
				const isActive = currentPage === item.path;
				return `
					<button 
						class="nav-link ${isActive ? 'active' : ''}"
						onclick="window.dispatchEvent(new CustomEvent('pageSelect', { detail: '${item.path}' }))"
					>
						${item.label}
					</button>
				`;
			}
		}).join('');
	}
	
	// Set up event listener for navigation
	if (typeof window !== 'undefined') {
		window.addEventListener('pageSelect', (event: any) => {
			handlePageSelect(event.detail);
		});
	}
</script>

<div class="docs-layout">
	{#if loading}
		<div class="loading">Loading documentation...</div>
	{:else if error}
		<div class="error">Error: {error}</div>
	{:else if navigation}
		<nav class="docs-sidebar">
			<header class="docs-header">
				<h1>svelte-markdown-pages</h1>
			</header>
			{@html renderNavigationItems(navigation.items)}
		</nav>
		
		<div class="docs-content">
			{@html pageContent || 'No content selected'}
		</div>
	{/if}
</div>

<style>
	.loading, .error {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		font-size: 1.2rem;
		color: #666;
	}
	
	.error {
		color: #dc3545;
	}
</style>
