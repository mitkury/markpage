import { NavigationTree } from '../types.js';
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
export declare class DocsSidebar {
    constructor(props: DocsSidebarProps);
    private props;
    render(): string;
    private renderNavigationItems;
}
export declare class DocsContent {
    constructor(props: DocsContentProps);
    private props;
    render(): string;
}
export declare class DocsLayout {
    constructor(props: DocsLayoutProps);
    private props;
    render(): string;
}
export declare function createDocsSidebar(props: DocsSidebarProps): DocsSidebar;
export declare function createDocsContent(props: DocsContentProps): DocsContent;
export declare function createDocsLayout(props: DocsLayoutProps): DocsLayout;
//# sourceMappingURL=components.d.ts.map