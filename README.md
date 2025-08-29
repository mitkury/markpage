# Svelte Markdown Pages NPM Package Specification

## Overview

**Goal**: Create a standalone npm package for building and rendering markdown-based content with distributed navigation structure.

**Target**: A developer building the first version of the package with tests.

**Tech Stack**:
- **Package**: TypeScript, Node.js
- **UI Components**: Svelte 5 (vanilla, no SvelteKit dependencies)
- **Testing**: Vitest
- **Build**: TypeScript compiler
- **CLI**: Node.js with TypeScript

**Use Cases**:
- **Documentation** (user guides, API docs, tutorials)
- **Blogs** (articles, posts, series)
- **Knowledge bases** (wikis, FAQs, help centers)
- **Guides** (how-to guides, manuals, references)
- **Any structured markdown content** that needs navigation

**Design Principles**:
- **Reusable** across different projects and content types
- **Scalable** as content grows
- **Maintainable** with local context for each section
- **Flexible** for different rendering contexts (app, website, static site)
- **Framework Agnostic**: Svelte 5 components that work in any Svelte project (including SvelteKit)

## Structure

```
docs/
├── .index.json                   # Root metadata
├── product/
│   ├── .index.json              # Product section metadata
│   ├── features/
│   │   ├── .index.json          # Features section metadata
│   │   ├── workspaces.md
│   │   ├── assistants.md
│   │   └── chat.md
│   └── how-to/
│       ├── .index.json          # How-to section metadata
│       ├── setup-providers.md
│       └── sync.md
└── dev/
    ├── .index.json              # Dev section metadata
    ├── quick-start.md
    ├── for-ai/
    │   ├── .index.json          # For AI section metadata
    │   ├── rules.md
    │   └── svelte.md
    └── proposals/
        ├── .index.json          # Proposals section metadata
        └── distributed-docs-structure.md
```

## Index.json Format

### Root Level (`docs/.index.json`)
```json
{
  "items": [
    { "name": "product", "type": "section", "label": "Product" },
    { "name": "dev", "type": "section", "label": "Developers" }
  ]
}
```

### Section Level (`docs/product/.index.json`)
```json
{
  "items": [
    { "name": "features", "type": "section", "label": "Features" },
    { "name": "how-to", "type": "section", "label": "How To" },
    { "name": "pricing", "type": "page", "label": "Pricing" }
  ]
}
```

### Content Level (`docs/product/features/.index.json`)
```json
{
  "items": [
    { "name": "workspaces", "type": "page", "label": "Workspaces" },
    { "name": "assistants", "type": "page", "label": "Assistants" },
    { "name": "chat", "type": "page", "label": "Chat" }
  ]
}
```

## Zod Schema

```ts
import { z } from "zod";

export const DocItemTypeSchema = z.enum(["section", "page"]);

export const DocItemSchema = z.object({
  name: z.string().min(1),
  type: DocItemTypeSchema,
  label: z.string().min(1),
  collapsed: z.boolean().optional(),
  url: z.string().url().optional()
});

export const IndexSchema = z.object({
  items: z.array(DocItemSchema)
});

export type DocItem = z.infer<typeof DocItemSchema>;
export type IndexFile = z.infer<typeof IndexSchema>;
```

## Benefits

- **Local context**: Each folder's structure is defined where the content lives
- **Easier navigation**: Contributors can see folder structure immediately
- **Reduced conflicts**: Changes to different sections don't conflict
- **Intuitive**: Add a file, update the local `.index.json`
- **Type-safe**: Validate all `.index.json` files with Zod

## Implementation: Build-Time Generation

Generate navigation data at build time for both app and website.

### Build Script

```ts
// scripts/build-docs.ts
import { buildNavigationTree } from './parser';
import { readFileSync, writeFileSync } from 'fs';

// Generate navigation
const navigationTree = buildNavigationTree('docs');

// Bundle markdown content for app
const markdownBundle: Record<string, string> = {};

function bundleMarkdownFiles(tree: NavigationTree, basePath: string) {
  for (const item of tree.items) {
    if (item.type === 'page') {
      const filePath = `${basePath}/${item.path}`;
      const content = readFileSync(filePath, 'utf-8');
      markdownBundle[item.path] = content;
    } else if (item.items) {
      bundleMarkdownFiles(item, basePath);
    }
  }
}

bundleMarkdownFiles(navigationTree, 'docs');

// Write files
writeFileSync('packages/client/src/lib/docs/navigation.json', JSON.stringify(navigationTree, null, 2));
writeFileSync('packages/client/src/lib/docs/content.json', JSON.stringify(markdownBundle, null, 2));
writeFileSync('packages/website/src/lib/docs/navigation.json', JSON.stringify(navigationTree, null, 2));
```

