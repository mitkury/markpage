import { NavigationTree, DocItem } from '../types.js';
export declare class ParserError extends Error {
    filePath?: string | undefined;
    constructor(message: string, filePath?: string | undefined);
}
export interface ParseOptions {
    basePath?: string;
    validateFiles?: boolean;
}
export declare function parseIndexFile(filePath: string): DocItem[];
export declare function buildNavigationTree(contentPath: string, options?: ParseOptions): NavigationTree;
export declare function validateContentStructure(contentPath: string): void;
//# sourceMappingURL=parser.d.ts.map