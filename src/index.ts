// Main exports
export * from './types.js';

// Builder exports
export * from './builder/index.js';

// Renderer exports
export * from './renderer/index.js';

// Re-export commonly used types and functions
export {
  DocItemTypeSchema,
  DocItemSchema,
  IndexSchema,
  type DocItem,
  type IndexFile,
  type NavigationTree,
  type NavigationItem,
  type BuildOptions,
  type BuildResult
} from './types.js';

export {
  buildDocs,
  generateStaticSite,
  type StaticSiteOptions,
  type StaticSiteResult
} from './builder/index.js';

export {
  NavigationTree as NavigationTreeClass,
  ContentLoader,
  loadContent,
  type DocsSidebarProps,
  type DocsContentProps,
  type DocsLayoutProps
} from './renderer/index.js';