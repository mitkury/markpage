<script lang="ts">
  import type { Snippet } from "svelte";
  let { variant = '', children }: { variant?: string; children?: Snippet } = $props();
</script>

<div role="alert" data-variant={variant}>
  {#if children}
    {@render children()}
  {/if}
</div>

