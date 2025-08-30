# Customization

Learn how to customize the package behavior and appearance.

## Custom Components

You can create custom Svelte components for rendering:

```svelte
<script lang="ts">
  import { NavigationTree, loadContent } from 'svelte-markdown-pages/renderer';
  
  let navigation = new NavigationTree(navigationData);
  let content = await loadContent(pagePath, contentBundle);
</script>

<div class="custom-docs">
  <!-- Your custom layout -->
</div>
```

## Custom Styling

The package provides CSS classes for styling:

```css
.docs-sidebar {
  /* Sidebar styles */
}

.docs-content {
  /* Content styles */
}

.nav-link {
  /* Navigation link styles */
}

.nav-link.active {
  /* Active link styles */
}
```

## Custom Processors

Implement custom content processors for advanced transformations:

```typescript
interface CustomProcessor {
  process(content: string): string;
}

const processor: CustomProcessor = {
  process(content: string): string {
    // Add custom processing logic
    return content;
  }
};
```