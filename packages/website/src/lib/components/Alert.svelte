<script lang="ts">
  let { 
    variant = 'info',
    children 
  } = $props<{
    variant?: 'info' | 'warning' | 'error' | 'success';
    children: any;
  }>();

  const variantConfig = {
    info: { icon: 'ℹ️', class: 'alert-info' },
    warning: { icon: '⚠️', class: 'alert-warning' },
    error: { icon: '❌', class: 'alert-error' },
    success: { icon: '✅', class: 'alert-success' }
  };

  const config = variantConfig[variant];
</script>

<div class="alert {config.class}">
  <span class="alert-icon">{config.icon}</span>
  <div class="alert-content">
    {@render children()}
  </div>
</div>

<style>
  .alert {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 1rem;
    border-radius: 6px;
    margin: 1rem 0;
    border-left: 4px solid;
  }

  .alert-icon {
    font-size: 1.25rem;
    flex-shrink: 0;
    margin-top: 0.125rem;
  }

  .alert-content {
    flex: 1;
    line-height: 1.6;
  }

  .alert-content :global(p) {
    margin: 0;
  }

  .alert-content :global(ul) {
    margin: 0.5rem 0 0 0;
    padding-left: 1.5rem;
  }

  .alert-content :global(li) {
    margin: 0.25rem 0;
  }

  .alert-content :global(a) {
    color: inherit;
    text-decoration: underline;
  }

  /* Variants */
  .alert-info {
    background: #e3f2fd;
    color: #0d47a1;
    border-left-color: #2196f3;
  }

  .alert-warning {
    background: #fff3e0;
    color: #e65100;
    border-left-color: #ff9800;
  }

  .alert-error {
    background: #ffebee;
    color: #c62828;
    border-left-color: #f44336;
  }

  .alert-success {
    background: #e8f5e8;
    color: #2e7d32;
    border-left-color: #4caf50;
  }
</style>
