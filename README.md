# Markpage

A standalone npm package for building and rendering markdown-based content with distributed navigation structure for any framework.

## Project Structure

This is a monorepo with the following packages:

- **`packages/markpage`** - The main package that gets published to npm
- **`packages/tests`** - Comprehensive test suite for the package
- **`packages/examples`** - Example SvelteKit project demonstrating usage

## Features

- **Distributed Navigation**: Each folder defines its own structure with `.index.json` files
- **Multiple Output Formats**: App bundles, website navigation, and static HTML sites
- **Type-Safe**: Full TypeScript support with Zod validation
- **Framework Agnostic**: Works with any framework or no framework at all
- **Flexible**: Point to any directory with markdown and `.index.json` files
- **Comprehensive Testing**: >90% test coverage with comprehensive test suite

## Development

### Prerequisites

- Node.js 18+
- npm

### Setup

```bash
# Install dependencies for all packages
npm install

# Build the main package
npm run build

# Run tests
npm test

# Build examples
npm run build:examples

# Start examples in development mode
npm run dev:examples
```

### Package Scripts

- `npm run build` - Build the main markpage package
- `npm run dev` - Watch mode for the main package
- `npm test` - Run all tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run build:examples` - Build the example SvelteKit project
- `npm run dev:examples` - Start the example project in development mode

## Installation

```bash
npm install markpage
```

## Quick Start

### 1. Create Content Structure

Create a directory with your markdown content and `.index.json` files:

```
my-content/
├── .index.json
├── getting-started.md
└── guides/
    ├── .index.json
    └── installation.md
```

### 2. Define Navigation

**Root level** (`my-content/.index.json`):
```json
{
  "items": [
    { "name": "getting-started", "type": "page", "label": "Getting Started" },
    { "name": "guides", "type": "section", "label": "Guides" }
  ]
}
```

**Section level** (`my-content/guides/.index.json`):
```json
{
  "items": [
    { "name": "installation", "type": "page", "label": "Installation" }
  ]
}
```

### 3. Build Documentation

```typescript
import { buildPages } from 'markpage/builder';

await buildPages('./my-content', {
  appOutput: './src/lib/content',
  websiteOutput: './src/lib/content',
  includeContent: true
});
```

### 4. Use in Your App

```typescript
import { NavigationTree, loadContent } from 'markpage/renderer';
import navigationData from './src/lib/content/navigation.json';
import contentBundle from './src/lib/content/content.json';

const navigation = new NavigationTree(navigationData);
const content = await loadContent('getting-started.md', contentBundle);
```

## CLI Usage

### Build for App/Website

```bash
npx markpage build ./my-content --output ./src/lib/content
```

### Generate Static Site

```bash
npx markpage static ./my-content --output ./dist
```

## API Reference

### Builder Module

#### `buildPages(contentPath, options?)`

Builds documentation from a content directory.

```typescript
import { buildPages } from 'markpage/builder';

const result = await buildPages('./content', {
  appOutput: './src/lib/content',
  websiteOutput: './src/lib/content',
  includeContent: true
});
```

#### `generateStaticSite(contentPath, outputPath, options?)`

Generates a complete static HTML site.

```typescript
import { generateStaticSite } from 'markpage/builder';

const result = await generateStaticSite('./content', './dist', {
  title: 'My Documentation',
  baseUrl: 'https://example.com',
  includeIndex: true
});
```

### Renderer Module

#### `NavigationTree`

Manages navigation structure and provides navigation utilities.

```typescript
import { NavigationTree } from 'markpage/renderer';

const navigation = new NavigationTree(navigationData);

// Find items
const item = navigation.findItemByPath('guides/installation.md');

// Get breadcrumbs
const breadcrumbs = navigation.getBreadcrumbs('guides/installation.md');

// Get siblings
const siblings = navigation.getSiblings('guides/installation.md');
const nextSibling = navigation.getNextSibling('guides/installation.md');
const prevSibling = navigation.getPreviousSibling('guides/installation.md');
```

#### `ContentLoader`

Manages content loading and processing.

```typescript
import { ContentLoader } from 'markpage/renderer';

const loader = new ContentLoader(contentBundle);

// Load content
const content = loader.loadAndProcess('getting-started.md');

// Check availability
const hasContent = loader.hasContent('guides/installation.md');
const paths = loader.getAvailablePaths();
```

#### `loadContent(path, contentBundle, processor?)`

Loads and processes content for a specific path.

```typescript
import { loadContent } from 'markpage/renderer';

const content = await loadContent('getting-started.md', contentBundle);
```

### Content Processing

#### Custom Processors

You can provide custom content processors for advanced transformations:

```typescript
const processor = {
  process(content: string): string {
    // Add table of contents
    return addTableOfContents(content);
  }
};

const content = await loadContent('page.md', contentBundle, processor);
```

#### Utility Functions

```typescript
import { 
  extractHeadings, 
  extractTableOfContents, 
  addTableOfContents 
} from 'markpage/renderer';

// Extract headings from markdown
const headings = extractHeadings(content);

// Generate table of contents
const toc = extractTableOfContents(content);

// Add table of contents to content
const contentWithToc = addTableOfContents(content);
```

## Content Structure

### Index.json Format

Each directory can contain a `.index.json` file that defines the navigation structure:

```json
{
  "items": [
    { "name": "page-name", "type": "page", "label": "Page Label" },
    { "name": "section-name", "type": "section", "label": "Section Label" }
  ]
}
```

### Item Properties

- `name`: File/directory name (without extension)
- `type`: Either `"page"` or `"section"`
- `label`: Display label for navigation
- `collapsed`: Optional boolean to collapse sections by default
- `url`: Optional external URL

### File Structure

- Pages: `{name}.md` files
- Sections: `{name}/` directories with their own `.index.json`

## Use Cases

### Documentation Sites

```bash
npx markpage build ./docs --output ./src/lib/docs
```

### Blog Systems

```bash
npx markpage build ./blog --output ./src/lib/blog
```

### Knowledge Bases

```bash
npx markpage build ./kb --output ./src/lib/kb
```

### Static Sites

```bash
npx markpage static ./content --output ./dist
```

## Integration Examples

### SvelteKit Integration

```svelte
<!-- src/routes/docs/[...slug]/+page.svelte -->
<script lang="ts">
  import { NavigationTree } from 'markpage/renderer';
  import { DocsSidebar, DocsContent } from 'markpage/components';
  import navigationData from '$lib/content/navigation.json';
  
  export let data;
  let { content, slug } = data;
  
  let navigation = $state(new NavigationTree(navigationData));
</script>

<div class="docs-layout">
  <DocsSidebar {navigation} currentPage={slug} />
  <DocsContent {content} />
</div>
```

### App Integration

```svelte
<!-- src/lib/components/ContentPopover.svelte -->
<script lang="ts">
  import { NavigationTree, loadContent } from 'markpage/renderer';
  import { DocsSidebar, DocsContent } from 'markpage/components';
  import navigationData from '$lib/content/navigation.json';
  import contentBundle from '$lib/content/content.json';
  
  let navigation = $state(new NavigationTree(navigationData));
  let currentPage = $state<string | null>(null);
  let pageContent = $state<string | null>(null);
  
  $effect(() => {
    if (currentPage) {
      loadContent(currentPage, contentBundle).then(content => {
        pageContent = content;
      });
    }
  });
</script>

<div class="content-popover">
  <DocsSidebar {navigation} bind:currentPage />
  <DocsContent {pageContent} />
</div>
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

MIT License - see LICENSE file for details.
