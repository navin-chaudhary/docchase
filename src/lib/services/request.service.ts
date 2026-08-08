import mongoose from "mongoose";
import { connectDB } from "@/lib/db/connect";
import {
  Client,
  DocumentRequest,
  DocumentRequirement,
  Document,
  Workspace,
  User,
  Reminder,
} from "@/models";
import { generatePublicToken } from "@/lib/utils/tokens";
import { calculateProgress, isRequestComplete } from "@/lib/utils/progress";
import { AppError, NotFoundError, ValidationError } from "@/lib/api/errors";
import { PLAN_LIMITS, type PlanType } from "@/types";
import { logActivity } from "./activity.service";
import { sendEmail } from "@/lib/email/client";
import {
  requestCreatedEmail,
  requestCompletedEmail,
} from "@/lib/email/templates";
import type { CreateRequestInput } from "@/lib/validations/request";

function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

async function assertActiveRequestLimit(workspaceId: string) {
  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) throw new NotFoundError("Workspace not found");
  const plan = (workspace.plan || "FREE") as PlanType;
  const limit = PLAN_LIMITS[plan].activeRequests;
  if (!Number.isFinite(limit)) return;

  const activeCount = await DocumentRequest.countDocuments({
    workspaceId,
    status: { $in: ["DRAFT", "SENT", "IN_PROGRESS", "OVERDUE"] },
  });

  if (activeCount >= limit) {
    throw new AppError(
      "PLAN_LIMIT",
      `Your ${plan} plan allows ${limit} active requests. Upgrade to create more.`,
      403
    );
  }
}

export async function createRequest(
  workspaceId: string,
  userId: string,
  input: CreateRequestInput
) {
  await connectDB();
  await assertActiveRequestLimit(workspaceId);

  const client = await Client.findOne({
    _id: input.clientId,
    workspaceId,
  });
  if (!client) throw new ValidationError("Client not found in this workspace");

  const publicToken = generatePublicToken(16);
  const dueDate = input.dueDate ? new Date(input.dueDate) : null;
  const status = input.sendNow ? "SENT" : "DRAFT";

  const request = await DocumentRequest.create({
    workspaceId,
    clientId: client._id,
    templateId: input.templateId || null,
    title: input.title,
    description: input.description ?? "",
    publicToken,
    status,
    dueDate,
    message: input.message ?? "",
    createdBy: userId,
    sentAt: input.sendNow ? new Date() : null,
  });

  await DocumentRequirement.insertMany(
    input.documents.map((doc) => ({
      workspaceId,
      requestId: request._id,
      name: doc.name,
      description: doc.description ?? "",
      required: doc.required,
      status: "PENDING",
      dueDate,
    }))
  );

  await logActivity({
    workspaceId,
    userId,
    clientId: client._id.toString(),
    requestId: request._id.toString(),
    action: "REQUEST_CREATED",
    description: `Request "${request.title}" created for ${client.name}`,
  });

  if (input.sendNow) {
    await logActivity({
      workspaceId,
      userId,
      clientId: client._id.toString(),
      requestId: request._id.toString(),
      action: "REQUEST_SENT",
      description: `Request sent to ${client.name}`,
    });

    if (client.email) {
      const [workspace, user] = await Promise.all([
        Workspace.findById(workspaceId),
        User.findById(userId),
      ]);
      await sendEmail({
        to: client.email,
        subject: `Document request: ${request.title}`,
        html: requestCreatedEmail({
          clientName: client.name,
          requestTitle: request.title,
          link: `${appUrl()}/request/${publicToken}`,
          professionalName: workspace?.name || user?.name || "Your advisor",
          message: request.message || undefined,
        }),
      });
    }
  }

  return getRequestDetail(workspaceId, request._id.toString());
}

