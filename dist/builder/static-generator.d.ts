import { ContentProcessor } from '../types.js';
export declare class StaticGeneratorError extends Error {
    filePath?: string | undefined;
    constructor(message: string, filePath?: string | undefined);
}
export interface StaticSiteOptions {
    title?: string;
    baseUrl?: string;
    css?: string;
    js?: string;
    processor?: ContentProcessor;
    includeIndex?: boolean;
    indexTitle?: string;
}
export interface StaticSiteResult {
    pages: Array<{
        path: string;
        content: string;
        html: string;
    }>;
    index?: {
        path: string;
        html: string;
    };
}
export declare function generateStaticSite(contentPath: string, outputPath: string, options?: StaticSiteOptions): Promise<StaticSiteResult>;
export declare function generateSitemap(pages: Array<{
    path: string;
}>, baseUrl: string): string;
export declare function generateRobotsTxt(baseUrl: string): string;
//# sourceMappingURL=static-generator.d.ts.map