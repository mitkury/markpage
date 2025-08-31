import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

// Vite plugin to build content on server start
const buildContentPlugin = () => {
  return {
    name: 'build-content',
    buildStart: async () => {
      try {
        console.log('Building content...');
        const { buildPages } = await import('svelte-markdown-pages/builder');
        await buildPages('./content', {
          appOutput: './src/lib/content',
          includeContent: true
        });
        console.log('Content built successfully!');
      } catch (error) {
        console.error('Failed to build content:', error);
      }
    }
  };
};

export default defineConfig({
  plugins: [buildContentPlugin(), sveltekit()]
});
