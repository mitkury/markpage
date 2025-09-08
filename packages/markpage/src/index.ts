// Root (browser-safe) exports: expose only types and renderer APIs.
export * from './types.js';
export * from './renderer/index.js';
export * from './extensions/component.js';

// Note:
// - Builder and CLI are Node-only and must be imported via subpaths:
//   import { buildPages } from 'markpage/builder'
//   import { generateStaticSite } from 'markpage/builder'
// This keeps `import 'markpage'` safe in browser runtimes.