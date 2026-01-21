// Simple validation functions
function validateDocItem(item: any): item is DocItem {
  return (
    typeof item === 'object' &&
    item !== null &&
    typeof item.name === 'string' &&
    item.name.length > 0 &&
    (item.type === 'section' || item.type === 'page') &&
    typeof item.label === 'string' &&
    item.label.length > 0 &&
    (item.collapsed === undefined || typeof item.collapsed === 'boolean') &&
    (item.url === undefined || typeof item.url === 'string')
  );
}

function validateIndexFile(data: any): data is IndexFile {
  return (
    typeof data === 'object' &&
    data !== null &&
    Array.isArray(data.items) &&
    data.items.every(validateDocItem)
  );
}

// Export validation functions
export { validateDocItem, validateIndexFile };

// Core types
export type DocItemType = "section" | "page";

export interface DocItem {
  name: string;
  type: DocItemType;
  label: string;
  collapsed?: boolean;
  url?: string;
}

export interface IndexFile {
  items: DocItem[];
}

// Navigation tree types
export interface NavigationItem extends DocItem {
  path?: string;
  items?: NavigationItem[];
  parent?: NavigationItem | undefined;
}

export type ContentMode = 'all' | 'index-only';

// Build output types
export interface BuildOptions {
  appOutput?: string;
  websiteOutput?: string;
  staticOutput?: string;
  includeContent?: boolean;
  autoDiscover?: boolean; // Enable auto-discovery when .index.json is missing
  /**
   * Choose which markdown files to bundle:
   * - `'all'` (default): include every markdown file under the content directory.
   * - `'index-only'`: bundle only the files referenced in the generated navigation tree (aka `.index.json` entries).
   */
  contentMode?: ContentMode;
  /**
   * Optional link checking during build (off by default).
   *
   * - `true` enables checks with defaults (warnings only)
   * - object form lets you tune behavior
   */
  linkCheck?: boolean | LinkCheckBuildOptions;
}

export interface BuildResult {
  navigation: NavigationItem[];
  content?: Record<string, string> | undefined;
  pages?: Array<{
    path: string;
    content: string;
    html: string;
  }> | undefined;
  linkCheck?: LinkCheckResult | undefined;
}

// Content processing types
export interface ContentProcessor {
  process(content: string): string;
}

// Link checking (builder-only feature, but result data is browser-safe)
export type LinkIssueReason = 'missing file' | 'unsupported protocol';
export type LinkWarningReason = 'not in navigation';

export interface LinkIssue {
  file: string; // absolute path to source markdown file
  target: string;
  reason: LinkIssueReason;
}

export interface LinkWarning {
  file: string; // absolute path to source markdown file
  target: string;
  resolvedFile: string; // absolute resolved markdown file path
  reason: LinkWarningReason;
}

export interface LinkCheckResult {
  filesChecked: number;
  issues: LinkIssue[];
  warnings: LinkWarning[];
}

export interface LinkCheckBuildOptions {
  /**
   * Warn if a link resolves to a markdown file inside the docs root,
   * but that file is not present in the generated navigation tree.
   */
  warnOnUnindexed?: boolean;
  /**
   * When true, `buildPages()` throws if any issues are found.
   * When false/undefined, issues are reported in `BuildResult.linkCheck` only.
   */
  failOnBroken?: boolean;
}
