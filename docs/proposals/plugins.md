# Plugin System Proposal

A proposal for extending svelte-markdown-pages functionality with a plugin system for custom processing, styling, and features.

## Overview

This proposal outlines a plugin system that would allow users to extend the functionality of svelte-markdown-pages with custom processors, transformers, and utilities. The system would be designed to integrate seamlessly with the existing architecture while providing flexibility for advanced use cases.

## Current Architecture

The current implementation already supports basic content processing through the `ContentProcessor` interface:

```typescript
interface ContentProcessor {
  process(content: string): string;
}
```

This is used in the `buildDocs` and `generateStaticSite` functions to transform markdown content before it's converted to HTML.

## Proposed Plugin System

### Plugin Interface

```typescript
interface Plugin {
  name: string;
  version: string;
  description?: string;
  
  // Content processing
  process?: (content: string, context: PluginContext) => string;
  
  // Build lifecycle hooks
  beforeBuild?: (context: BuildContext) => void | Promise<void>;
  afterBuild?: (result: BuildResult, context: BuildContext) => void | Promise<void>;
  
  // Validation
  validate?: (content: string, context: PluginContext) => boolean | ValidationResult;
  
  // Configuration
  configure?: (options: Record<string, any>) => void;
}

interface PluginContext {
  filePath: string;
  fileName: string;
  navigation: NavigationTree;
  options: BuildOptions;
}

interface BuildContext {
  contentPath: string;
  options: BuildOptions;
  navigation: NavigationTree;
}

interface ValidationResult {
  valid: boolean;
  errors?: string[];
  warnings?: string[];
}
```

### Enhanced BuildOptions

```typescript
interface BuildOptions {
  appOutput?: string;
  websiteOutput?: string;
  staticOutput?: string;
  includeContent?: boolean;
  
  // Plugin system
  plugins?: Plugin[];
  pluginOptions?: Record<string, any>;
}
```

## Plugin Categories

### 1. Content Processors

Plugins that transform markdown content before HTML conversion:

```typescript
const admonitionPlugin: Plugin = {
  name: 'admonition',
  version: '1.0.0',
  description: 'Adds support for admonition blocks',
  
  process(content: string, context: PluginContext): string {
    return content.replace(
      /^:::(\w+)\n([\s\S]*?)\n:::$/gm,
      (match, type, content) => {
        const icons = {
          info: 'ℹ️',
          warning: '⚠️',
          error: '❌',
          success: '✅'
        };
        
        return `
          <div class="admonition admonition-${type}">
            <div class="admonition-header">
              ${icons[type] || '📝'} ${type.charAt(0).toUpperCase() + type.slice(1)}
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

### 2. Build Hooks

Plugins that run at specific points in the build process:

```typescript
const analyticsPlugin: Plugin = {
  name: 'analytics',
  version: '1.0.0',
  description: 'Adds analytics tracking to generated pages',
  
  beforeBuild(context: BuildContext): void {
    console.log(`Starting build for ${context.contentPath} with ${context.navigation.items.length} root items`);
  },
  
  afterBuild(result: BuildResult, context: BuildContext): void {
    console.log(`Build completed: ${result.content ? Object.keys(result.content).length : 0} pages processed`);
  }
};
```

### 3. Validators

Plugins that validate content structure and quality:

```typescript
const linkValidatorPlugin: Plugin = {
  name: 'link-validator',
  version: '1.0.0',
  description: 'Validates internal and external links',
  
  validate(content: string, context: PluginContext): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Check for broken internal links
    const internalLinks = content.match(/\[([^\]]+)\]\(([^)]+)\)/g) || [];
    for (const link of internalLinks) {
      const match = link.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (match && match[2].startsWith('./') && !match[2].includes('#')) {
        // Validate internal link exists
        // Implementation would check against navigation tree
      }
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
};
```

## Implementation Strategy

### Phase 1: Basic Plugin Support

1. **Extend BuildOptions interface** to include plugins array
2. **Modify buildDocs function** to accept and process plugins
3. **Add plugin context** to provide metadata during processing
4. **Implement basic plugin lifecycle** (beforeBuild, process, afterBuild)

### Phase 2: Advanced Features

1. **Plugin configuration system** for options and settings
2. **Plugin validation** and error handling
3. **Plugin dependencies** and ordering
4. **Plugin registry** for discovery and installation

### Phase 3: Ecosystem

1. **Built-in plugins** for common use cases
2. **Plugin documentation** and examples
3. **Plugin testing utilities**
4. **Plugin marketplace** or registry

## Built-in Plugins

### Syntax Highlighting

