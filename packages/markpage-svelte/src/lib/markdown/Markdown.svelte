<script lang="ts">
  import { newMarked } from "@markpage/svelte";
  import MarkdownTokens from "./MarkdownTokens.svelte";
  import type { MarkpageOptions } from "./MarkpageOptions";

  let {
    source,
    options,
    unknownToken,
  }: {
    source: string;
    options?: MarkpageOptions;
    unknownToken?: ((token: any) => any) | undefined;
  } = $props();

  let tokens = $derived.by(() => {
    // Always use newMarked() to ensure we have the component extension
    const md = newMarked();
    
    if (options) {
      // Apply any registered extensions to the Marked instance
      const extensions = options.getExtensions();
      for (const extensionSet of extensions as { extensions: Array<{ name: string; level: 'inline' | 'block'; start?: (src: string) => number | undefined; tokenizer?: (src: string) => any }> }[]) {
        // Convert our extension format to Marked.js format
        const markedExtension = {
          extensions: extensionSet.extensions.map((ext) => ({
            name: ext.name,
            level: ext.level,
            start: ext.start,
            tokenizer: ext.tokenizer
          }))
        };
        md.use(markedExtension as any);
      }
    }
    
    return md.lexer(source);
  });

  // Get components and extension components from options
  let resolvedComponents = $derived(() => {
    return options ? options.getComponents() : new Map();
  });

  let resolvedExtensionComponents = $derived(() => {
    return options ? options.getExtensionComponents() : new Map();
  });
</script>

<div class="markpage">
  <MarkdownTokens {tokens} components={resolvedComponents()} extensionComponents={resolvedExtensionComponents()} {unknownToken} />
</div>
