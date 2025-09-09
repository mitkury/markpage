import { defineConfig } from 'tsup';

export default defineConfig({
	entry: ['src/lib/index.ts', 'src/lib/server.ts'],
	format: ['esm'],
	dts: true,
	sourcemap: true,
	clean: true,
	target: 'node18',
	treeshake: true,
	minify: false,
	outDir: 'dist'
});

