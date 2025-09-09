# Development Guide for @markpage/svelte

This guide explains how to develop the `@markpage/svelte` package, including how to work with local and published versions of the `markpage` dependency.

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
