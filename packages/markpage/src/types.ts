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

// Build output types
export interface BuildOptions {
  appOutput?: string;
  websiteOutput?: string;
  staticOutput?: string;
  includeContent?: boolean;
  autoDiscover?: boolean; // Enable auto-discovery when .index.json is missing
}

export interface BuildResult {
  navigation: NavigationItem[];
  content?: Record<string, string> | undefined;
  pages?: Array<{
    path: string;
    content: string;
    html: string;
  }> | undefined;
}

// Content processing types
export interface ContentProcessor {
  process(content: string): string;
}