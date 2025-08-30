# Customization

Advanced customization options for svelte-markdown-pages.

## Custom Components

You can create custom components to extend the functionality:

```svelte
<script>
  import { createDocsContent } from 'svelte-markdown-pages/components';
  
  const content = createDocsContent({
    content: markdownContent,
    processor: customProcessor
  });
</script>

{@html content.render()}
```

## Custom Processors

Create custom content processors to transform your markdown:

```typescript
interface ContentProcessor {
  process(content: string): string;
}

const myProcessor: ContentProcessor = {
  process(content: string): string {
    // Add custom syntax highlighting
    content = content.replace(/```(\w+)/g, '```language-$1');
    
    // Add custom components
    content = content.replace(/:::(.+?):::/g, '<CustomComponent>$1</CustomComponent>');
    
    return content;
  }
};
```

## Custom Navigation

Extend the navigation with custom properties:

```typescript
interface CustomNavigationItem extends NavigationItem {
  icon?: string;
  badge?: string;
  external?: boolean;
}

const customNavigation = {
  items: [
    {
      name: "getting-started",
      type: "page",
      label: "Getting Started",
      icon: "🚀",
      badge: "New"
    }
  ]
};
```

## Custom Styling

Override default styles with CSS custom properties:

```css
:root {
  --docs-primary-color: #007acc;
  --docs-secondary-color: #f5f5f5;
  --docs-text-color: #333;
  --docs-link-color: #007acc;
  --docs-border-color: #ddd;
}

.docs-sidebar {
  background: var(--docs-secondary-color);
  border-right: 1px solid var(--docs-border-color);
}

.nav-link.active {
  background: var(--docs-primary-color);
  color: white;
}
```

## Custom Layout

Create your own layout components:

```svelte
<script>
  import { NavigationTree } from 'svelte-markdown-pages/renderer';
  
  let navigation = $state(new NavigationTree(navigationData));
  let currentPage = $state("getting-started.md");
</script>

<div class="custom-layout">
  <header class="docs-header">
    <h1>My Documentation</h1>
  </header>
  
  <div class="docs-main">
    <nav class="docs-sidebar">
      <!-- Custom sidebar -->
    </nav>
    
    <main class="docs-content">
      <!-- Custom content -->
    </main>
  </div>
</div>
```

## Integration Examples

### SvelteKit Integration

```svelte
<!-- src/routes/docs/[...slug]/+page.svelte -->
<script lang="ts">
  import { NavigationTree } from 'svelte-markdown-pages/renderer';
  import { DocsSidebar, DocsContent } from 'svelte-markdown-pages/components';
  import navigationData from '$lib/content/navigation.json';
  
  export let data;
  let { content, slug } = data;
  
  let navigation = $state(new NavigationTree(navigationData));
</script>

<div class="docs-layout">
  <DocsSidebar {navigation} currentPage={slug} />
  <DocsContent {content} />
</div>
```

Next: Learn about [Plugins](./plugins.md) for extending functionality.
