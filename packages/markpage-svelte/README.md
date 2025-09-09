# @markpage/svelte

Svelte integration for Markpage with component support and markdown extensions.

## Features

- **Component Registration**: Register Svelte components for use in markdown
- **Markdown Extensions**: Add custom markdown syntax with components
- **Built-in Overrides**: Override any built-in markdown token
- **SSR Support**: Full server-side rendering support for SvelteKit
- **Type Safety**: Full TypeScript support
- **Automatic Parsing**: Extensions are automatically applied to markdown parsing

## Installation

```bash
npm install @markpage/svelte
```

## Examples

### 1. Basic Markdown Rendering

Start with the simplest example - just render plain markdown:

```svelte
<script lang="ts">
  import { Markdown } from '@markpage/svelte';

  const source = `
# Hello World

This is **bold** text and this is *italic*.

- List item 1
- List item 2

[Visit our website](https://example.com)
  `;
</script>

<Markdown {source} />
```

### 2. Custom Components

Add custom Svelte components that can be used as tags in markdown:

```svelte
<script lang="ts">
  import { Markdown, MarkpageOptions } from '@markpage/svelte';
  import Button from './Button.svelte';
  import Alert from './Alert.svelte';

  const options = new MarkpageOptions()
    .addCustomComponent('Button', Button)
    .addCustomComponent('Alert', Alert);

  const source = `
# Custom Components

<Button variant="primary">Click me</Button>

<Alert variant="warning" title="Important">
  This is a warning message with **markdown** inside!
</Alert>
  `;
</script>

<Markdown {source} {options} />
```

**Button.svelte:**
```svelte
<script lang="ts">
  export let variant = 'default';
  export let size = 'medium';
  let { children } = $props();
</script>

<button class="btn btn-{variant} btn-{size}">
  {@render children()}
</button>
```

**Alert.svelte:**
```svelte
<script lang="ts">
  export let variant = 'info';
  export let title = '';
  let { children } = $props();
</script>

<div class="alert alert-{variant}">
  {#if title}<h4>{title}</h4>{/if}
  {@render children()}
</div>
```

### 3. Override Built-in Tokens

Override any built-in markdown token with your own component:

```svelte
<script lang="ts">
  import { Markdown, MarkpageOptions } from '@markpage/svelte';
  import CustomCodeSpan from './CustomCodeSpan.svelte';

  const options = new MarkpageOptions()
    .overrideBuiltinToken('codespan', CustomCodeSpan);

  const source = `
# Custom Code Styling

Here is some \`inline code\` with custom styling!
  `;
</script>

<Markdown {source} {options} />
```

**CustomCodeSpan.svelte:**
```svelte
<script lang="ts">
  export let token;
</script>

<code class="custom-code" data-overridden="true">
  {token.text}
</code>
```

### 4. Markdown Extensions (LaTeX Math)

Add completely new markdown syntax with custom components:

```svelte
<script lang="ts">
  import { Markdown, MarkpageOptions } from '@markpage/svelte';
  import MathInline from './MathInline.svelte';
  import MathBlock from './MathBlock.svelte';

  function mathExtension() {
    return {
      extensions: [
        {
          name: 'math_block',
          level: 'block' as const,
          component: MathBlock,
          start(src: string) {
            const i = src.indexOf('$$');
            return i < 0 ? undefined : i;
          },
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
          component: MathInline,
          start(src: string) {
            const i = src.indexOf('$');
            return i < 0 ? undefined : i;
          },
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

  const options = new MarkpageOptions()
    .extendMarkdown(mathExtension());

  const source = `
# Mathematical Expressions

Here is inline math: $E = mc^2$

And here is a block equation:

$$
\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
$$
  `;
</script>

<Markdown {source} {options} />
```

**MathInline.svelte:**
```svelte
<script lang="ts">
  export let token;
</script>

<span class="math-inline" data-math="inline">
  {token.text}
</span>
```

**MathBlock.svelte:**
```svelte
<script lang="ts">
  export let token;
</script>

<div class="math-block" data-math="block">
  {token.text}
</div>
```

## API Reference

### MarkpageOptions

The main configuration class for all markdown customization:

```typescript
const options = new MarkpageOptions()
  .addCustomComponent(name, component)      // Register custom component tags
  .overrideBuiltinToken(name, component)    // Override built-in tokens
  .extendMarkdown(extensions)               // Add markdown extensions
  .useMarkedInstance(instance)              // Use custom Marked instance
  .useMarkedFactory(factory);               // Use custom Marked factory
```

### Methods

- **`addCustomComponent(name, component)`**: Register a custom component for use as a tag in markdown
- **`overrideBuiltinToken(name, component)`**: Override a built-in markdown token with a custom component
- **`extendMarkdown(extensions)`**: Register markdown extensions with their associated components
- **`useMarkedInstance(instance)`**: Use a specific Marked instance for parsing
- **`useMarkedFactory(factory)`**: Use a factory function to create Marked instances

### Built-in Tokens You Can Override

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
- And more...

### Extension Format

```typescript
interface MarkdownExtension {
  name: string;                    // Token type name
  level: 'block' | 'inline';       // Block or inline level
  component: Component;            // Svelte component to render
  start(src: string): number | undefined;  // Find start position
  tokenizer(src: string): any;     // Parse the token
}
```

## Advanced Usage

### Manual Marked Instance

For advanced use cases where you need custom Marked configuration:

```svelte
<script lang="ts">
  import { Markdown, MarkpageOptions, Marked } from '@markpage/svelte';

  const markedInstance = new Marked();
  // Add custom configuration here
  markedInstance.setOptions({ breaks: true });

  const options = new MarkpageOptions()
    .extendMarkdown(myExtensions)
    .useMarkedInstance(markedInstance);
</script>

<Markdown {source} {options} />
```

### Combining All Features

```svelte
<script lang="ts">
  import { Markdown, MarkpageOptions } from '@markpage/svelte';
  import Button from './Button.svelte';
  import CustomCodeSpan from './CustomCodeSpan.svelte';
  import MathInline from './MathInline.svelte';

  const options = new MarkpageOptions()
    .addCustomComponent('Button', Button)           // Custom tags
    .overrideBuiltinToken('codespan', CustomCodeSpan) // Override built-ins
    .extendMarkdown(mathExtension());               // Add extensions
</script>

<Markdown {source} {options} />
```

## SSR Support

- Built using `@sveltejs/package` for SvelteKit compatibility
- Works in SSR; avoid direct browser globals in your components during SSR

## TypeScript Support

Full TypeScript support is included:

```typescript
import type { 
  MarkpageOptions,
  MarkdownExtension,
  MarkdownExtensionSet
} from '@markpage/svelte';
```

## Security

- Components must be registered upfront
- No arbitrary code execution
- No dynamic imports
- Component names are validated

## Performance

- Extensions are automatically applied to parsing
- Components are registered once at startup
- Efficient component lookup using Map
- No runtime compilation overhead

## Contributing

This package is part of the Markpage monorepo. See the main [README](../../README.md) for contribution guidelines.

## License

MIT License - see [LICENSE](../../LICENSE) file for details.