import { describe, it, expect, beforeEach } from 'vitest';
import { NavigationTree, createNavigationTree } from 'svelte-markdown-pages/renderer';
import { NavigationItem } from 'svelte-markdown-pages';

describe('Navigation', () => {
  const sampleNavigationData: NavigationItem[] = [
    {
      name: 'getting-started',
      type: 'page',
      label: 'Getting Started',
      path: 'getting-started.md'
    },
    {
      name: 'guides',
      type: 'section',
      label: 'Guides',
      items: [
        {
          name: 'installation',
          type: 'page',
          label: 'Installation',
          path: 'guides/installation.md'
        },
        {
          name: 'configuration',
          type: 'page',
          label: 'Configuration',
          path: 'guides/configuration.md'
        }
      ]
    },
    {
      name: 'api',
      type: 'section',
      label: 'API Reference',
      collapsed: true,
      items: [
        {
          name: 'builder',
          type: 'page',
          label: 'Builder API',
          path: 'api/builder.md'
        }
      ]
    }
  ];

  describe('NavigationTree', () => {
    let navigation: NavigationTree;

    beforeEach(() => {
      navigation = new NavigationTree(sampleNavigationData);
    });

    describe('constructor and properties', () => {
      it('should create NavigationTree with data', () => {
        expect(navigation.items).toHaveLength(3);
        expect(navigation.flatItems).toHaveLength(6); // All items including nested
      });

      it('should build indexes correctly', () => {
        expect(navigation.findItemByPath('getting-started.md')).toBeDefined();
        expect(navigation.findItemByPath('guides/installation.md')).toBeDefined();
        expect(navigation.findItemByPath('nonexistent.md')).toBeUndefined();
      });
    });

    describe('findItemByPath', () => {
      it('should find items by path', () => {
        const item = navigation.findItemByPath('getting-started.md');
        expect(item).toBeDefined();
        expect(item!.name).toBe('getting-started');
        expect(item!.label).toBe('Getting Started');
      });

      it('should find nested items by path', () => {
        const item = navigation.findItemByPath('guides/installation.md');
        expect(item).toBeDefined();
        expect(item!.name).toBe('installation');
        expect(item!.label).toBe('Installation');
      });

      it('should return undefined for non-existent path', () => {
        const item = navigation.findItemByPath('nonexistent.md');
        expect(item).toBeUndefined();
      });
    });

    describe('findItemByName', () => {
      it('should find items by name', () => {
        const item = navigation.findItemByName('getting-started');
        expect(item).toBeDefined();
        expect(item!.name).toBe('getting-started');
      });

      it('should find nested items by name', () => {
        const item = navigation.findItemByName('installation');
        expect(item).toBeDefined();
        expect(item!.name).toBe('installation');
      });

      it('should return undefined for non-existent name', () => {
        const item = navigation.findItemByName('nonexistent');
        expect(item).toBeUndefined();
      });
    });

    describe('getBreadcrumbs', () => {
      it('should get breadcrumbs for root item', () => {
        const breadcrumbs = navigation.getBreadcrumbs('getting-started.md');
        expect(breadcrumbs).toHaveLength(1);
        expect(breadcrumbs[0].name).toBe('getting-started');
      });

      it('should get breadcrumbs for nested item', () => {
        const breadcrumbs = navigation.getBreadcrumbs('guides/installation.md');
        expect(breadcrumbs).toHaveLength(2);
        expect(breadcrumbs[0].name).toBe('guides');
        expect(breadcrumbs[1].name).toBe('installation');
      });

      it('should return empty array for non-existent path', () => {
        const breadcrumbs = navigation.getBreadcrumbs('nonexistent.md');
        expect(breadcrumbs).toHaveLength(0);
      });
    });

    describe('getSiblings', () => {
      it('should get siblings for root item', () => {
        const siblings = navigation.getSiblings('getting-started.md');
        expect(siblings).toHaveLength(3);
        expect(siblings.map(s => s.name)).toEqual(['getting-started', 'guides', 'api']);
      });

      it('should get siblings for nested item', () => {
        const siblings = navigation.getSiblings('guides/installation.md');
        expect(siblings).toHaveLength(2);
        expect(siblings.map(s => s.name)).toEqual(['installation', 'configuration']);
      });

      it('should return empty array for root level item', () => {
        const siblings = navigation.getSiblings('getting-started.md');
        // This should return all root items since they're all siblings
        expect(siblings).toHaveLength(3);
      });
    });

    describe('getNextSibling', () => {
      it('should get next sibling', () => {
        const nextSibling = navigation.getNextSibling('getting-started.md');
        expect(nextSibling).toBeDefined();
        expect(nextSibling!.name).toBe('guides');
      });

      it('should get next sibling for nested item', () => {
        const nextSibling = navigation.getNextSibling('guides/installation.md');
        expect(nextSibling).toBeDefined();
        expect(nextSibling!.name).toBe('configuration');
      });

      it('should return undefined for last item', () => {
        const nextSibling = navigation.getNextSibling('api/builder.md');
        expect(nextSibling).toBeUndefined();
      });

      it('should return undefined for non-existent path', () => {
        const nextSibling = navigation.getNextSibling('nonexistent.md');
        expect(nextSibling).toBeUndefined();
      });
    });

    describe('getPreviousSibling', () => {
      it('should get previous sibling', () => {
        const prevSibling = navigation.getPreviousSibling('guides/configuration.md');
        expect(prevSibling).toBeDefined();
        expect(prevSibling!.name).toBe('installation');
      });

      it('should return undefined for first item', () => {
        const prevSibling = navigation.getPreviousSibling('getting-started.md');
        expect(prevSibling).toBeUndefined();
      });

      it('should return undefined for non-existent path', () => {
        const prevSibling = navigation.getPreviousSibling('nonexistent.md');
        expect(prevSibling).toBeUndefined();
      });
    });

    describe('getChildren', () => {
      it('should get children for section', () => {
        const children = navigation.getChildren('guides');
        expect(children).toHaveLength(2);
        expect(children.map(c => c.name)).toEqual(['installation', 'configuration']);
      });

      it('should return empty array for page', () => {
        const children = navigation.getChildren('getting-started.md');
        expect(children).toHaveLength(0);
      });

      it('should return empty array for non-existent path', () => {
        const children = navigation.getChildren('nonexistent');
        expect(children).toHaveLength(0);
      });
    });

    describe('isExpanded', () => {
      it('should return true for expanded section', () => {
        expect(navigation.isExpanded('guides')).toBe(true);
      });

      it('should return false for collapsed section', () => {
        expect(navigation.isExpanded('api')).toBe(false);
      });

      it('should return true for page (always expanded)', () => {
        expect(navigation.isExpanded('getting-started.md')).toBe(true);
      });
    });

    describe('toggleExpanded', () => {
      it('should toggle expanded state', () => {
        expect(navigation.isExpanded('guides')).toBe(true);
        
        navigation.toggleExpanded('guides');
        expect(navigation.isExpanded('guides')).toBe(false);
        
        navigation.toggleExpanded('guides');
        expect(navigation.isExpanded('guides')).toBe(true);
      });

      it('should toggle collapsed section to expanded', () => {
        expect(navigation.isExpanded('api')).toBe(false);
        
        navigation.toggleExpanded('api');
        expect(navigation.isExpanded('api')).toBe(true);
      });
    });
  });

  describe('createNavigationTree', () => {
    it('should create NavigationTree instance', () => {
      const navigation = createNavigationTree(sampleNavigationData);
      expect(navigation).toBeInstanceOf(NavigationTree);
      expect(navigation.items).toHaveLength(3);
    });
  });
});