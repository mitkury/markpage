<script lang="ts">
  import type { ComponentType } from 'svelte';
  import type { ComponentNode, ParsedContent } from './types.js';
  import { ComponentParser } from './ComponentParser.js';
  import { createEventDispatcher } from 'svelte';

  let { 
    content = '', 
    components = new Map<string, ComponentType>(),
    enableComponents = true,
    ssr = false
  } = $props<{
    content: string;
    components: Map<string, ComponentType>;
    enableComponents?: boolean;
    ssr?: boolean;
  }>();

  const dispatch = createEventDispatcher();

  // During SSR, just render text. On client, parse components
  let parsedContent = $derived(() => {
    if (!ssr && enableComponents) {
      const parser = new ComponentParser();
      return parser.parse(content);
    } else {
      return [{ type: 'text', content }];
    }
  });

  function handleComponentEvent(event: CustomEvent, componentName: string) {
    dispatch('componentEvent', {
      component: componentName,
      event: event.detail
    });
  }
</script>

{#if ssr}
  <div class="markdown-renderer">
    <div class="markdown-text">{content}</div>
  </div>
{:else}
  <div class="markdown-renderer">
    {#each parsedContent() as item, index}
      {#if item.type === 'text'}
        <div class="markdown-text">{item.content}</div>
      {:else}
        {#if components.has(item.content.name)}
          {@const Component = components.get(item.content.name)!}
          {@const node = item.content as ComponentNode}
          {#if node.children}
            <Component {...node.props} text={node.children}
              on:click={(e) => handleComponentEvent(e, node.name)}
              on:submit={(e) => handleComponentEvent(e, node.name)}
              on:change={(e) => handleComponentEvent(e, node.name)}
            />
          {:else}
            <Component {...node.props}
              on:click={(e) => handleComponentEvent(e, node.name)}
              on:submit={(e) => handleComponentEvent(e, node.name)}
              on:change={(e) => handleComponentEvent(e, node.name)}
            />
          {/if}
        {:else}
          <div class="component-error">
            <strong>Component '{item.content.name}' not found</strong>
            <p>Available components: {Array.from(components.keys()).join(', ')}</p>
          </div>
        {/if}
      {/if}
    {/each}
  </div>
{/if}

<style>
  .markdown-renderer {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    line-height: 1.6;
    color: #333;
  }

  .markdown-text { 
    margin-bottom: 1rem; 
    white-space: pre-wrap; 
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