import { describe, it, expect } from 'vitest';
import { 
  DocsSidebar, 
  DocsContent, 
  createDocsSidebar,
  createDocsContent,
  createDocsLayout
} from 'svelte-markdown-pages/renderer';
import { NavigationItem } from 'svelte-markdown-pages';

describe('Components', () => {
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
    }
  ];

  describe('DocsSidebar', () => {
    it('should create DocsSidebar with props', () => {
      const sidebar = new DocsSidebar({
        navigation: sampleNavigationData,
        currentPage: 'getting-started.md',
        collapsed: false
      });

      expect(sidebar).toBeDefined();
    });

    it('should render sidebar HTML', () => {
      const sidebar = new DocsSidebar({
        navigation: sampleNavigationData,
        currentPage: 'getting-started.md',
        collapsed: false
      });

      const html = sidebar.render();
      expect(html).toContain('docs-sidebar');
      expect(html).toContain('Getting Started');
      expect(html).toContain('Guides');
      expect(html).toContain('Installation');
      expect(html).toContain('Configuration');
    });

    it('should render collapsed sidebar', () => {
      const sidebar = new DocsSidebar({
        navigation: sampleNavigationData,
        currentPage: 'getting-started.md',
        collapsed: true
      });

      const html = sidebar.render();
      expect(html).toContain('docs-sidebar collapsed');
    });

    it('should render active page link', () => {
      const sidebar = new DocsSidebar({
        navigation: sampleNavigationData,
        currentPage: 'getting-started.md',
        collapsed: false
      });

      const html = sidebar.render();
      expect(html).toContain('nav-link active');
      expect(html).toContain('data-path="getting-started.md"');
    });

    it('should render section headers', () => {
      const sidebar = new DocsSidebar({
        navigation: sampleNavigationData,
        currentPage: 'getting-started.md',
        collapsed: false
      });

      const html = sidebar.render();
      expect(html).toContain('nav-section-header');
      expect(html).toContain('Guides');
    });

    it('should render nested navigation items', () => {
      const sidebar = new DocsSidebar({
        navigation: sampleNavigationData,
        currentPage: 'guides/installation.md',
        collapsed: false
      });

      const html = sidebar.render();
      expect(html).toContain('Installation');
      expect(html).toContain('Configuration');
      expect(html).toContain('data-path="guides/installation.md"');
    });
  });

  describe('DocsContent', () => {
    it('should create DocsContent with props', () => {
      const content = new DocsContent({
        content: '<h1>Title</h1><p>Content</p>',
        title: 'Page Title'
      });

      expect(content).toBeDefined();
    });

    it('should render content HTML', () => {
      const content = new DocsContent({
        content: '<h1>Title</h1><p>Content</p>',
        title: 'Page Title'
      });

      const html = content.render();
      expect(html).toContain('docs-content');
      expect(html).toContain('<h1>Page Title</h1>');
      expect(html).toContain('<h1>Title</h1>');
      expect(html).toContain('<p>Content</p>');
    });

    it('should render loading state', () => {
      const content = new DocsContent({
        loading: true
      });

      const html = content.render();
      expect(html).toContain('docs-content loading');
      expect(html).toContain('Loading...');
    });

    it('should render error state', () => {
      const content = new DocsContent({
        error: 'Something went wrong'
      });

      const html = content.render();
      expect(html).toContain('docs-content error');
      expect(html).toContain('Error: Something went wrong');
    });

    it('should render empty state', () => {
      const content = new DocsContent({});

      const html = content.render();
      expect(html).toContain('docs-content empty');
      expect(html).toContain('No content selected');
    });

    it('should render content without title', () => {
      const content = new DocsContent({
        content: '<h1>Title</h1><p>Content</p>'
      });

      const html = content.render();
      expect(html).not.toContain('<h1>Page Title</h1>');
      expect(html).toContain('<h1>Title</h1>');
    });
  });

  describe('createDocsLayout', () => {
    it('should create layout HTML', () => {
      const html = createDocsLayout({
        navigation: sampleNavigationData,
        currentPage: 'getting-started.md',
        content: '<h1>Title</h1><p>Content</p>',
        sidebarCollapsed: false
      });

      expect(html).toContain('docs-layout');
      expect(html).toContain('docs-sidebar');
      expect(html).toContain('docs-content');
    });

    it('should render collapsed sidebar in layout', () => {
      const html = createDocsLayout({
        navigation: sampleNavigationData,
        currentPage: 'getting-started.md',
        content: '<h1>Title</h1><p>Content</p>',
        sidebarCollapsed: true
      });

      expect(html).toContain('docs-sidebar collapsed');
    });

    it('should include page selection functionality', () => {
      const html = createDocsLayout({
        navigation: sampleNavigationData,
        currentPage: 'getting-started.md',
        content: '<h1>Title</h1><p>Content</p>',
        sidebarCollapsed: false
      });

      expect(html).toContain('onclick="this.dispatchEvent(new CustomEvent(\'pageSelect\', {detail: \'getting-started.md\'}))"');
    });
  });

  describe('createDocsSidebar', () => {
    it('should create DocsSidebar instance', () => {
      const sidebar = createDocsSidebar({
        navigation: sampleNavigationData,
        currentPage: 'getting-started.md',
        collapsed: false
      });

      expect(sidebar).toBeInstanceOf(DocsSidebar);
    });
  });

  describe('createDocsContent', () => {
    it('should create DocsContent instance', () => {
      const content = createDocsContent({
        content: '<h1>Title</h1><p>Content</p>',
        title: 'Page Title'
      });

      expect(content).toBeInstanceOf(DocsContent);
    });
  });

  describe('createDocsLayout', () => {
    it('should return layout HTML string', () => {
      const layout = createDocsLayout({
        navigation: sampleNavigationData,
        currentPage: 'getting-started.md',
        content: '<h1>Title</h1><p>Content</p>',
        sidebarCollapsed: false
      });

      expect(typeof layout).toBe('string');
      expect(layout).toContain('docs-layout');
    });
  });
});