<script lang="ts">
  import type { Snippet } from "svelte";
  let { variant = '', children }: { variant?: string; children?: Snippet } = $props();
</script>

<button data-variant={variant}>
  {#if children}
    {@render children()}
  {/if}
</button>

