# Plugins

Extend svelte-markdown-pages functionality with plugins for custom processing, styling, and features.

## Plugin System

The plugin system allows you to extend the functionality of svelte-markdown-pages with custom processors, transformers, and utilities.

## Creating Plugins

### Basic Plugin Structure

A plugin is an object with specific methods and properties:

```typescript
interface Plugin {
	name: string;
	version: string;
	process?: (content: string) => string;
	transform?: (content: string) => string;
	validate?: (content: string) => boolean;
	beforeBuild?: () => void;
	afterBuild?: (result: any) => void;
}
```

### Simple Plugin Example

```typescript
const simplePlugin = {
	name: 'simple-plugin',
	version: '1.0.0',
	
	process(content: string): string {
		// Add custom processing
		return content.replace(/hello/g, 'Hello, World!');
	}
};

await buildDocs('./docs', {
	appOutput: './src/lib/content',
	plugins: [simplePlugin]
});
```

## Built-in Plugins

### Syntax Highlighting Plugin

Add syntax highlighting to code blocks:

```typescript
import { syntaxHighlightingPlugin } from 'svelte-markdown-pages/plugins';

await buildDocs('./docs', {
	appOutput: './src/lib/content',
	plugins: [syntaxHighlightingPlugin]
});
```

### Table of Contents Plugin

Automatically generate table of contents:

```typescript
import { tocPlugin } from 'svelte-markdown-pages/plugins';

await buildDocs('./docs', {
	appOutput: './src/lib/content',
	plugins: [tocPlugin]
});
```

### Link Validation Plugin

Validate internal and external links:

```typescript
import { linkValidationPlugin } from 'svelte-markdown-pages/plugins';

await buildDocs('./docs', {
	appOutput: './src/lib/content',
	plugins: [linkValidationPlugin]
});
```

## Custom Plugin Examples

### Admonition Plugin

Create custom admonition blocks:

```typescript
const admonitionPlugin = {
	name: 'admonition-plugin',
	version: '1.0.0',
	
	process(content: string): string {
		const admonitionTypes = ['info', 'warning', 'error', 'success'];
		
		return content.replace(
			/^:::(\w+)\n([\s\S]*?)\n:::$/gm,
			(match, type, content) => {
				if (!admonitionTypes.includes(type)) {
					return match; // Return original if type not recognized
				}
				
				const icons = {
					info: 'ℹ️',
					warning: '⚠️',
					error: '❌',
					success: '✅'
				};
				
				return `
					<div class="admonition admonition-${type}">
						<div class="admonition-header">
							${icons[type]} ${type.charAt(0).toUpperCase() + type.slice(1)}
						</div>
						<div class="admonition-content">
							${content}
						</div>
					</div>
				`;
			}
		);
	}
};
```

### Code Copy Plugin

Add copy buttons to code blocks:

```typescript
const codeCopyPlugin = {
	name: 'code-copy-plugin',
	version: '1.0.0',
	
	process(content: string): string {
		return content.replace(
			/<pre><code([^>]*)>([\s\S]*?)<\/code><\/pre>/g,
			(match, attrs, code) => {
				return `
					<div class="code-block-wrapper">
						<button class="copy-button" onclick="copyCode(this)">
							Copy
						</button>
						<pre><code${attrs}>${code}</code></pre>
					</div>
				`;
			}
		);
	}
};
```

### Image Optimization Plugin

Optimize images and add lazy loading:

```typescript
const imageOptimizationPlugin = {
	name: 'image-optimization-plugin',
	version: '1.0.0',
	
	process(content: string): string {
		return content.replace(
			/<img([^>]+)>/g,
			'<img$1 loading="lazy" decoding="async">'
		);
	}
};
```

## Advanced Plugin Features

### Plugin Configuration

Plugins can accept configuration options:

```typescript
const configurablePlugin = {
	name: 'configurable-plugin',
	version: '1.0.0',
	
	config: {
		enabled: true,
		options: {}
	},
	
	init(config: any) {
		this.config = { ...this.config, ...config };
	},
	
	process(content: string): string {
		if (!this.config.enabled) {
			return content;
		}
		
		// Apply processing based on config
		return content;
	}
};

await buildDocs('./docs', {
	appOutput: './src/lib/content',
	plugins: [
		[configurablePlugin, { enabled: true, options: { theme: 'dark' } }]
	]
});
```

### Plugin Dependencies

Plugins can depend on other plugins:

```typescript
const dependentPlugin = {
	name: 'dependent-plugin',
	version: '1.0.0',
	dependencies: ['syntax-highlighting'],
	
	process(content: string): string {
		// This plugin runs after syntax highlighting
		return content;
	}
};
```

