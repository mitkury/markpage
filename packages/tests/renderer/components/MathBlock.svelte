<script lang="ts">
  let { token }: { token: { text: string } } = $props();
</script>

<div data-math="block">{token.text}</div>

