<script lang="ts">
  let { token }: { token: any } = $props();
</script>

{token?.text ?? token?.raw ?? ''}
