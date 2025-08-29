// Simple example demonstrating the svelte-markdown-pages package
import { buildDocs } from './dist/builder/index.js';
import { NavigationTree, ContentLoader } from './dist/renderer/index.js';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

async function runExample() {
  console.log('🚀 Svelte Markdown Pages - Example');
  console.log('=====================================\n');

  // Create example content structure
  const contentDir = './example-content';
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
  console.log('📁 Directory structure:');
  console.log('   example-content/');
  console.log('   ├── .index.json');
  console.log('   ├── getting-started.md');
  console.log('   └── guides/');
  console.log('       ├── .index.json');
  console.log('       └── installation.md\n');

  try {
    // Build documentation
    console.log('🔨 Building documentation...');
    mkdirSync('./example-output', { recursive: true });
    const result = await buildDocs(contentDir, {
      appOutput: './example-output',
      includeContent: true
    });

    console.log('✅ Build successful!');
    console.log(`📊 Navigation items: ${result.navigation.items.length}`);
    console.log(`📄 Content files: ${Object.keys(result.content || {}).length}\n`);

    // Demonstrate navigation tree
    console.log('🧭 Navigation Tree:');
    const navigation = new NavigationTree(result.navigation);
    console.log(`   Total items: ${navigation.flatItems.length}`);
    
    const gettingStarted = navigation.findItemByPath('getting-started.md');
    if (gettingStarted) {
      console.log(`   Found: ${gettingStarted.label}`);
    }

    const breadcrumbs = navigation.getBreadcrumbs('guides/installation.md');
    console.log(`   Breadcrumbs for installation: ${breadcrumbs.map(item => item.label).join(' > ')}\n`);

    // Demonstrate content loading
    console.log('📖 Content Loading:');
    const contentLoader = new ContentLoader(result.content || {});
    const content = contentLoader.loadAndProcess('getting-started.md');
    console.log(`   Getting Started content length: ${content?.length || 0} characters`);
    console.log(`   Contains HTML: ${content?.includes('<h1>') ? 'Yes' : 'No'}\n`);

    console.log('🎉 Example completed successfully!');
    console.log('📁 Check the ./example-output directory for generated files.');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

runExample().catch(console.error);