### App Integration

```svelte
<!-- src/lib/components/ContentPopover.svelte -->
<script lang="ts">
  import { NavigationTree, loadContent } from 'svelte-markdown-pages/renderer';
  import { DocsSidebar, DocsContent } from 'svelte-markdown-pages/components';
  import navigationData from '$lib/content/navigation.json';
  
  let navigation = $state(new NavigationTree(navigationData));
  let currentPage = $state<string | null>(null);
  let pageContent = $state<string | null>(null);
  
  $effect(() => {
    if (currentPage) {
      loadContent(currentPage).then(content => {
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

### Website Integration

```svelte
<!-- src/routes/content/[...slug]/+page.svelte -->
<script lang="ts">
  import { NavigationTree } from 'svelte-markdown-pages/renderer';
  import { DocsSidebar, DocsContent } from 'svelte-markdown-pages/components';
  import navigationData from '$lib/content/navigation.json';
  
  export let data;
  let { content, slug } = data;
  
  let navigation = $state(new NavigationTree(navigationData));
</script>

<div class="content-layout">
  <DocsSidebar {navigation} currentPage={slug} />
  <DocsContent {content} />
</div>
```

## Static Site Generation

Generate static HTML pages for deployment.

```ts
// scripts/build-static-docs.ts
import { buildNavigationTree } from './parser';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { marked } from 'marked';
import { join, dirname } from 'path';

function buildStaticSite() {
  const navigationTree = buildNavigationTree('docs');
  const pages = generateStaticPages(navigationTree, 'docs');
  const outputDir = 'dist/docs';
  
  mkdirSync(outputDir, { recursive: true });
  
  for (const page of pages) {
    const html = generateHTML(page);
    const outputPath = join(outputDir, page.path);
    mkdirSync(dirname(outputPath), { recursive: true });
    writeFileSync(outputPath, html);
  }
  
  console.log(`Generated ${pages.length} static pages in ${outputDir}`);
}

buildStaticSite();
```

### Package.json Scripts

```json
{
  "scripts": {
    "build-docs": "tsx scripts/build-docs.ts",
    "build-static-docs": "tsx scripts/build-static-docs.ts",
    "build-all": "npm run build-docs && npm run build-static-docs"
  }
}
```

## Outputs

One build process generates three outputs:
1. **App**: `navigation.json` + `content.json` for Svelte popover (offline)
2. **Website**: `navigation.json` for SvelteKit dynamic routes
3. **Static**: Complete static HTML site for deployment

## Standalone NPM Package

### Package Structure

Create a standalone npm package that can be imported and used with any directory containing markdown and `.index.json` files.

```
svelte-markdown-pages/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
├── src/
│   ├── index.ts                 # Main exports
│   ├── types.ts                 # Shared types and Zod schemas
│   ├── builder/                 # Build-time functionality
│   │   ├── index.ts
│   │   ├── parser.ts            # Parse .index.json files
│   │   ├── builder.ts           # Build navigation and content
│   │   └── static-generator.ts  # Generate static HTML
│   ├── renderer/                # Runtime functionality
│   │   ├── index.ts
│   │   ├── navigation.ts        # Navigation tree processing
│   │   ├── content.ts           # Content loading and processing
│   │   └── components.ts        # Shared Svelte components
│   └── utils.ts                 # Utility functions
├── bin/
│   └── svelte-markdown-pages.js # CLI binary
├── tests/
│   ├── builder/
│   │   ├── parser.test.ts
│   │   ├── builder.test.ts
│   │   └── static-generator.test.ts
│   ├── renderer/
│   │   ├── navigation.test.ts
│   │   ├── content.test.ts
│   │   └── components.test.ts
│   ├── fixtures/
│   │   ├── sample-content/
│   │   │   ├── .index.json
│   │   │   ├── getting-started.md
│   │   │   └── guides/
│   │   │       ├── .index.json
│   │   │       └── installation.md
│   │   └── invalid-content/
│   │       └── invalid.json
│   └── utils.test.ts
├── examples/
│   ├── basic-usage/
│   ├── sveltekit-integration/
│   └── static-site/
└── README.md
```

### Package.json

```json
{
  "name": "svelte-markdown-pages",
  "version": "1.0.0",
  "description": "Build and render markdown-based content with distributed navigation for Svelte projects",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.js"
    },
    "./builder": {
      "import": "./dist/builder/index.js",
      "require": "./dist/builder/index.js"
    },
    "./renderer": {
      "import": "./dist/renderer/index.js",
      "require": "./dist/renderer/index.js"
    },
    "./components": {
      "import": "./dist/renderer/components.js",
      "require": "./dist/renderer/components.js"
    }
  },
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest --coverage",
    "prepublishOnly": "npm run build && npm run test"
  },
  "dependencies": {
    "zod": "^3.22.0",
    "marked": "^9.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0",
    "vitest": "^1.0.0",
    "@vitest/coverage-v8": "^1.0.0",
    "svelte": "^5.0.0",
    "@sveltejs/vite-plugin-svelte": "^3.0.0",
    "vite": "^5.0.0"
  },
  "peerDependencies": {
    "svelte": "^5.0.0"
  },
  "bin": {
    "svelte-markdown-pages": "./bin/svelte-markdown-pages.js"
  },
  "keywords": [
    "markdown",
    "documentation",
    "static-site",
    "navigation",
    "content-management",
    "svelte"
  ],
  "repository": "https://github.com/your-username/svelte-markdown-pages",
  "license": "MIT"
}
```

### Usage

**Install:**
```bash
npm install svelte-markdown-pages
```

**Build-time (CLI/scripts):**
```ts
import { buildDocs, generateStaticSite } from 'svelte-markdown-pages/builder';

