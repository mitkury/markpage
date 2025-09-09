<script lang="ts">
  import { newMarked } from "@markpage/svelte";
  import MarkdownTokens from "./MarkdownTokens.svelte";
  import type { ComponentName } from "./types";
  import type { MarkpageOptions } from "./MarkpageOptions";

  let {
    source,
    options,
    components = new Map<ComponentName, any>(),
    markedInstance,
    extensionComponents = new Map<string, any>(),
    unknownToken,
  }: {
    source: string;
    options?: MarkpageOptions;
    components?: Map<ComponentName, any>;
    markedInstance?: any;
    extensionComponents?: Map<string, any>;
    unknownToken?: ((token: any) => any) | undefined;
  } = $props();

  let tokens = $derived.by(() => {
    let md;
    
    if (options) {
      // Use options to get Marked instance
      const optionsMarked = options.getMarked();
      if (optionsMarked) {
        md = optionsMarked;
      } else {
        // Create default instance and apply extensions from options
        md = newMarked();
        // Note: Extensions would need to be applied here if we stored them in options
        // For now, we rely on the user to provide a pre-configured Marked instance
      }
    } else {
      // Fallback to legacy props
      md = markedInstance ?? newMarked();
    }
    
    return md.lexer(source);
  });

  // Resolve components and extension components with options taking precedence
  let resolvedComponents = $derived(() => {
    if (options) {
      const optionsComponents = options.getComponents();
      // Merge with legacy components prop (options takes precedence)
      return new Map([...components, ...optionsComponents]);
    }
    return components;
  });

  let resolvedExtensionComponents = $derived(() => {
    if (options) {
      const optionsExtensionComponents = options.getExtensionComponents();
      // Merge with legacy extensionComponents prop (options takes precedence)
      return new Map([...extensionComponents, ...optionsExtensionComponents]);
    }
    return extensionComponents;
  });
</script>

<div class="markpage">
  <MarkdownTokens {tokens} components={resolvedComponents()} extensionComponents={resolvedExtensionComponents()} {unknownToken} />
</div>
