import { ContentProcessorOptional } from '../types.js';
export declare class ContentLoader {
    private content;
    private processor?;
    constructor(content: Record<string, string>, processor?: ContentProcessorOptional);
    loadContent(path: string): string | undefined;
    loadAndProcess(path: string): string | undefined;
    processContent(content: string): string;
    hasContent(path: string): boolean;
    getAvailablePaths(): string[];
    getContentSize(path: string): number;
    getTotalContentSize(): number;
}
export declare function loadContent(path: string, contentBundle: Record<string, string>, processor?: ContentProcessorOptional): Promise<string | undefined>;
export declare function createContentLoader(contentBundle: Record<string, string>, processor?: ContentProcessorOptional): ContentLoader;
export declare function extractHeadings(content: string): Array<{
    level: number;
    text: string;
    id: string;
}>;
export declare function extractTableOfContents(content: string): string;
export declare function addTableOfContents(content: string): string;
//# sourceMappingURL=content.d.ts.map