// Svelte component exports
export { default as Markdown } from './markdown/Markdown.svelte';

// Type exports
export type {
  ComponentNode,
  ComponentOptions,
  RegisteredComponent,
  ParsedContent,
  MarkpageSvelteOptions,
  RenderContext
} from './types.js';

// Note: do not re-export core 'markpage' here to avoid bundling Node APIs in browser