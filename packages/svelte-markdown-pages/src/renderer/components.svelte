<!-- DocsSidebar.svelte -->
<script lang="ts">
  import { NavigationTree, NavigationItem } from '../types.js';
  
  let { navigation, currentPage = null, onPageSelect = undefined, collapsed = false } = $props<{
    navigation: NavigationTree;
    currentPage?: string | null;
    onPageSelect?: ((path: string) => void) | undefined;
    collapsed?: boolean | undefined;
  }>();
  
  function handlePageSelect(path: string) {
    if (onPageSelect) {
      onPageSelect(path);
    }
  }
  
  function renderNavigationItems(items: NavigationItem[]): string {
    return items.map(item => {
      if (item.type === 'section') {
        return `
          <div class="nav-section">
            <div class="nav-section-header">${item.label}</div>
            ${item.items ? renderNavigationItems(item.items) : ''}
          </div>
        `;
      } else {
        const isActive = currentPage === item.path;
        return `
          <a href="#" 
             class="nav-link ${isActive ? 'active' : ''}"
             data-path="${item.path}">
            ${item.label}
          </a>
        `;
      }
    }).join('');
  }
</script>

<nav class="docs-sidebar {collapsed ? 'collapsed' : ''}">
  {#each navigation.items as item}
    {#if item.type === 'section'}
      <div class="nav-section">
        <div class="nav-section-header">{item.label}</div>
        {#if item.items}
          {#each item.items as subItem}
            {#if subItem.type === 'page'}
              <a 
                href="#" 
                class="nav-link {currentPage === subItem.path ? 'active' : ''}"
                onclick={() => handlePageSelect(subItem.path!)}
              >
                {subItem.label}
              </a>
            {/if}
          {/each}
        {/if}
      </div>
    {:else}
      <a 
        href="#" 
        class="nav-link {currentPage === item.path ? 'active' : ''}"
        onclick={() => handlePageSelect(item.path!)}
      >
        {item.label}
      </a>
    {/if}
  {/each}
</nav>

<style>
  .docs-sidebar {
    width: 250px;
    background: #f5f5f5;
    border-right: 1px solid #ddd;
    padding: 1rem;
    overflow-y: auto;
  }
  
  .docs-sidebar.collapsed {
    width: 60px;
  }
  
  .nav-section {
    margin-bottom: 1rem;
  }
  
  .nav-section-header {
    font-weight: bold;
    color: #666;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
    text-transform: uppercase;
  }
  
  .nav-link {
    display: block;
    padding: 0.5rem;
    color: #333;
    text-decoration: none;
    border-radius: 4px;
    margin-bottom: 0.25rem;
  }
  
  .nav-link:hover {
    background: #e0e0e0;
  }
  
  .nav-link.active {
    background: #007acc;
    color: white;
  }
</style>