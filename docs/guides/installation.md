# Installation

Follow this guide to install and set up Markpage in your project.

## Prerequisites

Before installing Markpage, make sure you have:

- **Node.js 18+** - Required for modern JavaScript features
- **npm or yarn** - Package manager for installing dependencies
- **Any framework or none** - The package works with React, Vue, Svelte, Angular, or vanilla JS

## Quick Install

Install the package using npm:

```bash
npm install markpage
```

Or using yarn:

```bash
yarn add markpage
```

## Manual Setup

### 1. Create a New Project (Any Framework)

If you're starting from scratch, create a new project with your preferred framework:

```bash
# For React
npm create react-app my-docs-site

# For Vue
npm create vue@latest my-docs-site

# For Svelte
npm create svelte@latest my-docs-site

# For vanilla JS
mkdir my-docs-site && cd my-docs-site
npm init -y
```

### 2. Install Markpage

```bash
npm install markpage
```

### 3. Set Up Your Content Structure

Create a directory for your documentation content:

```bash
mkdir docs
```

### 4. Create Your First Content

Create a basic documentation structure:

```bash
# Create the main index file
echo '{
  "items": [
    { "name": "getting-started", "type": "page", "label": "Getting Started" }
  ]
}' > docs/.index.json

# Create your first markdown file
echo '# Getting Started

Welcome to your documentation site!

This is your first page created with Markpage.' > docs/getting-started.md
```

### 5. Build Your Documentation

Create a build script in your `package.json`:

```json
{
  "scripts": {
    "build:docs": "node -e \"import('markpage/builder').then(({buildPages}) => buildPages('./docs', {appOutput: './src/lib/content', includeContent: true}))\""
  }
}
```

Or create a build script file:

```typescript
// scripts/build-docs.js
import { buildPages } from 'markpage/builder';

await buildPages('./docs', {
  appOutput: './src/lib/content',
  websiteOutput: './src/lib/content',
  includeContent: true
});
```

### 6. Use in Your App

Create a documentation page in your app:

```typescript
// Example for React
import { NavigationTree, loadContent } from 'markpage/renderer';
import navigationData from './content/navigation.json';
import contentBundle from './content/content.json';

function DocsPage() {
  const [currentPage, setCurrentPage] = useState("getting-started.md");
  const [pageContent, setPageContent] = useState<string | null>(null);
  
  useEffect(() => {
    if (currentPage && contentBundle) {
      loadContent(currentPage, contentBundle).then(setPageContent);
    }
  }, [currentPage]);
  
  return (
    <div className="docs-layout">
      <nav className="sidebar">
        {/* Navigation will go here */}
      </nav>
      <main className="content">
        {pageContent ? <div dangerouslySetInnerHTML={{ __html: pageContent }} /> : 'Loading...'}
      </main>
    </div>
  );
}
```

## Content Structure

### Basic Structure

Your documentation should follow this structure:

```
docs/
├── .index.json              # Root navigation
├── getting-started.md        # Getting started page
├── guides/
│   ├── .index.json          # Guides section navigation
│   ├── installation.md      # Installation guide
│   └── configuration.md     # Configuration guide
└── api/
    ├── .index.json          # API section navigation
    └── reference.md         # API reference
```

### Index.json Format

Each `.index.json` file defines the navigation structure for that directory:

```json
{
  "items": [
    {
      "name": "page-name",
      "type": "page",
      "label": "Page Display Name"
    },
    {
      "name": "section-name",
      "type": "section",
      "label": "Section Display Name"
    }
  ]
}
```

### Item Properties

- `name`: File/directory name (without extension)
- `type`: Either `"page"` or `"section"`
- `label`: Display label for navigation
- `collapsed`: Optional boolean to collapse sections by default
- `url`: Optional external URL

## Build Configuration

### Basic Build

```typescript
import { buildPages } from 'markpage/builder';

await buildPages('./docs', {
  appOutput: './src/lib/content',
  includeContent: true
});

### Advanced Build Options

```typescript
await buildPages('./docs', {
  appOutput: './src/lib/content',
  websiteOutput: './src/lib/content',
  staticOutput: './dist',
  includeContent: true,
  processor: customProcessor,
  
});
```

## CLI Usage

You can also use the CLI for quick builds:

```bash
# Build for app integration
npx markpage build ./docs --output ./src/lib/content

# Generate static site
npx markpage static ./docs --output ./dist
```

## Next Steps

Now that you have Markpage installed, check out:

- [Configuration](./configuration.md) - Learn about build options and customization
- [API Reference](../api/builder.md) - Complete API documentation
- [Examples](../../packages/examples) - Working examples in the examples package

## Troubleshooting

### Common Issues

**Module not found errors**: Make sure you're using Node.js 18+ and have installed the package correctly.

**Build errors**: Check that your `.index.json` files are valid JSON and follow the correct format.

**Content not loading**: Verify that your markdown files exist and are referenced correctly in the navigation.

### Getting Help

- Check the [API Reference](../api/builder.md) for detailed documentation
- Look at the [examples](../../packages/examples) for working implementations
- Review the [test suite](../../packages/tests) for usage patterns
