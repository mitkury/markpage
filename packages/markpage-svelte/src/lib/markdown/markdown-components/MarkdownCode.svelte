<script lang="ts">
  import type { Tokens } from "markpage/marked";
  let { token }: { token: Tokens.Code } = $props();
  let lang = $derived(token.lang || "text");
</script>

<pre>
  <code class={lang ? `language-${lang}` : undefined}>{token.text}</code>
</pre>
