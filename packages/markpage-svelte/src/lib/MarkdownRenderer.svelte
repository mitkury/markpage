<script lang="ts">
  import type { Component } from 'svelte';
  import type { ComponentNode, ParsedContent } from './types.js';
  import { ComponentParser } from './ComponentParser.js';
  import { marked } from 'marked';

  let { 
    content = '', 
    components = new Map<string, Component>(),
    enableComponents = true,
    onComponentEvent
  } = $props<{
    content: string;
    components: Map<string, Component>;
    enableComponents?: boolean;
    onComponentEvent?: (event: { component: string; event: any }) => void;
  }>();

  // Event dispatcher function - calls the registered event handler from parent
  function dispatch(event: string, detail?: any) {
    if (onComponentEvent) {
      onComponentEvent({
        component: event,
        event: detail
      });
    }
  }

  // Parse markdown to HTML first, then extract components
  let parsedContent = $derived(() => {
    // First convert markdown to HTML (marked returns a string, not a Promise)
    const htmlContent = marked.parse(content) as string;
    
    if (enableComponents) {
      const parser = new ComponentParser();
      return parser.parse(htmlContent);
    } else {
      return [{ type: 'text', content: htmlContent }];
    }
  });

  function handleComponentEvent(event: Event, componentName: string) {
    dispatch('componentEvent', {
      component: componentName,
      event: (event as CustomEvent).detail
    });
  }
</script>

<div class="markdown-renderer">
  {#each parsedContent() as item, index}
    {#if item.type === 'text'}
      <div class="markdown-text">{@html item.content}</div>
    {:else}
      {@const node = item.content as ComponentNode}
      {#if components.has(node.name)}
        {@const Component = components.get(node.name)!}
        {#if node.children}
          <Component {...node.props} text={node.children}
            onclick={(e: Event) => handleComponentEvent(e, node.name)}
            onsubmit={(e: Event) => handleComponentEvent(e, node.name)}
            onchange={(e: Event) => handleComponentEvent(e, node.name)}
          />
        {:else}
          <Component {...node.props}
            onclick={(e: Event) => handleComponentEvent(e, node.name)}
            onsubmit={(e: Event) => handleComponentEvent(e, node.name)}
            onchange={(e: Event) => handleComponentEvent(e, node.name)}
          />
        {/if}
      {:else}
        <div class="component-error">
          <strong>Component '{node.name}' not found</strong>
          <p>Available components: {Array.from(components.keys()).join(', ')}</p>
        </div>
      {/if}
    {/if}
  {/each}
</div>
