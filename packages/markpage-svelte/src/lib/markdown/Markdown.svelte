<script lang="ts">
  import { Lexer, Marked } from "markpage/marked";
  import MarkdownTokens from "./MarkdownTokens.svelte";
  import type { ComponentName } from "./types";
  import { componentExtension } from "markpage/renderer";

  let {
    source,
    components = new Map<ComponentName, any>(),
    markedInstance,
  }: {
    source: string;
    components?: Map<ComponentName, any>;
    markedInstance?: any;
  } = $props();

  let tokens = $derived.by(() => {
    // Prefer provided marked instance's lexer if available, else default Lexer
    try {
      if (markedInstance?.lexer && typeof markedInstance.lexer === "function") {
        return markedInstance.lexer(source);
      }
      // If no instance provided, use a local Marked instance with componentExtension
      const md = new Marked();
      // Cast to any to avoid type mismatch between different marked versions
      md.use({ extensions: [componentExtension as any] as any });
      return md.lexer(source);
    } catch (_) {
      // fall back to default lexer
    }

    const lexer = new Lexer();
    return lexer.lex(source);
  });
</script>

<div class="markdown">
  <MarkdownTokens {tokens} {components} />
</div>
