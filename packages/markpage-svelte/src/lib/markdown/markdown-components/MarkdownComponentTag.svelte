<script lang="ts">
  import MarkdownTokens from "../MarkdownTokens.svelte";
  import type { ComponentName } from "../types";

  let { token, components = new Map<ComponentName, any>() }: { token: any; components?: Map<ComponentName, any> } = $props();

  const Comp = $derived.by(() => {
    const name = token?.name ?? '';
    if (!components || !name) return null;
    
    // Direct lookup
    const direct = components.get(name);
    if (direct) return direct;
    
    // Fallback: case-insensitive resolution for convenience
    const lower = String(name).toLowerCase();
    for (const [key, value] of components) {
      if (String(key).toLowerCase() === lower) return value;
    }
    return null;
  });

</script>

{#if Comp && typeof Comp === 'function'}
  {@const Component = Comp}
  <Component {...token.props} childrenTokens={token.children}>
    {#if token.children}
      <MarkdownTokens tokens={token.children} {components} />
    {/if}
  </Component>
{:else}
  <div class="component-fallback">
    &lt;{token.name}{Object.entries(token.props ?? {}).map(([k, v]) => ` ${k}="${String(v)}"`).join('')}{token.children ? `&gt;...&lt;/${token.name}&gt;` : ` /&gt;`}
  </div>
{/if}

<style>
  .component-fallback {
    display: inline-block;
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 4px;
    padding: 0.25rem 0.5rem;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 0.875rem;
    color: #6c757d;
    margin: 0.25rem 0;
  }
</style>

