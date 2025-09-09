# Advanced Customization

Learn how to customize markpage for your specific needs with advanced configuration options.

## Custom Components

You can create custom components to extend the functionality of your documentation:

```svelte
<!-- src/lib/components/CustomComponent.svelte -->
<script lang="ts">
	let { content } = $props<{ content: string }>();
</script>

<div class="custom-component">
	{@html content}
</div>

<style>
	.custom-component {
		background: #f8f9fa;
		border: 1px solid #e9ecef;
		border-radius: 8px;
		padding: 1rem;
		margin: 1rem 0;
	}
</style>
```

## Custom Processors

Create custom content processors for advanced transformations:

```typescript
const customProcessor = {
	process(content: string): string {
		// Replace custom syntax with HTML
		return content
			.replace(/:::(.+?):::/g, '<CustomComponent content="$1" />')
			.replace(/\[\[(.+?)\]\]/g, '<InternalLink href="$1" />');
	}
};

await buildPages('./docs', {
  appOutput: './src/lib/content',
  processor: customProcessor
});
```

## Custom Styling

### CSS Customization

Override default styles with your own CSS:

```css
/* Custom documentation styles */
.docs-content {
	font-family: 'Inter', sans-serif;
	line-height: 1.7;
}

.docs-content h1 {
	color: #1a202c;
	border-bottom: 3px solid #3182ce;
}

.docs-content code {
	background: #edf2f7;
	color: #2d3748;
	font-weight: 500;
}

.docs-content pre {
	background: #2d3748;
	border-radius: 12px;
	box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
```

### Theme System

Create theme variations:

```typescript
const themes = {
	light: {
		background: '#ffffff',
		text: '#2d3748',
		primary: '#3182ce',
		secondary: '#718096'
	},
	dark: {
		background: '#1a202c',
		text: '#e2e8f0',
		primary: '#63b3ed',
		secondary: '#a0aec0'
	}
};
```

## Custom Navigation

### Custom Navigation Components

Create custom navigation components:

```svelte
<!-- src/lib/components/CustomSidebar.svelte -->
<script lang="ts">
	import type { NavigationItem } from 'markpage';
	
	let { items, currentPage } = $props<{
		items: NavigationItem[];
		currentPage: string;
	}>();
	
	function renderItem(item: NavigationItem): string {
		if (item.type === 'section') {
			return `
				<div class="nav-section">
					<h3 class="nav-section-title">${item.label}</h3>
					${item.items?.map(renderItem).join('') || ''}
				</div>
			`;
		}
		
		const isActive = currentPage === item.name + '.md';
		return `
			<a href="/docs/${item.name}" class="nav-item ${isActive ? 'active' : ''}">
				${item.label}
			</a>
		`;
	}
</script>

<nav class="custom-sidebar">
	{@html items.map(renderItem).join('')}
</nav>

<style>
	.custom-sidebar {
		background: #f7fafc;
		padding: 1.5rem;
		border-right: 1px solid #e2e8f0;
	}
	
	.nav-section-title {
		font-size: 0.875rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: #718096;
		margin: 1.5rem 0 0.75rem 0;
	}
	
	.nav-item {
		display: block;
		padding: 0.5rem 0.75rem;
		color: #4a5568;
		text-decoration: none;
		border-radius: 6px;
		margin: 0.25rem 0;
		transition: all 0.2s;
	}
	
	.nav-item:hover {
		background: #edf2f7;
		color: #2d3748;
	}
	
	.nav-item.active {
		background: #3182ce;
		color: white;
	}
</style>
```

## Custom Layouts

### Page Layouts

Create different layouts for different types of content:

```svelte
<!-- src/lib/layouts/DocumentationLayout.svelte -->
<script lang="ts">
	let { children, title, sidebar } = $props<{
		children: any;
		title: string;
		sidebar: any;
	}>();
</script>

<div class="doc-layout">
	<header class="doc-header">
		<h1>{title}</h1>
	</header>
	
	<div class="doc-body">
		<aside class="doc-sidebar">
			{@render sidebar()}
		</aside>
		
		<main class="doc-content">
			{@render children()}
		</main>
	</div>
</div>

<style>
	.doc-layout {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}
	
	.doc-header {
		background: #2d3748;
		color: white;
		padding: 1rem 2rem;
	}
	
	.doc-body {
		display: flex;
		flex: 1;
	}
	
	.doc-sidebar {
		width: 280px;
		background: #f7fafc;
		border-right: 1px solid #e2e8f0;
	}
	
	.doc-content {
		flex: 1;
		padding: 2rem;
	}
</style>
```

## Custom Markdown Extensions

### Syntax Extensions

Extend markdown syntax with custom processors or token components:

