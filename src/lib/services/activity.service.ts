import mongoose from "mongoose";
import { Activity } from "@/models";
import type { ActivityAction } from "@/types";

export async function logActivity(params: {
  workspaceId: string;
  userId?: string | null;
  clientId?: string | null;
  requestId?: string | null;
  documentId?: string | null;
  action: ActivityAction;
  description: string;
  metadata?: Record<string, unknown>;
}) {
  await Activity.create({
    workspaceId: new mongoose.Types.ObjectId(params.workspaceId),
    userId: params.userId
      ? new mongoose.Types.ObjectId(params.userId)
      : null,
    clientId: params.clientId
      ? new mongoose.Types.ObjectId(params.clientId)
      : null,
    requestId: params.requestId
      ? new mongoose.Types.ObjectId(params.requestId)
      : null,
    documentId: params.documentId
      ? new mongoose.Types.ObjectId(params.documentId)
      : null,
    action: params.action,
    description: params.description,
    metadata: params.metadata ?? {},
  });
}

export async function listActivities(
  workspaceId: string,
  options: { requestId?: string; limit?: number; page?: number } = {}
) {
  const limit = options.limit ?? 30;
  const page = options.page ?? 1;
  const filter: Record<string, unknown> = {
    workspaceId: new mongoose.Types.ObjectId(workspaceId),
  };
  if (options.requestId) {
    filter.requestId = new mongoose.Types.ObjectId(options.requestId);
  }

  const [items, total] = await Promise.all([
    Activity.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Activity.countDocuments(filter),
  ]);

  return { items, total, page, limit };
}
