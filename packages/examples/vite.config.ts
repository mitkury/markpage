import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		sveltekit(),
		// Plugin to build content before dev server starts
		{
			name: 'build-content',
			buildStart: async () => {
				try {
					const { buildPages } = await import('markpage/builder');
					await buildPages('./content', {
						appOutput: './src/lib/content',
						includeContent: true
					});
					console.log('✅ Content built successfully');
				} catch (error) {
					console.error('❌ Failed to build content:', error);
				}
			}
		}
	]
});
