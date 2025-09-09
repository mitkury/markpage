// Root (browser-safe) exports: expose only types and renderer APIs.
export * from './types.js';
export * from './renderer/index.js';
export * from './extensions/component.js';
// Re-export selected marked APIs for browser-safe consumers (e.g., @markpage/svelte)
export { Marked, Lexer, type Tokens, type Token } from 'marked';

// Note:
// - Builder and CLI are Node-only and must be imported via subpaths:
//   import { buildPages } from 'markpage/builder'
// This keeps `import 'markpage'` safe in browser runtimes.