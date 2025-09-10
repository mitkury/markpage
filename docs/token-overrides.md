# Token Overrides and Extensions

Learn how to override built-in markdown tokens and create new markdown syntax with custom components.

## Overview

With `@markpage/svelte`, you can:

- **Override built-in tokens** (like `paragraph`, `heading`, `list`, etc.) with custom components
- **Create new markdown syntax** with custom extensions (like LaTeX math, syntax highlighting, etc.)

## Overriding Built-in Tokens

### Basic Token Override

Override any built-in markdown token with a custom component:

**CustomCodeSpan.svelte:**
```svelte
<script>
  export let token;
</script>

<code class="custom-code" data-overridden="true">
  {token.text}
</code>

<style>
  .custom-code {
    background: #f1f3f4;
    padding: 2px 6px;
    border-radius: 3px;
    font-family: 'Monaco', 'Menlo', monospace;
    font-size: 0.9em;
    color: #d73a49;
  }
</style>
```

**Usage:**
```svelte
<script>
  import { Markdown, MarkpageOptions } from '@markpage/svelte';
  import CustomCodeSpan from './CustomCodeSpan.svelte';

  const options = new MarkpageOptions()
    .overrideBuiltinToken('codespan', CustomCodeSpan);

  const source = `
Here is some \`inline code\` with custom styling!
  `;
</script>

<Markdown {source} {options} />
```

### Available Built-in Tokens

You can override any of these built-in tokens:

- `heading` - Headers (# ## ###)
- `paragraph` - Paragraphs
- `list` - Lists
- `list_item` - List items
- `blockquote` - Blockquotes
- `code` - Code blocks
- `codespan` - Inline code
- `link` - Links
- `image` - Images
- `strong` - Bold text
- `em` - Italic text
- `hr` - Horizontal rules
- `table` - Tables
- `table_row` - Table rows
- `table_cell` - Table cells

### Custom Heading Component

**CustomHeading.svelte:**
```svelte
<script>
  export let token;
  
  // Generate a unique ID for the heading
  const id = token.text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
</script>

<h{token.depth} id={id} class="custom-heading">
  <a href="#{id}" class="heading-link">
    {token.text}
  </a>
</h{token.depth}>

<style>
  .custom-heading {
    position: relative;
    margin: 2em 0 1em 0;
    color: #2c3e50;
  }
  
  .heading-link {
    text-decoration: none;
    color: inherit;
  }
  
  .heading-link:hover::before {
    content: '#';
    position: absolute;
    left: -1.5em;
    color: #3498db;
  }
</style>
```

**Usage:**
```svelte
<script>
  import { Markdown, MarkpageOptions } from '@markpage/svelte';
  import CustomHeading from './CustomHeading.svelte';

  const options = new MarkpageOptions()
    .overrideBuiltinToken('heading', CustomHeading);

  const source = `
# Custom Heading with Link
## Another Heading
### Third Level Heading
  `;
</script>

<Markdown {source} {options} />
```

## Creating Markdown Extensions

Extensions let you add completely new markdown syntax with custom components.

### LaTeX Math Extension

Create a math extension that supports both inline and block math:

**MathInline.svelte:**
```svelte
<script>
  export let token;
</script>

<span class="math-inline" data-math="inline">
  {token.text}
</span>

<style>
  .math-inline {
    background: #f8f9fa;
    padding: 2px 4px;
    border-radius: 3px;
    font-family: 'Times New Roman', serif;
    font-style: italic;
  }
</style>
```

**MathBlock.svelte:**
```svelte
<script>
  export let token;
</script>

<div class="math-block" data-math="block">
  {token.text}
</div>

<style>
  .math-block {
    background: #f8f9fa;
    padding: 16px;
    border-radius: 8px;
    margin: 16px 0;
    text-align: center;
    font-family: 'Times New Roman', serif;
    font-size: 1.1em;
  }
</style>
```

**Extension Definition:**
```svelte
<script>
  import { Markdown, MarkpageOptions } from '@markpage/svelte';
  import MathInline from './MathInline.svelte';
  import MathBlock from './MathBlock.svelte';

  function mathExtension() {
    return {
      extensions: [
        {
          name: 'math_block',
          level: 'block',
          component: MathBlock,
          start(src) {
            const i = src.indexOf('$$');
            return i < 0 ? undefined : i;
          },
          tokenizer(src) {
            if (!src.startsWith('$$')) return;
            const end = src.indexOf('$$', 2);
            if (end === -1) return;
            const raw = src.slice(0, end + 2);
            const text = src.slice(2, end).trim();
            return { type: 'math_block', raw, text };
          }
        },
        {
          name: 'math_inline',
          level: 'inline',
          component: MathInline,
          start(src) {
            const i = src.indexOf('$');
            return i < 0 ? undefined : i;
          },
          tokenizer(src) {
            if (src.startsWith('$$')) return; // let block handle
            if (!src.startsWith('$')) return;
            const end = src.indexOf('$', 1);
            if (end === -1) return;
            const raw = src.slice(0, end + 1);
            const text = src.slice(1, end).trim();
            return { type: 'math_inline', raw, text };
          }
        }
      ]
    };
  }

  const options = new MarkpageOptions()
    .extendMarkdown(mathExtension());

  const source = `
Here is inline math: $E = mc^2$

And here is a block equation:

$$
\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
$$
  `;
