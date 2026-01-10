export { newMarked } from './markdown/newMarked.js';

// Svelte component exports
export { default as Markdown } from './markdown/Markdown.svelte';

// Re-export important types and utilities from markpage
export type {
  NavigationItem,
  DocItem,
  DocItemType,
  IndexFile,
  BuildOptions,
  BuildResult,
  ContentProcessor,
  Tokens,
  Token,
  BuiltinTokenName,
  ComponentTokenName
} from 'markpage';

// Re-export useful utilities from markpage renderer
export {
  NavigationTree,
  createNavigationTree,
  extractHeadings,
  extractTableOfContents,
  addTableOfContents,
  builtinTokenNames,
  componentExtension,
  createComponentExtension,
  createInlineComponentExtension,
  Marked,
  Lexer
} from 'markpage';

// newMarked is exported above from the server-safe module

// Type exports specific to @markpage/svelte
export type {
  ComponentNode,
  ComponentOptions,
  RegisteredComponent,
  ParsedContent,
  MarkpageSvelteOptions,
  RenderContext
} from './types.js';

// Export MarkpageOptions directly from its module (avoid barrel indirection)
export { MarkpageOptions } from './markdown/MarkpageOptions.js';
export type { MarkdownExtension, MarkdownExtensionSet } from './markdown/MarkpageOptions.js';