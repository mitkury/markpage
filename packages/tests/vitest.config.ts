import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import path from 'path';

export default defineConfig({
  plugins: [
    svelte({
      compilerOptions: {
        generate: 'dom'
      }
    })
  ],
  resolve: {
    conditions: ['svelte', 'browser', 'development'],
    alias: {
      '@markpage/svelte': path.resolve(__dirname, '../markpage-svelte/src/lib/index.ts')
    }
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