<script lang="ts">
  import MarkdownTokens from "../MarkdownTokens.svelte";
  let { token, components = new Map() }: { token: any; components?: Map<string, any> } = $props();
</script>

{#if token?.tokens && token.tokens.length > 0}
  <MarkdownTokens tokens={token.tokens} {components} />
{:else}
  {token?.text ?? token?.raw ?? ''}
{/if}
