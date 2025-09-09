<script lang="ts">
  import type { Token } from "markpage/marked";
  import MarkdownToken from "./MarkdownToken.svelte";
  import type { ComponentName } from "./types";

  let {
    tokens,
    components,
  }: { tokens: Token[] | null; components?: Map<ComponentName, any> } =
    $props();
</script>

{#if tokens}
  {#each tokens as token}
    <MarkdownToken {token} {components} />
  {/each}
{/if}
