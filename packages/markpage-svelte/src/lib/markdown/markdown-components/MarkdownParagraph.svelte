<script lang="ts">
  import type { Snippet } from "svelte";
  let { token, children }: { token: any; children?: Snippet } = $props();
  const text = $derived(() => String(token?.text ?? token?.raw ?? ''));
  const hasChildren = $derived(() => typeof children === 'function');
</script>

<p>
  {#if hasChildren}
    {@render children?.()}
  {:else}
    {text}
  {/if}
</p>
