import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { writeFileSync, mkdirSync, readFileSync, readdirSync, existsSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { buildPages } from 'markpage/builder';

describe('Section Content Bundling', () => {
  let tempDir: string;
  let contentDir: string;
  let outputDir: string;

  beforeEach(() => {
    tempDir = join(tmpdir(), `markpage-section-test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
    contentDir = join(tempDir, 'content');
    outputDir = join(tempDir, 'output');
    
    mkdirSync(tempDir, { recursive: true });
    mkdirSync(contentDir, { recursive: true });
    mkdirSync(outputDir, { recursive: true });

    // Create test content structure with README.md in guides section
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
    writeFileSync(join(guidesDir, 'README.md'), '# Guides Overview\n\nThis section contains various guides.');
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

  it('should bundle content for sections with README files', async () => {
    // Debug: Check if files exist
    console.log('Files in contentDir:', readdirSync(contentDir));
    console.log('Files in guidesDir:', readdirSync(join(contentDir, 'guides')));
    
    const result = await buildPages(contentDir, {
      appOutput: outputDir,
      includeContent: true
    });

    console.log('Navigation result:', JSON.stringify(result.navigation, null, 2));
    console.log('Content keys:', Object.keys(result.content || {}));

    expect(result.content).toBeDefined();
    // Should include the README content for the guides section
    expect(result.content!['guides/README.md']).toBe('# Guides Overview\n\nThis section contains various guides.');
    expect(result.content!['getting-started.md']).toBe('# Getting Started\n\nWelcome to the documentation!');
    expect(result.content!['guides/installation.md']).toBe('# Installation\n\nFollow these steps to install.');
  });
});
