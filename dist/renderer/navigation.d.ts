import { NavigationTree as NavigationTreeType, NavigationItem } from '../types.js';
export declare class NavigationTree {
    private _items;
    private _flatItems;
    private _pathMap;
    constructor(data: NavigationTreeType);
    get items(): NavigationItem[];
    get flatItems(): NavigationItem[];
    findItemByPath(path: string): NavigationItem | undefined;
    findItemByName(name: string): NavigationItem | undefined;
    getBreadcrumbs(path: string): NavigationItem[];
    getSiblings(path: string): NavigationItem[];
    getNextSibling(path: string): NavigationItem | undefined;
    getPreviousSibling(path: string): NavigationItem | undefined;
    getChildren(path: string): NavigationItem[];
    isExpanded(path: string): boolean;
    toggleExpanded(path: string): void;
    private _buildIndexes;
    private _buildIndexesRecursive;
    private _findItemByNameRecursive;
}
export declare function createNavigationTree(data: NavigationTreeType): NavigationTree;
//# sourceMappingURL=navigation.d.ts.map