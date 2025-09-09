<script lang="ts">
  import type { Tokens } from "markpage";
  import type { Snippet } from "svelte";

  let {
    token,
    children,
  }: {
    token: Tokens.Link;
    children: Snippet;
  } = $props();
</script>

<a href={token.href} title={token.title}>{@render children()}</a>
