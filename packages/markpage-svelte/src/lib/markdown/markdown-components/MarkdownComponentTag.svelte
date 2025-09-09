<script lang="ts">
  import MarkdownTokens from "../MarkdownTokens.svelte";
  import type { ComponentName } from "../types";

  let { token, components = new Map<ComponentName, any>() }: { token: any; components?: Map<ComponentName, any> } = $props();

  function handle(event: Event, name: string) {}

  const Comp = $derived.by(() => {
    const name = token?.name ?? '';
    if (!components || !name) return null;
    const direct = components.get(name);
    if (direct) return direct;
    // Fallback: case-insensitive resolution for convenience in tests/usages
    const lower = String(name).toLowerCase();
    for (const [key, value] of components) {
      if (String(key).toLowerCase() === lower) return value;
    }
    return null;
  });
  function getRenderer(component: any): null | ((props: any) => { html?: string }) {
    // In Svelte 5, components are no longer classes with .render() method
    // We should use <svelte:component> instead
    return null;
  }
  function childrenText() {
    if (!token.children) return '';
    try {
      return token.children.map((t: any) => String(t.text ?? t.raw ?? '')).join('');
    } catch (_) {
      return '';
    }
  }

</script>

{#if Comp && typeof Comp === 'function'}
  {@const Component = Comp}
  <Component
    {...token.props}
    onclick={(e: Event) => handle(e, token.name)}
    onsubmit={(e: Event) => handle(e, token.name)}
    onchange={(e: Event) => handle(e, token.name)}
    childrenTokens={token.children}
  >
    {#if token.children}
      <MarkdownTokens tokens={token.children} {components} />
    {/if}
  </Component>
{:else}
  <!-- Fallback to literal text when unknown component -->
  <div class="component-fallback">
    &lt;{token.name}{Object.entries(token.props ?? {}).map(([k, v]) => ` ${k}="${String(v)}"`).join('')}{token.children ? `&gt;...&lt;/${token.name}&gt;` : ` /&gt;`}
  </div>
{/if}

