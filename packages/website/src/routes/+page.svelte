<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import navigationData from '$lib/content/navigation.json';
	
	onMount(() => {
		// Redirect to the first page in navigation
		const firstPage = navigationData[0];
		if (firstPage?.path) {
			// Extract the name without .md extension for the URL
			const urlPath = firstPage.path.replace('.md', '');
			goto(`/${urlPath}`);
		} else {
			// Fallback to root which will handle the default
			goto('/');
		}
	});
</script>

<div class="loading">Redirecting to documentation...</div>

<style>
	.loading {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		font-size: 1.2rem;
		color: #666;
	}
</style>
