import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { writeFileSync, mkdirSync, readFileSync, existsSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { 
  generateStaticSite,
  generateSitemap,
  generateRobotsTxt,
  StaticGeneratorError 
} from '../../src/builder/static-generator.js';
import { ContentProcessor } from '../../src/types.js';

describe('Static Generator', () => {
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

  describe('generateStaticSite', () => {
    it('should generate static site with default options', async () => {
      const result = await generateStaticSite(contentDir, outputDir);

      expect(result.pages).toHaveLength(2);
      expect(result.index).toBeDefined();
      expect(result.index!.path).toBe('index.html');

      // Check that files were written
      const gettingStartedPath = join(outputDir, 'getting-started.html');
      const installationPath = join(outputDir, 'guides/installation.html');
      const indexPath = join(outputDir, 'index.html');

      expect(existsSync(gettingStartedPath)).toBe(true);
      expect(existsSync(installationPath)).toBe(true);
      expect(existsSync(indexPath)).toBe(true);

      // Check content
      const gettingStartedHtml = readFileSync(gettingStartedPath, 'utf-8');
      const installationHtml = readFileSync(installationPath, 'utf-8');
      const indexHtml = readFileSync(indexPath, 'utf-8');

      expect(gettingStartedHtml).toContain('<h1>Getting Started</h1>');
      expect(installationHtml).toContain('<h1>Installation</h1>');
      expect(indexHtml).toContain('<title>Documentation</title>');
      expect(indexHtml).toContain('Getting Started');
      expect(indexHtml).toContain('Installation');
    });

    it('should generate static site with custom options', async () => {
      const result = await generateStaticSite(contentDir, outputDir, {
        title: 'Custom Documentation',
        baseUrl: 'https://example.com',
        css: 'body { font-family: Arial; }',
        js: 'console.log("loaded");',
        includeIndex: true,
        indexTitle: 'Welcome'
      });

      expect(result.pages).toHaveLength(2);
      expect(result.index).toBeDefined();

      const gettingStartedPath = join(outputDir, 'getting-started.html');
      const gettingStartedHtml = readFileSync(gettingStartedPath, 'utf-8');

      expect(gettingStartedHtml).toContain('<title>Custom Documentation</title>');
      expect(gettingStartedHtml).toContain('<base href="https://example.com">');
      expect(gettingStartedHtml).toContain('body { font-family: Arial; }');
      expect(gettingStartedHtml).toContain('console.log("loaded");');
    });

    it('should generate static site without index', async () => {
      const result = await generateStaticSite(contentDir, outputDir, {
        includeIndex: false
      });

      expect(result.pages).toHaveLength(2);
      expect(result.index).toBeUndefined();

      const indexPath = join(outputDir, 'index.html');
      expect(existsSync(indexPath)).toBe(false);
    });

    it('should generate static site with custom processor', async () => {
      const processor: ContentProcessor = {
        process(content: string): string {
          return content.replace(/\[\[(.+?)\]\]/g, '[$1]($1)');
        }
      };

      // Update content to include wiki-style links
      writeFileSync(join(contentDir, 'getting-started.md'), '# Getting Started\n\nCheck out [[installation]] for setup.');

      const result = await generateStaticSite(contentDir, outputDir, {
        processor
      });

      expect(result.pages).toHaveLength(2);

      const gettingStartedPath = join(outputDir, 'getting-started.html');
      const gettingStartedHtml = readFileSync(gettingStartedPath, 'utf-8');

      expect(gettingStartedHtml).toContain('<a href="installation">installation</a>');
    });

    it('should throw StaticGeneratorError for invalid content path', async () => {
      await expect(generateStaticSite('nonexistent-path', outputDir)).rejects.toThrow(StaticGeneratorError);
    });

    it('should create nested directories for pages', async () => {
      await generateStaticSite(contentDir, outputDir);

      const guidesDir = join(outputDir, 'guides');
      expect(existsSync(guidesDir)).toBe(true);

      const installationPath = join(guidesDir, 'installation.html');
      expect(existsSync(installationPath)).toBe(true);
    });
  });

  describe('generateSitemap', () => {
    it('should generate sitemap XML', () => {
      const pages = [
        { path: 'getting-started.html' },
        { path: 'guides/installation.html' }
      ];

      const sitemap = generateSitemap(pages, 'https://example.com');

      expect(sitemap).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(sitemap).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
      expect(sitemap).toContain('<loc>https://example.com/getting-started.html</loc>');
      expect(sitemap).toContain('<loc>https://example.com/guides/installation.html</loc>');
      expect(sitemap).toContain('<lastmod>');
    });

    it('should handle empty pages array', () => {
      const sitemap = generateSitemap([], 'https://example.com');

      expect(sitemap).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(sitemap).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
      expect(sitemap).toContain('</urlset>');
    });
  });

  describe('generateRobotsTxt', () => {
    it('should generate robots.txt', () => {
      const robotsTxt = generateRobotsTxt('https://example.com');

      expect(robotsTxt).toContain('User-agent: *');
      expect(robotsTxt).toContain('Allow: /');
      expect(robotsTxt).toContain('Sitemap: https://example.com/sitemap.xml');
    });

    it('should handle different base URLs', () => {
      const robotsTxt = generateRobotsTxt('https://docs.example.com');

      expect(robotsTxt).toContain('Sitemap: https://docs.example.com/sitemap.xml');
    });
  });
});