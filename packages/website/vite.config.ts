import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, type Plugin } from 'vite';
import type { ViteDevServer } from 'vite';
import { watch } from 'chokidar';
import path from 'path';

// Vite plugin to build content on server start and watch for changes
const buildContentPlugin = (): Plugin => {
  let isBuilding = false;
  
  const buildContent = async () => {
    if (isBuilding) return;
    isBuilding = true;
    
    try {
      console.log('Building content from root docs...');
      const { buildPages } = await import('markpage/builder');
      await buildPages('../../docs', {
        appOutput: './src/lib/content',
        includeContent: true
      });
      console.log('Content built successfully!');
    } catch (error) {
      console.error('Failed to build content:', error);
    } finally {
      isBuilding = false;
    }
  };

  return {
    name: 'build-content',
    buildStart: buildContent,
    configureServer(server: ViteDevServer) {
      // Watch for changes in the docs directory
      const docsPath = path.resolve('../../docs');
      const watcher = watch(docsPath, {
        ignored: /(^|[\/\\])\../, // ignore dotfiles
        persistent: true
      });

      watcher.on('change', (filePath) => {
        console.log(`Content file changed: ${filePath}`);
        buildContent();
      });

      watcher.on('add', (filePath) => {
        console.log(`Content file added: ${filePath}`);
        buildContent();
      });

      watcher.on('unlink', (filePath) => {
        console.log(`Content file removed: ${filePath}`);
        buildContent();
      });

      // Clean up watcher when server closes
      server.middlewares.use('/__close', () => {
        watcher.close();
      });
    }
  };
};

export default defineConfig({
  plugins: [buildContentPlugin(), sveltekit()],
  resolve: {
    alias: [
      { find: '@markpage/svelte/server', replacement: path.resolve(__dirname, '../markpage-svelte/src/lib/server.ts') },
      { find: /@markpage\/svelte$/u, replacement: path.resolve(__dirname, '../markpage-svelte/src/lib/index.ts') }
    ]
  }
});
