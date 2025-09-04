# Publishing @markpage/svelte Package Proposal

## Overview

This document outlines the proposal for publishing `@markpage/svelte` as a separate npm package, providing Svelte-specific integration for the Markpage markdown content management system.

## Current Status

The `@markpage/svelte` package is currently in development and provides:

- ✅ **Component System**: Embed Svelte components directly in markdown files
- ✅ **Markdown Rendering**: Integration with `marked` library for HTML conversion
- ✅ **SSR Compatibility**: Built with SvelteKit for server-side rendering support
- ✅ **Event System**: Proper event handling with `onComponentEvent` prop
- ✅ **Type Safety**: Full TypeScript support with Svelte 5 compatibility
- ✅ **Pure Components**: Unstyled components for maximum flexibility

## Package Structure

### Current Package Configuration

```json
{
  "name": "@markpage/svelte",
  "version": "0.0.1",
  "description": "Svelte integration for Markpage with component support",
  "type": "module",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "svelte": "./dist/index.js"
    },
    "./package.json": "./package.json"
  },
  "files": ["dist"],
  "dependencies": {
    "marked": "^16.2.1",
    "markpage": "file:../markpage"
  },
  "peerDependencies": {
    "svelte": "^5.0.0"
  }
}
```

### Exported Components and Utilities

1. **MarkdownRenderer**: Main Svelte component for rendering markdown with component support
2. **ComponentParser**: Utility for parsing component syntax in markdown
3. **MarkpageSvelte**: Class-based API for advanced use cases
4. **Types**: Full TypeScript definitions for all interfaces

## Publishing Strategy

### Option 1: Separate Scoped Package (Recommended)

**Pros:**
- Clear separation of concerns between core markpage and framework integrations
- Independent versioning and release cycles
- Smaller bundle sizes for users who only need Svelte integration
- Follows established patterns in the ecosystem (e.g., `@sveltejs/kit`, `@testing-library/react`)
- Easy to add other framework integrations later (React, Vue, etc.)

**Cons:**
- Additional package to maintain
- Potential confusion about which package to install

### Option 2: Integrated into Main Package

**Pros:**
- Single package to install
- Simpler for users

**Cons:**
- Larger bundle size for non-Svelte users
- More complex package structure
- Harder to maintain framework-specific code

## Recommended Approach: Separate Scoped Package

Based on analysis of popular packages in the ecosystem, the separate scoped package approach is recommended:

### Examples of This Pattern

- **Svelte Ecosystem**: `svelte` + `@sveltejs/kit` + `@sveltejs/adapter-*`
- **React Ecosystem**: `react` + `@testing-library/react` + `@types/react`
- **Vue Ecosystem**: `vue` + `@vue/cli` + `@vue/composition-api`
- **Build Tools**: `vite` + `@vitejs/plugin-react` + `@vitejs/plugin-vue`
- **UI Libraries**: `@headlessui/react` + `@headlessui/vue`

## Pre-Publishing Checklist

### 1. Package Configuration

- [x] **Package Name**: `@markpage/svelte` (scoped package)
- [x] **Version**: Start with `0.0.1` for initial release
- [x] **Exports**: Properly configured for SvelteKit compatibility
- [x] **Dependencies**: `marked` and `markpage` as dependencies
- [x] **Peer Dependencies**: `svelte ^5.0.0`
- [x] **Files**: Only include `dist` directory in published package

### 2. Build System

- [x] **SvelteKit Package**: Using `@sveltejs/package` for building
- [x] **TypeScript**: Full type definitions generated
- [x] **SSR Compatibility**: Built for server-side rendering
- [x] **Watch Mode**: Development workflow with `svelte-package --watch`

### 3. Code Quality

- [x] **Svelte 5 Compatibility**: Using modern runes API
- [x] **Type Safety**: Full TypeScript support
- [x] **Component Purity**: Unstyled components for flexibility
- [x] **Event System**: Proper external event handling
- [x] **Error Handling**: Graceful fallbacks for invalid components

### 4. Documentation

- [ ] **README**: Comprehensive usage examples
- [ ] **API Documentation**: Detailed component and utility documentation
- [ ] **Migration Guide**: If applicable
- [ ] **Examples**: Working code examples

### 5. Testing

- [ ] **Unit Tests**: Component and utility testing
- [ ] **Integration Tests**: End-to-end functionality
- [ ] **SSR Tests**: Server-side rendering compatibility
- [ ] **Type Tests**: TypeScript compilation verification

## Publishing Workflow

### 1. Initial Release (v0.0.1)

