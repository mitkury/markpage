<script lang="ts">
  import MarkdownTokens from "../MarkdownTokens.svelte";
  import type { ComponentName } from "../types";
  
  let { 
    token, 
    components = new Map<ComponentName, any>(), 
    extensionComponents = new Map<string, any>(), 
    unknownToken 
  }: { 
    token: any; 
    components?: Map<ComponentName, any>; 
    extensionComponents?: Map<string, any>; 
    unknownToken?: ((token: any) => any) | undefined 
  } = $props();
</script>

<strong>
  {#if token?.tokens && token.tokens.length > 0}
    <MarkdownTokens tokens={token.tokens} {components} {extensionComponents} {unknownToken} />
  {:else}
    {token?.text ?? token?.raw ?? ''}
  {/if}
</strong>