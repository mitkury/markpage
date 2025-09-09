<script lang="ts">
  let { token }: { token: { text: string } } = $props();
</script>

<span data-math="inline">{token.text}</span>

