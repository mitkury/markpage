import { z } from "zod";
export declare const DocItemTypeSchema: z.ZodEnum<["section", "page"]>;
export declare const DocItemSchema: z.ZodObject<{
    name: z.ZodString;
    type: z.ZodEnum<["section", "page"]>;
    label: z.ZodString;
    collapsed: z.ZodOptional<z.ZodBoolean>;
    url: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    type: "section" | "page";
    label: string;
    collapsed?: boolean | undefined;
    url?: string | undefined;
}, {
    name: string;
    type: "section" | "page";
    label: string;
    collapsed?: boolean | undefined;
    url?: string | undefined;
}>;
export declare const IndexSchema: z.ZodObject<{
    items: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        type: z.ZodEnum<["section", "page"]>;
        label: z.ZodString;
        collapsed: z.ZodOptional<z.ZodBoolean>;
        url: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        type: "section" | "page";
        label: string;
        collapsed?: boolean | undefined;
        url?: string | undefined;
    }, {
        name: string;
        type: "section" | "page";
        label: string;
        collapsed?: boolean | undefined;
        url?: string | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    items: {
        name: string;
        type: "section" | "page";
        label: string;
        collapsed?: boolean | undefined;
        url?: string | undefined;
    }[];
}, {
    items: {
        name: string;
        type: "section" | "page";
        label: string;
        collapsed?: boolean | undefined;
        url?: string | undefined;
    }[];
}>;
export type DocItem = z.infer<typeof DocItemSchema>;
export type IndexFile = z.infer<typeof IndexSchema>;
export interface NavigationItem extends DocItem {
    path?: string;
    items?: NavigationItem[];
    parent?: NavigationItem | undefined;
}
export interface NavigationTree {
    items: NavigationItem[];
}
export interface BuildOptions {
    appOutput?: string;
    websiteOutput?: string;
    staticOutput?: string;
    includeContent?: boolean;
}
export interface BuildResult {
    navigation: NavigationTree;
    content?: Record<string, string> | undefined;
    pages?: Array<{
        path: string;
        content: string;
        html: string;
    }> | undefined;
}
export interface ContentProcessor {
    process(content: string): string;
}
export interface ContentProcessorOptional {
    process(content: string): string;
}
export interface StaticPageOptions {
    title?: string;
    baseUrl?: string;
    css?: string;
    js?: string;
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
    } | undefined;
}
//# sourceMappingURL=types.d.ts.map