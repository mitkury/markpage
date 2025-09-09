<script lang="ts">
  import { newMarked } from "@markpage/svelte";
  import MarkdownTokens from "./MarkdownTokens.svelte";
  import type { ComponentName } from "./types";

  let {
    source,
    components = new Map<ComponentName, any>(),
    markedInstance,
    extensionComponents = new Map<string, any>(),
    unknownToken,
  }: {
    source: string;
    components?: Map<ComponentName, any>;
    markedInstance?: any;
    extensionComponents?: Map<string, any>;
    unknownToken?: ((token: any) => any) | undefined;
  } = $props();

  let tokens = $derived.by(() => {
    const md = markedInstance ?? newMarked();
    return md.lexer(source);
  });
</script>

<div class="markpage">
  <MarkdownTokens {tokens} {components} {extensionComponents} {unknownToken} />
</div>
