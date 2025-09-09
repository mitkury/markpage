### Proposal: MarkpageOptions setup for components and Markdown extensions

#### Problem
Today, `Markdown` can be extended via `components`, `extensionComponents`, and a provided `markedInstance`. This is flexible but spreads configuration across props and userland code, making reuse and app-wide defaults harder.

#### Goals
- Provide a single, ergonomic setup object to configure:
  - Component tags (MDX-like) by name
  - Markdown token extensions (tokenizer + renderer mapping)
  - Optional custom `Marked` instance (or factory)
- Keep defaults simple: `<Markdown source={...} />` should work with no setup.
- Maintain backward compatibility with existing props where possible.

#### API Sketch
```ts
// App/setup code (framework-agnostic)
import { MarkpageOptions } from '@markpage/svelte';

const options = new MarkpageOptions();

// 1) Component tags (user-authored <Tag/>)
options.addCustomComponent('Button', ButtonComponent);

// 2) Markdown extensions (parser-emitted tokens)
// Require a modified Marked extension format: each extension item includes `component`.
// This removes any need for separate token→component mapping.

function mathExtensionWithComponents() {
  return {
    extensions: [
      {
        name: 'math_block',
        level: 'block' as const,
        component: MathBlockComponent,
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
        component: MathInlineComponent,
        start(src: string) { const i = src.indexOf('$'); return i < 0 ? undefined : i; },
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

function calloutExtensionWithComponent() {
  return {
    extensions: [
      {
        name: 'callout',
        level: 'block' as const,
        component: CalloutComponent,
        // tokenizer(...)
      }
    ]
  };
}

// Register one or many extension sets in a single call
options.extendMarkdown([mathExtensionWithComponents(), calloutExtensionWithComponent()]);

// 3) Optional: provide a Marked instance (or factory)
options.useMarkedInstance(marked);       // or
options.useMarkedFactory(() => newMarked());
```

Usage in Svelte:
```svelte
<script lang="ts">
  import { Markdown, MarkpageOptions } from '@markpage/svelte';
  export let source: string;
  const options = new MarkpageOptions()
    .addCustomComponent('Alert', Alert)
    .extendMarkdown([
      mathExtensionWithComponents()
    ]);
</script>

<Markdown {source} {options} />
```

#### Behavior
- Default path: If `options` is not provided, `Markdown` renders using built-ins only (no extra extensions/components).
- With `options`:
  - Component tags map to `components` in the renderer.
  - Token renderers map to `extensionComponents` in the renderer.
  - A provided Marked instance/factory is used for lexing; otherwise a default is used (with builtin component tag extension only if requested by options).

#### Class Design (minimal)
```ts
class MarkpageOptions {
  addCustomComponent(name: string, component: any): this;
  // Accept one or many modified Marked extension sets that include `component`
  extendMarkdown(ext: any | any[]): this;
  useMarkedInstance(instance: any): this;
  useMarkedFactory(factory: () => any): this;

  // Internal getters used by Markdown.svelte
  getComponents(): Map<string, any>;
  getExtensionComponents(): Map<string, any>;
  getMarked(): any; // returns configured instance or factory-created instance
}
```

#### Rendering Flow (Markdown.svelte)
- If `options` provided:
  - Resolve `md` via `options.getMarked()`
  - Apply all registered extensions exactly once to `md`
  - Pass `options.getComponents()` as `components`
  - Pass `options.getExtensionComponents()` as `extensionComponents`
- Else (no options): use a simple default `Marked` instance (no extra extensions/components).

Resolution order for tokens remains:
1. `extensionComponents` (from options)
2. Built-in components
3. `unknownToken` fallback

#### Backward Compatibility
- Keep existing `components`, `extensionComponents`, `markedInstance`, `unknownToken` props working.
- If `options` is provided, it takes precedence; individual props may still augment/override, but the recommended path is to use `options` exclusively to avoid ambiguity.

#### Examples
- Basic:
```svelte
<Markdown source={md} />
```

- With setup:
```ts
const options = new MarkpageOptions()
  .addCustomComponent('Card', Card)
  .extendMarkdown(calloutExtensionWithComponent());
```
```svelte
<Markdown {source} {options} />
```

#### Testing
- Add tests covering:
  - Options-only setup renders tags and custom tokens
  - Options + props precedence/merging
  - Reusing the same `options` across multiple `Markdown` instances

#### Open Questions
- Should options be immutable after first use? (could prevent accidental runtime mutation). Initial proposal allows chaining and later reuse.
- Context API alternative: Provide `setContext('markpage', options)` as a global default. Initial proposal keeps explicit prop to avoid hidden state.

#### Migration
- No breaking changes. Current users can continue using props. New users get a single setup object for clarity and reuse.


