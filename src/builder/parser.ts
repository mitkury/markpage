import { readFileSync, readdirSync, statSync } from 'fs';
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

export function buildNavigationTree(
  contentPath: string,
  options: ParseOptions = {}
): NavigationTree {
  const { basePath = contentPath, validateFiles = true } = options;
  
  if (!statSync(contentPath).isDirectory()) {
    throw new ParserError(`Content path is not a directory: ${contentPath}`);
  }
  
  const rootIndexPath = join(contentPath, '.index.json');
  
  if (!statSync(rootIndexPath).isFile()) {
    throw new ParserError(`Root .index.json not found: ${rootIndexPath}`);
  }
  
  const rootItems = parseIndexFile(rootIndexPath);
  const navigationItems: NavigationItem[] = [];
  
  for (const item of rootItems) {
    const navigationItem = processNavigationItem(
      item,
      contentPath,
      basePath,
      validateFiles
    );
    navigationItems.push(navigationItem);
  }
  
  return { items: navigationItems };
}

function processNavigationItem(
  item: DocItem,
  currentPath: string,
  basePath: string,
  validateFiles: boolean
): NavigationItem {
  const navigationItem: NavigationItem = { ...item };
  
  if (item.type === 'section') {
    const sectionPath = join(currentPath, item.name);
    const sectionIndexPath = join(sectionPath, '.index.json');
    
    if (validateFiles && !statSync(sectionIndexPath).isFile()) {
      throw new ParserError(
        `Section .index.json not found: ${sectionIndexPath}`,
        sectionIndexPath
      );
    }
    
    try {
      const sectionItems = parseIndexFile(sectionIndexPath);
      navigationItem.items = sectionItems.map(subItem =>
        processNavigationItem(subItem, sectionPath, basePath, validateFiles)
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
  } else if (item.type === 'page') {
    const pagePath = join(currentPath, `${item.name}.md`);
    const relativePath = relative(basePath, pagePath);
    
    if (validateFiles && !statSync(pagePath).isFile()) {
      throw new ParserError(
        `Page markdown file not found: ${pagePath}`,
        pagePath
      );
    }
    
    navigationItem.path = relativePath;
  }
  
  return navigationItem;
}

export function validateContentStructure(contentPath: string): void {
  const errors: string[] = [];
  
  function validateDirectory(dirPath: string, depth = 0): void {
    if (depth > 10) {
      errors.push(`Maximum directory depth exceeded: ${dirPath}`);
      return;
    }
    
    const indexPath = join(dirPath, '.index.json');
    
    if (!statSync(indexPath).isFile()) {
      errors.push(`Missing .index.json: ${indexPath}`);
      return;
    }
    
    try {
      const items = parseIndexFile(indexPath);
      
      for (const item of items) {
        if (item.type === 'section') {
          const sectionPath = join(dirPath, item.name);
          
          if (!statSync(sectionPath).isDirectory()) {
            errors.push(`Section directory not found: ${sectionPath}`);
            continue;
          }
          
          validateDirectory(sectionPath, depth + 1);
        } else if (item.type === 'page') {
          const pagePath = join(dirPath, `${item.name}.md`);
          
          if (!statSync(pagePath).isFile()) {
            errors.push(`Page markdown file not found: ${pagePath}`);
          }
        }
      }
    } catch (error) {
      errors.push(`Failed to parse ${indexPath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
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