### Plugin Hooks

Use hooks for different stages of the build process:

```typescript
const hookPlugin = {
	name: 'hook-plugin',
	version: '1.0.0',
	
	beforeBuild() {
		console.log('Starting build...');
		// Pre-build setup
	},
	
	process(content: string): string {
		// Content processing
		return content;
	},
	
	afterBuild(result: any) {
		console.log('Build completed:', result);
		// Post-build cleanup
	}
};
```

## Plugin Validation

### Content Validation

Validate content structure and format:

```typescript
const validationPlugin = {
	name: 'validation-plugin',
	version: '1.0.0',
	
	validate(content: string): boolean {
		// Check for required sections
		const hasTitle = /^#\s+.+$/m.test(content);
		const hasContent = content.length > 100;
		
		if (!hasTitle) {
			console.warn('Content missing title');
			return false;
		}
		
		if (!hasContent) {
			console.warn('Content too short');
			return false;
		}
		
		return true;
	},
	
	process(content: string): string {
		if (!this.validate(content)) {
			throw new Error('Content validation failed');
		}
		
		return content;
	}
};
```

## Plugin Utilities

### Helper Functions

Create utility functions for plugins:

```typescript
const pluginUtils = {
	extractHeadings(content: string): string[] {
		const headingRegex = /^#{1,6}\s+(.+)$/gm;
		const headings: string[] = [];
		let match;
		
		while ((match = headingRegex.exec(content)) !== null) {
			headings.push(match[1]);
		}
		
		return headings;
	},
	
	generateId(text: string): string {
		return text
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-+|-+$/g, '');
	}
};

const tocPlugin = {
	name: 'toc-plugin',
	version: '1.0.0',
	
	process(content: string): string {
		const headings = pluginUtils.extractHeadings(content);
		
		if (headings.length === 0) {
			return content;
		}
		
		const toc = headings.map(heading => {
			const id = pluginUtils.generateId(heading);
			return `- [${heading}](#${id})`;
		}).join('\n');
		
		return `## Table of Contents\n\n${toc}\n\n${content}`;
	}
};
```

## Plugin Testing

### Unit Testing Plugins

Test your plugins with unit tests:

```typescript
import { describe, it, expect } from 'vitest';

describe('Admonition Plugin', () => {
	it('should process admonition blocks', () => {
		const input = `:::info
This is an info block
:::`;
		
		const expected = `<div class="admonition admonition-info">`;
		
		const result = admonitionPlugin.process(input);
		expect(result).toContain(expected);
	});
	
	it('should handle unknown admonition types', () => {
		const input = `:::unknown
This is unknown
:::`;
		
		const result = admonitionPlugin.process(input);
		expect(result).toBe(input); // Should return original
	});
});
```

## Plugin Distribution

### Publishing Plugins

Create and publish plugins as npm packages:

```json
{
	"name": "svelte-markdown-pages-admonition",
	"version": "1.0.0",
	"description": "Admonition plugin for svelte-markdown-pages",
	"main": "dist/index.js",
	"types": "dist/index.d.ts",
	"keywords": ["svelte-markdown-pages", "plugin", "admonition"],
	"peerDependencies": {
		"svelte-markdown-pages": "^1.0.0"
	}
}
```

### Plugin Registry

Create a plugin registry for easy discovery:

```typescript
// plugins/index.ts
export { admonitionPlugin } from './admonition';
export { codeCopyPlugin } from './code-copy';
export { imageOptimizationPlugin } from './image-optimization';

// Usage
import { admonitionPlugin, codeCopyPlugin } from 'svelte-markdown-pages-plugins';

await buildDocs('./docs', {
	appOutput: './src/lib/content',
	plugins: [admonitionPlugin, codeCopyPlugin]
});
```

## Best Practices

### Plugin Development

1. **Keep plugins focused**: Each plugin should have a single responsibility
2. **Provide configuration**: Allow users to customize plugin behavior
3. **Handle errors gracefully**: Don't break the build if plugin fails
4. **Document your plugin**: Provide clear documentation and examples
5. **Test thoroughly**: Ensure your plugin works in different scenarios

### Performance Considerations

1. **Optimize processing**: Use efficient algorithms for content processing
2. **Cache results**: Cache expensive operations when possible
3. **Lazy loading**: Load heavy dependencies only when needed
4. **Memory management**: Clean up resources after processing

## Next Steps

Now that you understand plugins, explore:

- [API Reference](../api/builder.md) - Complete API documentation
- [Examples](../../packages/examples) - Working examples with plugins
- [Plugin Gallery](../../plugins) - Collection of community plugins
