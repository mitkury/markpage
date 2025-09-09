<script lang="ts">
  let { token }: { token: { text: string } } = $props();
</script>

<code data-overridden="true">{token.text}</code>

