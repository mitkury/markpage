import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    'index': 'src/index.ts',
    'builder/index': 'src/builder/index.ts',
    'renderer/index': 'src/renderer/index.ts',
    'renderer/components': 'src/renderer/components.ts',
    'renderer/content': 'src/renderer/content.ts',
    'renderer/navigation': 'src/renderer/navigation.ts',
    'builder/builder': 'src/builder/builder.ts',
    'builder/parser': 'src/builder/parser.ts',
    'builder/static-generator': 'src/builder/static-generator.ts',
    'types': 'src/types.ts'
  },
  format: ['esm', 'cjs'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: false,
  external: ['svelte'],
  outDir: 'dist',
  target: 'node18'
});
