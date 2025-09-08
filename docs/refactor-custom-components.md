# Refactor Proposal: Token-based Custom Components in Markdown

## Proposed API (User-Facing)

### Svelte Markdown (token renderer)
Props exposed by `Markdown.svelte` (or a higher-level wrapper):

```svelte
<script lang="ts">
  import Markdown from '@markpage/svelte/markdown/Markdown.svelte';
  import Button from './Button.svelte';
  import LinkOverride from './LinkOverride.svelte';

  // Single registry for both: built-in token overrides and custom components
  const components = new Map<
    string,
    any // Svelte component
  >([
    // Custom MDX-like components (capitalized names)
    ['Button', Button],
    // Built-in token overrides (lowercase token type names)
    ['link', LinkOverride],
  ]);

  const source = `Here is <Button variant="primary"/> and a [link](https://example.com)`;
</script>

<Markdown
  {source}
  components={components}
  onComponentEvent={(e) => console.log(e)}
/>
```

- `components?: Map<string, Component>`: Unified registry for both built-in token overrides and custom MDX-like tags.
- `onComponentEvent?`: Optional event surface for forwarding DOM/custom events from rendered components.
- `markedInstance?`: Optional marked instance to use instead of the global. If provided, the component will use this instance (with your extensions) for lexing.

Behavior:
- Built-in markdown tokens resolve to: `components.get(type)` → default renderer → fallback warn.
- MDX-like tokens resolve via `components.get(name)`; if missing, render a textual fallback (`<Tag .../>`).
- Naming: built-in token types are lowercase (e.g., `paragraph`, `link`). Custom components must be Capitalized (MDX-style), e.g., `Button`, `AlertBanner`.

Marked usage:
- If `markedInstance` is provided, it will be used (instance-scoped extensions supported).
- Else, the global `marked` (with any global extensions) is used.

### Core (optional)
If the core renderer is used directly, you can configure either the global marked or an instance:

```ts
// Option A: global
import { marked, Marked } from 'marked';
import { componentExtension } from 'markpage/renderer/extensions';
marked.use({ extensions: [componentExtension] });

// Option B: instance
const md = new Marked();
md.use({ extensions: [componentExtension] });
// pass md to the Svelte component as markedInstance
```

The public token shape for custom components is:
```ts
type ComponentToken = {
  type: 'component';
  raw: string;
  name: string;                         // e.g., 'Button'
  props: Record<string, unknown>;       // parsed from attributes
  children?: import('marked').Token[];  // tokens for paired tags
}
```

---

## Summary
Move Markpage’s component handling from HTML post-processing to a token-first pipeline powered by marked’s lexer/tokenizer. Introduce a custom `component` token that represents MDX-like tags (e.g., `<Button variant="primary" />` or `<Alert>...</Alert>`), enabling safer parsing, better nesting, and framework-agnostic rendering.
## Goals
- Parse MDX-like component tags during tokenization, not from HTML.
- Support both self-closing and paired component tags.
- Allow markdown content as children of components.
- Keep initial scope safe and deterministic (no arbitrary JS expressions in props).
- Provide an incremental migration path that doesn’t break current users.

## Non-Goals (initial phase)
- Full MDX compatibility (imports, arbitrary JS, expressions in props).
- Arbitrary JavaScript in props beyond JSON-like values.

## Approach
### 1) marked Extension: `component` token
Add a marked extension that recognizes component tags and emits tokens:

- Name rule: MDX-style — component tags must start with a capital letter: `[A-Z][A-Za-z0-9:_-]*`.
- Props:
  - `key="string"`
  - `key={json}` where the content between braces is strict JSON (numbers, booleans, null, arrays, objects, strings). No JS expressions.
- Forms:
  - Self-closing: `<Tag ... />`
  - Paired: `<Tag ...> ... </Tag>`
- Children:
  - For paired tags, the inner content is re-lexed so children are tokens (not raw strings). This allows nested markdown and components.
- Safety:
  - Extension runs after code tokenizers; do not tokenize inside code fences/spans.
  - Escaped sequences like `\<Tag />` are not tokenized (handled by marked/regex ordering).

Token shape (conceptual):
```ts
{
  type: 'component',
  raw: string,
  name: string,
  props: Record<string, unknown>,
  children?: Token[] // present only for paired tags
}
```

### 2) Rendering Options
- Option A (minimal change): Render component tokens as HTML placeholders (e.g., `<mp-component data="...">`) and let existing HTML-based component parser consume them (works with current `MarkdownRenderer.svelte`).
- Option B (preferred): Keep a token stream end-to-end. Extend the Svelte token renderer (`MarkdownToken.svelte`) with a new `component` mapping that can:
  - Look up the Svelte component from a `components: Map<string, Component>` prop.
  - Render with `{...props}`.
  - If `children` exist, render them through `MarkdownTokens` as slots/snippets.

We can ship A for quick wins and migrate to B when stable.

## API Changes
### Renderer (Svelte)
- New props in `Markdown.svelte` (and/or a higher-level wrapper):
  - `components?: Map<string, Component>`
  - `markedInstance?`
  - `onComponentEvent?: (e: { component: string; event: any }) => void` (optional)
- New Svelte component: `markdown-components/MarkdownComponentTag.svelte` to render `component` tokens, including fallbacks when a component is not registered.

### Core (builder/renderer)
- No breaking changes to `buildPages`.
- Optionally expose an opt-in flag to enable the extension at parse time if consumers use core rendering utilities.

## Security and Determinism
- Props are JSON-only within braces to avoid code execution (`{ ... }` parsed with `JSON.parse`).
- String props via quotes remain as-is.
- No evaluation of JS expressions in phase 1.

## Migration Plan
1) Introduce the marked extension.
2) Implement Option A (placeholder HTML) to keep current Svelte `MarkdownRenderer.svelte` working unchanged.
3) Add Option B (direct token rendering) in `Markdown.svelte` pipeline; add `component` mapping.
4) Transition default to Option B once parity is achieved; keep Option A for compatibility for one minor release.

## Testing Strategy
- Unit tests for tokenizer:
  - Self-closing and paired tags
  - Props parsing: quoted, braced JSON, mixed
  - Nesting of components and markdown
  - Ignoring inside code blocks and inline code
  - Escaped sequences not tokenized
- Renderer tests:
  - Component found vs fallback rendering
  - Children content rendered correctly (including nested components)
  - Event forwarding (click/submit/change) if exposed
- Integration tests in `@markpage/tests` with sample markdown files.

## Examples
### Self-closing
```markdown
Here is a button: <Button variant="primary" text="Click me" />
```
Produces a `component` token: `name=Button`, `props={ variant: "primary", text: "Click me" }`.

### Paired with markdown children
```markdown
<Alert variant="warning">
  ### Heads up
  This is an important notice with an inline <Badge text="New" />.
</Alert>
```
Produces a `component` token with `children` tokens representing the heading, paragraph, and nested `Badge` component.

## Risks and Mitigations
- Regex complexity: keep grammar simple (capitalized names, simple props) to reduce ambiguity.
- Ambiguity with HTML: run the component tokenizer before generic HTML tokenizer; Capitalized names avoid clashes with standard HTML tags.
- Performance: tokenization remains linear; nested re-lexing is limited to component inner content only.

## Rollout
- 0.x minor: ship extension off by default + Option A; gather feedback.
- Next minor: enable by default, keep compatibility flag.
- Future: consider MDX ecosystem (micromark/mdast) if full MDX is requested.

## Open Questions
- Should we allow lowercase custom tags as opt-in?
- Should `{expr}` support a limited expression grammar (e.g., booleans, numbers without braces)?
- Event surface: standardize which DOM events are forwarded by default?

## Implementation Notes (sketch)
- marked extension with `level: 'inline'`, `start()` hint via `/<[A-Z]/`, self/paired regex, and `Lexer` recursion for children.
- Svelte renderer adds a `component` mapping in `MarkdownToken.svelte` and a `MarkdownComponentTag.svelte` with fallback.


