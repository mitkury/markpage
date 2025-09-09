<script lang="ts">
  import MarkdownToken from "../MarkdownToken.svelte";
  import type { Tokens } from "markpage";
  import type { ComponentName } from "../types";

  let { token, components = new Map<ComponentName, any>(), extensionComponents = new Map<string, any>(), unknownToken }: { token: Tokens.List; components?: Map<ComponentName, any>; extensionComponents?: Map<string, any>; unknownToken?: ((token: any) => any) | undefined } = $props();

  let component = $derived(token.ordered ? "ol" as const : "ul" as const);
</script>

<svelte:element this={component} start={token.start || 1}>
  {#each token.items as item}
    <MarkdownToken token={{ ...item }} {components} {extensionComponents} {unknownToken} />
  {/each}
</svelte:element>
