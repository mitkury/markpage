import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
	build: {
		lib: {
			entry: {
				'index': 'src/index.ts',
				'marked': 'src/marked.ts',
				'builder/index': 'src/builder/index.ts',
				'builder/builder': 'src/builder/builder.ts',
				'builder/parser': 'src/builder/parser.ts',
				'renderer/index': 'src/renderer/index.ts',
				'renderer/content': 'src/renderer/content.ts',
				'renderer/navigation': 'src/renderer/navigation.ts',
				'types': 'src/types.ts'
			},
			formats: ['es', 'cjs'],
			fileName: (format, entryName) => {
				return format === 'cjs' ? `${entryName}.cjs` : `${entryName}.js`;
			}
		},
		sourcemap: true,
		target: 'node18',
		minify: false,
		rollupOptions: {
			external: ['marked', 'fs', 'path']
		}
	},
	plugins: [
		dts({
			outDir: 'dist',
			insertTypesEntry: false
		})
	]
});

