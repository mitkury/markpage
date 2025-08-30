# Examples

Example SvelteKit project demonstrating how to use svelte-markdown-pages.

## Features

This example project shows:

- Basic integration with SvelteKit
- Using the NavigationTree and ContentLoader
- Rendering documentation with DocsSidebar and DocsContent components
- Svelte 5 runes usage ($state, $effect)

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

- **`src/routes/+page.svelte`** - Main page demonstrating svelte-markdown-pages usage
- **`src/routes/+layout.svelte`** - Root layout
- **`src/app.html`** - HTML template
- **`src/app.css`** - Global styles

## Usage Example

The main page shows how to:

1. Import and use NavigationTree and ContentLoader
2. Set up reactive state with Svelte 5 runes
3. Load and render markdown content
4. Use the DocsSidebar and DocsContent components

## Customization

You can modify this example to:

- Add more pages and routes
- Customize the styling
- Add more complex navigation structures
- Integrate with your own content management system

## Development

This is a standard SvelteKit project. See the [SvelteKit documentation](https://kit.svelte.dev/) for more information.
