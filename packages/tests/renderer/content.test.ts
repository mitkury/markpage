import { describe, it, expect } from 'vitest';
import { 
  ContentLoader, 
  loadContent, 
  createContentLoader,
  extractHeadings,
  extractTableOfContents,
  addTableOfContents
} from 'markpage/renderer';
import type { ContentProcessor } from 'markpage';

describe('Content', () => {
  const sampleContentBundle = {
    'getting-started.md': '# Getting Started\n\nWelcome to the documentation!',
    'guides/installation.md': '# Installation\n\nFollow these steps to install.',
    'guides/configuration.md': '# Configuration\n\nConfigure your settings here.'
  };

  describe('ContentLoader', () => {
    it('should create ContentLoader instance', () => {
      const loader = new ContentLoader(sampleContentBundle);
      expect(loader).toBeInstanceOf(ContentLoader);
    });

    it('should load content by path', () => {
      const loader = new ContentLoader(sampleContentBundle);
      const content = loader.loadContent('getting-started.md');
      expect(content).toBe('# Getting Started\n\nWelcome to the documentation!');
    });

    it('should return undefined for non-existent path', () => {
      const loader = new ContentLoader(sampleContentBundle);
      const content = loader.loadContent('non-existent.md');
      expect(content).toBeUndefined();
    });

    it('should process content with processor', () => {
      const processor: ContentProcessor = {
        process: (content: string) => content.replace(/Welcome/g, 'Hello')
      };
      
      const loader = new ContentLoader(sampleContentBundle, processor);
      const content = loader.loadAndProcess('getting-started.md');
      expect(content).toContain('Hello to the documentation!');
    });

    it('should check if content exists', () => {
      const loader = new ContentLoader(sampleContentBundle);
      expect(loader.hasContent('getting-started.md')).toBe(true);
      expect(loader.hasContent('non-existent.md')).toBe(false);
    });

    it('should get available paths', () => {
      const loader = new ContentLoader(sampleContentBundle);
      const paths = loader.getAvailablePaths();
      expect(paths).toContain('getting-started.md');
      expect(paths).toContain('guides/installation.md');
      expect(paths).toContain('guides/configuration.md');
    });

    it('should get content size', () => {
      const loader = new ContentLoader(sampleContentBundle);
      const size = loader.getContentSize('getting-started.md');
      expect(size).toBeGreaterThan(0);
    });

    it('should get total content size', () => {
      const loader = new ContentLoader(sampleContentBundle);
      const totalSize = loader.getTotalContentSize();
      expect(totalSize).toBeGreaterThan(0);
    });

    it('should process content without processor', () => {
      const loader = new ContentLoader(sampleContentBundle);
      const content = loader.processContent('# Title\n\nContent');
      expect(content).toContain('<h1>Title</h1>');
    });

    it('should process content with processor', () => {
      const processor: ContentProcessor = {
        process: (content: string) => content.replace(/Title/g, 'Custom Title')
      };
      
      const loader = new ContentLoader(sampleContentBundle, processor);
      const content = loader.processContent('# Title\n\nContent');
      expect(content).toContain('Custom Title');
    });

    it('should handle empty content bundle', () => {
      const loader = new ContentLoader({});
      expect(loader.getAvailablePaths()).toHaveLength(0);
      expect(loader.getTotalContentSize()).toBe(0);
    });

    it('should handle processor that returns empty string', () => {
      const processor: ContentProcessor = {
        process: () => ''
      };
      
      const loader = new ContentLoader(sampleContentBundle, processor);
      const content = loader.loadAndProcess('getting-started.md');
      expect(content).toBe('');
    });

    it('should handle processor that modifies content structure', () => {
      const processor: ContentProcessor = {
        process: (content: string) => content + '\n\n---\n\nProcessed by custom processor'
      };
      
      const loader = new ContentLoader(sampleContentBundle, processor);
      const content = loader.loadAndProcess('getting-started.md');
      expect(content).toContain('Processed by custom processor');
    });

    it('should handle processor that adds HTML', () => {
      const processor: ContentProcessor = {
        process: (content: string) => content.replace(/Welcome/g, '<strong>Welcome</strong>')
      };
      
      const loader = new ContentLoader(sampleContentBundle, processor);
      const content = loader.loadAndProcess('getting-started.md');
      expect(content).toContain('<strong>Welcome</strong>');
    });

    it('should handle processor that removes content', () => {
      const processor: ContentProcessor = {
        process: (content: string) => content.replace(/# Getting Started\n\n/, '')
      };
      
      const loader = new ContentLoader(sampleContentBundle, processor);
      const content = loader.loadAndProcess('getting-started.md');
      expect(content).not.toContain('# Getting Started');
    });
  });

  describe('loadContent', () => {
    it('should load content asynchronously', async () => {
      const content = await loadContent('getting-started.md', sampleContentBundle);
      expect(content).toContain('<h1>Getting Started</h1>');
      expect(content).toContain('<p>Welcome to the documentation!</p>');
    });

    it('should return undefined for non-existent path', async () => {
      const content = await loadContent('non-existent.md', sampleContentBundle);
      expect(content).toBeUndefined();
    });

    it('should process content with custom processor', async () => {
      const processor: ContentProcessor = {
        process: (content: string) => content.replace(/Welcome/g, 'Hello')
      };
      
      const content = await loadContent('getting-started.md', sampleContentBundle, processor);
      expect(content).toContain('Hello to the documentation!');
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
        process: (content: string) => content.replace(/Welcome/g, 'Hello')
      };
      
      const loader = createContentLoader(sampleContentBundle, processor);
      expect(loader).toBeInstanceOf(ContentLoader);
      
      const content = loader.loadAndProcess('getting-started.md');
      expect(content).toContain('Hello to the documentation!');
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
      const markdown = 'This is just regular content without any headings.';
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
      const markdown = 'This is just regular content without any headings.';
      const toc = extractTableOfContents(markdown);
      
      expect(toc).toBe('');
    });
  });

  describe('addTableOfContents', () => {
    it('should add table of contents to content', () => {
      const markdown = '# Title\n\n## Subtitle\n\nContent here';
      const result = addTableOfContents(markdown);
      
      expect(result).toContain('## Table of Contents');
      expect(result).toContain('- [Title](#title)');
      expect(result).toContain('  - [Subtitle](#subtitle)');
      expect(result).toContain('Content here');
    });

    it('should add TOC after first heading', () => {
      const markdown = '# Title\n\n## Subtitle\n\nContent here';
      const result = addTableOfContents(markdown);
      
      const lines = result.split('\n');
      const titleIndex = lines.findIndex((line: string) => line === '# Title');
      const tocIndex = lines.findIndex((line: string) => line === '## Table of Contents');
      
      expect(tocIndex).toBeGreaterThan(titleIndex);
    });

    it('should return original content if no headings', () => {
      const markdown = 'This is just regular content without any headings.';
      const result = addTableOfContents(markdown);
      
      expect(result).toBe(markdown);
    });
  });
});