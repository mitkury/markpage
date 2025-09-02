// Main exports
export * from './types.js';

// Builder exports
export * from './builder/index.js';

// Renderer exports
export * from './renderer/index.js';

// Re-export commonly used types and functions
export {
  validateDocItem,
  validateIndexFile,
  type DocItem,
  type IndexFile,
  type NavigationItem,
  type BuildOptions,
  type BuildResult
} from './types.js';

export {
  buildPages,
  generateStaticSite,
  type StaticSiteOptions,
  type StaticSiteResult
} from './builder/index.js';

export {
  NavigationTree,
  ContentLoader,
  loadContent,
  extractHeadings,
  extractTableOfContents,
  addTableOfContents
} from './renderer/index.js';