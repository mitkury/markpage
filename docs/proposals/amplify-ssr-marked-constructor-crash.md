# Incident Note: Amplify SSR crash (`B is not a constructor`) when rendering `@markpage/svelte`

## Summary

On AWS Amplify Hosting **WEB_COMPUTE** (SvelteKit SSR runtime), pages that rendered `@markpage/svelte`’s `<Markdown />` component started returning **HTTP 500** with a runtime error:

- `TypeError: B is not a constructor`

This affected routes like `/v1/.../` while SvelteKit `__data.json` endpoints could still return `200`.

## Environment

- **Hosting**: AWS Amplify Hosting Compute (SSR), platform `WEB_COMPUTE`
- **Framework**: SvelteKit SSR
- **Runtime**: Node.js (Lambda-like)
- **Affected package**: `@markpage/svelte` (0.1.x line)

## Regression window

- **Last known good**: `@markpage/svelte@0.0.10` (worked on Amplify SSR)
- **First known bad**: `@markpage/svelte@0.1.3` (crashed on Amplify SSR)

## What actually failed

The SSR stack trace showed the failure happening inside `@markpage/svelte`’s default Marked construction path:

- `newMarked()` → `MarkpageOptions.getMarked()` → `Markdown(...)`

In the deployed SSR bundle, the `Marked` constructor was minified to an identifier like `B`, and the crash was:

- `new B()` → `TypeError: B is not a constructor`

## Root cause (high-level)

This was not “Marked doesn’t work on backends” (it does). The issue was **SSR bundling / module initialization ordering** in the Amplify compute environment:

- The SvelteKit SSR bundle inlined `marked` in a way that can delay initialization of the `Marked` class export.
- When `@markpage/svelte` invoked `new Marked()` during SSR, the symbol existed but was **not yet constructible** at that moment.
- Result: `TypeError: <identifier> is not a constructor`.

This became visible after the 0.1.x refactor because we centralized default Marked setup into `newMarked()` / `MarkpageOptions.getMarked()`, changing when and where Marked is constructed in the SSR bundle.

## Fix

We changed the default path to **avoid calling `new Marked()`** in SSR-sensitive code:

- Introduced a server-safe `newMarked()` that uses the `marked` singleton (`import { marked } from 'marked'`) and registers Markpage’s extensions once via `marked.use(...)`.
- Wired `MarkpageOptions.getMarked()` to use that server-safe `newMarked()` by default.
- Exposed `MarkpageOptions` + `newMarked` from `@markpage/svelte/server` (no `.svelte` imports) for SSR-only usage.

Published as:

- **`@markpage/svelte@0.1.5`** (fix release)

## Notes / guidance

- If you are deploying SvelteKit SSR to Amplify Hosting Compute (or similar SSR bundling environments), prefer `@markpage/svelte@>=0.1.5`.
- If you provide a custom Marked instance/factory via `MarkpageOptions.useMarkedInstance(...)` / `useMarkedFactory(...)`, ensure your instance is created in a way compatible with your SSR bundler.

