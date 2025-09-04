<script lang="ts">
  let { text = 'Button', variant = 'primary' } = $props<{ text?: string; variant?: string }>();
  
  function handleClick() {
    alert(`Button clicked! Variant: ${variant}, Text: ${text}`);
  }
</script>

<button onclick={handleClick} class="test-button" class:primary={variant === 'primary'} class:success={variant === 'success'} class:warning={variant === 'warning'} class:danger={variant === 'danger'}>
  {text}
</button>

<style>
  .test-button {
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    margin: 0.5rem 0.25rem;
    font-weight: 500;
    transition: all 0.2s ease;
  }
  
  .primary {
    background: #007acc;
    color: white;
  }
  
  .primary:hover {
    background: #005a9e;
  }
  
  .success {
    background: #28a745;
    color: white;
  }
  
  .success:hover {
    background: #1e7e34;
  }
  
  .warning {
    background: #ffc107;
    color: #212529;
  }
  
  .warning:hover {
    background: #e0a800;
  }
  
  .danger {
    background: #dc3545;
    color: white;
  }
  
  .danger:hover {
    background: #c82333;
  }
</style>
