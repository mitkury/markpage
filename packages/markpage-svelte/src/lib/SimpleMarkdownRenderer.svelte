<script lang="ts">
  let { content = '' } = $props<{ content: string }>();
</script>

<div class="markdown-renderer">
  <div class="markdown-text">{content}</div>
</div>

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
</style>
