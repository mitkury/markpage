<script module lang="ts">
  import MarkdownBloquote from "./markdown-components/MarkdownBloquote.svelte";
  import MarkdownHeading from "./markdown-components/MarkdownHeading.svelte";
  import MarkdownList from "./markdown-components/MarkdownList.svelte";
  import MarkdownListItem from "./markdown-components/MarkdownListItem.svelte";
  import MarkdownBr from "./markdown-components/MarkdownBr.svelte";
  import MarkdownCode from "./markdown-components/MarkdownCode.svelte";
  import MarkdownCodeSpan from "./markdown-components/MarkdownCodeSpan.svelte";
  import MarkdownTable from "./markdown-components/MarkdownTable.svelte";
  import MarkdownHtml from "./markdown-components/MarkdownHtml.svelte";
  import MarkdownParagraph from "./markdown-components/MarkdownParagraph.svelte";
  import MarkdownLink from "./markdown-components/MarkdownLink.svelte";
  import MarkdownText from "./markdown-components/MarkdownText.svelte";
  import MarkdownDef from "./markdown-components/MarkdownDef.svelte";
  import MarkdownDel from "./markdown-components/MarkdownDel.svelte";
  import MarkdownEm from "./markdown-components/MarkdownEm.svelte";
  import MarkdownHr from "./markdown-components/MarkdownHr.svelte";
  import MarkdownStrong from "./markdown-components/MarkdownStrong.svelte";
  import MarkdownImage from "./markdown-components/MarkdownImage.svelte";
  import MarkdownSpace from "./markdown-components/MarkdownSpace.svelte";
  import MarkdownComponentTag from "./markdown-components/MarkdownComponentTag.svelte";
  import type { BuiltinTokenName } from "./types";
  

  const markdownComponents: Record<string, any> = {
    blockquote: MarkdownBloquote,
    heading: MarkdownHeading,
    list: MarkdownList,
    list_item: MarkdownListItem,
    br: MarkdownBr,
    code: MarkdownCode,
    codespan: MarkdownCodeSpan,
    table: MarkdownTable,
    html: MarkdownHtml,
    paragraph: MarkdownParagraph,
    link: MarkdownLink,
    text: MarkdownText,
    def: MarkdownDef,
    del: MarkdownDel,
    em: MarkdownEm,
    hr: MarkdownHr,
    strong: MarkdownStrong,
    image: MarkdownImage,
    space: MarkdownSpace,
    component: MarkdownComponentTag,
  };
</script>

<script lang="ts">
  import MarkdownTokens from "./MarkdownTokens.svelte";
  import type { ComponentName } from "./types";

  let {
    token,
    components = new Map<ComponentName, any>(),
    extensionComponents = new Map<string, any>(),
    unknownToken,
  }: {
    token: any;
    components: Map<ComponentName, any>;
    extensionComponents: Map<string, any>;
    unknownToken?: ((token: any) => any) | undefined;
  } = $props();

  const MarkdownComponent = $derived.by(() => {
    const type = token.type as string;
    // 1) Prefer extension-provided component for custom tokens
    const extComp = extensionComponents?.get(type);
    if (extComp) return extComp;

    // 2) Fallback to built-in components
    const comp = markdownComponents[type];

    if (!comp) {
      // 3) Optional unknown token fallback
      if (unknownToken) {
        try {
          const maybe = unknownToken(token);
          if (maybe) return maybe as any;
        } catch (err) {
          console.error('unknownToken handler threw', err);
        }
      }
      console.error(`No markdown component found for token type: ${token.type}`);
      return null;
    }

    return comp;
  });
</script>
{#if MarkdownComponent}
  <MarkdownComponent {token} {components}>
    {#if "tokens" in token && token["tokens"] && token["tokens"].length > 0}
      <MarkdownTokens tokens={token["tokens"]} {components} {extensionComponents} {unknownToken} />
    {/if}
  </MarkdownComponent>
{/if}