```typescript
const markdownExtensions = {
	// Custom admonition blocks
	admonition: {
		pattern: /^:::(\w+)\n([\s\S]*?)\n:::$/gm,
		replacement: (match: string, type: string, content: string) => {
			const icons = {
				info: 'ℹ️',
				warning: '⚠️',
				error: '❌',
				success: '✅'
			};
			
			return `
				<div class="admonition admonition-${type}">
					<div class="admonition-header">
						${icons[type as keyof typeof icons] || '📝'} ${type.charAt(0).toUpperCase() + type.slice(1)}
					</div>
					<div class="admonition-content">
						${content}
					</div>
				</div>
			`;
		}
	},
	
	// Custom callout blocks
	callout: {
		pattern: /^\[\[(.+?)\]\]\n([\s\S]*?)\n\[\[\/\]\]$/gm,
		replacement: (match: string, title: string, content: string) => {
			return `
				<div class="callout">
					<div class="callout-title">${title}</div>
					<div class="callout-content">
						${content}
					</div>
				</div>
			`;
		}
	}
};

const processor = {
	process(content: string): string {
		let processed = content;
		
		// Apply custom extensions
		Object.values(markdownExtensions).forEach(extension => {
			processed = processed.replace(extension.pattern, extension.replacement);
		});
		
		return processed;
	}
};

```

### Rendering custom tokens in Svelte

You can render custom markdown tokens by supplying Svelte components via the `extensionComponents` prop on `Markdown`.

```svelte
<script lang="ts">
  import { Markdown, Marked } from '@markpage/svelte';
  import MathInline from '$lib/components/MathInline.svelte';
  import MathBlock from '$lib/components/MathBlock.svelte';

  // Example: add simple $...$ (inline) and $$...$$ (block) tokenizers
  function mathExtension() {
    return {
      extensions: [
        {
          name: 'math_block',
          level: 'block' as const,
          start(src: string) { const i = src.indexOf('$$'); return i < 0 ? undefined : i; },
          tokenizer(src: string) {
            if (!src.startsWith('$$')) return;
            const end = src.indexOf('$$', 2);
            if (end === -1) return;
            const raw = src.slice(0, end + 2);
            const text = src.slice(2, end).trim();
            return { type: 'math_block', raw, text } as any;
          }
        },
        {
          name: 'math_inline',
          level: 'inline' as const,
          start(src: string) { const i = src.indexOf('$'); return i < 0 ? undefined : i; },
          tokenizer(src: string) {
            if (src.startsWith('$$')) return; // let block handle
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
  markedInstance.use(mathExtension());

  const extensionComponents = new Map<string, any>([
    ['math_inline', MathInline],
    ['math_block', MathBlock]
  ]);

  export let source: string;
</script>

<Markdown {source} {markedInstance} {extensionComponents} />
```

Resolution order for a token type `t`:
- extensionComponents.get(t)
- built-in markdown component
- optional `unknownToken` fallback

To override a built-in token (e.g., `codespan`):

```svelte
<script lang="ts">
  import { Markdown } from '@markpage/svelte';
  import OverrideCodeSpan from '$lib/components/OverrideCodeSpan.svelte';

  const extensionComponents = new Map<string, any>([
    ['codespan', OverrideCodeSpan]
  ]);

  export let source = 'Inline `code` here';
</script>

<Markdown {source} {extensionComponents} />
```
```

## Custom Build Process

### Build Hooks

Add custom build hooks for advanced processing:

```typescript
const buildHooks = {
	beforeBuild: async (contentPath: string) => {
		console.log('Starting build for:', contentPath);
		// Pre-processing tasks
	},
	
	afterBuild: async (result: any) => {
		console.log('Build completed:', result);
		// Post-processing tasks
	},
	
	onError: (error: Error) => {
		console.error('Build error:', error);
		// Error handling
	}
};

await buildPages('./docs', {
  appOutput: './src/lib/content',
  hooks: buildHooks
});
```

## Performance Optimization

### Lazy Loading

Implement lazy loading for large documentation sites:

```typescript
const lazyProcessor = {
	process(content: string): string {
		// Add lazy loading attributes to images
		return content.replace(
			/<img([^>]+)>/g,
			'<img$1 loading="lazy">'
		);
	}
};
```

### Code Splitting

Split large content into smaller chunks:

```typescript
const chunkProcessor = {
	process(content: string): string {
		// Split content into sections
		const sections = content.split(/(?=^#{1,3}\s)/m);
		
		return sections.map((section, index) => {
			if (index === 0) return section;
			return `<section data-chunk="${index}">${section}</section>`;
		}).join('');
	}
};
```

## Next Steps

Now that you understand advanced customization, explore:


- [API Reference](../api/builder.md) - Complete API documentation
- [Examples](../../packages/examples) - Working examples
