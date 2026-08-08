import { z } from "zod";

export const requestDocumentSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(500).optional().or(z.literal("")),
  required: z.boolean().default(true),
});

export const createRequestSchema = z.object({
  clientId: z.string().min(1),
  templateId: z.string().optional().nullable(),
  title: z.string().min(2).max(160),
  description: z.string().max(2000).optional().or(z.literal("")),
  message: z.string().max(2000).optional().or(z.literal("")),
  dueDate: z
    .string()
    .optional()
    .nullable()
    .or(z.literal(""))
    .refine(
      (v) => !v || !Number.isNaN(Date.parse(v)),
      "Invalid due date"
    ),
  documents: z
    .array(requestDocumentSchema)
    .min(1, "Select at least one document"),
  sendNow: z.boolean().optional().default(true),
});

export const updateRequestSchema = z.object({
  title: z.string().min(2).max(160).optional(),
  description: z.string().max(2000).optional(),
  message: z.string().max(2000).optional(),
  dueDate: z.string().datetime().nullable().optional(),
  status: z
    .enum([
      "DRAFT",
      "SENT",
      "IN_PROGRESS",
      "COMPLETED",
      "EXPIRED",
      "CANCELLED",
      "OVERDUE",
    ])
    .optional(),
});

export const requestQuerySchema = z.object({
  status: z.string().optional(),
  clientId: z.string().optional(),
  overdue: z.enum(["true", "false"]).optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const reminderSchema = z.object({
  channel: z.enum(["EMAIL", "WHATSAPP", "MANUAL"]),
  message: z.string().min(1).max(2000).optional(),
});

export const rejectSchema = z.object({
  reason: z.string().min(3, "Please provide a rejection reason").max(1000),
});

export type CreateRequestInput = z.infer<typeof createRequestSchema>;
