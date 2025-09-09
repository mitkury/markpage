<script lang="ts">
  import { Marked, componentExtension } from "@markpage/svelte";
  import MarkdownTokens from "./MarkdownTokens.svelte";
  import type { ComponentName } from "./types";

  let {
    source,
    components = new Map<ComponentName, any>(),
    markedInstance,
  }: {
    source: string;
    components?: Map<ComponentName, any>;
    markedInstance?: any;
  } = $props();

  let tokens = $derived.by(() => {
    const md = markedInstance ?? new Marked();
    md.use({ extensions: [componentExtension as any] as any });
    return md.lexer(source);
  });
</script>

<div class="markpage">
  <MarkdownTokens {tokens} {components} />
</div>
