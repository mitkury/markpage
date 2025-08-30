import { NavigationTree, NavigationItem } from '../types.js';

// Svelte 5 components (vanilla Svelte, no SvelteKit dependencies)

export interface DocsSidebarProps {
  navigation: NavigationTree;
  currentPage?: string | null;
  onPageSelect?: ((path: string) => void) | undefined;
  collapsed?: boolean | undefined;
}

export interface DocsContentProps {
  content?: string | null;
  title?: string;
  loading?: boolean;
  error?: string | null;
}

export interface DocsLayoutProps {
  navigation: NavigationTree;
  currentPage?: string | null;
  content?: string | null;
  onPageSelect?: ((path: string) => void) | undefined;
  sidebarCollapsed?: boolean | undefined;
  onSidebarToggle?: (() => void) | undefined;
}

// Component implementations would go here
// For now, we'll export the interfaces and placeholder implementations

export class DocsSidebar {
  constructor(props: DocsSidebarProps) {
    // Svelte component implementation
    this.props = props;
  }

  private props: DocsSidebarProps;

  render(): string {
    // This is a placeholder - in a real implementation, this would be a Svelte component
    return `
      <nav class="docs-sidebar ${this.props.collapsed ? 'collapsed' : ''}">
        ${this.renderNavigationItems(this.props.navigation.items)}
      </nav>
    `;
  }

  private renderNavigationItems(items: NavigationItem[]): string {
    return items.map(item => {
      if (item.type === 'section') {
        return `
          <div class="nav-section">
            <div class="nav-section-header">${item.label}</div>
            ${item.items ? this.renderNavigationItems(item.items) : ''}
          </div>
        `;
      } else {
        const isActive = this.props.currentPage === item.path;
        return `
          <a href="#" 
             class="nav-link ${isActive ? 'active' : ''}"
             data-path="${item.path}"
             onclick="this.dispatchEvent(new CustomEvent('pageSelect', {detail: '${item.path}'}))">
            ${item.label}
          </a>
        `;
      }
    }).join('');
  }
}

export class DocsContent {
  constructor(props: DocsContentProps) {
    this.props = props;
  }

  private props: DocsContentProps;

  render(): string {
    if (this.props.loading) {
      return '<div class="docs-content loading">Loading...</div>';
    }

    if (this.props.error) {
      return `<div class="docs-content error">Error: ${this.props.error}</div>`;
    }

    if (!this.props.content) {
      return '<div class="docs-content empty">No content selected</div>';
    }

    return `
      <div class="docs-content">
        ${this.props.title ? `<h1>${this.props.title}</h1>` : ''}
        <div class="content-body">
          ${this.props.content}
        </div>
      </div>
    `;
  }
}

export class DocsLayout {
  constructor(props: DocsLayoutProps) {
    this.props = props;
  }

  private props: DocsLayoutProps;

  render(): string {
    return `
      <div class="docs-layout">
        <button class="sidebar-toggle" onclick="this.dispatchEvent(new CustomEvent('sidebarToggle'))">
          ☰
        </button>
        <div class="docs-container">
          ${new DocsSidebar({
            navigation: this.props.navigation,
            currentPage: this.props.currentPage || null,
            onPageSelect: this.props.onPageSelect,
            collapsed: this.props.sidebarCollapsed
          }).render()}
          ${new DocsContent({
            content: this.props.content || null
          }).render()}
        </div>
      </div>
    `;
  }
}

// Utility functions for component usage
export function createDocsSidebar(props: DocsSidebarProps): DocsSidebar {
  return new DocsSidebar(props);
}

export function createDocsContent(props: DocsContentProps): DocsContent {
  return new DocsContent(props);
}

export function createDocsLayout(props: DocsLayoutProps): DocsLayout {
  return new DocsLayout(props);
}