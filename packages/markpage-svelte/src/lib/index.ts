import { Marked, componentExtension } from 'markpage';

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
  Marked,
  Lexer
} from 'markpage';

// Convenience: create a Marked instance with the component extension applied
export function newMarked() {
  const md = new Marked();
  md.use({ extensions: [componentExtension as any] as any } as any);
  return md;
}

// Type exports specific to @markpage/svelte
export type {
  ComponentNode,
  ComponentOptions,
  RegisteredComponent,
  ParsedContent,
  MarkpageSvelteOptions,
  RenderContext
} from './types.js';

// Export MarkpageOptions class
export { MarkpageOptions, type MarkdownExtension, type MarkdownExtensionSet } from './types.js';