// Server-safe exports: types and utilities without Svelte components.
// This can be imported in SvelteKit server-side code without issues.

// Re-export all server-safe types and utilities from markpage
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

// Re-export server-safe utilities from markpage renderer
export {
  NavigationTree,
  createNavigationTree,
  extractHeadings,
  extractTableOfContents,
  addTableOfContents,
  builtinTokenNames,
  componentExtension
} from 'markpage';



