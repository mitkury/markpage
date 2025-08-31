import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { writeFileSync, mkdirSync, existsSync, rmSync } from 'fs';
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
    it('should build navigation tree from index file', () => {
      const indexPath = join(tempDir, '.index.json');
      const indexContent = {
        items: [
          { name: 'getting-started', type: 'page', label: 'Getting Started' },
          { name: 'guides', type: 'section', label: 'Guides' }
        ]
      };
      writeFileSync(indexPath, JSON.stringify(indexContent));
      
      // Create the markdown file referenced in the index
      writeFileSync(join(tempDir, 'getting-started.md'), '# Getting Started');
      
      // Create the guides directory that's referenced in the index
      const guidesDir = join(tempDir, 'guides');
      mkdirSync(guidesDir);

      const result = buildNavigationTree(tempDir);
      expect(result.items).toHaveLength(2);
      expect(result.items[0].name).toBe('getting-started');
      expect(result.items[1].name).toBe('guides');
    });

    it('should auto-discover content when no .index.json exists', () => {
      // Create markdown files and directories without .index.json
      writeFileSync(join(tempDir, 'getting-started.md'), '# Getting Started');
      writeFileSync(join(tempDir, 'installation.md'), '# Installation');
      
      const guidesDir = join(tempDir, 'guides');
      mkdirSync(guidesDir);
      writeFileSync(join(guidesDir, 'advanced.md'), '# Advanced');

      const result = buildNavigationTree(tempDir, { autoDiscover: true });
      
      // Should discover all items in alphabetical order
      expect(result.items).toHaveLength(3);
      expect(result.items[0].name).toBe('getting-started');
      expect(result.items[0].type).toBe('page');
      expect(result.items[0].label).toBe('Getting Started');
      expect(result.items[1].name).toBe('installation');
      expect(result.items[1].type).toBe('page');
      expect(result.items[1].label).toBe('Installation');
      expect(result.items[2].name).toBe('guides');
      expect(result.items[2].type).toBe('section');
      expect(result.items[2].label).toBe('Guides');
      
      // Should auto-discover section content
      expect(result.items[2].items).toHaveLength(1);
      expect(result.items[2].items![0].name).toBe('advanced');
      expect(result.items[2].items![0].type).toBe('page');
      expect(result.items[2].items![0].label).toBe('Advanced');
    });

    it('should use .index.json when present even with auto-discovery enabled', () => {
      // Create .index.json with specific items
      const indexPath = join(tempDir, '.index.json');
      const indexContent = {
        items: [
          { name: 'getting-started', type: 'page', label: 'Getting Started' }
        ]
      };
      writeFileSync(indexPath, JSON.stringify(indexContent));
      
      // Create the markdown file referenced in the index
      writeFileSync(join(tempDir, 'getting-started.md'), '# Getting Started');

      // Create additional files that should be ignored
      writeFileSync(join(tempDir, 'ignored.md'), '# Ignored');
      const ignoredDir = join(tempDir, 'ignored-dir');
      mkdirSync(ignoredDir);

      const result = buildNavigationTree(tempDir, { autoDiscover: true });
      
      // Should only include items from .index.json
      expect(result.items).toHaveLength(1);
      expect(result.items[0].name).toBe('getting-started');
    });

    it('should generate proper labels from filenames', () => {
      writeFileSync(join(tempDir, 'getting-started.md'), '# Getting Started');
      writeFileSync(join(tempDir, 'user-guide.md'), '# User Guide');
      writeFileSync(join(tempDir, 'api_reference.md'), '# API Reference');
      
      const guidesDir = join(tempDir, 'advanced-topics');
      mkdirSync(guidesDir);

      const result = buildNavigationTree(tempDir, { autoDiscover: true });
      
      // Items are sorted alphabetically
      expect(result.items[0].label).toBe('Api Reference'); // api_reference.md comes first
      expect(result.items[1].label).toBe('Getting Started');
      expect(result.items[2].label).toBe('User Guide');
      expect(result.items[3].label).toBe('Advanced Topics');
    });

    it('should throw error when auto-discovery is disabled and no .index.json exists', () => {
      writeFileSync(join(tempDir, 'getting-started.md'), '# Getting Started');

      expect(() => buildNavigationTree(tempDir, { autoDiscover: false }))
        .toThrow(ParserError);
    });

    it('should handle mixed .index.json and auto-discovery', () => {
      // Root has .index.json
      const indexPath = join(tempDir, '.index.json');
      const indexContent = {
        items: [
          { name: 'getting-started', type: 'page', label: 'Getting Started' },
          { name: 'guides', type: 'section', label: 'Guides' }
        ]
      };
      writeFileSync(indexPath, JSON.stringify(indexContent));
      
      // Create the markdown file referenced in the index
      writeFileSync(join(tempDir, 'getting-started.md'), '# Getting Started');

      // Guides section has no .index.json but has files
      const guidesDir = join(tempDir, 'guides');
      mkdirSync(guidesDir);
      writeFileSync(join(guidesDir, 'installation.md'), '# Installation');
      writeFileSync(join(guidesDir, 'configuration.md'), '# Configuration');

      const result = buildNavigationTree(tempDir, { autoDiscover: true });
      
      expect(result.items).toHaveLength(2);
      expect(result.items[1].name).toBe('guides');
      expect(result.items[1].items).toHaveLength(2);
      expect(result.items[1].items![0].name).toBe('configuration');
      expect(result.items[1].items![1].name).toBe('installation');
    });

    it('should exclude index.md and README.md from auto-discovered pages', () => {
      // Create markdown files including index.md and README.md
      writeFileSync(join(tempDir, 'getting-started.md'), '# Getting Started');
      writeFileSync(join(tempDir, 'index.md'), '# Index');
      writeFileSync(join(tempDir, 'README.md'), '# README');
      writeFileSync(join(tempDir, 'installation.md'), '# Installation');
      
      const result = buildNavigationTree(tempDir, { autoDiscover: true });
      
      expect(result.items).toHaveLength(2);
      expect(result.items[0].name).toBe('getting-started');
      expect(result.items[1].name).toBe('installation');
      // index.md and README.md should not be included as pages
    });

    it('should set section path to index.md when present', () => {
      // Create a section with index.md
      const guidesDir = join(tempDir, 'guides');
      mkdirSync(guidesDir);
      writeFileSync(join(guidesDir, 'index.md'), '# Guides Index');
      writeFileSync(join(guidesDir, 'installation.md'), '# Installation');
      
      const result = buildNavigationTree(tempDir, { autoDiscover: true });
      
      expect(result.items).toHaveLength(1);
      expect(result.items[0].name).toBe('guides');
      expect(result.items[0].type).toBe('section');
      expect(result.items[0].path).toBe('guides/index.md');
      expect(result.items[0].items).toHaveLength(1);
      expect(result.items[0].items![0].name).toBe('installation');
    });

    it('should set section path to README.md when index.md is not present', () => {
      // Create a section with README.md but no index.md
      const guidesDir = join(tempDir, 'guides');
      mkdirSync(guidesDir);
      writeFileSync(join(guidesDir, 'README.md'), '# Guides README');
      writeFileSync(join(guidesDir, 'installation.md'), '# Installation');
      
      const result = buildNavigationTree(tempDir, { autoDiscover: true });
      
      expect(result.items).toHaveLength(1);
      expect(result.items[0].name).toBe('guides');
      expect(result.items[0].type).toBe('section');
      expect(result.items[0].path).toBe('guides/README.md');
      expect(result.items[0].items).toHaveLength(1);
      expect(result.items[0].items![0].name).toBe('installation');
    });

    it('should set section path to readme.md when neither index.md nor README.md is present', () => {
      // Create a section with readme.md (lowercase) but no index.md or README.md
      const guidesDir = join(tempDir, 'guides');
      mkdirSync(guidesDir);
      writeFileSync(join(guidesDir, 'readme.md'), '# Guides readme');
      writeFileSync(join(guidesDir, 'installation.md'), '# Installation');
      
      const result = buildNavigationTree(tempDir, { autoDiscover: true });
      
      expect(result.items).toHaveLength(1);
      expect(result.items[0].name).toBe('guides');
      expect(result.items[0].type).toBe('section');
      // On case-insensitive file systems, readme.md might be detected as README.md
      expect(result.items[0].path).toMatch(/guides\/(readme|README)\.md/);
      expect(result.items[0].items).toHaveLength(1);
      expect(result.items[0].items![0].name).toBe('installation');
    });

    it('should prioritize index.md over README.md for section path', () => {
      // Create a section with both index.md and README.md
      const guidesDir = join(tempDir, 'guides');
      mkdirSync(guidesDir);
      writeFileSync(join(guidesDir, 'index.md'), '# Guides Index');
      writeFileSync(join(guidesDir, 'README.md'), '# Guides README');
      writeFileSync(join(guidesDir, 'installation.md'), '# Installation');
      
      const result = buildNavigationTree(tempDir, { autoDiscover: true });
      
      expect(result.items).toHaveLength(1);
      expect(result.items[0].name).toBe('guides');
      expect(result.items[0].type).toBe('section');
      expect(result.items[0].path).toBe('guides/index.md'); // Should prioritize index.md
      expect(result.items[0].items).toHaveLength(1);
      expect(result.items[0].items![0].name).toBe('installation');
    });


  });

  describe('validateContentStructure', () => {
    it('should validate correct content structure', () => {
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

      expect(() => validateContentStructure(contentDir)).not.toThrow();
    });

    it('should throw ParserError for missing index file when auto-discovery disabled', () => {
      const contentDir = join(tempDir, 'content');
      mkdirSync(contentDir);

      expect(() => validateContentStructure(contentDir, { autoDiscover: false })).toThrow(ParserError);
    });

    it('should validate auto-discovered content when no .index.json exists', () => {
      const contentDir = join(tempDir, 'content');
      mkdirSync(contentDir);
      
      // Create markdown files without .index.json
      writeFileSync(join(contentDir, 'getting-started.md'), '# Getting Started');
      writeFileSync(join(contentDir, 'installation.md'), '# Installation');

      expect(() => validateContentStructure(contentDir, { autoDiscover: true })).not.toThrow();
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