```typescript
const syntaxHighlightingPlugin: Plugin = {
  name: 'syntax-highlighting',
  version: '1.0.0',
  description: 'Adds syntax highlighting to code blocks',
  
  process(content: string): string {
    return content.replace(
      /```(\w+)\n([\s\S]*?)```/g,
      (match, lang, code) => {
        return `<pre><code class="language-${lang}">${code}</code></pre>`;
      }
    );
  }
};
```

### Table of Contents

```typescript
const tocPlugin: Plugin = {
  name: 'table-of-contents',
  version: '1.0.0',
  description: 'Automatically generates table of contents',
  
  process(content: string): string {
    const headings = content.match(/^(#{1,6})\s+(.+)$/gm) || [];
    if (headings.length === 0) return content;
    
    const toc = headings.map(heading => {
      const match = heading.match(/^(#{1,6})\s+(.+)$/);
      if (!match) return '';
      
      const level = match[1].length;
      const text = match[2];
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      
      return `${'  '.repeat(level - 1)}- [${text}](#${id})`;
    }).join('\n');
    
    return `## Table of Contents\n\n${toc}\n\n${content}`;
  }
};
```

## Plugin Configuration

### Global Configuration

```typescript
await buildDocs('./docs', {
  appOutput: './src/lib/content',
  plugins: [admonitionPlugin, tocPlugin],
  pluginOptions: {
    'admonition': {
      icons: { custom: '🎯' },
      styles: { theme: 'dark' }
    },
    'toc': {
      minDepth: 2,
      maxDepth: 4
    }
  }
});
```

### Plugin-Specific Configuration

```typescript
const configurablePlugin: Plugin = {
  name: 'configurable',
  version: '1.0.0',
  
  private config: Record<string, any> = {};
  
  configure(options: Record<string, any>): void {
    this.config = { ...this.config, ...options };
  },
  
  process(content: string): string {
    if (this.config.enabled === false) {
      return content;
    }
    
    // Use configuration in processing
    return content;
  }
};
```

## Plugin Development

### Plugin Structure

```
my-plugin/
├── package.json
├── src/
│   ├── index.ts
│   └── plugin.ts
├── tests/
│   └── plugin.test.ts
└── README.md
```

### Plugin Package.json

```json
{
  "name": "svelte-markdown-pages-my-plugin",
  "version": "1.0.0",
  "description": "My custom plugin for svelte-markdown-pages",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "keywords": ["svelte-markdown-pages", "plugin"],
  "peerDependencies": {
    "svelte-markdown-pages": "^1.0.0"
  },
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  }
}
```

### Plugin Testing

```typescript
import { describe, it, expect } from 'vitest';
import { myPlugin } from './plugin';

describe('My Plugin', () => {
  it('should process content correctly', () => {
    const input = 'Test content';
    const expected = 'Processed test content';
    
    const result = myPlugin.process?.(input, {
      filePath: 'test.md',
      fileName: 'test.md',
      navigation: { items: [] },
      options: {}
    });
    
    expect(result).toBe(expected);
  });
});
```

## Migration Path

### For Existing Users

The plugin system would be backward compatible:

```typescript
// Current usage continues to work
await buildDocs('./docs', {
  appOutput: './src/lib/content',
  includeContent: true
});

// New plugin usage
await buildDocs('./docs', {
  appOutput: './src/lib/content',
  includeContent: true,
  plugins: [myPlugin]
});
```

### For ContentProcessor Users

Existing `ContentProcessor` implementations could be wrapped as plugins:

```typescript
const legacyProcessor: ContentProcessor = {
  process(content: string): string {
    return content.replace(/pattern/g, 'replacement');
  }
};

const legacyPlugin: Plugin = {
  name: 'legacy-processor',
  version: '1.0.0',
  process: legacyProcessor.process
};
```

## Benefits

1. **Extensibility**: Users can add custom functionality without modifying core code
2. **Modularity**: Features can be developed and distributed independently
3. **Ecosystem**: Enables community contributions and plugin marketplace
4. **Flexibility**: Supports various use cases from simple processors to complex build tools
5. **Maintainability**: Keeps core functionality focused while allowing extensions

## Considerations

1. **Performance**: Plugin processing adds overhead to build time
2. **Complexity**: Plugin system increases API surface area
3. **Compatibility**: Need to maintain backward compatibility
4. **Security**: Plugins run with full access to build context
5. **Testing**: Plugin system needs comprehensive testing

## Next Steps

1. **Gather feedback** on the proposed interface and features
2. **Implement Phase 1** with basic plugin support
3. **Create example plugins** to validate the design
4. **Document plugin development** guidelines
5. **Establish plugin ecosystem** and distribution mechanisms

This proposal provides a foundation for a flexible and powerful plugin system while maintaining the simplicity and reliability of the current implementation.
