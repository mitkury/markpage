<script lang="ts">
  import type { ComponentType } from 'svelte';
  import type { ComponentNode, ParsedContent } from './types.js';
  import { ComponentParser } from './ComponentParser.js';
  import { onMount } from 'svelte';
  import { createEventDispatcher } from 'svelte';

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
  const dispatch = createEventDispatcher();

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

  function handleComponentEvent(event: CustomEvent, componentName: string) {
    dispatch('componentEvent', {
      component: componentName,
      event: event.detail
    });
  }

  // Simple markdown to HTML conversion (basic implementation)
  function markdownToHtml(markdown: string): string {
    // This is a very basic implementation - in production you'd want a proper markdown parser
    return markdown
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
      .replace(/^\- (.*$)/gim, '<li>$1</li>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/^(.+)$/gm, '<p>$1</p>')
      .replace(/<p><\/p>/g, '')
      .replace(/<p>(<h[1-6]>.*<\/h[1-6]>)<\/p>/g, '$1')
      .replace(/<p>(<li>.*<\/li>)<\/p>/g, '<ul>$1</ul>');
  }

  // Create a children function that renders markdown
  function createChildrenFunction(markdown: string) {
    return () => {
      const html = markdownToHtml(markdown);
      return html;
    };
  }
</script>

<div class="markdown-renderer">
  {#each parsedContent as item, index}
    {#if item.type === 'text'}
      <!-- Render text content as markdown -->
      <div class="markdown-text">
        {@html markdownToHtml(item.content)}
      </div>
    {:else}
      <!-- Dynamic component rendering -->
      {#if components.has(item.content.name)}
        {@const Component = components.get(item.content.name)!}
        {@const node = item.content as ComponentNode}
        <!-- In Svelte 5, we can render components directly -->
        {#if node.children}
          <Component {...node.props} on:click={(e) => handleComponentEvent(e, node.name)} on:submit={(e) => handleComponentEvent(e, node.name)} on:change={(e) => handleComponentEvent(e, node.name)} children={createChildrenFunction(node.children)}>
            <!-- The component will handle rendering children -->
          </Component>
        {:else}
          <Component {...node.props} on:click={(e) => handleComponentEvent(e, node.name)} on:submit={(e) => handleComponentEvent(e, node.name)} on:change={(e) => handleComponentEvent(e, node.name)} />
        {/if}
      {:else}
        <!-- Fallback for unregistered components -->
        <div class="component-error">
          <strong>Component '{item.content.name}' not found</strong>
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
  }

  .component-error {
    margin: 1rem 0;
    padding: 1rem;
    border: 2px solid #f44336;
    border-radius: 4px;
    background-color: #ffebee;
    color: #c62828;
  }

  .component-error strong {
    display: block;
    margin-bottom: 0.5rem;
  }

  .component-error p {
    margin: 0;
    font-size: 0.9rem;
  }
</style>