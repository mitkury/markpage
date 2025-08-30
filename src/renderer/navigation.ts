import { NavigationTree as NavigationTreeType, NavigationItem } from '../types.js';

export class NavigationTree {
  private _items: NavigationItem[];
  private _flatItems: NavigationItem[] = [];
  private _pathMap: Map<string, NavigationItem> = new Map();

  constructor(data: NavigationTreeType) {
    this._items = data.items;
    this._buildIndexes();
  }

  get items(): NavigationItem[] {
    return this._items;
  }

  get flatItems(): NavigationItem[] {
    return this._flatItems;
  }

  findItemByPath(path: string): NavigationItem | undefined {
    return this._pathMap.get(path);
  }

  findItemByName(name: string): NavigationItem | undefined {
    return this._findItemByNameRecursive(this._items, name);
  }

  getBreadcrumbs(path: string): NavigationItem[] {
    const item = this.findItemByPath(path);
    if (!item) {
      return [];
    }

    const breadcrumbs: NavigationItem[] = [];
    let current: NavigationItem | undefined = item;

    while (current) {
      breadcrumbs.unshift(current);
      current = current.parent;
    }

    return breadcrumbs;
  }

  getSiblings(path: string): NavigationItem[] {
    const item = this.findItemByPath(path);
    if (!item || !item.parent) {
      // If no parent, return all root items
      return this._items;
    }

    return item.parent.items || [];
  }

  getNextSibling(path: string): NavigationItem | undefined {
    const siblings = this.getSiblings(path);
    const currentIndex = siblings.findIndex(item => item.path === path);
    
    if (currentIndex === -1 || currentIndex === siblings.length - 1) {
      return undefined;
    }

    return siblings[currentIndex + 1];
  }

  getPreviousSibling(path: string): NavigationItem | undefined {
    const siblings = this.getSiblings(path);
    const currentIndex = siblings.findIndex(item => item.path === path);
    
    if (currentIndex <= 0) {
      return undefined;
    }

    return siblings[currentIndex - 1];
  }

  getChildren(path: string): NavigationItem[] {
    // First try to find by name (for sections)
    let item = this.findItemByName(path);
    
    // If not found by name, try to find by path
    if (!item) {
      item = this.findItemByPath(path);
    }
    
    // If still not found, try to find nested items by path
    if (!item && path.includes('/')) {
      const pathParts = path.split('/');
      const sectionName = pathParts[pathParts.length - 1];
      item = this.findItemByName(sectionName);
    }
    
    return item?.items || [];
  }

  isExpanded(path: string): boolean {
    const item = this.findItemByName(path) || this.findItemByPath(path);
    return item ? !item.collapsed : false;
  }

  toggleExpanded(path: string): void {
    const item = this.findItemByName(path) || this.findItemByPath(path);
    if (item) {
      item.collapsed = !item.collapsed;
    }
  }

  private _buildIndexes(): void {
    this._flatItems = [];
    this._pathMap.clear();
    this._buildIndexesRecursive(this._items, undefined);
  }

  private _buildIndexesRecursive(
    items: NavigationItem[],
    parent: NavigationItem | undefined
  ): void {
    for (const item of items) {
      // Set parent reference
      item.parent = parent || undefined;

      // Add to flat list
      this._flatItems.push(item);

      // Add to path map if it's a page
      if (item.path) {
        this._pathMap.set(item.path, item);
      }

      // Process children
      if (item.items) {
        this._buildIndexesRecursive(item.items, item);
      }
    }
  }

  private _findItemByNameRecursive(
    items: NavigationItem[],
    name: string
  ): NavigationItem | undefined {
    for (const item of items) {
      if (item.name === name) {
        return item;
      }

      if (item.items) {
        const found = this._findItemByNameRecursive(item.items, name);
        if (found) {
          return found;
        }
      }
    }

    return undefined;
  }
}

export function createNavigationTree(data: NavigationTreeType): NavigationTree {
  return new NavigationTree(data);
}