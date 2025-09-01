import { z } from "zod";

export const DocItemTypeSchema = z.enum(["section", "page"]);

export const DocItemSchema = z.object({
  name: z.string().min(1),
  type: DocItemTypeSchema,
  label: z.string().min(1),
  collapsed: z.boolean().optional(),
  url: z.string().url().optional()
});

export const IndexSchema = z.object({
  items: z.array(DocItemSchema)
});

export type DocItem = z.infer<typeof DocItemSchema>;
export type IndexFile = z.infer<typeof IndexSchema>;

// Navigation tree types
export interface NavigationItem extends DocItem {
  path?: string;
  items?: NavigationItem[];
  parent?: NavigationItem | undefined;
}

// Build output types
export interface BuildOptions {
  appOutput?: string;
  websiteOutput?: string;
  staticOutput?: string;
  includeContent?: boolean;
  autoDiscover?: boolean; // Enable auto-discovery when .index.json is missing
}

export interface BuildResult {
  navigation: NavigationItem[];
  content?: Record<string, string> | undefined;
  pages?: Array<{
    path: string;
    content: string;
    html: string;
  }> | undefined;
}

// Content processing types
export interface ContentProcessor {
  process(content: string): string;
}