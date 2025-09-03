<script lang="ts">
  let { 
    variant = 'default',
    text = ''
  } = $props<{
    variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
    text?: string;
  }>();

  const variantClasses: Record<string, string> = {
    default: 'test-btn-default',
    primary: 'test-btn-primary',
    success: 'test-btn-success',
    warning: 'test-btn-warning',
    danger: 'test-btn-danger'
  };
</script>

<button 
  class="test-btn {variantClasses[variant]}"
>
  {text || 'Test Button'}
</button>

<style>
  .test-btn {
    display: inline-block;
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-family: inherit;
    font-size: 1rem;
    font-weight: 500;
    text-decoration: none;
    transition: all 0.2s ease;
    margin: 0.5rem 0;
  }

  .test-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }

  .test-btn-default { background: #f5f5f5; color: #333; border: 1px solid #ddd; }
  .test-btn-primary { background: #007acc; color: white; }
  .test-btn-success { background: #28a745; color: white; }
  .test-btn-warning { background: #ffc107; color: #212529; }
  .test-btn-danger  { background: #dc3545; color: white; }
</style>