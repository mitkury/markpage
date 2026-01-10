import { marked } from 'marked';
import { createComponentExtension, createInlineComponentExtension } from 'markpage';

let didApplyBuiltins = false;

/**
 * Server-safe convenience: returns a Marked-like instance with Markpage's
 * component parsing extensions applied.
 *
 * Note: intentionally does NOT call `new Marked()`; uses the `marked` singleton
 * to avoid constructor/init-order issues in some SSR bundles (e.g. Amplify
 * Hosting Compute).
 */
export function newMarked() {
  if (!didApplyBuiltins) {
    const blockExt = createComponentExtension();
    const inlineExt = createInlineComponentExtension();
    marked.use({ extensions: [blockExt as any, inlineExt as any] as any } as any);
    didApplyBuiltins = true;
  }

  return marked as any;
}