</script>

<Markdown {source} {options} />
```

### Syntax Highlighting Extension

Create a syntax highlighting extension for code blocks:

**SyntaxHighlightedCode.svelte:**
```svelte
<script>
  export let token;
  
  // Simple syntax highlighting (you could integrate with a library like Prism.js)
  function highlightCode(code, lang) {
    if (!lang) return code;
    
    // Basic keyword highlighting
    const keywords = {
      javascript: ['function', 'const', 'let', 'var', 'if', 'else', 'for', 'while', 'return'],
      python: ['def', 'class', 'if', 'else', 'for', 'while', 'return', 'import', 'from'],
      html: ['<', '>', '</', '/>']
    };
    
    let highlighted = code;
    if (keywords[lang]) {
      keywords[lang].forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'g');
        highlighted = highlighted.replace(regex, `<span class="keyword">${keyword}</span>`);
      });
    }
    
    return highlighted;
  }
</script>

<pre class="syntax-highlighted"><code class="language-{token.lang || 'text'}">{@html highlightCode(token.text, token.lang)}</code></pre>

<style>
  .syntax-highlighted {
    background: #2d3748;
    color: #e2e8f0;
    padding: 16px;
    border-radius: 8px;
    overflow-x: auto;
    margin: 16px 0;
  }
  
  .keyword {
    color: #f687b3;
    font-weight: bold;
  }
</style>
```

**Usage:**
```svelte
<script>
  import { Markdown, MarkpageOptions } from '@markpage/svelte';
  import SyntaxHighlightedCode from './SyntaxHighlightedCode.svelte';

  const options = new MarkpageOptions()
    .overrideBuiltinToken('code', SyntaxHighlightedCode);

  const source = `
\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}

const message = greet('World');
console.log(message);
\`\`\`
  `;
</script>

<Markdown {source} {options} />
```

## Advanced: Manual Marked Instance

For advanced use cases, you can provide your own Marked instance:

```svelte
<script>
  import { Markdown, MarkpageOptions, Marked } from '@markpage/svelte';

  const markedInstance = new Marked();
  // Add custom Marked configuration
  markedInstance.setOptions({ 
    breaks: true,
    gfm: true 
  });

  const options = new MarkpageOptions()
    .addCustomComponent('Button', Button)
    .useMarkedInstance(markedInstance);

  const source = `
Line breaks are now preserved

<Button>Custom Button</Button>
  `;
</script>

<Markdown {source} {options} />
```

## Extension Structure

Extensions follow this structure:

```typescript
interface MarkdownExtension {
  name: string;                    // Token type name
  level: 'block' | 'inline';       // Block or inline level
  component: Component;            // Svelte component to render
  start(src: string): number | undefined;  // Find start position
  tokenizer(src: string): any;     // Parse the token
}
```

### Extension Methods

- **`start(src)`**: Returns the position where the extension should start parsing, or `undefined` if not found
- **`tokenizer(src)`**: Parses the token from the source string and returns a token object

### Token Object

The tokenizer should return an object with:

- `type`: The token type name (should match the extension name)
- `raw`: The raw markdown text that was parsed
- `text`: The content text (without delimiters)
- Any additional properties your component needs

## Best Practices

### 1. Keep Extensions Focused

Create extensions for specific purposes rather than trying to handle multiple syntaxes in one extension.

### 2. Handle Edge Cases

Make sure your tokenizer handles edge cases gracefully:

```javascript
tokenizer(src) {
  if (!src.startsWith('$')) return;
  const end = src.indexOf('$', 1);
  if (end === -1) return; // Handle unclosed syntax
  // ... rest of parsing
}
```

### 3. Use Semantic Names

Choose clear, descriptive names for your extensions:

```javascript
// Good
name: 'math_inline'
name: 'syntax_highlight'

// Avoid
name: 'custom1'
name: 'special'
```

### 4. Test Your Extensions

Always test your extensions with various inputs to ensure they work correctly.

## What's Next?

- **[Custom Components](custom-components.md)** - Learn how to create and use custom components
- **[Getting Started](getting-started.md)** - Back to the basics