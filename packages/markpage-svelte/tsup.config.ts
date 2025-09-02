import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: false,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['svelte'],
  esbuildOptions(options) {
    options.banner = {
      js: '"use client";',
    };
  },
});