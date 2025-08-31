import { describe, it, expect, beforeEach } from 'vitest';
import { 
  ContentLoader, 
  loadContent, 
  createContentLoader,
  extractHeadings,
  extractTableOfContents,
  addTableOfContents
} from 'svelte-markdown-pages/renderer';
import { ContentProcessor } from 'svelte-markdown-pages';

describe('Content', () => {
  const sampleContentBundle = {
    'getting-started.md': '# Getting Started\n\nWelcome to the documentation!',
    'guides/installation.md': '# Installation\n\n## Prerequisites\n\n- Node.js\n- npm\n\n## Steps\n\n1. Install package\n2. Configure\n3. Build',
    'api/builder.md': '# Builder API\n\n## Functions\n\n### buildPages\n\nBuilds documentation.'
  };

  describe('ContentLoader', () => {
    let loader: ContentLoader;

    beforeEach(() => {
      loader = new ContentLoader(sampleContentBundle);
    });

    describe('constructor and properties', () => {
      it('should create ContentLoader with content bundle', () => {
        expect(loader.hasContent('getting-started.md')).toBe(true);
        expect(loader.hasContent('nonexistent.md')).toBe(false);
      });

      it('should create ContentLoader with processor', () => {
        const processor: ContentProcessor = {
          process(content: string): string {
            return content.replace(/\[\[(.+?)\]\]/g, '[$1]($1)');
          }
        };

        const loaderWithProcessor = new ContentLoader(sampleContentBundle, processor);
        expect(loaderWithProcessor).toBeDefined();
      });
    });

    describe('loadContent', () => {
      it('should load content by path', () => {
        const content = loader.loadContent('getting-started.md');
        expect(content).toBe('# Getting Started\n\nWelcome to the documentation!');
      });

      it('should return undefined for non-existent path', () => {
        const content = loader.loadContent('nonexistent.md');
        expect(content).toBeUndefined();
      });
    });

    describe('loadAndProcess', () => {
      it('should load and process content without processor', () => {
        const content = loader.loadAndProcess('getting-started.md');
        expect(content).toContain('<h1>Getting Started</h1>');
        expect(content).toContain('<p>Welcome to the documentation!</p>');
      });

      it('should load and process content with processor', () => {
        const processor: ContentProcessor = {
          process(content: string): string {
            return content.replace(/\[\[(.+?)\]\]/g, '[$1]($1)');
          }
        };

        const loaderWithProcessor = new ContentLoader(sampleContentBundle, processor);
        const content = loaderWithProcessor.loadAndProcess('getting-started.md');
        expect(content).toContain('<h1>Getting Started</h1>');
      });

      it('should return undefined for non-existent path', () => {
        const content = loader.loadAndProcess('nonexistent.md');
        expect(content).toBeUndefined();
      });
    });

    describe('processContent', () => {
      it('should process content without processor', () => {
        const markdown = '# Title\n\nThis is **bold** text.';
        const result = loader.processContent(markdown);
        expect(result).toContain('<h1>Title</h1>');
        expect(result).toContain('<strong>bold</strong>');
      });

      it('should process content with processor', () => {
        const processor: ContentProcessor = {
          process(content: string): string {
            return content.replace(/\[\[(.+?)\]\]/g, '[$1]($1)');
          }
        };

        const loaderWithProcessor = new ContentLoader(sampleContentBundle, processor);
        const markdown = '# Title\n\nCheck out [[getting-started]] for more info.';
        const result = loaderWithProcessor.processContent(markdown);
        expect(result).toContain('<h1>Title</h1>');
        expect(result).toContain('<a href="getting-started">getting-started</a>');
      });
    });

    describe('hasContent', () => {
      it('should return true for existing content', () => {
        expect(loader.hasContent('getting-started.md')).toBe(true);
        expect(loader.hasContent('guides/installation.md')).toBe(true);
      });

      it('should return false for non-existent content', () => {
        expect(loader.hasContent('nonexistent.md')).toBe(false);
      });
    });

    describe('getAvailablePaths', () => {
      it('should return all available paths', () => {
        const paths = loader.getAvailablePaths();
        expect(paths).toHaveLength(3);
        expect(paths).toContain('getting-started.md');
        expect(paths).toContain('guides/installation.md');
        expect(paths).toContain('api/builder.md');
      });
    });

    describe('getContentSize', () => {
      it('should return content size for existing path', () => {
        const size = loader.getContentSize('getting-started.md');
        expect(size).toBeGreaterThan(0);
      });

      it('should return 0 for non-existent path', () => {
        const size = loader.getContentSize('nonexistent.md');
        expect(size).toBe(0);
      });
    });

    describe('getTotalContentSize', () => {
      it('should return total size of all content', () => {
        const totalSize = loader.getTotalContentSize();
        expect(totalSize).toBeGreaterThan(0);
        
        // Should be sum of individual sizes
        const individualSizes = Object.keys(sampleContentBundle).reduce((sum, path) => {
          return sum + loader.getContentSize(path);
        }, 0);
        expect(totalSize).toBe(individualSizes);
      });
    });
  });

  describe('loadContent', () => {
    it('should load and process content', async () => {
      const content = await loadContent('getting-started.md', sampleContentBundle);
      expect(content).toContain('<h1>Getting Started</h1>');
    });

    it('should load and process content with processor', async () => {
      const processor: ContentProcessor = {
        process(content: string): string {
          return content.replace(/\[\[(.+?)\]\]/g, '[$1]($1)');
        }
      };

      const content = await loadContent('getting-started.md', sampleContentBundle, processor);
      expect(content).toContain('<h1>Getting Started</h1>');
    });

    it('should return undefined for non-existent path', async () => {
      const content = await loadContent('nonexistent.md', sampleContentBundle);
      expect(content).toBeUndefined();
    });
  });

  describe('createContentLoader', () => {
    it('should create ContentLoader instance', () => {
      const loader = createContentLoader(sampleContentBundle);
      expect(loader).toBeInstanceOf(ContentLoader);
      expect(loader.hasContent('getting-started.md')).toBe(true);
    });

    it('should create ContentLoader with processor', () => {
      const processor: ContentProcessor = {
        process(content: string): string {
          return content.replace(/\[\[(.+?)\]\]/g, '[$1]($1)');
        }
      };

      const loader = createContentLoader(sampleContentBundle, processor);
      expect(loader).toBeInstanceOf(ContentLoader);
    });
  });

  describe('extractHeadings', () => {
    it('should extract headings from markdown', () => {
      const markdown = '# Title\n\n## Subtitle\n\n### Sub-subtitle\n\nContent';
      const headings = extractHeadings(markdown);

      expect(headings).toHaveLength(3);
      expect(headings[0]).toEqual({
        level: 1,
        text: 'Title',
        id: 'title'
      });
      expect(headings[1]).toEqual({
        level: 2,
        text: 'Subtitle',
        id: 'subtitle'
      });
      expect(headings[2]).toEqual({
        level: 3,
        text: 'Sub-subtitle',
        id: 'sub-subtitle'
      });
    });

    it('should handle special characters in heading IDs', () => {
      const markdown = '# Title with Spaces & Symbols!';
      const headings = extractHeadings(markdown);

      expect(headings).toHaveLength(1);
      expect(headings[0].id).toBe('title-with-spaces-symbols');
    });

    it('should return empty array for content without headings', () => {
      const markdown = 'This is just regular content without headings.';
      const headings = extractHeadings(markdown);

      expect(headings).toHaveLength(0);
    });
  });

  describe('extractTableOfContents', () => {
    it('should generate table of contents', () => {
      const markdown = '# Title\n\n## Subtitle\n\n### Sub-subtitle\n\nContent';
      const toc = extractTableOfContents(markdown);

      expect(toc).toContain('## Table of Contents');
      expect(toc).toContain('- [Title](#title)');
      expect(toc).toContain('  - [Subtitle](#subtitle)');
      expect(toc).toContain('    - [Sub-subtitle](#sub-subtitle)');
    });

    it('should return empty string for content without headings', () => {
      const markdown = 'This is just regular content without headings.';
      const toc = extractTableOfContents(markdown);

      expect(toc).toBe('');
    });
  });

  describe('addTableOfContents', () => {
    it('should add table of contents to content', () => {
      const markdown = '# Title\n\n## Subtitle\n\nContent';
      const result = addTableOfContents(markdown);

      expect(result).toContain('## Table of Contents');
      expect(result).toContain('- [Title](#title)');
      expect(result).toContain('  - [Subtitle](#subtitle)');
      expect(result).toContain('# Title');
      expect(result).toContain('## Subtitle');
    });

    it('should add TOC after first heading', () => {
      const markdown = '# Title\n\n## Subtitle\n\nContent';
      const result = addTableOfContents(markdown);

      const lines = result.split('\n');
      const titleIndex = lines.findIndex(line => line === '# Title');
      const tocIndex = lines.findIndex(line => line === '## Table of Contents');

      expect(tocIndex).toBeGreaterThan(titleIndex);
    });

    it('should return original content if no headings', () => {
      const markdown = 'This is just regular content without headings.';
      const result = addTableOfContents(markdown);

      expect(result).toBe(markdown);
    });
  });
});