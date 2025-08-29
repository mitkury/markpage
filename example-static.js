// Example demonstrating static site generation
import { generateStaticSite } from './dist/builder/index.js';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

async function runStaticExample() {
  console.log('🚀 Svelte Markdown Pages - Static Site Example');
  console.log('================================================\n');

  // Create example content structure
  const contentDir = './example-static-content';
  mkdirSync(contentDir, { recursive: true });

  // Create root index
  const rootIndex = {
    items: [
      { name: 'getting-started', type: 'page', label: 'Getting Started' },
      { name: 'guides', type: 'section', label: 'Guides' }
    ]
  };
  writeFileSync(join(contentDir, '.index.json'), JSON.stringify(rootIndex, null, 2));

  // Create guides section
  const guidesDir = join(contentDir, 'guides');
  mkdirSync(guidesDir, { recursive: true });
  const guidesIndex = {
    items: [
      { name: 'installation', type: 'page', label: 'Installation' }
    ]
  };
  writeFileSync(join(guidesDir, '.index.json'), JSON.stringify(guidesIndex, null, 2));

  // Create markdown files
  writeFileSync(join(contentDir, 'getting-started.md'), 
    '# Getting Started\n\nWelcome to the documentation!\n\n## Quick Start\n\n1. Install package\n2. Create content\n3. Build docs');
  
  writeFileSync(join(guidesDir, 'installation.md'), 
    '# Installation\n\n## Prerequisites\n\n- Node.js 18+\n- npm or yarn\n\n## Steps\n\n1. Install the package\n2. Create your content structure\n3. Build your documentation');

  console.log('✅ Created example content structure');

  try {
    // Generate static site
    console.log('🔨 Generating static site...');
    const outputDir = './example-static-output';
    mkdirSync(outputDir, { recursive: true });
    
    const result = await generateStaticSite(contentDir, outputDir, {
      title: 'My Documentation',
      baseUrl: 'https://example.com',
      css: 'body { font-family: Arial, sans-serif; margin: 40px; }',
      includeIndex: true
    });

    console.log('✅ Static site generated successfully!');
    console.log(`📄 Generated ${result.pages.length} pages`);
    console.log(`🏠 Index page: ${result.index ? 'Yes' : 'No'}\n`);

    console.log('📁 Generated files:');
    console.log('   example-static-output/');
    console.log('   ├── index.html');
    console.log('   ├── getting-started.html');
    console.log('   └── guides/');
    console.log('       └── installation.html\n');

    console.log('🎉 Static site example completed successfully!');
    console.log('📁 Check the ./example-static-output directory for generated HTML files.');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

runStaticExample().catch(console.error);