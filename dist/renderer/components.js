// Component implementations would go here
// For now, we'll export the interfaces and placeholder implementations
export class DocsSidebar {
    constructor(props) {
        // Svelte component implementation
        this.props = props;
    }
    render() {
        // This is a placeholder - in a real implementation, this would be a Svelte component
        return `
      <nav class="docs-sidebar ${this.props.collapsed ? 'collapsed' : ''}">
        ${this.renderNavigationItems(this.props.navigation.items)}
      </nav>
    `;
    }
    renderNavigationItems(items) {
        return items.map(item => {
            if (item.type === 'section') {
                return `
          <div class="nav-section">
            <div class="nav-section-header">${item.label}</div>
            ${item.items ? this.renderNavigationItems(item.items) : ''}
          </div>
        `;
            }
            else {
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
    constructor(props) {
        this.props = props;
    }
    render() {
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
    constructor(props) {
        this.props = props;
    }
    render() {
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
export function createDocsSidebar(props) {
    return new DocsSidebar(props);
}
export function createDocsContent(props) {
    return new DocsContent(props);
}
export function createDocsLayout(props) {
    return new DocsLayout(props);
}
//# sourceMappingURL=components.js.map