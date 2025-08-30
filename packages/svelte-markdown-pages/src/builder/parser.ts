import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, relative } from 'path';
import { IndexSchema, NavigationItem, NavigationTree, DocItem } from '../types.js';

export class ParserError extends Error {
  constructor(message: string, public filePath?: string) {
    super(message);
    this.name = 'ParserError';
  }
}

export interface ParseOptions {
  basePath?: string;
  validateFiles?: boolean;
  autoDiscover?: boolean;
}

export function parseIndexFile(filePath: string): DocItem[] {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);
    const result = IndexSchema.safeParse(data);
    
    if (!result.success) {
      throw new ParserError(
        `Invalid .index.json format: ${result.error.message}`,
        filePath
      );
    }
    
    return result.data.items;
  } catch (error) {
    if (error instanceof ParserError) {
      throw error;
    }
    
    if (error instanceof SyntaxError) {
      throw new ParserError(
        `Invalid JSON in .index.json: ${error.message}`,
        filePath
      );
    }
    
    throw new ParserError(
      `Failed to read .index.json: ${error instanceof Error ? error.message : 'Unknown error'}`,
      filePath
    );
  }
}

/**
 * Auto-discovers content in a directory when no .index.json is present
 */
function autoDiscoverContent(dirPath: string): DocItem[] {
  try {
    const items = readdirSync(dirPath, { withFileTypes: true });
    const discoveredItems: DocItem[] = [];
    
    // Filter and sort items
    const markdownFiles = items
      .filter(item => item.isFile() && item.name.endsWith('.md'))
      .map(item => ({ ...item, name: item.name.slice(0, -3) })) // Remove .md extension
      .sort((a, b) => a.name.localeCompare(b.name));
    
    const directories = items
      .filter(item => item.isDirectory() && !item.name.startsWith('.'))
      .sort((a, b) => a.name.localeCompare(b.name));
    
    // Add markdown files as pages, but exclude index.md and README.md
    for (const file of markdownFiles) {
      // Skip index.md and README.md as they will be handled as section roots
      if (file.name.toLowerCase() !== 'index' && file.name.toLowerCase() !== 'readme') {
        discoveredItems.push({
          name: file.name,
          type: 'page',
          label: generateLabel(file.name)
        });
      }
    }
    
    // Add directories as sections
    for (const dir of directories) {
      discoveredItems.push({
        name: dir.name,
        type: 'section',
        label: generateLabel(dir.name)
      });
    }
    
    return discoveredItems;
  } catch (error) {
    throw new ParserError(
      `Failed to auto-discover content in directory: ${error instanceof Error ? error.message : 'Unknown error'}`,
      dirPath
    );
  }
}

/**
 * Generates a human-readable label from a filename/directory name
 */
function generateLabel(name: string): string {
  return name
    .replace(/[-_]/g, ' ') // Replace hyphens and underscores with spaces
    .replace(/\b\w/g, l => l.toUpperCase()) // Capitalize first letter of each word
    .trim();
}

/**
 * Checks if a directory has an .index.json file
 */
function hasIndexFile(dirPath: string): boolean {
  try {
    const indexPath = join(dirPath, '.index.json');
    return statSync(indexPath).isFile();
  } catch {
    return false;
  }
}

