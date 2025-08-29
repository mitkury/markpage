export class NavigationTree {
    constructor(data) {
        this._flatItems = [];
        this._pathMap = new Map();
        this._items = data.items;
        this._buildIndexes();
    }
    get items() {
        return this._items;
    }
    get flatItems() {
        return this._flatItems;
    }
    findItemByPath(path) {
        return this._pathMap.get(path);
    }
    findItemByName(name) {
        return this._findItemByNameRecursive(this._items, name);
    }
    getBreadcrumbs(path) {
        const item = this.findItemByPath(path);
        if (!item) {
            return [];
        }
        const breadcrumbs = [];
        let current = item;
        while (current) {
            breadcrumbs.unshift(current);
            current = current.parent;
        }
        return breadcrumbs;
    }
    getSiblings(path) {
        const item = this.findItemByPath(path);
        if (!item || !item.parent) {
            return [];
        }
        return item.parent.items || [];
    }
    getNextSibling(path) {
        const siblings = this.getSiblings(path);
        const currentIndex = siblings.findIndex(item => item.path === path);
        if (currentIndex === -1 || currentIndex === siblings.length - 1) {
            return undefined;
        }
        return siblings[currentIndex + 1];
    }
    getPreviousSibling(path) {
        const siblings = this.getSiblings(path);
        const currentIndex = siblings.findIndex(item => item.path === path);
        if (currentIndex <= 0) {
            return undefined;
        }
        return siblings[currentIndex - 1];
    }
    getChildren(path) {
        const item = this.findItemByPath(path);
        return item?.items || [];
    }
    isExpanded(path) {
        const item = this.findItemByPath(path);
        return item ? !item.collapsed : false;
    }
    toggleExpanded(path) {
        const item = this.findItemByPath(path);
        if (item) {
            item.collapsed = !item.collapsed;
        }
    }
    _buildIndexes() {
        this._flatItems = [];
        this._pathMap.clear();
        this._buildIndexesRecursive(this._items, undefined);
    }
    _buildIndexesRecursive(items, parent) {
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
    _findItemByNameRecursive(items, name) {
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
export function createNavigationTree(data) {
    return new NavigationTree(data);
}
//# sourceMappingURL=navigation.js.map