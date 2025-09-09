<script lang="ts">
  import type { Snippet } from "svelte";
  let { title = '', subtitle = '', children }: { title?: string; subtitle?: string; children?: Snippet } = $props();
</script>

<div class="card" data-title={title} data-subtitle={subtitle}>
  {#if title}
    <h3 class="card-title">{title}</h3>
  {/if}
  {#if subtitle}
    <p class="card-subtitle">{subtitle}</p>
  {/if}
  {#if children}
    <div class="card-content">
      {@render children()}
    </div>
  {/if}
</div>
