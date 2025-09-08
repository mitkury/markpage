<script lang="ts">
  import { Lexer } from "marked";
  import MarkdownTokens from "./MarkdownTokens.svelte";

  let {
    source,
    components = new Map<string, any>(),
    markedInstance,
  }: {
    source: string;
    components?: Map<string, any>;
    markedInstance?: any;
  } = $props();

  let tokens = $derived.by(() => {
    // Prefer provided marked instance's lexer if available, else default Lexer
    try {
      if (markedInstance?.lexer && typeof markedInstance.lexer === "function") {
        return markedInstance.lexer(source);
      }
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
