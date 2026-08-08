import mongoose from "mongoose";
import { connectDB } from "@/lib/db/connect";
import { Client, DocumentRequest, DocumentRequirement, Document } from "@/models";
import { NotFoundError } from "@/lib/api/errors";
import { logActivity } from "./activity.service";
import type { ClientInput } from "@/lib/validations/client";

export async function listClients(
  workspaceId: string,
  options: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
  } = {}
) {
  await connectDB();
  const page = options.page ?? 1;
  const limit = options.limit ?? 20;
  const filter: Record<string, unknown> = {
    workspaceId: new mongoose.Types.ObjectId(workspaceId),
  };

  if (options.status && options.status !== "ALL") {
    filter.status = options.status;
  }

  if (options.search) {
    const q = options.search.trim();
    filter.$or = [
      { name: { $regex: q, $options: "i" } },
      { email: { $regex: q, $options: "i" } },
      { phone: { $regex: q, $options: "i" } },
      { companyName: { $regex: q, $options: "i" } },
    ];
  }

  const [items, total] = await Promise.all([
    Client.find(filter)
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Client.countDocuments(filter),
  ]);

  return { items, total, page, limit };
}

export async function createClient(
  workspaceId: string,
  userId: string,
  input: ClientInput
) {
  await connectDB();
  const client = await Client.create({
    workspaceId,
    ...input,
    email: input.email?.toLowerCase() ?? "",
    tags: input.tags ?? [],
    status: input.status ?? "ACTIVE",
  });

  await logActivity({
    workspaceId,
    userId,
    clientId: client._id.toString(),
    action: "CLIENT_CREATED",
    description: `Client ${client.name} created`,
  });

  return client;
}

export async function getClient(workspaceId: string, clientId: string) {
  await connectDB();
  const client = await Client.findOne({
    _id: clientId,
    workspaceId,
  }).lean();
  if (!client) throw new NotFoundError("Client not found");
  return client;
}

export async function getClientDetail(workspaceId: string, clientId: string) {
  await connectDB();
  const client = await getClient(workspaceId, clientId);

  const requests = await DocumentRequest.find({
    workspaceId,
    clientId,
  })
    .sort({ createdAt: -1 })
    .lean();

  const requestIds = requests.map((r) => r._id);
  const [requirements, documents] = await Promise.all([
    DocumentRequirement.find({
      workspaceId,
      requestId: { $in: requestIds },
    }).lean(),
    Document.find({
      workspaceId,
      clientId,
    })
      .sort({ uploadedAt: -1 })
      .limit(50)
      .lean(),
  ]);

  const pendingDocs = requirements.filter(
    (r) => r.required && ["PENDING", "REJECTED"].includes(r.status)
  );

  return {
    client,
    activeRequests: requests.filter((r) =>
      ["SENT", "IN_PROGRESS", "OVERDUE", "DRAFT"].includes(r.status)
    ),
    completedRequests: requests.filter((r) => r.status === "COMPLETED"),
    pendingDocuments: pendingDocs,
    documentHistory: documents,
    allRequests: requests,
  };
}

export async function updateClient(
  workspaceId: string,
  clientId: string,
  input: Partial<ClientInput>
) {
  await connectDB();
  const client = await Client.findOneAndUpdate(
    { _id: clientId, workspaceId },
    {
      $set: {
        ...input,
        ...(input.email !== undefined
          ? { email: input.email.toLowerCase() }
          : {}),
      },
    },
    { new: true }
  );
  if (!client) throw new NotFoundError("Client not found");
  return client;
}

export async function deleteClient(workspaceId: string, clientId: string) {
  await connectDB();
  const client = await Client.findOneAndDelete({
    _id: clientId,
    workspaceId,
  });
  if (!client) throw new NotFoundError("Client not found");
  return { ok: true };
}
