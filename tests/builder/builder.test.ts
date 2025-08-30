import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { writeFileSync, mkdirSync, readFileSync, existsSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { 
  buildDocs, 
  processMarkdown, 
  generateStaticPages,
  BuilderError 
} from '../../src/builder/builder.js';
import { ContentProcessor } from '../../src/types.js';

describe('Builder', () => {
  let tempDir: string;
  let contentDir: string;
  let outputDir: string;

  beforeEach(() => {
    tempDir = join(tmpdir(), `svelte-markdown-pages-test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
    contentDir = join(tempDir, 'content');
    outputDir = join(tempDir, 'output');
    
    mkdirSync(tempDir, { recursive: true });
    mkdirSync(contentDir, { recursive: true });
    mkdirSync(outputDir, { recursive: true });

    // Create test content structure
    const rootIndex = {
      items: [
        { name: 'getting-started', type: 'page', label: 'Getting Started' },
        { name: 'guides', type: 'section', label: 'Guides' }
      ]
    };
    writeFileSync(join(contentDir, '.index.json'), JSON.stringify(rootIndex));

    const guidesDir = join(contentDir, 'guides');
    mkdirSync(guidesDir);
    const guidesIndex = {
      items: [
        { name: 'installation', type: 'page', label: 'Installation' }
      ]
    };
    writeFileSync(join(guidesDir, '.index.json'), JSON.stringify(guidesIndex));

    writeFileSync(join(contentDir, 'getting-started.md'), '# Getting Started\n\nWelcome to the documentation!');
    writeFileSync(join(guidesDir, 'installation.md'), '# Installation\n\nFollow these steps to install.');
  });

  afterEach(() => {
    // Clean up temp files
    if (existsSync(tempDir)) {
      try {
        rmSync(tempDir, { recursive: true, force: true });
      } catch (error) {
        console.warn('Failed to clean up temp directory:', tempDir, error);
      }
    }
  });

  describe('buildDocs', () => {
    it('should build documentation with content', async () => {
      const result = await buildDocs(contentDir, {
        appOutput: outputDir,
        includeContent: true
      });

      expect(result.navigation.items).toHaveLength(2);
      expect(result.content).toBeDefined();
      expect(Object.keys(result.content!)).toHaveLength(2);
      expect(result.content!['getting-started.md']).toContain('# Getting Started');
      expect(result.content!['guides/installation.md']).toContain('# Installation');
    });

    it('should build documentation without content', async () => {
      const result = await buildDocs(contentDir, {
        appOutput: outputDir,
        includeContent: false
      });

      expect(result.navigation.items).toHaveLength(2);
      expect(result.content).toBeUndefined();
    });

    it('should write app output files', async () => {
      await buildDocs(contentDir, {
        appOutput: outputDir,
        includeContent: true
      });

      const navigationPath = join(outputDir, 'navigation.json');
      const contentPath = join(outputDir, 'content.json');

      expect(existsSync(navigationPath)).toBe(true);
      expect(existsSync(contentPath)).toBe(true);

      const navigation = JSON.parse(readFileSync(navigationPath, 'utf-8'));
      const content = JSON.parse(readFileSync(contentPath, 'utf-8'));

      expect(navigation.items).toHaveLength(2);
      expect(Object.keys(content)).toHaveLength(2);
    });

    it('should write website output files', async () => {
      await buildDocs(contentDir, {
        websiteOutput: outputDir
      });

      const navigationPath = join(outputDir, 'navigation.json');
      expect(existsSync(navigationPath)).toBe(true);

      const navigation = JSON.parse(readFileSync(navigationPath, 'utf-8'));
      expect(navigation.items).toHaveLength(2);
    });

    it('should throw BuilderError for invalid content path', async () => {
      await expect(buildDocs('nonexistent-path')).rejects.toThrow(BuilderError);
    });
  });

  describe('processMarkdown', () => {
    it('should process markdown without processor', () => {
      const markdown = '# Title\n\nThis is **bold** text.';
      const result = processMarkdown(markdown);

      expect(result).toContain('<h1>Title</h1>');
      expect(result).toContain('<strong>bold</strong>');
    });

    it('should process markdown with custom processor', () => {
      const processor: ContentProcessor = {
        process(content: string): string {
          return content.replace(/\[\[(.+?)\]\]/g, '[$1]($1)');
        }
      };

      const markdown = '# Title\n\nCheck out [[getting-started]] for more info.';
      const result = processMarkdown(markdown, processor);

      expect(result).toContain('<h1>Title</h1>');
      expect(result).toContain('<a href="getting-started">getting-started</a>');
    });
  });

  describe('generateStaticPages', () => {
    it('should generate static pages', () => {
      const navigation = {
        items: [
          {
            name: 'getting-started',
            type: 'page' as const,
            label: 'Getting Started',
            path: 'getting-started.md'
          }
        ]
      };

      const pages = generateStaticPages(navigation, contentDir);

      expect(pages).toHaveLength(1);
      expect(pages[0].path).toBe('getting-started.html');
      expect(pages[0].content).toContain('# Getting Started');
      expect(pages[0].html).toContain('<h1>Getting Started</h1>');
    });

    it('should generate static pages with custom processor', () => {
      const processor: ContentProcessor = {
        process(content: string): string {
          return content.replace(/\[\[(.+?)\]\]/g, '[$1]($1)');
        }
      };

      const navigation = {
        items: [
          {
            name: 'getting-started',
            type: 'page' as const,
            label: 'Getting Started',
            path: 'getting-started.md'
          }
        ]
      };

      const pages = generateStaticPages(navigation, contentDir, { processor });

      expect(pages).toHaveLength(1);
      expect(pages[0].html).toContain('<h1>Getting Started</h1>');
    });

    it('should generate static pages with custom page options', () => {
      const navigation = {
        items: [
          {
            name: 'getting-started',
            type: 'page' as const,
            label: 'Getting Started',
            path: 'getting-started.md'
          }
        ]
      };

      const pages = generateStaticPages(navigation, contentDir, {
        pageOptions: {
          title: 'Custom Title',
          baseUrl: 'https://example.com',
          css: 'body { color: red; }',
          js: 'console.log("test");'
        }
      });

      expect(pages).toHaveLength(1);
      expect(pages[0].html).toContain('<title>Custom Title</title>');
      expect(pages[0].html).toContain('<base href="https://example.com">');
      expect(pages[0].html).toContain('body { color: red; }');
      expect(pages[0].html).toContain('console.log("test");');
    });

    it('should handle missing markdown files', () => {
      const navigation = {
        items: [
          {
            name: 'nonexistent',
            type: 'page' as const,
            label: 'Nonexistent',
            path: 'nonexistent.md'
          }
        ]
      };

      expect(() => generateStaticPages(navigation, contentDir)).toThrow(BuilderError);
    });
  });
});