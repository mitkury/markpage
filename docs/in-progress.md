## Markpage Svelte E2E Refactor: Progress & Next Steps

### What I did
- Read project README and refactor notes; aligned with the token-based custom components approach.
- Fixed tests workspace resolution to use local packages and Svelte plugin in Vitest.
- Exposed `componentExtension` from `markpage/renderer` and verified tokenization of MDX-like tags.
- Simplified `@markpage/svelte` rendering:
  - `Markdown.svelte`: always uses a local `Marked` instance with `componentExtension` for deterministic tokens.
  - `MarkdownToken.svelte`: unified rendering path for all tokens; passes `components` down to nested tokens.
  - `MarkdownComponentTag.svelte`: minimal two-branch render for custom components:
    - If the registered component has `render()`, injects `{@html Comp.render({...}).html}`.
    - Else, mounts the Svelte component via `<svelte:component>`.
    - Children passed as both flattened text and nested tokens.
- Kept test environment browser-like (`jsdom`) with `@sveltejs/vite-plugin-svelte` configured.

### Current status
- Builder and renderer tests are green.
- One e2e test (`renderer/svelte-markdown-e2e.test.ts`) still failing at the DOM query for the custom component output.
- Tokenization is correct (component tokens present). The remaining gap is DOM injection path for SSR-style components under test.

### Next steps
1) Make `MarkdownComponentTag.svelte` output deterministic in tests:
   - Keep a single synchronous render path:
     - Prefer `render()` result when available; else `<svelte:component>`.
     - Ensure `children` text is computed from child tokens consistently.
     - Verify the `{@html ...}` branch actually injects HTML in `jsdom` (no runes reactivity around it).
2) Add missing e2e coverage once green:
   - Simple markdown rendering (headings, paragraphs, links, lists).
   - Unknown component fallback renders literal tag text.
   - Nested components with markdown children.
   - Custom `markedInstance` path works and avoids double-registration.
3) Clean up:
   - Remove any stray debug logs.
   - Keep `MarkdownToken.svelte` unified (no special-case branches) and `MarkdownComponentTag.svelte` minimal.
4) Documentation:
   - Document the custom component contract (SSR object with `render()` vs Svelte component) and how children are provided.

### Notes
- The approach avoids hacks and mirrors regular token rendering for components.
- Once the single e2e is fixed, I’ll add the extra tests and confirm full green.

