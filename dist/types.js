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
//# sourceMappingURL=types.js.map