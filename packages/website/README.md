# Markpage Website

This is the official documentation website for markpage, built using the package itself. It demonstrates how to create a complete documentation site with distributed navigation structure.

## Features

- **Self-Hosting**: Built using markpage itself
- **Distributed Navigation**: Each section manages its own navigation
- **Responsive Design**: Works on desktop and mobile devices
- **Search**: Full-text search across all content
- **Dark Mode**: Toggle between light and dark themes
- **Code Highlighting**: Syntax highlighting for code blocks

## Development

### Prerequisites

- Node.js 18+
- npm

### Setup

```bash
# Install dependencies
npm install

# Build content
npm run build:docs

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Content Structure

The website content is stored in the `../../docs/` directory and follows the markpage content structure:

```
docs/
├── .index.json              # Root navigation
├── getting-started.md        # Getting started page
├── guides/                   # Guides section
│   ├── .index.json          # Guides navigation
│   ├── installation.md      # Installation guide
│   └── configuration.md     # Configuration guide
└── api/                      # API section
    ├── .index.json          # API navigation
    ├── builder.md           # Builder API docs
    ├── renderer.md          # Renderer API docs
    └── types.md             # Types documentation
```

### Building Content

The website automatically builds content from the `../../docs/` directory:

```bash
npm run build:docs
```

This generates:
- `src/lib/content/navigation.json` - Navigation structure
- `src/lib/content/content.json` - Content bundle

### Customization

You can customize the website by:

- **Adding new content**: Create new markdown files in `../../docs/`
- **Modifying styling**: Update the CSS in the Svelte components
- **Adding features**: Implement new functionality
- **Changing layout**: Modify the component structure

## Architecture

The website is built using:

- **SvelteKit**: Full-stack web framework
- **Markpage**: Content management and navigation
- **Tailwind CSS**: Utility-first CSS framework
- **Vite**: Build tool and dev server

## Deployment

The website can be deployed to any static hosting service:

- **Vercel**: Automatic deployment from Git
- **Netlify**: Drag and drop deployment
- **GitHub Pages**: Free hosting for open source projects
- **AWS S3**: Static website hosting

## Contributing

To contribute to the website:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally with `npm run dev`
5. Submit a pull request

## Learn More

This website serves as a complete example of how to use markpage:

- **Getting Started**: Learn the basics of markpage
- **Guides**: Step-by-step tutorials
- **API Reference**: Complete API documentation
- **Examples**: Working examples and use cases

For more information, see:

- [Main Package](../../packages/markpage) - The markpage package
- [Examples](../../packages/examples) - Example implementations
- [Tests](../../packages/tests) - Test suite and examples
