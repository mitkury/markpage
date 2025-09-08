<script lang="ts">
  import MarkdownTokens from "../MarkdownTokens.svelte";
  import type { ComponentName } from "../types";

  let { token, components = new Map<ComponentName, any>() }: { token: any; components?: Map<ComponentName, any> } = $props();

  function handle(event: Event, name: string) {}

  const Comp = $derived.by(() => {
    const name = token?.name ?? '';
    if (!components || !name) return null;
    try {
      // debug
      console.log('MarkdownComponentTag lookup', { name, keys: Array.from(components.keys()) });
    } catch {}
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
    if (!component) return null;
    const candidate = (component as any);
    if (typeof candidate.render === 'function') return candidate.render.bind(candidate);
    if (candidate && typeof candidate.default?.render === 'function') return candidate.default.render.bind(candidate.default);
    return null;
  }
  $effect(() => {
    try {
      console.log('MarkdownComponentTag Comp type', { name: token?.name, type: typeof Comp, hasRender: Comp && typeof (Comp as any).render });
    } catch {}
  });
  function childrenText() {
    if (!token.children) return '';
    try {
      return token.children.map((t: any) => String(t.text ?? t.raw ?? '')).join('');
    } catch (_) {
      return '';
    }
  }

</script>

{#if getRenderer(Comp)}
  {@html (() => {
    const render = getRenderer(Comp)!;
    const result = render({ ...(token.props ?? {}), children: childrenText(), childrenTokens: token.children });
    try { console.log('MarkdownComponentTag render html', { name: token.name, html: result?.html }); } catch {}
    return result?.html ?? '';
  })()}
{:else if typeof Comp === 'function'}
  {@html (() => {
    try {
      const mount = document.createElement('div');
      const instance = new (Comp as any)({ target: mount, props: { ...(token.props ?? {}), children: childrenText(), childrenTokens: token.children } });
      const html = mount.innerHTML;
      try { instance?.$destroy?.(); } catch {}
      return html;
    } catch (err) {
      try { console.warn('MarkdownComponentTag function component mount failed', err); } catch {}
      return '';
    }
  })()}
{:else}
  <!-- Fallback to literal text when unknown component -->
  <div class="component-fallback">
    &lt;{token.name}{Object.entries(token.props ?? {}).map(([k, v]) => ` ${k}="${String(v)}"`).join('')}{token.children ? `&gt;...&lt;/${token.name}&gt;` : ` /&gt;`}
  </div>
{/if}

