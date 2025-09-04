<script lang="ts">
  let { 
    variant = 'default',
    size = 'medium',
    disabled = false,
    children,
    text
  } = $props<{
    variant?: 'default' | 'primary' | 'secondary' | 'danger';
    size?: 'small' | 'medium' | 'large';
    disabled?: boolean;
    children?: any;
    text?: string;
  }>();

  const variantClasses = {
    default: 'btn-default',
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'btn-danger'
  };

  const sizeClasses = {
    small: 'btn-small',
    medium: 'btn-medium',
    large: 'btn-large'
  };
</script>

<button 
  class="btn {variantClasses[variant]} {sizeClasses[size]}"
  {disabled}
  onclick={() => !disabled && console.log('Button clicked!')}
>
  {#if typeof text === 'string' && text}
    {@html text}
  {:else if children}
    {@render children()}
  {/if}
</button>

<style>
  .btn {
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-family: inherit;
    font-weight: 500;
    transition: all 0.2s ease;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;
  }

  .btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .btn:not(:disabled):hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }

  /* Variants */
  .btn-default {
    background: #f5f5f5;
    color: #333;
    border: 1px solid #ddd;
  }

  .btn-primary {
    background: #007acc;
    color: white;
  }

  .btn-secondary {
    background: #6c757d;
    color: white;
  }

  .btn-danger {
    background: #dc3545;
    color: white;
  }

  /* Sizes */
  .btn-small {
    padding: 0.375rem 0.75rem;
    font-size: 0.875rem;
  }

  .btn-medium {
    padding: 0.5rem 1rem;
    font-size: 1rem;
  }

  .btn-large {
    padding: 0.75rem 1.5rem;
    font-size: 1.125rem;
  }
</style>