export async function listRequests(
  workspaceId: string,
  options: {
    status?: string;
    clientId?: string;
    overdue?: string;
    search?: string;
    page?: number;
    limit?: number;
  } = {}
) {
  await connectDB();
  await refreshOverdueStatuses(workspaceId);

  const page = options.page ?? 1;
  const limit = options.limit ?? 20;
  const filter: Record<string, unknown> = {
    workspaceId: new mongoose.Types.ObjectId(workspaceId),
  };

  if (options.clientId) {
    filter.clientId = new mongoose.Types.ObjectId(options.clientId);
  }

  if (options.overdue === "true") {
    filter.status = "OVERDUE";
  } else if (options.status) {
    const statuses = options.status.split(",").filter(Boolean);
    if (statuses.length === 1) filter.status = statuses[0];
    else if (statuses.length > 1) filter.status = { $in: statuses };
  }

  if (options.search) {
    filter.title = { $regex: options.search.trim(), $options: "i" };
  }

  const [items, total] = await Promise.all([
    DocumentRequest.find(filter)
      .populate("clientId", "name email phone companyName")
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    DocumentRequest.countDocuments(filter),
  ]);

  const requestIds = items.map((r) => r._id);
  const requirements = await DocumentRequirement.find({
    workspaceId,
    requestId: { $in: requestIds },
  }).lean();

  const enriched = items.map((req) => {
    const reqReqs = requirements.filter(
      (r) => r.requestId.toString() === req._id.toString()
    );
    return {
      ...req,
      progress: calculateProgress(reqReqs),
    };
  });

  return { items: enriched, total, page, limit };
}

export async function getRequestDetail(workspaceId: string, requestId: string) {
  await connectDB();
  const request = await DocumentRequest.findOne({
    _id: requestId,
    workspaceId,
  })
    .populate("clientId")
    .lean();

  if (!request) throw new NotFoundError("Request not found");

  const [requirements, documents, reminders] = await Promise.all([
    DocumentRequirement.find({ workspaceId, requestId }).lean(),
    Document.find({ workspaceId, requestId }).sort({ uploadedAt: -1 }).lean(),
    Reminder.find({ workspaceId, requestId }).sort({ sentAt: -1 }).lean(),
  ]);

  const progress = calculateProgress(requirements);

  return {
    request,
    requirements,
    documents,
    reminders,
    progress,
    publicLink: `${appUrl()}/request/${request.publicToken}`,
  };
}

export async function sendRequest(workspaceId: string, userId: string, requestId: string) {
  await connectDB();
  const request = await DocumentRequest.findOne({
    _id: requestId,
    workspaceId,
  });
  if (!request) throw new NotFoundError("Request not found");

  if (request.status === "CANCELLED" || request.status === "COMPLETED") {
    throw new ValidationError("Cannot send a cancelled or completed request");
  }

  request.status = request.status === "DRAFT" ? "SENT" : request.status;
  request.sentAt = request.sentAt ?? new Date();
  await request.save();

  const client = await Client.findOne({
    _id: request.clientId,
    workspaceId,
  });

  await logActivity({
    workspaceId,
    userId,
    clientId: request.clientId.toString(),
    requestId: request._id.toString(),
    action: "REQUEST_SENT",
    description: `Request "${request.title}" sent`,
  });

  if (client?.email) {
    const workspace = await Workspace.findById(workspaceId);
    await sendEmail({
      to: client.email,
      subject: `Document request: ${request.title}`,
      html: requestCreatedEmail({
        clientName: client.name,
        requestTitle: request.title,
        link: `${appUrl()}/request/${request.publicToken}`,
        professionalName: workspace?.name || "Your advisor",
        message: request.message || undefined,
      }),
    });
  }

  return getRequestDetail(workspaceId, requestId);
}

