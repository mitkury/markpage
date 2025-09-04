## Proposal: Integrate MDX-like Component Tokens into marked for `@markpage/svelte`

### Goal
Enable `@markpage/svelte` to parse MDX-like component syntax (e.g., `<MyCard title="hello" />` or `<MyCard>...</MyCard>`) directly within the marked pipeline by introducing a tokenizer extension that emits first-class component tokens. Render these tokens via a registry-driven Svelte renderer, keeping safety and performance in mind.

### Background
`@markpage/svelte` currently parses the rendered HTML string to extract custom components. This post-processing is fragile, less performant, and risks conflicts with marked's own HTML handling. It also makes nested markdown inside custom components harder to support consistently (lists, links, math, etc.).

### Problems with the current approach
- HTML post-processing is brittle and order-dependent.
- Hard to preserve correct markdown semantics for component children.
- Security ambiguity (raw HTML vs component placeholders).
- Performance overhead due to extra DOM/string parsing.

### Proposed design
Add a marked extension that tokenizes MDX-like tags before the default `html` handling. The extension emits a `component` token with structured data for name, props, and optional child tokens. `@markpage/svelte` will then map `component` tokens to Svelte components via a registry.

Key points:
- Runs early in the tokenizer so custom tags are not consumed by `html`.
- Supports self-closing (`<MyComp ... />`) and paired (`<MyComp ...>...</MyComp>`) forms.
- Parses a safe subset of attributes (strings, numbers, booleans, and optional JSON-ish values inside `{}`) without executing code.
- Recursively lexes inner content as markdown to produce `childrenTokens`, so features like lists, links, and math work as usual.
- Respects code fences and inline code (no component parsing inside code).

### Token schema
```
type ComponentToken = Token & {
  type: 'component';
  name: string;                      // e.g., 'MyCard'
  props: Record<string, unknown>;    // parsed attributes
  childrenTokens?: Token[];          // optional, absent for self-closing
};
```

### Syntax supported
- Self-closing: `<MyCard title="hello" highlight={true} />`
- Paired with children:
  ```
  <MyCard title="hello">
  Inner markdown with lists, links, images, etc.
  </MyCard>
  ```

### Parsing/validation rules
- Component names must start with an uppercase letter: `^[A-Z][A-Za-z0-9_]*` (avoids collisions with native HTML tags).
- Attributes:
  - `key="value"` or `key='value'`
  - `key={true|false|123|"str"|[...]|{...}}` (attempt JSON.parse; fallback to string/number/bool heuristics)
  - `key` (boolean true)
- Nesting: Count depth for same-name tags to find the matching close. Different component names do not nest for closing purposes.
- Escape: A backslash before `<` (e.g., `\<MyCard ...>`) disables component parsing.
- Code blocks/inline code: Do not parse component syntax within fenced code blocks or inline code spans.

### Security considerations
- Registry allowlist: Only render components that are registered. Unknown components fall back to a placeholder or raw text rendering.
- No JS evaluation: Do not allow arbitrary expressions in `{ ... }`. Treat braces as JSON-only (or disable JSON entirely for stricter mode).
- Sanitization: Leave HTML sanitization decisions to the host (same as marked). Component tokens bypass raw HTML rendering by design.

### `@markpage/svelte` API changes
- New option on the Svelte `<Markdown>` component (or equivalent API):
  - `components?: Record<string, SvelteComponent>`
- The renderer looks up `token.name` in `components` and, if present, renders it with `{...token.props}` and `{#if token.childrenTokens}<MarkdownTokens tokens={token.childrenTokens} />{/if}` into the default slot.
- Unknown components: render a configurable fallback (e.g., raw source in `<pre>`, invisible, or a warning component).

### Extension registration
- Export `componentsInMarkdown` from `@markpage/svelte` or a subpath (e.g., `@markpage/svelte/marked-extensions`).
- Consumers register it alongside other extensions:
  ```ts
  import { marked } from 'marked';
  import { componentsInMarkdown } from '@markpage/svelte/marked-extensions';

  marked.use({ extensions: [componentsInMarkdown] });
  ```
- The `@markpage/svelte` convenience wrapper can auto-register it if desired.

### Renderer mapping (Svelte)
- Extend the token-to-component map to include `'component'` → `MarkdownComponentRenderer.svelte`.
- `MarkdownComponentRenderer.svelte`:
  - Accepts the token and a registry (via prop or Svelte context).
  - Renders the matched Svelte component or a fallback if not found.
  - Renders `childrenTokens` using the existing markdown token renderer to preserve all markdown features.

