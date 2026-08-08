import { z } from "zod";

export const templateDocumentSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(500).optional().or(z.literal("")),
  required: z.boolean().default(true),
});

export const templateSchema = z.object({
  name: z.string().min(2).max(120),
  description: z.string().max(1000).optional().or(z.literal("")),
  documents: z
    .array(templateDocumentSchema)
    .min(1, "Add at least one document"),
});

export type TemplateInput = z.infer<typeof templateSchema>;
