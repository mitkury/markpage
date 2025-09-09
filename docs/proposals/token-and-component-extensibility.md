### Proposal: Extensible token rendering and custom components in Markdown

#### Problem
Currently `@markpage/svelte` renders tokens using a fixed `markdownComponents[type]` map. This prevents rendering of new token kinds (e.g., TeX `$...$` and `$$...$$`) produced by custom tokenizers, because unknown token types have no way to supply a component.

#### Goals
- Support both:
  - Custom components embedded as tags (`<MyWidget />`) — already supported
  - Custom markdown tokens (e.g., TeX inline/block, callouts, footnotes)
- Keep the Svelte API simple and backward compatible
- Allow core or third-party plugins to add tokenizers and default renderers

#### High-level Design
1) Token extension in core (parser)
- Add a lightweight plugin API in `markpage` to register `marked` extensions (custom tokenizer/renderer).
- Ship an example plugin `@markpage/plugin-math` that recognizes `$...$` (inline) and `$$...$$` (block) and emits tokens with types `math_inline` and `math_block`.
- Token shape example:
```ts
type MathToken = {
  type: 'math_inline' | 'math_block';
  raw: string;
  text: string; // inner math content
  displayMode?: boolean; // true for block
}
```

2) Pluggable token components in `@markpage/svelte`
- Extend `Markdown` and `MarkdownToken` props to accept an optional `extensionComponents` map:
```ts
// New prop
extensionComponents?: Map<string, any>; // tokenType -> Svelte component
```
- Resolution order when rendering a token of type `t`:
  1. If `extensionComponents` has `t`, use it
  2. Else if built-in `markdownComponents` has `t`, use it
  3. Else call an optional `unknownToken` fallback; if not provided, render as plain text or log once

3) Optional fallback hook
- Add optional `unknownToken?: (token: any) => any` prop on `Markdown` to allow custom fallback rendering or logging.

4) Defaults and backwards compatibility
- If `extensionComponents` is not provided, behavior is unchanged.
- Built-in tokens continue to work with the existing mapping.
- No breaking changes to existing component embedding API (`components` for `<CustomComponent />`).

#### Example: TeX/KaTeX support
1. Install math plugin and renderer:
```bash
npm install @markpage/plugin-math katex
```

2. Enable tokenizer in build/renderer (core):
```ts
import { marked } from 'marked';
import { withMath } from '@markpage/plugin-math';
import { buildPages } from 'markpage/builder';

// Register the extension on the same marked instance you already use/pass
withMath(marked);

await buildPages('./docs', {
  appOutput: './src/lib/content',
  includeContent: true
});
```

3. Provide Svelte components for tokens:
```svelte
<!-- MathInline.svelte -->
<script lang="ts">
  import katex from 'katex';
  let { token }: { token: { text: string } } = $props();
  let html = katex.renderToString(token.text, { throwOnError: false });
</script>
<span class="math-inline" {@html html} />
```

```svelte
<!-- MathBlock.svelte -->
<script lang="ts">
  import katex from 'katex';
  let { token }: { token: { text: string } } = $props();
  let html = katex.renderToString(token.text, { displayMode: true, throwOnError: false });
</script>
<div class="math-block" {@html html} />
```

4. Wire up in `Markdown` usage:
```svelte
<script lang="ts">
  import { Markdown } from '@markpage/svelte';
  import MathInline from './MathInline.svelte';
  import MathBlock from './MathBlock.svelte';

  const extensionComponents = new Map([
    ['math_inline', MathInline],
    ['math_block', MathBlock]
  ]);

  export let source: string;
</script>

<Markdown {source} {extensionComponents} />
```

#### Minimal Svelte changes
- `Markdown.svelte` and `MarkdownToken.svelte`:
  - Accept `extensionComponents?: Map<string, any>` and optional `unknownToken?: (token:any)=>any` via props.
  - In `MarkdownToken.svelte`, resolve component with the precedence defined above.

- #### API Summary
- Core
  - Use your existing `marked` instance to register extensions before invoking Markpage APIs
  - Future: expose `registerExtension(ext: MarkedExtension)` helper
- Svelte
  - `Markdown` props: `components?: Map<ComponentName, any>`, `extensionComponents?: Map<string, any>`, `unknownToken?: (token:any)=>any`

#### Testing
- Add tests in `@markpage/tests` that:
  - Verify tokens `math_inline` and `math_block` appear from the plugin
  - Verify Svelte renderer uses `extensionComponents` over built-ins
  - Ensure no regressions for built-in tokens and `<Component />` tags

#### Open Questions
- Should we ship default math components behind an optional peer dep (`katex`)? Proposal: provide components in `@markpage/plugin-math-svelte` to avoid forcing a renderer choice.
- Do we want a global registry for token components via context? Initial proposal keeps it instance-local via props for simplicity.

#### Migration
No changes required for existing users. New capability is opt-in via `extensionComponents`. Register any extensions on the `marked` instance you already use/pass.