export async function completeRequestIfReady(
  workspaceId: string,
  requestId: string
) {
  const requirements = await DocumentRequirement.find({
    workspaceId,
    requestId,
  });

  if (!isRequestComplete(requirements)) return null;

  const request = await DocumentRequest.findOneAndUpdate(
    { _id: requestId, workspaceId },
    { $set: { status: "COMPLETED", completedAt: new Date() } },
    { new: true }
  );

  if (!request) return null;

  const [client, workspace, user] = await Promise.all([
    Client.findOne({ _id: request.clientId, workspaceId }),
    Workspace.findById(workspaceId),
    User.findById(request.createdBy),
  ]);

  await logActivity({
    workspaceId,
    userId: request.createdBy.toString(),
    clientId: request.clientId.toString(),
    requestId: request._id.toString(),
    action: "REQUEST_COMPLETED",
    description: `Request "${request.title}" completed`,
  });

  if (client?.email) {
    await sendEmail({
      to: client.email,
      subject: `All documents complete: ${request.title}`,
      html: requestCompletedEmail({
        clientName: client.name,
        requestTitle: request.title,
        professionalName: workspace?.name || user?.name || "Your advisor",
      }),
    });
  }

  return request;
}

export async function cancelRequest(
  workspaceId: string,
  userId: string,
  requestId: string
) {
  await connectDB();
  const request = await DocumentRequest.findOneAndUpdate(
    { _id: requestId, workspaceId },
    { $set: { status: "CANCELLED" } },
    { new: true }
  );
  if (!request) throw new NotFoundError("Request not found");

  await logActivity({
    workspaceId,
    userId,
    clientId: request.clientId.toString(),
    requestId,
    action: "REQUEST_CANCELLED",
    description: `Request "${request.title}" cancelled`,
  });

  return request;
}

export async function refreshOverdueStatuses(workspaceId: string) {
  const now = new Date();
  await DocumentRequest.updateMany(
    {
      workspaceId,
      dueDate: { $lt: now },
      status: { $in: ["SENT", "IN_PROGRESS"] },
    },
    { $set: { status: "OVERDUE" } }
  );
}

export async function getPublicRequest(token: string) {
  await connectDB();
  const request = await DocumentRequest.findOne({ publicToken: token }).lean();
  if (!request) throw new NotFoundError("This document request link is invalid");

  if (["CANCELLED", "EXPIRED"].includes(request.status)) {
    throw new AppError(
      "REQUEST_UNAVAILABLE",
      "This document request is no longer available",
      410
    );
  }

  // Mark overdue for public view consistency
  if (
    request.dueDate &&
    new Date(request.dueDate) < new Date() &&
    ["SENT", "IN_PROGRESS"].includes(request.status)
  ) {
    await DocumentRequest.updateOne(
      { _id: request._id },
      { $set: { status: "OVERDUE" } }
    );
    request.status = "OVERDUE";
  }

  const [client, workspace, requirements, documents] = await Promise.all([
    Client.findById(request.clientId).select("name email phone companyName").lean(),
    Workspace.findById(request.workspaceId)
      .select("name logo email phone website plan")
      .lean(),
    DocumentRequirement.find({ requestId: request._id }).lean(),
    Document.find({ requestId: request._id }).sort({ uploadedAt: -1 }).lean(),
  ]);

  const progress = calculateProgress(requirements);
  const showBranding =
    !workspace?.plan ||
    !PLAN_LIMITS[workspace.plan as PlanType].removeBranding;

  return {
    request: {
      title: request.title,
      description: request.description,
      dueDate: request.dueDate,
      status: request.status,
      message: request.message,
      completedAt: request.completedAt,
    },
    client: client
      ? { name: client.name, companyName: client.companyName }
      : null,
    professional: workspace
      ? {
          name: workspace.name,
          logo: workspace.logo,
          email: workspace.email,
          phone: workspace.phone,
        }
      : null,
    requirements: requirements.map((r) => ({
      id: r._id.toString(),
      name: r.name,
      description: r.description,
      required: r.required,
      status: r.status,
      rejectionReason: r.rejectionReason,
      uploadedAt: r.uploadedAt,
      reviewedAt: r.reviewedAt,
    })),
    documents: documents.map((d) => ({
      id: d._id.toString(),
      requirementId: d.requirementId.toString(),
      originalName: d.originalName,
      fileUrl: d.fileUrl,
      fileType: d.fileType,
      fileSize: d.fileSize,
      status: d.status,
      uploadedAt: d.uploadedAt,
    })),
    progress,
    showBranding,
  };
}
