import { z } from "zod";

export const workspaceUpdateSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().max(20).optional().or(z.literal("")),
  address: z.string().max(500).optional().or(z.literal("")),
  website: z.string().url().optional().or(z.literal("")),
  logo: z.string().url().nullable().optional(),
  defaultReminderMessage: z.string().max(2000).optional(),
  defaultRequestMessage: z.string().max(2000).optional(),
});

export type WorkspaceUpdateInput = z.infer<typeof workspaceUpdateSchema>;
