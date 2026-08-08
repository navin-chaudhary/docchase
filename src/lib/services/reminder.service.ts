import mongoose from "mongoose";
import { connectDB } from "@/lib/db/connect";
import {
  Client,
  DocumentRequest,
  DocumentRequirement,
  Reminder,
  Workspace,
} from "@/models";
import { NotFoundError, ValidationError } from "@/lib/api/errors";
import { formatReminderMessage, buildWhatsAppUrl } from "@/lib/utils/whatsapp";
import { logActivity } from "./activity.service";
import { sendEmail } from "@/lib/email/client";
import { reminderEmail } from "@/lib/email/templates";
import type { ReminderChannel } from "@/types";

function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

export async function sendReminder(params: {
  workspaceId: string;
  userId: string;
  requestId: string;
  channel: ReminderChannel;
  message?: string;
}) {
  await connectDB();

  const request = await DocumentRequest.findOne({
    _id: params.requestId,
    workspaceId: params.workspaceId,
  });
  if (!request) throw new NotFoundError("Request not found");

  const [client, workspace, pendingReqs] = await Promise.all([
    Client.findOne({ _id: request.clientId, workspaceId: params.workspaceId }),
    Workspace.findById(params.workspaceId),
    DocumentRequirement.find({
      requestId: request._id,
      workspaceId: params.workspaceId,
      required: true,
      status: { $in: ["PENDING", "REJECTED"] },
    }),
  ]);

  if (!client) throw new NotFoundError("Client not found");

  const link = `${appUrl()}/request/${request.publicToken}`;
  const template =
    params.message ||
    workspace?.defaultReminderMessage ||
    "Hi {clientName}, just a reminder that you still have {pendingCount} pending documents for {requestTitle}. Please upload them using the link below.\n\n{link}";

  const message = formatReminderMessage({
    template,
    clientName: client.name,
    requestTitle: request.title,
    pendingCount: pendingReqs.length,
    link,
  });

  if (params.channel === "EMAIL") {
    if (!client.email) {
      throw new ValidationError("Client does not have an email address");
    }
    await sendEmail({
      to: client.email,
      subject: `Reminder: pending documents for ${request.title}`,
      html: reminderEmail({
        clientName: client.name,
        message,
        link,
      }),
    });
  }

  const reminder = await Reminder.create({
    workspaceId: params.workspaceId,
    requestId: request._id,
    clientId: client._id,
    userId: params.userId,
    channel: params.channel,
    message,
    sentAt: new Date(),
  });

  request.lastReminderAt = new Date();
  await request.save();

  await logActivity({
    workspaceId: params.workspaceId,
    userId: params.userId,
    clientId: client._id.toString(),
    requestId: request._id.toString(),
    action: "REMINDER_SENT",
    description: `${params.channel} reminder sent to ${client.name}`,
    metadata: { channel: params.channel },
  });

  return {
    reminder,
    message,
    whatsappUrl:
      params.channel === "WHATSAPP"
        ? buildWhatsAppUrl(client.phone || "", message)
        : null,
    pendingDocuments: pendingReqs.map((r) => ({
      id: r._id.toString(),
      name: r.name,
      status: r.status,
    })),
  };
}

export async function listReminders(
  workspaceId: string,
  options: { requestId?: string; page?: number; limit?: number } = {}
) {
  await connectDB();
  const page = options.page ?? 1;
  const limit = options.limit ?? 30;
  const filter: Record<string, unknown> = {
    workspaceId: new mongoose.Types.ObjectId(workspaceId),
  };
  if (options.requestId) {
    filter.requestId = new mongoose.Types.ObjectId(options.requestId);
  }

  const [items, total] = await Promise.all([
    Reminder.find(filter)
      .populate("clientId", "name phone email")
      .populate("requestId", "title publicToken status dueDate")
      .sort({ sentAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Reminder.countDocuments(filter),
  ]);

  return { items, total, page, limit };
}

export async function getReminderPreview(
  workspaceId: string,
  requestId: string
) {
  await connectDB();
  const request = await DocumentRequest.findOne({
    _id: requestId,
    workspaceId,
  });
  if (!request) throw new NotFoundError("Request not found");

  const [client, workspace, pendingReqs] = await Promise.all([
    Client.findOne({ _id: request.clientId, workspaceId }),
    Workspace.findById(workspaceId),
    DocumentRequirement.find({
      requestId,
      workspaceId,
      required: true,
      status: { $in: ["PENDING", "REJECTED"] },
    }).lean(),
  ]);

  if (!client) throw new NotFoundError("Client not found");

  const link = `${appUrl()}/request/${request.publicToken}`;
  const message = formatReminderMessage({
    template:
      workspace?.defaultReminderMessage ||
      "Hi {clientName}, just a reminder that you still have {pendingCount} pending documents for {requestTitle}. Please upload them using the link below.\n\n{link}",
    clientName: client.name,
    requestTitle: request.title,
    pendingCount: pendingReqs.length,
    link,
  });

  return {
    message,
    link,
    whatsappUrl: buildWhatsAppUrl(client.phone || "", message),
    pendingDocuments: pendingReqs,
    client: {
      name: client.name,
      email: client.email,
      phone: client.phone,
    },
  };
}
