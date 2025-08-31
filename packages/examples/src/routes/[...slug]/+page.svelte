<script lang="ts">
	import { loadContent } from 'svelte-markdown-pages/renderer';
	import { page } from '$app/state';
	import navigationData from '$lib/content/navigation.json';
	import contentData from '$lib/content/content.json';
	
	// Build docs from the content directory
	let navigation = $state<any>(navigationData);
	let contentBundle = $state<any>(contentData);
	
	// Map URL path to content path
	function getContentPathFromUrl(urlPath: string): string | null {
		const cleanPath = urlPath.replace(/^\/+/, '').replace(/\.md$/, '');
		if (!cleanPath) {
			// Return the first page from navigation as default
			return navigation?.items?.[0]?.path || null;
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
		
		return null;
	}
  
  let currentPage = $derived.by(() => {
    const urlPath = page.url.pathname;
    const contentPath = getContentPathFromUrl(urlPath);
    
    return contentPath || navigation?.items?.[0]?.path || null;
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
	

</script>

<div class="docs-layout">
	{#if navigation}
		<nav class="docs-sidebar">
			<header class="docs-header">
				<h1>svelte-markdown-pages</h1>
				<p>Example Documentation</p>
			</header>
			{@html renderNavigationItems(navigation.items)}
		</nav>
		
		<div class="docs-content">
			{#if notFound}
				<div class="not-found">
					<h1>404 - Page Not Found</h1>
					<p>The page you're looking for doesn't exist.</p>
					<p>Try one of these pages:</p>
					<ul>
						<li><a href="/getting-started">Getting Started</a></li>
						<li><a href="/guides/installation">Installation Guide</a></li>
						<li><a href="/guides/configuration">Configuration</a></li>
						<li><a href="/api/builder">API Reference</a></li>
					</ul>
				</div>
			{:else}
				{#await pageContentPromise}
					<div>Loading...</div>
				{:then content}
					{@html content || 'No content selected'}
				{:catch error}
					<div>Error: {error.message}</div>
				{/await}
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
		width: 280px;
		background: #f7fafc;
		border-right: 1px solid #e2e8f0;
		padding: 1.5rem;
		overflow-y: auto;
	}
	
	.docs-header {
		margin-bottom: 2rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid #e2e8f0;
	}
	
	.docs-header h1 {
		font-size: 1.5rem;
		font-weight: 700;
		color: #2d3748;
		margin: 0 0 0.5rem 0;
	}
	
	.docs-header p {
		font-size: 0.875rem;
		color: #718096;
		margin: 0;
	}
	
	.docs-content {
		flex: 1;
		padding: 2rem;
		overflow-y: auto;
	}
	
	:global(.nav-section) {
		margin-bottom: 1.5rem;
	}
	
	:global(.nav-section-header) {
		font-size: 0.875rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: #718096;
		margin-bottom: 0.75rem;
	}
	
	:global(.nav-link) {
		display: block;
		padding: 0.5rem 0.75rem;
		color: #4a5568;
		text-decoration: none;
		border-radius: 6px;
		margin-bottom: 0.25rem;
		transition: all 0.2s;
		font-size: 0.875rem;
	}
	
	:global(.nav-link:hover) {
		background: #edf2f7;
		color: #2d3748;
	}
	
	:global(.nav-link.active) {
		background: #3182ce;
		color: white;
	}
	
	.not-found {
		max-width: 600px;
		margin: 0 auto;
		padding: 2rem;
		text-align: center;
	}
	
	.not-found h1 {
		font-size: 2rem;
		color: #2d3748;
		margin-bottom: 1rem;
	}
	
	.not-found ul {
		list-style: none;
		padding: 0;
		margin-top: 1rem;
	}
	
	.not-found li {
		margin-bottom: 0.5rem;
	}
	
	.not-found a {
		color: #3182ce;
		text-decoration: none;
	}
	
	.not-found a:hover {
		text-decoration: underline;
	}
</style>
