# Markpage Examples

This is an example SvelteKit project demonstrating how to use the `markpage` package to build documentation sites with distributed navigation structure.

## Features Demonstrated

- **Content Building**: Building documentation from markdown files
- **Navigation**: Distributed navigation structure with `.index.json` files
- **Content Loading**: Dynamic content loading and rendering
- **Routing**: SvelteKit dynamic routes for documentation pages
- **Styling**: Basic documentation site styling

## Project Structure

```
examples/
├── content/                    # Source markdown content
│   ├── .index.json           # Root navigation
│   ├── getting-started.md    # Getting started page
│   ├── guides/               # Guides section
│   │   ├── .index.json      # Guides navigation
│   │   ├── installation.md  # Installation guide
│   │   └── configuration.md # Configuration guide
│   └── api/                 # API section
│       ├── .index.json      # API navigation
│       ├── builder.md       # Builder API docs
│       ├── renderer.md      # Renderer API docs
│       └── types.md         # Types documentation
├── src/
│   ├── lib/
│   │   └── content/         # Built content (generated)
│   └── routes/
│       └── [...slug]/       # Dynamic route for all pages
└── package.json
```

## Content Structure

The example uses a distributed navigation structure where each folder can define its own navigation:

### Root Level (content/.index.json)
```json
{
  "items": [
    { "name": "getting-started", "type": "page", "label": "Getting Started" },
    { "name": "guides", "type": "section", "label": "Guides" },
    { "name": "api", "type": "section", "label": "API Reference" }
  ]
}
```

### Section Level (content/guides/.index.json)
```json
{
  "items": [
    { "name": "installation", "type": "page", "label": "Installation" },
    { "name": "configuration", "type": "page", "label": "Configuration" }
  ]
}
```

## Building Content

The example includes a build script that processes the markdown content:

```typescript
const { buildPages } = await import('markpage/builder');

await buildPages('./content', {
  appOutput: './src/lib/content',
  includeContent: true
});
```

This generates:
- `navigation.json` - Navigation structure
- `content.json` - Content bundle

## Usage in SvelteKit

The main page component (`src/routes/[...slug]/+page.svelte`) uses the `loadContent` function from `markpage/renderer` to load and render markdown content.

## Running the Example

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Build content**:
   ```bash
   npm run build:content
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Open browser**:
   Navigate to `http://localhost:5173`

## Customization

You can customize this example by:

- **Adding new content**: Create new markdown files and update `.index.json` files
- **Modifying styling**: Update the CSS in the Svelte components
- **Adding features**: Implement search, table of contents, etc.
- **Changing layout**: Modify the component structure

## Integration with Your Project

To use this pattern in your own project:

1. Copy the content structure
2. Install the `markpage` package
3. Set up the build process
4. Create your own styling and components
5. Add your content

This example demonstrates the core concepts of markpage and can serve as a starting point for your own documentation sites.
