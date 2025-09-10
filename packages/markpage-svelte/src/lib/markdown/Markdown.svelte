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
    let md;
    
    if (options) {
      // Use options to get Marked instance (this now creates a default instance with extensions)
      md = options.getMarked();
    } else {
      // No options provided, use default instance
      md = newMarked();
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