export function buildNavigationTree(
  contentPath: string,
  options: ParseOptions = {}
): NavigationTree {
  const { basePath = contentPath, validateFiles = true, autoDiscover = true } = options;
  
  try {
    if (!statSync(contentPath).isDirectory()) {
      throw new ParserError(`Content path is not a directory: ${contentPath}`);
    }
  } catch (error) {
    if (error instanceof ParserError) {
      throw error;
    }
    throw new ParserError(`Content path does not exist: ${contentPath}`, contentPath);
  }
  
  const rootIndexPath = join(contentPath, '.index.json');
  let rootItems: DocItem[];
  
  // Check if .index.json exists
  const hasIndex = hasIndexFile(contentPath);
  
  if (hasIndex) {
    // Use existing .index.json
    try {
      rootItems = parseIndexFile(rootIndexPath);
    } catch (error) {
      if (error instanceof ParserError) {
        throw error;
      }
      throw new ParserError(`Root .index.json not found: ${rootIndexPath}`, rootIndexPath);
    }
  } else if (autoDiscover) {
    // Auto-discover content
    rootItems = autoDiscoverContent(contentPath);
  } else {
    // Auto-discovery disabled and no .index.json
    throw new ParserError(`Root .index.json not found: ${rootIndexPath}`, rootIndexPath);
  }
  
  const navigationItems: NavigationItem[] = [];
  
  for (const item of rootItems) {
    const navigationItem = processNavigationItem(
      item,
      contentPath,
      basePath,
      validateFiles,
      autoDiscover
    );
    navigationItems.push(navigationItem);
  }
  
  return { items: navigationItems };
}

function processNavigationItem(
  item: DocItem,
  currentPath: string,
  basePath: string,
  validateFiles: boolean,
  autoDiscover: boolean
): NavigationItem {
  const navigationItem: NavigationItem = { ...item };
  
  if (item.type === 'section') {
    const sectionPath = join(currentPath, item.name);
    
    // Check if section has .index.json
    if (hasIndexFile(sectionPath)) {
      // Use existing .index.json
      const sectionIndexPath = join(sectionPath, '.index.json');
      
      if (validateFiles) {
        try {
          if (!statSync(sectionIndexPath).isFile()) {
            throw new ParserError(
              `Section .index.json not found: ${sectionIndexPath}`,
              sectionIndexPath
            );
          }
        } catch (error) {
          if (error instanceof ParserError) {
            throw error;
          }
          throw new ParserError(
            `Section .index.json not found: ${sectionIndexPath}`,
            sectionIndexPath
          );
        }
      }
      
      try {
        const sectionItems = parseIndexFile(sectionIndexPath);
        navigationItem.items = sectionItems.map(subItem =>
          processNavigationItem(subItem, sectionPath, basePath, validateFiles, autoDiscover)
        );
      } catch (error) {
        if (error instanceof ParserError) {
          throw error;
        }
        throw new ParserError(
          `Failed to process section ${item.name}: ${error instanceof Error ? error.message : 'Unknown error'}`,
          sectionIndexPath
        );
      }
    } else if (autoDiscover) {
      // Auto-discover section content
      try {
        const sectionItems = autoDiscoverContent(sectionPath);
        navigationItem.items = sectionItems.map(subItem =>
          processNavigationItem(subItem, sectionPath, basePath, validateFiles, autoDiscover)
        );
      } catch (error) {
        if (error instanceof ParserError) {
          throw error;
        }
        throw new ParserError(
          `Failed to auto-discover section ${item.name}: ${error instanceof Error ? error.message : 'Unknown error'}`,
          sectionPath
        );
      }
    } else {
      // Auto-discovery disabled and no .index.json
      const sectionIndexPath = join(sectionPath, '.index.json');
      throw new ParserError(
        `Section .index.json not found: ${sectionIndexPath}`,
        sectionIndexPath
      );
    }
    
    // Check for index.md or README.md as section root (for all sections)
    const indexPath = join(sectionPath, 'index.md');
    const readmePath = join(sectionPath, 'README.md');
    const readmeLowerPath = join(sectionPath, 'readme.md');
    
    let sectionRootPath: string | undefined;
    
    // Priority: index.md > README.md > readme.md
    if (validateFiles) {
      // When validating files, check each one individually
      try {
        if (statSync(indexPath).isFile()) {
          sectionRootPath = indexPath;
        }
      } catch {
        // index.md doesn't exist, try README.md
        try {
          if (statSync(readmePath).isFile()) {
            sectionRootPath = readmePath;
          }
        } catch {
          // README.md doesn't exist, try readme.md
          try {
            if (statSync(readmeLowerPath).isFile()) {
              sectionRootPath = readmeLowerPath;
            }
          } catch {
            // readme.md doesn't exist, continue without section root
          }
        }
      }
    } else {
      // If not validating files, just check if they exist
      if (existsSync(indexPath)) {
        sectionRootPath = indexPath;
      } else if (existsSync(readmePath)) {
        sectionRootPath = readmePath;
      } else if (existsSync(readmeLowerPath)) {
        sectionRootPath = readmeLowerPath;
      }
    }
    

    
    if (sectionRootPath) {
      navigationItem.path = relative(basePath, sectionRootPath);
    }
  } else if (item.type === 'page') {
    const pagePath = join(currentPath, `${item.name}.md`);
    const relativePath = relative(basePath, pagePath);
    
    if (validateFiles) {
      try {
        if (!statSync(pagePath).isFile()) {
          throw new ParserError(
            `Page markdown file not found: ${pagePath}`,
            pagePath
          );
        }
      } catch (error) {
        if (error instanceof ParserError) {
          throw error;
        }
        throw new ParserError(
          `Page markdown file not found: ${pagePath}`,
          pagePath
        );
      }
    }
    
    navigationItem.path = relativePath;
  }
  
  return navigationItem;
}

