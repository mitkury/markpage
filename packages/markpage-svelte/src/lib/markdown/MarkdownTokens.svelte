<script lang="ts">
  import type { Token } from "marked";
  import MarkdownToken from "./MarkdownToken.svelte";

  let { tokens, components }: { tokens: Token[] | null; components?: Map<string, any> } = $props();
</script>

{#if tokens}
  {#each tokens as token}
    <MarkdownToken {token} {components} />
  {/each}
{/if}
