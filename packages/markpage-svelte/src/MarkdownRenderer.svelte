<script lang="ts">
  import type { ComponentType } from 'svelte';
  import type { ComponentNode, ParsedContent } from './types.js';
  import { ComponentParser } from './ComponentParser.js';
  import { onMount } from 'svelte';

  let { 
    content = '', 
    components = new Map<string, ComponentType>(),
    enableComponents = true 
  } = $props<{
    content: string;
    components: Map<string, ComponentType>;
    enableComponents?: boolean;
  }>();

  let parsedContent: ParsedContent[] = $state([]);
  let parser: ComponentParser;

  onMount(() => {
    parser = new ComponentParser();
    updateParsedContent();
  });

  $effect(() => {
    updateParsedContent();
  });

  function updateParsedContent() {
    if (enableComponents && parser) {
      parsedContent = parser.parse(content);
    } else {
      parsedContent = [{ type: 'text', content }];
    }
  }

  function renderComponent(node: ComponentNode) {
    const Component = components.get(node.name);
    
    if (!Component) {
      // Fallback to showing the component as text
      return `<${node.name}${Object.entries(node.props).map(([k, v]) => 
        typeof v === 'boolean' ? (v ? ` ${k}` : '') : ` ${k}="${v}"`
      ).join('')}>${node.children || ''}</${node.name}>`;
    }

    // For now, we'll return a placeholder since we can't dynamically render Svelte components
    // In a real implementation, this would need to be handled differently
    return `<${node.name}${Object.entries(node.props).map(([k, v]) => 
      typeof v === 'boolean' ? (v ? ` ${k}` : '') : ` ${k}="${v}"`
    ).join('')}>${node.children || ''}</${node.name}>`;
  }
</script>

<div class="markdown-renderer">
  {#each parsedContent as item}
    {#if item.type === 'text'}
      <!-- For now, we'll just display text content as-is -->
      <!-- In a real implementation, you'd want to parse this as markdown -->
      <div class="markdown-text">{item.content}</div>
    {:else}
      <!-- Component rendering -->
      <div class="component-placeholder">
        {@html renderComponent(item.content as ComponentNode)}
      </div>
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
  }

  .component-placeholder {
    margin: 1rem 0;
    padding: 1rem;
    border: 2px dashed #ccc;
    border-radius: 4px;
    background-color: #f9f9f9;
    color: #666;
  }
</style>