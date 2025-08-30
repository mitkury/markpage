<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	
	onMount(() => {
		// Redirect to the documentation
		goto('/getting-started');
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
