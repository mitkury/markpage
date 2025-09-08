<script lang="ts">
  import type { Tokens } from "markpage/marked";

  let { token } = $props<{
    token: Tokens.HTML;
  }>();
</script>

{@html token.text}
