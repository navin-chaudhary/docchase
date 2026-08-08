import { z } from "zod";

export const clientSchema = z.object({
  name: z.string().min(2, "Name is required").max(120),
  email: z
    .string()
    .email("Invalid email")
    .optional()
    .or(z.literal("")),
  phone: z.string().max(20).optional().or(z.literal("")),
  companyName: z.string().max(120).optional().or(z.literal("")),
  address: z.string().max(500).optional().or(z.literal("")),
  notes: z.string().max(2000).optional().or(z.literal("")),
  tags: z.array(z.string().max(40)).max(20).optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

export const clientQuerySchema = z.object({
  search: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "ALL"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type ClientInput = z.infer<typeof clientSchema>;
