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
- `markedInstance?`: Optional `Marked` instance to use instead of a local instance. If provided, the component will use this instance (with your extensions) for lexing.

Behavior:
- Built-in markdown tokens resolve to: `components.get(type)` → default renderer → fallback warn.
- MDX-like tokens resolve via `components.get(name)`; if missing, render a textual fallback (`<Tag .../>`).
- Naming: built-in token types are lowercase (e.g., `paragraph`, `link`). Custom components must be Capitalized (MDX-style), e.g., `Button`, `AlertBanner`.

Marked usage:
- If `markedInstance` is provided, it will be used (instance-scoped extensions supported).
- Else, a local `Marked` instance is created inside `Markdown.svelte` and configured.

### Core (current state and exports)
- We now expose a browser-safe subpath for marked via `markpage/marked`.
- Consumers (including `@markpage/svelte`) should import `Marked`, `Lexer`, and types from `markpage/marked` for clarity and stability.

```ts
import { Marked, Lexer, type Tokens, type Token } from 'markpage/marked';
import { componentExtension } from 'markpage/renderer';
```

This keeps `import 'markpage'` browser-safe by not coupling app code to Node-only builder/CLI internals.

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

---

## Current state (implemented now)
- `@markpage/svelte` has a token-based renderer in `markdown/Markdown.svelte` and token components in `markdown/markdown-components/*`.
- It imports `Marked`/`Lexer` and token types from `markpage/marked` (new subpath) for clarity.
- The custom component tokenizer (`componentExtension`) is used via `markpage/renderer` and applied to a local `Marked` instance inside `Markdown.svelte` when `markedInstance` is not provided.
- Vitest config in tests enables the Svelte plugin so `.svelte` under `@markpage/svelte` compiles during tests.

## Gaps to address next
- Test environment error: Svelte lifecycle (`mount`) unavailable in SSR path. Ensure tests render in a client-like environment (adjust `@testing-library/svelte` usage and/or environment config for Svelte 5 client rendering).
- Fallback rendering for unknown custom components should be verified (Text fallback `<Tag .../>`).
- Ensure paired component children flow through `MarkdownTokens` correctly (nesting, multiple children types).
- Confirm that providing a `markedInstance` with pre-configured `componentExtension` works and bypasses local configuration.
- Verify type exports through `markpage/marked` in consumer TS projects (types and imports resolve cleanly).

## E2E test plan (what to add/fix)
- Custom components render
  - Input: `<Button variant="primary">Click</Button>`; Expect: `<button data-variant="primary">Click</button>` with text.
- Alert component
  - Input: `<Alert variant="info">Info message</Alert>`; Expect: `<div role="alert" data-variant="info">Info message</div>`.
- Fallback for unknown component
  - Input: `<Unknown x="1"/>`; Expect: literal output, not an HTML element (e.g., text containing `<Unknown x="1"/>`).
- Nested components and markdown children
  - Input: `<Alert variant="warning">Hello <Button variant="primary"/> world</Alert>`; Expect nested rendering with correct structure and text order.
- Provided marked instance
  - Use a `Marked` instance passed via `markedInstance` pre-configured with `componentExtension`; Expect identical rendering pathway and no double-registration errors.

## Rollout
- Keep the token path as default in Svelte; maintain back-compat via placeholder approach if necessary.
- Keep `markpage/marked` as the single public surface for marked usage in Markpage consumers.

## Risks and Mitigations
- Regex complexity in tokenizer: keep grammar simple to reduce ambiguity.
- Ambiguity with HTML: run the component tokenizer before generic HTML tokenizer; Capitalized names avoid clashes with HTML.
- Test stability: ensure client render path in tests to avoid SSR lifecycle errors.

---

## Implementation Notes (sketch)
- marked extension with `level: 'inline'`, `start()` hint via `/<[A-Z]/`, self/paired regex, and `Lexer` recursion for children.
- Svelte renderer adds a `component` mapping in `MarkdownToken.svelte` and a `MarkdownComponentTag.svelte` with fallback.