export function validateContentStructure(contentPath: string, options: ParseOptions = {}): void {
  const { autoDiscover = true } = options;
  const errors: string[] = [];
  
  function validateDirectory(dirPath: string, depth = 0): void {
    if (depth > 10) {
      errors.push(`Maximum directory depth exceeded: ${dirPath}`);
      return;
    }
    
    const indexPath = join(dirPath, '.index.json');
    
    // Check if .index.json exists
    if (hasIndexFile(dirPath)) {
      // Validate using .index.json
      try {
        const items = parseIndexFile(indexPath);
        
        for (const item of items) {
          if (item.type === 'section') {
            const sectionPath = join(dirPath, item.name);
            
            try {
              if (!statSync(sectionPath).isDirectory()) {
                errors.push(`Section directory not found: ${sectionPath}`);
                continue;
              }
            } catch (error) {
              errors.push(`Section directory not found: ${sectionPath}`);
              continue;
            }
            
            validateDirectory(sectionPath, depth + 1);
          } else if (item.type === 'page') {
            const pagePath = join(dirPath, `${item.name}.md`);
            
            try {
              if (!statSync(pagePath).isFile()) {
                errors.push(`Page markdown file not found: ${pagePath}`);
              }
            } catch (error) {
              errors.push(`Page markdown file not found: ${pagePath}`);
            }
          }
        }
      } catch (error) {
        errors.push(`Failed to parse ${indexPath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } else if (autoDiscover) {
      // Validate auto-discovered content
      try {
        const items = autoDiscoverContent(dirPath);
        
        for (const item of items) {
          if (item.type === 'section') {
            const sectionPath = join(dirPath, item.name);
            
            try {
              if (!statSync(sectionPath).isDirectory()) {
                errors.push(`Section directory not found: ${sectionPath}`);
                continue;
              }
            } catch (error) {
              errors.push(`Section directory not found: ${sectionPath}`);
              continue;
            }
            
            validateDirectory(sectionPath, depth + 1);
          } else if (item.type === 'page') {
            const pagePath = join(dirPath, `${item.name}.md`);
            
            try {
              if (!statSync(pagePath).isFile()) {
                errors.push(`Page markdown file not found: ${pagePath}`);
              }
            } catch (error) {
              errors.push(`Page markdown file not found: ${pagePath}`);
            }
          }
        }
      } catch (error) {
        errors.push(`Failed to auto-discover content in ${dirPath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } else {
      // Auto-discovery disabled and no .index.json
      errors.push(`Missing .index.json: ${indexPath}`);
      return;
    }
  }
  
  validateDirectory(contentPath);
  
  if (errors.length > 0) {
    throw new ParserError(
      `Content structure validation failed:\n${errors.join('\n')}`,
      contentPath
    );
  }
}