// Build for any directory
await buildDocs('./my-content', {
  appOutput: './src/lib/content',
  websiteOutput: './src/lib/content'
});

// Generate static site
await generateStaticSite('./my-content', './dist');
```

**Runtime (app/website):**
```ts
import { NavigationTree, loadContent } from 'svelte-markdown-pages/renderer';
import { DocsSidebar, DocsContent } from 'svelte-markdown-pages/components';

// Load navigation and content
const navigation = new NavigationTree(navigationData);
const content = await loadContent(pagePath);
```

**CLI:**
```bash
# Build content from any directory
npx svelte-markdown-pages build ./my-content --output ./src/lib/content

# Generate static site
npx svelte-markdown-pages static ./my-content --output ./dist

# Or use the binary directly
npx svelte-markdown-pages --help
```

**Point to any directory:**
```bash
# Documentation
npx svelte-markdown-pages build ./docs --output ./src/docs

# Blog
npx svelte-markdown-pages build ./blog --output ./src/blog

# Knowledge base
npx svelte-markdown-pages build ./kb --output ./src/kb
```

### Integration with Any Project

```json
{
  "scripts": {
    "build-content": "markdown-pages build ./content --output ./src/lib/content",
    "build-static": "markdown-pages static ./content --output ./dist",
    "dev": "npm run build-content && npm run dev:app"
  }
}
```

## Benefits of Standalone Package

- **Universal**: Works with any project, not just Sila
- **Reusable**: Can be used for docs, blogs, knowledge bases, etc.
- **Simple**: Just point to any directory with markdown and `.index.json` files
- **Flexible**: Multiple output formats (app, website, static)
- **Maintainable**: Single package to maintain and update

## Development Specification

### Phase 1: Core Infrastructure
1. **Setup project structure** with TypeScript, Vitest, and Vite
2. **Implement Zod schemas** for type validation
3. **Create parser** for `.index.json` files with error handling
4. **Write tests** for parser with fixtures

### Phase 2: Builder Module
1. **Implement builder** that reads directory structure
2. **Add markdown processing** with marked library
3. **Create static generator** for HTML output
4. **Write comprehensive tests** for builder functionality

### Phase 3: Renderer Module
1. **Implement NavigationTree class** with methods for navigation logic
2. **Create content loader** for runtime content access
3. **Build Svelte 5 components** (vanilla Svelte, no SvelteKit dependencies)
4. **Test renderer** with sample navigation data

### Phase 4: CLI and Integration
1. **Create CLI binary** with flexible directory targeting
2. **Add examples** for different use cases
3. **Test integration** with SvelteKit projects
4. **Write documentation** and README

### Testing Requirements
- **Unit tests**: All modules with >90% coverage
- **Integration tests**: End-to-end workflows
- **Fixture tests**: Sample content and invalid content
- **Component tests**: Svelte components in isolation

### Quality Standards
- **TypeScript**: Strict mode, no any types
- **Error handling**: Comprehensive error messages
- **Performance**: Handle large content directories efficiently
- **Documentation**: Clear API documentation and examples
