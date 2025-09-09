<script lang="ts">
  import type { Token } from "markpage";
  import MarkdownToken from "./MarkdownToken.svelte";
  import type { ComponentName } from "./types";

  let {
    tokens,
    components = new Map<ComponentName, any>(),
    extensionComponents = new Map<string, any>(),
    unknownToken,
  }: {
    tokens: Token[] | null;
    components?: Map<ComponentName, any>;
    extensionComponents?: Map<string, any>;
    unknownToken?: ((token: any) => any) | undefined;
  } = $props();
</script>

{#if tokens}
  {#each tokens as token}
    <MarkdownToken {token} {components} {extensionComponents} {unknownToken} />
  {/each}
{/if}
