import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte()],
  resolve: {
    conditions: ['svelte', 'browser', 'development']
  },
  test: {
    globals: true,
    environment: 'jsdom',
    define: {
      'import.meta.env.SSR': false
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'fixtures/'
      ]
    }
  }
});