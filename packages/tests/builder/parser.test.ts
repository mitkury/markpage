import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { 
  parseIndexFile, 
  buildNavigationTree, 
  validateContentStructure,
  ParserError 
} from 'svelte-markdown-pages/builder';

describe('Parser', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = join(tmpdir(), `svelte-markdown-pages-test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
    mkdirSync(tempDir, { recursive: true });
  });

  afterEach(() => {
    if (existsSync(tempDir)) {
      try {
        rmSync(tempDir, { recursive: true, force: true });
      } catch (error) {
        console.warn('Failed to clean up temp directory:', tempDir, error);
      }
    }
  });

  describe('parseIndexFile', () => {
    it('should parse valid index file', () => {
      const indexPath = join(tempDir, '.index.json');
      const indexContent = {
        items: [
          { name: 'getting-started', type: 'page', label: 'Getting Started' },
          { name: 'guides', type: 'section', label: 'Guides' }
        ]
      };
      writeFileSync(indexPath, JSON.stringify(indexContent));

      const result = parseIndexFile(indexPath);
      expect(result).toEqual(indexContent.items);
    });

    it('should throw ParserError for invalid JSON', () => {
      const indexPath = join(tempDir, '.index.json');
      writeFileSync(indexPath, 'invalid json');

      expect(() => parseIndexFile(indexPath)).toThrow(ParserError);
    });

    it('should throw ParserError for invalid schema', () => {
      const indexPath = join(tempDir, '.index.json');
      const invalidContent = {
        items: [
          { name: 'test', type: 'invalid-type', label: 'Test' }
        ]
      };
      writeFileSync(indexPath, JSON.stringify(invalidContent));

      expect(() => parseIndexFile(indexPath)).toThrow(ParserError);
    });

    it('should handle missing file', () => {
      const indexPath = join(tempDir, 'nonexistent.json');
      expect(() => parseIndexFile(indexPath)).toThrow(ParserError);
    });
  });

  describe('buildNavigationTree', () => {
    it('should build navigation tree from valid content structure', () => {
      // Create test content structure
      const contentDir = join(tempDir, 'content');
      mkdirSync(contentDir);

      // Root index
      const rootIndex = {
        items: [
          { name: 'getting-started', type: 'page', label: 'Getting Started' },
          { name: 'guides', type: 'section', label: 'Guides' }
        ]
      };
      writeFileSync(join(contentDir, '.index.json'), JSON.stringify(rootIndex));

      // Guides section
      const guidesDir = join(contentDir, 'guides');
      mkdirSync(guidesDir);
      const guidesIndex = {
        items: [
          { name: 'installation', type: 'page', label: 'Installation' }
        ]
      };
      writeFileSync(join(guidesDir, '.index.json'), JSON.stringify(guidesIndex));

      // Markdown files
      writeFileSync(join(contentDir, 'getting-started.md'), '# Getting Started');
      writeFileSync(join(guidesDir, 'installation.md'), '# Installation');

      const result = buildNavigationTree(contentDir);

      expect(result.items).toHaveLength(2);
      expect(result.items[0]).toMatchObject({
        name: 'getting-started',
        type: 'page',
        label: 'Getting Started',
        path: 'getting-started.md'
      });
      expect(result.items[1]).toMatchObject({
        name: 'guides',
        type: 'section',
        label: 'Guides'
      });
      expect(result.items[1].items).toHaveLength(1);
      expect(result.items[1].items![0]).toMatchObject({
        name: 'installation',
        type: 'page',
        label: 'Installation',
        path: 'guides/installation.md'
      });
    });

    it('should throw ParserError for missing root index', () => {
      const contentDir = join(tempDir, 'content');
      mkdirSync(contentDir);

      expect(() => buildNavigationTree(contentDir)).toThrow(ParserError);
    });

    it('should throw ParserError for missing section index', () => {
      const contentDir = join(tempDir, 'content');
      mkdirSync(contentDir);

      const rootIndex = {
        items: [
          { name: 'guides', type: 'section', label: 'Guides' }
        ]
      };
      writeFileSync(join(contentDir, '.index.json'), JSON.stringify(rootIndex));

      const guidesDir = join(contentDir, 'guides');
      mkdirSync(guidesDir);

      expect(() => buildNavigationTree(contentDir)).toThrow(ParserError);
    });

    it('should throw ParserError for missing markdown file', () => {
      const contentDir = join(tempDir, 'content');
      mkdirSync(contentDir);

      const rootIndex = {
        items: [
          { name: 'getting-started', type: 'page', label: 'Getting Started' }
        ]
      };
      writeFileSync(join(contentDir, '.index.json'), JSON.stringify(rootIndex));

      expect(() => buildNavigationTree(contentDir)).toThrow(ParserError);
    });

    it('should handle non-directory content path', () => {
      const filePath = join(tempDir, 'not-a-directory');
      writeFileSync(filePath, 'test');

      expect(() => buildNavigationTree(filePath)).toThrow(ParserError);
    });
  });

  describe('validateContentStructure', () => {
    it('should validate correct content structure', () => {
      const contentDir = join(tempDir, 'content');
      mkdirSync(contentDir);

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

      writeFileSync(join(contentDir, 'getting-started.md'), '# Getting Started');
      writeFileSync(join(guidesDir, 'installation.md'), '# Installation');

      expect(() => validateContentStructure(contentDir)).not.toThrow();
    });

    it('should throw ParserError for missing index file', () => {
      const contentDir = join(tempDir, 'content');
      mkdirSync(contentDir);

      expect(() => validateContentStructure(contentDir)).toThrow(ParserError);
    });

    it('should throw ParserError for missing section directory', () => {
      const contentDir = join(tempDir, 'content');
      mkdirSync(contentDir);

      const rootIndex = {
        items: [
          { name: 'guides', type: 'section', label: 'Guides' }
        ]
      };
      writeFileSync(join(contentDir, '.index.json'), JSON.stringify(rootIndex));

      expect(() => validateContentStructure(contentDir)).toThrow(ParserError);
    });

    it('should throw ParserError for missing markdown file', () => {
      const contentDir = join(tempDir, 'content');
      mkdirSync(contentDir);

      const rootIndex = {
        items: [
          { name: 'getting-started', type: 'page', label: 'Getting Started' }
        ]
      };
      writeFileSync(join(contentDir, '.index.json'), JSON.stringify(rootIndex));

      expect(() => validateContentStructure(contentDir)).toThrow(ParserError);
    });
  });
});