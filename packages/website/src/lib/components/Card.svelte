<script lang="ts">
  let { 
    title = '',
    subtitle = '',
    children,
    text
  } = $props<{
    title?: string;
    subtitle?: string;
    children?: any;
    text?: string;
  }>();
</script>

<div class="card">
  {#if title}
    <div class="card-header">
      <h3 class="card-title">{title}</h3>
      {#if subtitle}
        <p class="card-subtitle">{subtitle}</p>
      {/if}
    </div>
  {/if}
  
  <div class="card-content">
    {#if typeof text === 'string' && text}
      {@html text}
    {:else if children}
      {@render children()}
    {/if}
  </div>
</div>

<style>
  .card {
    background: white;
    border: 1px solid #e1e5e9;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    margin: 1.5rem 0;
    overflow: hidden;
    transition: box-shadow 0.2s ease;
  }

  .card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .card-header {
    padding: 1.5rem 1.5rem 0;
    border-bottom: 1px solid #f0f0f0;
    margin-bottom: 1rem;
  }

  .card-title {
    margin: 0 0 0.5rem 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: #333;
  }

  .card-subtitle {
    margin: 0;
    color: #666;
    font-size: 0.9rem;
  }

  .card-content {
    padding: 0 1.5rem 1.5rem;
    line-height: 1.6;
  }

  .card-content :global(p) {
    margin: 0 0 1rem 0;
  }

  .card-content :global(p:last-child) {
    margin-bottom: 0;
  }

  .card-content :global(ul) {
    margin: 0.5rem 0;
    padding-left: 1.5rem;
  }

  .card-content :global(li) {
    margin: 0.25rem 0;
  }

  .card-content :global(code) {
    background: #f5f5f5;
    padding: 0.125rem 0.25rem;
    border-radius: 3px;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 0.9em;
  }

  .card-content :global(pre) {
    background: #f5f5f5;
    padding: 1rem;
    border-radius: 4px;
    overflow-x: auto;
    margin: 1rem 0;
  }

  .card-content :global(pre code) {
    background: none;
    padding: 0;
  }
</style>
