# svelte-markdown-pages Examples

This is an example SvelteKit project demonstrating how to use the `svelte-markdown-pages` package to build documentation sites with distributed navigation structure.

## Features Demonstrated

- **Content-driven approach**: Uses markdown files and `.index.json` files for navigation
- **Proper SvelteKit routing**: Uses `[...slug]` dynamic routes for clean URLs
- **Built content files**: Generates `navigation.json` and `content.json` from markdown content
- **Modern Svelte 5**: Uses the latest Svelte 5 runes and patterns
- **Type-safe**: Full TypeScript support
- **Automatic content building**: Content is built automatically when the dev server starts

## Project Structure

```
packages/examples/
├── content/                    # Markdown content directory
│   ├── .index.json            # Root navigation
│   ├── getting-started.md     # Getting started page
│   ├── guides/                # Guides section
│   │   ├── .index.json        # Guides navigation
│   │   ├── installation.md    # Installation guide
│   │   └── configuration.md   # Configuration guide
│   └── api/                   # API section
│       ├── .index.json        # API navigation
│       ├── builder.md         # Builder API docs
│       └── renderer.md        # Renderer API docs
├── src/
│   ├── lib/
│   │   └── content/           # Generated content files
│   │       ├── navigation.json
│   │       └── content.json
│   └── routes/
│       ├── +page.svelte       # Root page (redirects to first page)
│       └── [...slug]/
│           └── +page.svelte   # Dynamic route for all pages
├── vite.config.ts             # Vite config with content building plugin
└── package.json
```

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

That's it! The development server will automatically:
1. Build the content from markdown files (via Vite plugin)
2. Generate `navigation.json` and `content.json`
3. Start the Vite dev server

## How It Works

### Automatic Content Building

The project uses a custom Vite plugin (`vite.config.ts`) that automatically builds content when the dev server starts:

```typescript
const buildContentPlugin = () => {
  return {
    name: 'build-content',
    buildStart: async () => {
      const { buildPages } = await import('svelte-markdown-pages/builder');
      await buildPages('./content', {
        appOutput: './src/lib/content',
        includeContent: true
      });
    }
  };
};
```

### Content Structure

Each directory can contain a `.index.json` file that defines the navigation structure:

```json
{
  "items": [
    { "name": "getting-started", "type": "page", "label": "Getting Started" },
    { "name": "guides", "type": "section", "label": "Guides" }
  ]
}
```

### URL Routing

The example uses SvelteKit's `[...slug]` dynamic routing:

- `/` → Redirects to first page
- `/getting-started` → Getting started page
- `/guides/installation` → Installation guide
- `/api/builder` → Builder API docs

### Content Loading

The main page component (`src/routes/[...slug]/+page.svelte`) uses the `loadContent` function from `svelte-markdown-pages/renderer` to load and render markdown content.

## Key Differences from Old Approach

### ✅ New Approach (Current)
- **Content-driven**: Uses actual markdown files and `.index.json` files
- **Proper routing**: Uses SvelteKit's `[...slug]` dynamic routes
- **Built files**: Generates `navigation.json` and `content.json` from content
- **Clean URLs**: URLs match the content structure
- **Type-safe**: Full TypeScript support
- **Seamless integration**: Content builds automatically during server startup

### ❌ Old Approach (Deprecated)
- **Hardcoded data**: Navigation and content were hardcoded in the component
- **Client-side routing**: Used custom event handling and `window.history.pushState`
- **Manual mapping**: Required manual URL-to-content path mapping
- **Limited scalability**: Hard to maintain for large documentation sites

## Customization

### Adding New Pages

1. Create a new markdown file in the appropriate directory
2. Update the corresponding `.index.json` file to include the new page
3. Restart the dev server (`npm run dev`) to rebuild content

### Styling

The example includes a clean, modern design that you can customize by modifying the CSS in `src/routes/[...slug]/+page.svelte`.

### Content Processing

You can add custom content processors by modifying the `loadContent` call in the main component.

## Scripts

- `npm run dev` - Start development server (content builds automatically)
- `npm run build` - Build for production
- `npm run build:content` - Generate navigation and content files (manual)
- `npm run preview` - Preview production build

## Learn More

- [Main Package Documentation](../../README.md)
- [API Reference](../../docs/api/)
- [Website Example](../website/) - Another example implementation
