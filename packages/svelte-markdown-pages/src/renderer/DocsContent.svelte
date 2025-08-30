<script lang="ts">
  let { content = null, title = undefined, loading = false, error = null } = $props<{
    content?: string | null;
    title?: string;
    loading?: boolean;
    error?: string | null;
  }>();
</script>

<div class="docs-content">
  {#if loading}
    <div class="loading">Loading...</div>
  {:else if error}
    <div class="error">Error: {error}</div>
  {:else if !content}
    <div class="empty">No content selected</div>
  {:else}
    {#if title}
      <h1>{title}</h1>
    {/if}
    <div class="content-body">
      {@html content}
    </div>
  {/if}
</div>

<style>
  .docs-content {
    flex: 1;
    padding: 2rem;
    overflow-y: auto;
  }
  
  .loading {
    text-align: center;
    padding: 2rem;
    color: #666;
  }
  
  .error {
    color: #d32f2f;
    padding: 1rem;
    background: #ffebee;
    border-radius: 4px;
    margin-bottom: 1rem;
  }
  
  .empty {
    text-align: center;
    padding: 2rem;
    color: #666;
    font-style: italic;
  }
  
  .content-body {
    line-height: 1.6;
  }
  
  .content-body h1,
  .content-body h2,
  .content-body h3,
  .content-body h4,
  .content-body h5,
  .content-body h6 {
    margin-top: 2rem;
    margin-bottom: 1rem;
  }
  
  .content-body p {
    margin-bottom: 1rem;
  }
  
  .content-body ul,
  .content-body ol {
    margin-bottom: 1rem;
    padding-left: 2rem;
  }
  
  .content-body code {
    background: #f5f5f5;
    padding: 0.2rem 0.4rem;
    border-radius: 3px;
    font-family: 'Courier New', monospace;
  }
  
  .content-body pre {
    background: #f5f5f5;
    padding: 1rem;
    border-radius: 4px;
    overflow-x: auto;
    margin-bottom: 1rem;
  }
  
  .content-body pre code {
    background: none;
    padding: 0;
  }
</style>