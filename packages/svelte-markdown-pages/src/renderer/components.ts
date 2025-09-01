import { NavigationItem } from '../types.js';

// Legacy class-based components for backward compatibility
export interface DocsSidebarProps {
  navigation: NavigationItem[];
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
  navigation: NavigationItem[];
  currentPage?: string | null;
  content?: string | null;
  onPageSelect?: ((path: string) => void) | undefined;
  sidebarCollapsed?: boolean | undefined;
  onSidebarToggle?: (() => void) | undefined;
}

// Legacy class-based implementations
export class DocsSidebarClass {
  constructor(props: DocsSidebarProps) {
    this.props = props;
  }

  private props: DocsSidebarProps;

  render(): string {
    return `
      <nav class="docs-sidebar ${this.props.collapsed ? 'collapsed' : ''}">
        ${this.renderNavigationItems(this.props.navigation)}
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

export class DocsContentClass {
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

// Legacy exports for backward compatibility
export { DocsSidebarClass as DocsSidebar, DocsContentClass as DocsContent };

// Utility functions
export function createDocsSidebar(props: DocsSidebarProps): DocsSidebarClass {
  return new DocsSidebarClass(props);
}

export function createDocsContent(props: DocsContentProps): DocsContentClass {
  return new DocsContentClass(props);
}

export function createDocsLayout(props: DocsLayoutProps): string {
  const sidebar = new DocsSidebarClass({
    navigation: props.navigation,
    currentPage: props.currentPage,
    onPageSelect: props.onPageSelect,
    collapsed: props.sidebarCollapsed
  });

  const content = new DocsContentClass({
    content: props.content,
    loading: false,
    error: null
  });

  return `
    <div class="docs-layout">
      ${sidebar.render()}
      ${content.render()}
    </div>
  `;
}