```bash
# Build the package
cd packages/markpage-svelte
npm run build

# Verify the build
ls -la dist/

# Publish to npm
npm publish --access public
```

### 2. Version Management

- **Patch releases** (0.0.x): Bug fixes, minor improvements
- **Minor releases** (0.x.0): New features, new components
- **Major releases** (x.0.0): Breaking changes, major refactors

### 3. Release Process

1. **Development**: Work on feature branch
2. **Testing**: Run full test suite
3. **Build**: Ensure clean build with no errors
4. **Version**: Update version in package.json
5. **Publish**: Run `npm publish`
6. **Documentation**: Update main README with new version

## Usage Examples

### Basic Usage

```svelte
<script>
  import { MarkdownRenderer } from '@markpage/svelte';
  import TestButton from './TestButton.svelte';
  
  const components = new Map([
    ['TestButton', TestButton]
  ]);
  
  const markdownContent = `
    # My Documentation
    
    Here's some content with a component:
    
    <TestButton variant="primary" text="Click me" />
  `;
</script>

<MarkdownRenderer 
  content={markdownContent} 
  components={components}
  enableComponents={true}
  onComponentEvent={(event) => console.log('Component event:', event)}
/>
```

### Advanced Usage

```svelte
<script>
  import { MarkpageSvelte, ComponentParser } from '@markpage/svelte';
  
  const mp = new MarkpageSvelte(navigation, content);
  mp.addComponent('Alert', AlertComponent);
  
  const parser = new ComponentParser();
  const parsed = parser.parse(markdownContent);
</script>
```

## Dependencies and Compatibility

### Required Dependencies

- **markpage**: Core markdown processing functionality
- **marked**: Markdown to HTML conversion
- **svelte**: Svelte framework (peer dependency)

### Compatibility Matrix

| Svelte Version | @markpage/svelte | Status |
|----------------|------------------|---------|
| 5.x            | 0.0.1+           | ✅ Supported |
| 4.x            | Not supported    | ❌ Legacy |

### Browser Support

- Modern browsers with ES2020 support
- Node.js 18+ for SSR
- SvelteKit 2.0+ for framework integration

## Marketing and Positioning

### Package Description

"Svelte integration for Markpage with component support - embed interactive Svelte components directly in your markdown files"

### Key Features to Highlight

1. **Component System**: MDX-like functionality for Svelte
2. **SSR Compatible**: Works with SvelteKit server-side rendering
3. **Type Safe**: Full TypeScript support
4. **Framework Agnostic Core**: Built on the flexible Markpage foundation
5. **Event System**: Proper component event handling
6. **Pure Components**: Unstyled for maximum flexibility

### Target Audience

- Svelte developers building documentation sites
- Teams using SvelteKit for content management
- Developers who want MDX-like functionality in Svelte
- Content creators who need interactive markdown

## Future Roadmap

### Short Term (v0.1.0)

- [ ] Comprehensive test suite
- [ ] Performance optimizations
- [ ] Better error messages
- [ ] Component nesting support

### Medium Term (v0.2.0)

- [ ] Plugin system for custom parsers
- [ ] Advanced component validation
- [ ] Hot reload support for development
- [ ] Performance monitoring

### Long Term (v1.0.0)

- [ ] Stable API with backward compatibility guarantees
- [ ] Advanced component features (slots, context)
- [ ] Integration with popular Svelte UI libraries
- [ ] Community ecosystem of components

## Risk Assessment

### Technical Risks

- **SSR Compatibility**: Ensure continued compatibility with SvelteKit updates
- **Performance**: Large markdown files with many components
- **Type Safety**: Maintaining TypeScript compatibility across Svelte versions

### Mitigation Strategies

- Comprehensive testing including SSR scenarios
- Performance benchmarks and optimization
- Regular updates to match Svelte ecosystem changes
- Clear migration guides for breaking changes

## Conclusion

Publishing `@markpage/svelte` as a separate scoped package is the recommended approach. This provides:

1. **Clear separation** between core functionality and framework integration
2. **Independent versioning** for faster iteration
3. **Ecosystem alignment** with established patterns
4. **Future flexibility** for additional framework integrations

The package is ready for initial release with core functionality complete. The main remaining tasks are comprehensive testing, documentation, and establishing the release workflow.

## Next Steps

1. **Complete testing suite** for all components and utilities
2. **Write comprehensive documentation** with examples
3. **Set up CI/CD pipeline** for automated testing and publishing
4. **Create initial release** (v0.0.1) to npm
5. **Gather community feedback** and iterate based on usage
6. **Plan v0.1.0** with additional features and improvements
