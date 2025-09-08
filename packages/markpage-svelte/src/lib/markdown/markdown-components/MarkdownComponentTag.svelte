<script lang="ts">
  import MarkdownTokens from "../MarkdownTokens.svelte";
  import type { ComponentName } from "../types";

  let {
    token,
    components = new Map<ComponentName, any>(),
    onComponentEvent,
  }: {
    token: any;
    components?: Map<ComponentName, any>;
    onComponentEvent?: (event: { component: string; event: any }) => void;
  } = $props();

  function handle(event: Event, name: string) {
    if (onComponentEvent) {
      onComponentEvent({ component: name, event });
    }
  }

  const Comp = $derived(() => components.get(token.name) ?? null);
  try { console.log('[MarkdownComponentTag] token', token.name, 'comp?', !!Comp); } catch (_) {}
  function childrenText() {
    if (!token.children) return '';
    try {
      return token.children.map((t: any) => (t.text ?? t.raw ?? '')).join('');
    } catch (_) {
      return '';
    }
  }

  let htmlOut = $state('');
  $effect(() => {
    try {
      const renderFn = (Comp as any)?.render;
      htmlOut = typeof renderFn === 'function' ? (renderFn({ ...(token.props ?? {}), children: childrenText(), childrenTokens: token.children })?.html ?? '') : '';
    } catch (_) {
      htmlOut = '';
    }
  });
</script>

{#if Comp}
  {#if htmlOut}
    {@html htmlOut}
  {:else if typeof Comp === 'function'}
    <!-- Svelte component constructor path -->
    <svelte:component
      this={Comp}
      {...token.props}
      children={childrenText()}
      onclick={(e: Event) => handle(e, token.name)}
      onsubmit={(e: Event) => handle(e, token.name)}
      onchange={(e: Event) => handle(e, token.name)}
      childrenTokens={token.children}
    >
      {#if token.children}
        <MarkdownTokens tokens={token.children} {components} />
      {/if}
    </svelte:component>
  {:else}
    <!-- Fallback to literal text when unknown component -->
    <div class="component-fallback">
      &lt;{token.name}{Object.entries(token.props ?? {}).map(([k, v]) => ` ${k}="${String(v)}"`).join('')}{token.children ? `&gt;...&lt;/${token.name}&gt;` : ` /&gt;`}
    </div>
  {/if}
{/if}


