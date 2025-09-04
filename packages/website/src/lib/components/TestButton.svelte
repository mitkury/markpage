<script lang="ts">
  let { text = 'Button' } = $props<{ text?: string }>();
  
  function handleClick() {
    alert('Button clicked!');
  }
</script>

<button onclick={handleClick} class="test-button">
  {text}
</button>

<style>
  .test-button {
    background: #007acc;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    margin: 0.5rem 0;
  }
  
  .test-button:hover {
    background: #005a9e;
  }
</style>
