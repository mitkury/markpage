<script lang="ts">
	import { loadContent } from 'markpage/renderer';
	import { page } from '$app/state';
	import navigationData from '$lib/content/navigation.json';
	import contentData from '$lib/content/content.json';
	import { MarkdownRenderer } from '@markpage/svelte';
	import TestButton from '$lib/components/TestButton.svelte';
	
	// Build docs from the docs directory
	let navigation = $state<any>(navigationData);
	let contentBundle = $state<any>(contentData);
	
	// Component registration for markdown components
	const components = new Map([
		['TestButton', TestButton]
	]);
	
	// Debug logging
	console.log('Navigation data:', navigationData);
	console.log('Navigation state:', navigation);
	console.log('Content bundle:', contentData);
	
	// Map URL path to content path
	function getContentPathFromUrl(urlPath: string): string | null {
		const cleanPath = urlPath.replace(/^\/+/, '').replace(/\.md$/, '');
		if (!cleanPath) {
			// Return the first page from navigation as default
			return navigation?.[0]?.path || null;
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
			
			// Try to find the path in navigation (navigation is the array itself)
			const foundPath = findPath(navigation, cleanPath);
			if (foundPath) {
				return foundPath;
			}
		}
		
		return null;
	}
  
  let currentPage = $derived.by(() => {
    const urlPath = page.url.pathname;
    const contentPath = getContentPathFromUrl(urlPath);
    
    return contentPath || navigation?.[0]?.path || null;
  });

  let notFound = $derived.by(() => !currentPage && page.url.pathname !== "/");

  let pageContentPromise = $derived.by(async () => {
    if (currentPage && contentBundle) {
      try {
        const content = await loadContent(currentPage, contentBundle);
        return content;
      } catch (err) {
        console.error('Failed to load content:', err);
        throw err;
      }
    }
    return null;
  });
	
	function renderNavigationItems(items: any[], parentPath: string = ''): string {
		return items.map(item => {
			if (item.type === 'section') {
				const currentPath = parentPath ? `${parentPath}/${item.name}` : item.name;
				const sectionItems = renderNavigationItems(item.items || [], currentPath);
				return `
					<div class="nav-section">
						<div class="nav-section-header">${item.label}</div>
						${sectionItems}
					</div>
				`;
			} else {
				const isActive = currentPage === item.path;
				const href = parentPath ? `/${parentPath}/${item.name}` : `/${item.name}`;
				return `
					<a 
						href="${href}"
						class="nav-link ${isActive ? 'active' : ''}"
					>
						${item.label}
					</a>
				`;
			}
		}).join('');
	}
	
	// Generate dynamic navigation links for 404 page
	function getNavigationLinks(): string[] {
		const links: string[] = [];
		
		function collectLinks(items: any[], parentPath: string = '') {
			for (const item of items) {
				if (item.type === 'page' && item.path) {
					const urlPath = parentPath ? `/${parentPath}/${item.name}` : `/${item.name}`;
					links.push(urlPath);
				}
				if (item.items) {
					const currentPath = parentPath ? `${parentPath}/${item.name}` : item.name;
					collectLinks(item.items, currentPath);
				}
			}
		}
		
		if (navigation) {
			collectLinks(navigation);
		}
		
		return links.slice(0, 5); // Limit to 5 links for 404 page
	}
</script>

<div class="docs-layout">
	{#if navigation}
		<nav class="docs-sidebar">
			<header class="docs-header">
				<h1>Markpage</h1>
				<p class="docs-subtitle">Documentation</p>
			</header>
			{@html renderNavigationItems(navigation)}
		</nav>
		
		<div class="docs-content">
			{#if notFound}
				<div class="not-found">
					<h1>404 - Page Not Found</h1>
					<p>The page you're looking for doesn't exist.</p>
					<p>Try one of these pages:</p>
					<ul>
						{#each getNavigationLinks() as link}
							<li><a href={link}>{link.replace(/^\//, '')}</a></li>
						{/each}
					</ul>
				</div>
			{:else}
				{#await pageContentPromise}
					<div>Loading...</div>
				{:then content}
					{#if content}
						<MarkdownRenderer 
							content={content}
							components={components}
							enableComponents={true}
						/>
					{:else}
						<div>No content selected</div>
					{/if}
				{:catch error}
					<div>Error: {error.message}</div>
				{/await}
			{/if}
		</div>
	{/if}
</div>

<style>
	/* Add your styles here */
</style>
