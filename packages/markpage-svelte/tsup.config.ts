import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: false, // Temporarily disabled due to tsup DTS issues
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['svelte'],
  tsconfig: './tsconfig.json',
});