### Performance
- Fast path `start()` function in the tokenizer searches for `<[A-Z]` to skip files without components quickly.
- Avoid backtracking-heavy regex; use simple boundary checks and incremental scanning for closing tags.
- Only JSON-parse attributes when braces are present.

### Testing plan
1. Unit tests for tokenizer:
   - Self-closing and paired tags
   - Attributes (strings, numbers, booleans, JSON)
   - Unknown components
   - Nesting depth for identical names
   - Escaped `<` and code fences
   - Interaction with existing marked extensions (e.g., math/TeX)
2. Integration tests in Svelte renderer:
   - Registry resolution
   - Children markdown rendering
   - Fallback behavior
3. Fuzz tests on mixed markdown and component syntax to catch catastrophic regex behavior.

### Migration strategy
- Maintain current HTML post-processing path behind a feature flag.
- Introduce the marked-tokenizer-based path as the new default in a minor release.
- Provide a codemod/guide for consumers who rely on legacy HTML parsing side effects.

### Open questions
- Should JSON in `{}` be enabled by default or behind an option (e.g., `allowJsonProps`)?
- Do we need support for lowercase custom elements (web components)? If yes, require opt-in (to avoid collisions with native tags).
- What should the default fallback renderer do when a component is unknown?

### Minimal implementation sketch (tokenizer)
```ts
import type { Token, TokenizerExtension, RendererExtension } from 'marked';

type ComponentToken = Token & {
  type: 'component';
  name: string;
  props: Record<string, unknown>;
  childrenTokens?: Token[];
};

export const componentsInMarkdown: TokenizerExtension & RendererExtension = {
  name: 'componentsInMarkdown',
  level: 'block',
  start(src) {
    const idx = src.search(/<([A-Z][A-Za-z0-9_]*)\b/);
    return idx === -1 ? undefined : idx;
  },
  tokenizer(src) {
    const self = /^<([A-Z][A-Za-z0-9_]*)\b([^>]*)\/>/.exec(src);
    if (self) {
      const [raw, name, attrs] = self;
      return { type: 'component', raw, name, props: parseAttrs(attrs ?? '') } as ComponentToken;
    }

    const open = /^<([A-Z][A-Za-z0-9_]*)\b([^>]*)>/.exec(src);
    if (!open) return;

    const [, name, attrs] = open;
    let depth = 1;
    let i = open[0].length;
    const openRe = new RegExp(`<${name}\\b`, 'g');
    const closeRe = new RegExp(`</${name}>`, 'g');
    while (i < src.length && depth > 0) {
      const slice = src.slice(i);
      const nextOpen = openRe.exec(slice);
      const nextClose = closeRe.exec(slice);
      if (!nextClose) return; // let default html handle it
      if (nextOpen && nextOpen.index < nextClose.index) {
        depth++; i += nextOpen.index + 1;
      } else {
        depth--; i += nextClose.index + (`</${name}>`).length;
      }
    }
    if (depth !== 0) return;

    const raw = src.slice(0, i);
    const inner = src.slice(open[0].length, i - (`</${name}>`).length);
    const childrenTokens = this.lexer.lex(inner);
    return { type: 'component', raw, name, props: parseAttrs(attrs ?? ''), childrenTokens } as ComponentToken;
  },
  renderer(token) {
    return token.raw; // real rendering is handled by Svelte side
  }
};

function parseAttrs(attrs: string): Record<string, unknown> {
  const props: Record<string, unknown> = {};
  const re = /\s+([A-Za-z_][A-Za-z0-9_-]*)(?:=(?:"([^"]*)"|'([^']*)'|\{([^}]*)\}))?/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(attrs))) {
    const key = m[1];
    const v1 = m[2]; const v2 = m[3]; const v3 = m[4];
    if (v1 !== undefined) props[key] = v1;
    else if (v2 !== undefined) props[key] = v2;
    else if (v3 !== undefined) {
      try { props[key] = JSON.parse(v3); }
      catch { props[key] = v3 === 'true' ? true : v3 === 'false' ? false : (Number.isNaN(Number(v3)) ? v3 : Number(v3)); }
    } else props[key] = true;
  }
  return props;
}
```

### Outcome
This change moves component handling into the marked pipeline, producing structured tokens that integrate seamlessly with the existing markdown renderer. It improves reliability, preserves markdown semantics for component children, provides a clear security model, and reduces overall complexity in `@markpage/svelte`.


