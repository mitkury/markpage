<script lang="ts">
  import MarkdownTokens from "../MarkdownTokens.svelte";
  let { token, components = new Map(), extensionComponents = new Map(), unknownToken }: { token: any; components?: Map<string, any>; extensionComponents?: Map<string, any>; unknownToken?: ((token: any) => any) | undefined } = $props();
</script>

<p>
  {#if token?.tokens && token.tokens.length > 0}
    <MarkdownTokens tokens={token.tokens} {components} {extensionComponents} {unknownToken} />
  {:else}
    {token?.text ?? token?.raw ?? ''}
  {/if}
</p>
