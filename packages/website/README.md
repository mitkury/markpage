# svelte-markdown-pages Website

This is the official documentation website for svelte-markdown-pages, built using the package itself. It demonstrates how to create a complete documentation site with distributed navigation structure.

## Features

- **Self-Hosting**: Built using svelte-markdown-pages itself
- **Dynamic Routing**: SvelteKit routes for all documentation pages
- **Responsive Design**: Mobile-friendly layout with sidebar navigation
- **Real-time Content**: Content is built from markdown files in the `/docs` directory
- **Svelte 5**: Uses the latest Svelte 5 runes and syntax

## Development

### Prerequisites

- Node.js 18+
- npm

### Setup

```bash
# Install dependencies
npm install

# Build documentation from /docs
npm run build:docs

# Start development server
npm run dev
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run build:docs` - Build documentation from `/docs` directory
- `npm run dev:docs` - Build docs and start dev server

## Structure

```
packages/website/
├── src/
│   ├── routes/
│   │   ├── +layout.svelte          # Root layout
│   │   ├── +page.svelte            # Home page (redirects to docs)
│   │   └── docs/
│   │       └── [...slug]/
│   │           └── +page.svelte    # Dynamic documentation pages
│   ├── lib/
│   │   └── content/                # Generated content (built from /docs)
│   │       ├── navigation.json     # Navigation structure
│   │       └── content.json        # Content bundle
│   ├── app.css                     # Global styles
│   ├── app.d.ts                    # TypeScript declarations
│   └── app.html                    # HTML template
├── static/                         # Static assets
├── package.json                    # Dependencies and scripts
├── svelte.config.js               # SvelteKit configuration
├── vite.config.ts                 # Vite configuration
└── tsconfig.json                  # TypeScript configuration
```

## Content

The website content is built from the `/docs` directory in the project root. The build process:

1. Reads markdown files from `/docs`
2. Parses `.index.json` files for navigation structure
3. Generates `navigation.json` and `content.json` in `src/lib/content/`
4. Serves content through dynamic SvelteKit routes

## Customization

### Styling

Modify `src/app.css` to customize the appearance:

```css
/* Custom documentation styles */
.docs-content {
  font-family: 'Inter', sans-serif;
  line-height: 1.7;
}

.docs-sidebar {
  background: #f8f9fa;
  border-right: 1px solid #e9ecef;
}
```

### Layout

The main documentation layout is in `src/routes/docs/[...slug]/+page.svelte`. It includes:

- Header with site title
- Sidebar navigation
- Content area with markdown rendering
- Responsive design for mobile devices

### Navigation

Navigation is automatically generated from the `/docs` directory structure. Each directory can contain a `.index.json` file that defines the navigation items:

```json
{
  "items": [
    { "name": "getting-started", "type": "page", "label": "Getting Started" },
    { "name": "guides", "type": "section", "label": "Guides" }
  ]
}
```

## Deployment

### Build for Production

```bash
npm run build:docs  # Build documentation
npm run build       # Build SvelteKit app
```

### Deploy to Vercel

1. Connect your repository to Vercel
2. Set build command: `npm run build:docs && npm run build`
3. Set output directory: `packages/website/build`
4. Deploy

### Deploy to Netlify

1. Connect your repository to Netlify
2. Set build command: `npm run build:docs && npm run build`
3. Set publish directory: `packages/website/build`
4. Deploy

## Examples

This website serves as a complete example of how to use svelte-markdown-pages:

- **Content Structure**: See `/docs` for how to organize markdown files
- **Navigation**: See `.index.json` files for navigation configuration
- **SvelteKit Integration**: See `src/routes/docs/[...slug]/+page.svelte` for dynamic routing
- **Styling**: See `src/app.css` for documentation styling
- **Build Process**: See `package.json` scripts for build configuration

## Related

- [Main Package](../../packages/svelte-markdown-pages) - The svelte-markdown-pages package
- [Examples](../../packages/examples) - Basic usage examples
- [Tests](../../packages/tests) - Test suite and examples
- [Documentation](../../docs) - Source markdown files for this website
