# Plugins

Extend svelte-markdown-pages with custom plugins.

## Creating Plugins

Plugins allow you to:

- Transform content
- Add custom syntax
- Integrate with external services
- Extend the build process

## Plugin API

```typescript
interface Plugin {
  name: string;
  process(content: string): string;
  transform?(navigation: NavigationTree): NavigationTree;
}
```

## Example Plugin

Here's a simple plugin that adds syntax highlighting:

```typescript
const syntaxHighlightingPlugin: Plugin = {
  name: 'syntax-highlighting',
  
  process(content: string): string {
    // Add syntax highlighting classes
    return content.replace(
      /```(\w+)\n([\s\S]*?)```/g,
      (match, lang, code) => {
        return `\`\`\`${lang} hljs\n${code}\`\`\``;
      }
    );
  }
};
```

## Table of Contents Plugin

```typescript
const tocPlugin: Plugin = {
  name: 'table-of-contents',
  
  process(content: string): string {
    const headings = content.match(/^#{1,6}\s+(.+)$/gm) || [];
    
    if (headings.length === 0) return content;
    
    const toc = headings.map(heading => {
      const level = heading.match(/^(#{1,6})/)[0].length;
      const text = heading.replace(/^#{1,6}\s+/, '');
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      
      return `${'  '.repeat(level - 1)}- [${text}](#${id})`;
    }).join('\n');
    
    return `## Table of Contents\n\n${toc}\n\n---\n\n${content}`;
  }
};
```

## Navigation Plugin

```typescript
const navigationPlugin: Plugin = {
  name: 'navigation-enhancer',
  
  transform(navigation: NavigationTree): NavigationTree {
    // Add metadata to navigation items
    const enhanceItems = (items: NavigationItem[]): NavigationItem[] => {
      return items.map(item => ({
        ...item,
        metadata: {
          lastModified: new Date().toISOString(),
          wordCount: item.path ? getWordCount(item.path) : 0
        },
        items: item.items ? enhanceItems(item.items) : undefined
      }));
    };
    
    return {
      ...navigation,
      items: enhanceItems(navigation.items)
    };
  }
};
```

## Using Plugins

```typescript
import { buildDocs } from 'svelte-markdown-pages/builder';

const result = await buildDocs('./content', {
  appOutput: './src/lib/content',
  plugins: [syntaxHighlightingPlugin, tocPlugin, navigationPlugin]
});
```

## Plugin Configuration

Plugins can accept configuration:

```typescript
interface PluginConfig {
  [key: string]: any;
}

interface Plugin {
  name: string;
  config?: PluginConfig;
  process(content: string): string;
  transform?(navigation: NavigationTree): NavigationTree;
}

const configurablePlugin: Plugin = {
  name: 'configurable',
  config: {
    highlightLanguages: ['javascript', 'typescript', 'svelte'],
    tocDepth: 3
  },
  
  process(content: string): string {
    // Use this.config to access configuration
    return content;
  }
};
```

## Built-in Plugins

svelte-markdown-pages comes with several built-in plugins:

- **Markdown**: Basic markdown processing
- **Code Highlighting**: Syntax highlighting for code blocks
- **Links**: Internal and external link processing
- **Images**: Image optimization and processing

## Plugin Ecosystem

The plugin system is designed to be extensible. You can:

- Share plugins as npm packages
- Create plugin collections
- Build custom build tools
- Integrate with existing markdown ecosystems

Next: Explore the [API Reference](../api/builder.md) for more details.
