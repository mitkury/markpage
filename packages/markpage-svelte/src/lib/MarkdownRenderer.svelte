<script lang="ts">
  import type { Component } from 'svelte';
  import type { ComponentNode, ParsedContent } from './types.js';
  import { ComponentParser } from './ComponentParser.js';
  import { marked } from 'marked';

  let { 
    content = '', 
    components = new Map<string, Component>(),
    enableComponents = true
  } = $props<{
    content: string;
    components: Map<string, Component>;
    enableComponents?: boolean;
  }>();

  // Event dispatcher function - emits events that parent components can listen to
  function dispatch(event: string, detail?: any) {
    // This logs the event for debugging, but in a real app the parent
    // would handle these events through their own event listeners
    console.log('Component event:', event, detail);
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

<style>
  .markdown-renderer {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    line-height: 1.6;
    color: #333;
  }

  .markdown-text { 
    margin-bottom: 1rem; 
    font-family: inherit;
  }

  .component-error {
    margin: 1rem 0;
    padding: 1rem;
    border: 2px solid #f44336;
    border-radius: 4px;
    background-color: #ffebee;
    color: #c62828;
  }
</style>