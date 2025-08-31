import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { writeFileSync, mkdirSync, readFileSync, existsSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { buildPages, generateStaticSite } from 'svelte-markdown-pages/builder';
import { NavigationTree, ContentLoader } from 'svelte-markdown-pages/renderer';

describe('Integration', () => {
  let tempDir: string;
  let contentDir: string;
  let outputDir: string;

  beforeEach(() => {
    // Use system temp directory instead of project root
    tempDir = join(tmpdir(), `svelte-markdown-pages-test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
    contentDir = join(tempDir, 'content');
    outputDir = join(tempDir, 'output');
    
    mkdirSync(tempDir, { recursive: true });
    mkdirSync(contentDir, { recursive: true });
    mkdirSync(outputDir, { recursive: true });

    // Create comprehensive test content structure
    const rootIndex = {
      items: [
        { name: 'getting-started', type: 'page', label: 'Getting Started' },
        { name: 'guides', type: 'section', label: 'Guides' },
        { name: 'api', type: 'section', label: 'API Reference' }
      ]
    };
    writeFileSync(join(contentDir, '.index.json'), JSON.stringify(rootIndex));

    // Guides section
    const guidesDir = join(contentDir, 'guides');
    mkdirSync(guidesDir);
    const guidesIndex = {
      items: [
        { name: 'installation', type: 'page', label: 'Installation' },
        { name: 'configuration', type: 'page', label: 'Configuration' },
        { name: 'advanced', type: 'section', label: 'Advanced Topics' }
      ]
    };
    writeFileSync(join(guidesDir, '.index.json'), JSON.stringify(guidesIndex));

    // Advanced section
    const advancedDir = join(guidesDir, 'advanced');
    mkdirSync(advancedDir);
    const advancedIndex = {
      items: [
        { name: 'customization', type: 'page', label: 'Customization' },
        { name: 'plugins', type: 'page', label: 'Plugins' }
      ]
    };
    writeFileSync(join(advancedDir, '.index.json'), JSON.stringify(advancedIndex));

    // API section
    const apiDir = join(contentDir, 'api');
    mkdirSync(apiDir);
    const apiIndex = {
      items: [
        { name: 'builder', type: 'page', label: 'Builder API' },
        { name: 'renderer', type: 'page', label: 'Renderer API' },
        { name: 'types', type: 'page', label: 'Type Definitions' }
      ]
    };
    writeFileSync(join(apiDir, '.index.json'), JSON.stringify(apiIndex));

    // Create markdown files
    writeFileSync(join(contentDir, 'getting-started.md'), 
      '# Getting Started\n\nWelcome to the documentation!\n\n## Quick Start\n\n1. Install package\n2. Create content\n3. Build docs');
    
    writeFileSync(join(guidesDir, 'installation.md'), 
      '# Installation\n\n## Prerequisites\n\n- Node.js 18+\n- npm or yarn\n\n## Steps\n\n1. Install the package\n2. Create your content structure\n3. Build your documentation');
    
    writeFileSync(join(guidesDir, 'configuration.md'), 
      '# Configuration\n\nLearn how to configure the package for your needs.\n\n## Basic Configuration\n\nThe package can be configured through build options.');
    
    writeFileSync(join(advancedDir, 'customization.md'), 
      '# Customization\n\nLearn how to customize the package behavior and appearance.\n\n## Custom Components\n\nYou can create custom Svelte components for rendering.');
    
    writeFileSync(join(advancedDir, 'plugins.md'), 
      '# Plugins\n\nExtend the package functionality with plugins.\n\n## Plugin System\n\nThe package supports a plugin system for extending functionality.');
    
    writeFileSync(join(apiDir, 'builder.md'), 
      '# Builder API\n\nThe builder module provides functionality for processing markdown content.\n\n## Functions\n\n### buildPages\n\nBuilds documentation from a content directory.');
    
    writeFileSync(join(apiDir, 'renderer.md'), 
      '# Renderer API\n\nThe renderer module provides runtime functionality for navigation and content rendering.\n\n## Classes\n\n### NavigationTree\n\nManages navigation structure and provides navigation utilities.');
    
    writeFileSync(join(apiDir, 'types.md'), 
      '# Type Definitions\n\nComplete type definitions for the package.\n\n## Core Types\n\n### DocItemType\n\n```typescript\ntype DocItemType = "section" | "page"\n```');
  });

  afterEach(() => {
    // Clean up temp files
    if (existsSync(tempDir)) {
      try {
        rmSync(tempDir, { recursive: true, force: true });
      } catch (error) {
        // Ignore cleanup errors in tests
        console.warn('Failed to clean up temp directory:', tempDir, error);
      }
    }
  });

  describe('Complete Workflow', () => {
    it('should build documentation and render content', async () => {
      // Step 1: Build documentation
      const buildResult = await buildPages(contentDir, {
        appOutput: outputDir,
        includeContent: true
      });

      expect(buildResult.navigation.items).toHaveLength(3);
      expect(buildResult.content).toBeDefined();
      expect(Object.keys(buildResult.content!)).toHaveLength(8);

      // Step 2: Create navigation tree
      const navigation = new NavigationTree(buildResult.navigation);
      expect(navigation.items).toHaveLength(3);
      expect(navigation.flatItems).toHaveLength(11); // All items including nested

      // Step 3: Create content loader
      const contentLoader = new ContentLoader(buildResult.content!);
      expect(contentLoader.getAvailablePaths()).toHaveLength(8);

      // Step 4: Test navigation functionality
      const gettingStartedItem = navigation.findItemByPath('getting-started.md');
      expect(gettingStartedItem).toBeDefined();
      expect(gettingStartedItem!.name).toBe('getting-started');

      const breadcrumbs = navigation.getBreadcrumbs('guides/advanced/customization.md');
      expect(breadcrumbs).toHaveLength(3);
      expect(breadcrumbs[0].name).toBe('guides');
      expect(breadcrumbs[1].name).toBe('advanced');
      expect(breadcrumbs[2].name).toBe('customization');

      // Step 5: Test content loading
      const content = contentLoader.loadAndProcess('getting-started.md');
      expect(content).toContain('<h1>Getting Started</h1>');
      expect(content).toContain('<h2>Quick Start</h2>');

      const apiContent = contentLoader.loadAndProcess('api/builder.md');
      expect(apiContent).toContain('<h1>Builder API</h1>');
      expect(apiContent).toContain('<h2>Functions</h2>');
    });

    it('should handle navigation tree operations', async () => {
      const buildResult = await buildPages(contentDir, {
        appOutput: outputDir,
        includeContent: true
      });

      const navigation = new NavigationTree(buildResult.navigation);

      // Test finding items
      const installationItem = navigation.findItemByPath('guides/installation.md');
      expect(installationItem).toBeDefined();
      expect(installationItem!.label).toBe('Installation');

      // Test getting siblings
      const siblings = navigation.getSiblings('guides/installation.md');
      expect(siblings).toHaveLength(3);
      expect(siblings.map(s => s.name)).toEqual(['installation', 'configuration', 'advanced']);

      // Test getting next/previous siblings
      const nextSibling = navigation.getNextSibling('guides/installation.md');
      expect(nextSibling).toBeDefined();
      expect(nextSibling!.name).toBe('configuration');

      const prevSibling = navigation.getPreviousSibling('guides/configuration.md');
      expect(prevSibling).toBeDefined();
      expect(prevSibling!.name).toBe('installation');

      // Test getting children
      const guidesChildren = navigation.getChildren('guides');
      expect(guidesChildren).toHaveLength(3);
      expect(guidesChildren.map(c => c.name)).toEqual(['installation', 'configuration', 'advanced']);

      const advancedChildren = navigation.getChildren('guides/advanced');
      expect(advancedChildren).toHaveLength(2);
      expect(advancedChildren.map(c => c.name)).toEqual(['customization', 'plugins']);
    });

    it('should generate static site with full navigation', async () => {
      const result = await generateStaticSite(contentDir, outputDir, {
        title: 'Documentation',
        includeIndex: true
      });

      expect(result.pages).toHaveLength(8);
      expect(result.index).toBeDefined();

      // Check that all pages were generated
      const pagePaths = result.pages.map(p => p.path);
      expect(pagePaths).toContain('getting-started.html');
      expect(pagePaths).toContain('guides/installation.html');
      expect(pagePaths).toContain('guides/configuration.html');
      expect(pagePaths).toContain('guides/advanced/customization.html');
      expect(pagePaths).toContain('guides/advanced/plugins.html');
      expect(pagePaths).toContain('api/builder.html');
      expect(pagePaths).toContain('api/renderer.html');
      expect(pagePaths).toContain('api/types.html');

      // Check that files were written
      const gettingStartedPath = join(outputDir, 'getting-started.html');
      const installationPath = join(outputDir, 'guides/installation.html');
      const customizationPath = join(outputDir, 'guides/advanced/customization.html');

      expect(existsSync(gettingStartedPath)).toBe(true);
      expect(existsSync(installationPath)).toBe(true);
      expect(existsSync(customizationPath)).toBe(true);

      // Check content
      const gettingStartedHtml = readFileSync(gettingStartedPath, 'utf-8');
      expect(gettingStartedHtml).toContain('<h1>Getting Started</h1>');
      expect(gettingStartedHtml).toContain('<h2>Quick Start</h2>');

      const installationHtml = readFileSync(installationPath, 'utf-8');
      expect(installationHtml).toContain('<h1>Installation</h1>');
      expect(installationHtml).toContain('<h2>Prerequisites</h2>');

      const customizationHtml = readFileSync(customizationPath, 'utf-8');
      expect(customizationHtml).toContain('<h1>Customization</h1>');
      expect(customizationHtml).toContain('<h2>Custom Components</h2>');
    });

    it('should handle content processing with custom processor', async () => {
      const processor = {
        process(content: string): string {
          // Add table of contents and process wiki-style links
          return content
            .replace(/\[\[(.+?)\]\]/g, '[$1]($1)')
            .replace(/^# (.+)$/m, '# $1\n\n## Table of Contents\n\n- [$1](#$1)\n');
        }
      };

      const buildResult = await buildPages(contentDir, {
        appOutput: outputDir,
        includeContent: true
      });

      const contentLoader = new ContentLoader(buildResult.content!, processor);
      const processedContent = contentLoader.loadAndProcess('getting-started.md');

      expect(processedContent).toContain('<h1>Getting Started</h1>');
      expect(processedContent).toContain('<h2>Table of Contents</h2>');
    });
  });
});