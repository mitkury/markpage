# Development Guide for @markpage/svelte

This guide explains how to develop the `@markpage/svelte` package, including how to work with local and published versions of the `markpage` dependency and the new MarkpageOptions API.

## Overview

The `@markpage/svelte` package depends on the `markpage` package. During development, you may want to:
- Test changes to the local `markpage` package
- Test with the published `markpage` package
- Switch between both easily

## Development Workflow

### Using Local Markpage (for development)

When you're making changes to the `markpage` package and want to test them with `@markpage/svelte`:

```bash
# Navigate to the svelte package
cd packages/markpage-svelte

# Use local markpage version and start development
npm run dev:local

# Or manually link and start development
npm run link:local
npm run dev
```

This will:
1. Link to the local `markpage` package in `../markpage`
2. Start the development server with watch mode

### Using Published Markpage (for testing)

When you want to test with the published version of `markpage`:

```bash
# Navigate to the svelte package
cd packages/markpage-svelte

# Use published markpage version and start development
npm run dev:published

# Or manually unlink and start development
npm run unlink:local
npm run dev
```

This will:
1. Unlink from the local `markpage` package
2. Install the published version from npm
3. Start the development server with watch mode

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev:local` | Start development with local markpage |
| `npm run dev:published` | Start development with published markpage |
| `npm run link:local` | Link to local markpage package |
| `npm run unlink:local` | Unlink and reinstall published markpage |
| `npm run build` | Build the package for production |
| `npm run dev` | Start development (uses current markpage version) |

## How It Works

### npm link

The development scripts use `npm link` to create a symlink between the local `markpage` package and the `@markpage/svelte` package:

1. **Linking**: `npm link markpage` creates a symlink to the local package
2. **Unlinking**: `npm unlink markpage` removes the symlink and reinstalls the published version

### Package Dependencies

- **Published version**: `"markpage": "^0.3.6"` (in dependencies)
- **Local version**: Symlinked to `../markpage` (via npm link)

## Testing the Published Package

To test that the published package works correctly:

```bash
# Create a test directory
mkdir test-package && cd test-package

# Initialize npm project
npm init -y

# Install the published package
npm install @markpage/svelte

# Verify both packages are installed
ls node_modules/@markpage/svelte
ls node_modules/markpage
```

This should install both `@markpage/svelte` and `markpage` automatically.

## Troubleshooting

### Link Issues

If you encounter issues with npm link:

```bash
# Check if markpage is linked globally
npm list -g --depth=0

# If not linked, link it first
cd packages/markpage
npm link

# Then link in svelte package
cd ../markpage-svelte
npm link markpage
```

### Version Conflicts

If you see version conflicts:

```bash
# Clean install
npm run unlink:local
rm -rf node_modules package-lock.json
npm install
```

### Build Issues

If the build fails:

```bash
# Clean and rebuild
npm run clean
npm run build
```

## Publishing

When publishing the `@markpage/svelte` package:

1. Ensure you're using the published version: `npm run dev:published`
2. Run tests: `npm test`
3. Build the package: `npm run build`
4. Publish: `npm publish`

The published package will automatically install the correct version of `markpage` as a dependency.

## MarkpageOptions API

The `@markpage/svelte` package now uses the `MarkpageOptions` API for configuring the Markdown component. This provides a clean, fluent interface for setting up custom components and markdown extensions.

### Basic Usage

```svelte
<script lang="ts">
  import { Markdown, MarkpageOptions } from '@markpage/svelte';
  import Button from './Button.svelte';
  import Alert from './Alert.svelte';

  const options = new MarkpageOptions()
    .addCustomComponent('Button', Button)
    .addCustomComponent('Alert', Alert);

  const source = `
    <Button variant="primary">Click me</Button>
    <Alert variant="info">This is an alert</Alert>
  `;
</script>

<Markdown {source} {options} />
```

### Advanced Configuration

```svelte
<script lang="ts">
  import { Markdown, MarkpageOptions, Marked } from '@markpage/svelte';
  import MathInline from './MathInline.svelte';
  import MathBlock from './MathBlock.svelte';

  function mathExtensionWithComponents() {
    return {
      extensions: [
        {
          name: 'math_inline',
          level: 'inline' as const,
          component: MathInline,
          start(src: string) { 
            const i = src.indexOf('$'); 
            return i < 0 ? undefined : i; 
          },
          tokenizer(src: string) {
            if (src.startsWith('$$')) return;
            if (!src.startsWith('$')) return;
            const end = src.indexOf('$', 1);
            if (end === -1) return;
            const raw = src.slice(0, end + 1);
            const text = src.slice(1, end).trim();
            return { type: 'math_inline', raw, text } as any;
          }
        }
      ]
    };
  }

  const markedInstance = new Marked();
  markedInstance.use(mathExtensionWithComponents());

  const options = new MarkpageOptions()
    .addCustomComponent('Button', Button)
    .extendMarkdown(mathExtensionWithComponents())
    .useMarkedInstance(markedInstance);

  const source = `
    <Button variant="primary">Click me</Button>
    Here is math: $a+b=c$
  `;
</script>

<Markdown {source} {options} />
```

### API Methods

- `addCustomComponent(name, component)`: Register a custom component for use as a tag in markdown
- `extendMarkdown(extensions)`: Register markdown extensions with their associated components
- `overrideBuiltinToken(name, component)`: Override a built-in markdown token with a custom component
- `useMarkedInstance(instance)`: Use a specific Marked instance for parsing
- `useMarkedFactory(factory)`: Use a factory function to create Marked instances
- `getComponents()`: Get the map of registered custom components
- `getExtensionComponents()`: Get the map of registered extension components
- `getMarked()`: Get the configured Marked instance

All methods return `this` for method chaining, allowing for fluent configuration.

### Overriding Built-in Tokens

You can override any built-in markdown token (like `codespan`, `heading`, `paragraph`, etc.) using the `overrideBuiltinToken` method:

```svelte
<script lang="ts">
  import { Markdown, MarkpageOptions } from '@markpage/svelte';
  import CustomCodeSpan from './CustomCodeSpan.svelte';

  const options = new MarkpageOptions()
    .overrideBuiltinToken('codespan', CustomCodeSpan);

  const source = 'Inline `code` here';
</script>

<Markdown {source} {options} />
```
