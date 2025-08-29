import { BuildOptions, BuildResult, NavigationTree, ContentProcessor } from '../types.js';
export declare class BuilderError extends Error {
    filePath?: string | undefined;
    constructor(message: string, filePath?: string | undefined);
}
export interface ContentBundle {
    [path: string]: string;
}
export declare function buildDocs(contentPath: string, options?: BuildOptions): Promise<BuildResult>;
export declare function processMarkdown(content: string, processor?: ContentProcessor): string;
export declare function generateStaticPages(navigation: NavigationTree, basePath: string, options?: {
    processor?: ContentProcessor;
    pageOptions?: {
        title?: string;
        baseUrl?: string;
        css?: string;
        js?: string;
    };
}): Array<{
    path: string;
    content: string;
    html: string;
}>;
//# sourceMappingURL=builder.d.ts.map