<script lang="ts">
  import { Lexer, Marked } from "markpage/marked";
  import MarkdownTokens from "./MarkdownTokens.svelte";
  import type { ComponentName } from "./types";
  import { componentExtension } from "markpage/renderer";

  let {
    source,
    components = new Map<ComponentName, any>(),
    markedInstance,
  }: {
    source: string;
    components?: Map<ComponentName, any>;
    markedInstance?: any;
  } = $props();

  let tokens: any = $state(null);
  $effect(() => {
    const md = new Marked();
    md.use({ extensions: [componentExtension as any] as any });
    tokens = md.lexer(source);
  });
</script>

<div class="markdown">
  <MarkdownTokens {tokens} {components} />
</div>
