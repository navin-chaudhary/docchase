import mongoose from "mongoose";
import { connectDB } from "@/lib/db/connect";
import {
  Client,
  Document,
  DocumentRequest,
  DocumentRequirement,
  User,
  Workspace,
} from "@/models";
import { uploadToCloudinary } from "@/lib/storage/cloudinary";
import { validateUploadFile } from "@/lib/validations/file";
import { AppError, NotFoundError, ValidationError } from "@/lib/api/errors";
import { rateLimit } from "@/lib/utils/rate-limit";
import { PLAN_LIMITS, type PlanType } from "@/types";
import { logActivity } from "./activity.service";
import { completeRequestIfReady } from "./request.service";
import { sendEmail } from "@/lib/email/client";
import {
  documentApprovedEmail,
  documentRejectedEmail,
  documentUploadedEmail,
} from "@/lib/email/templates";
import { nanoid } from "nanoid";

function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

async function assertDocumentLimit(workspaceId: string) {
  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) throw new NotFoundError("Workspace not found");
  const plan = (workspace.plan || "FREE") as PlanType;
  const limit = PLAN_LIMITS[plan].documentsPerMonth;
  if (!Number.isFinite(limit)) return;

  const start = new Date();
  start.setDate(1);
  start.setHours(0, 0, 0, 0);

  const count = await Document.countDocuments({
    workspaceId,
    createdAt: { $gte: start },
  });

  if (count >= limit) {
    throw new AppError(
      "PLAN_LIMIT",
      `Your ${plan} plan allows ${limit} documents/month.`,
      403
    );
  }
}

export async function uploadPublicDocument(params: {
  token: string;
  requirementId: string;
  file: File;
  ip?: string;
}) {
  await connectDB();

  const rl = rateLimit(
    `upload:${params.ip || "unknown"}:${params.token}`,
    20,
    60 * 60 * 1000
  );
  if (!rl.success) {
    throw new AppError("RATE_LIMITED", "Too many uploads. Try again later.", 429);
  }

  validateUploadFile(params.file);

  const request = await DocumentRequest.findOne({
    publicToken: params.token,
  });
  if (!request) throw new NotFoundError("Invalid request link");
  if (["CANCELLED", "EXPIRED", "COMPLETED"].includes(request.status)) {
    throw new ValidationError("This request is not accepting uploads");
  }

  const requirement = await DocumentRequirement.findOne({
    _id: params.requirementId,
    requestId: request._id,
    workspaceId: request.workspaceId,
  });
  if (!requirement) throw new NotFoundError("Document requirement not found");

  await assertDocumentLimit(request.workspaceId.toString());

  const buffer = Buffer.from(await params.file.arrayBuffer());
  const fileName = `${nanoid(12)}-${params.file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

  const uploaded = await uploadToCloudinary(buffer, {
    folder: `docchase/${request.workspaceId}/${request._id}`,
    fileName,
    mimeType: params.file.type,
  });

  const doc = await Document.create({
    workspaceId: request.workspaceId,
    requestId: request._id,
    requirementId: requirement._id,
    clientId: request.clientId,
    originalName: params.file.name,
    fileName,
    fileUrl: uploaded.url,
    storageKey: uploaded.publicId,
    fileType: params.file.type || "application/octet-stream",
    fileSize: params.file.size,
    status: "UPLOADED",
    uploadedBy: "CLIENT",
    uploadedAt: new Date(),
  });

  requirement.status = "UNDER_REVIEW";
  requirement.uploadedAt = new Date();
  requirement.rejectionReason = null;
  requirement.currentDocumentId = doc._id;
  requirement.reviewedAt = null;
  await requirement.save();

  if (["SENT", "OVERDUE"].includes(request.status)) {
    request.status = "IN_PROGRESS";
    await request.save();
  }

  const [client, professional, workspace] = await Promise.all([
    Client.findById(request.clientId),
    User.findById(request.createdBy),
    Workspace.findById(request.workspaceId),
  ]);

  await logActivity({
    workspaceId: request.workspaceId.toString(),
    clientId: request.clientId.toString(),
    requestId: request._id.toString(),
    documentId: doc._id.toString(),
    action: "DOCUMENT_UPLOADED",
    description: `${client?.name || "Client"} uploaded ${requirement.name}`,
    metadata: { documentName: requirement.name },
  });

  if (professional?.email) {
    await sendEmail({
      to: professional.email,
      subject: `${client?.name || "Client"} uploaded ${requirement.name}`,
      html: documentUploadedEmail({
        professionalName: professional.name,
        clientName: client?.name || "Client",
        documentName: requirement.name,
        requestTitle: request.title,
        dashboardLink: `${appUrl()}/requests/${request._id}`,
      }),
    });
  }

  void workspace;

  return {
    document: {
      id: doc._id.toString(),
      originalName: doc.originalName,
      fileUrl: doc.fileUrl,
      fileType: doc.fileType,
      fileSize: doc.fileSize,
      status: doc.status,
      uploadedAt: doc.uploadedAt,
    },
    requirement: {
      id: requirement._id.toString(),
      status: requirement.status,
    },
  };
}

export async function approveRequirement(
  workspaceId: string,
  userId: string,
  requirementId: string
) {
  await connectDB();
  const requirement = await DocumentRequirement.findOne({
    _id: requirementId,
    workspaceId,
  });
  if (!requirement) throw new NotFoundError("Requirement not found");

  requirement.status = "APPROVED";
  requirement.reviewedAt = new Date();
  requirement.rejectionReason = null;
  await requirement.save();

  if (requirement.currentDocumentId) {
    await Document.findOneAndUpdate(
      { _id: requirement.currentDocumentId, workspaceId },
      { $set: { status: "APPROVED", reviewedAt: new Date(), rejectionReason: null } }
    );
  }

  const request = await DocumentRequest.findOne({
    _id: requirement.requestId,
    workspaceId,
  });
  const client = await Client.findOne({
    _id: request?.clientId,
    workspaceId,
  });

  await logActivity({
    workspaceId,
    userId,
    clientId: request?.clientId.toString(),
    requestId: requirement.requestId.toString(),
    documentId: requirement.currentDocumentId?.toString(),
    action: "DOCUMENT_APPROVED",
    description: `${requirement.name} approved`,
  });

  if (client?.email && request) {
    await sendEmail({
      to: client.email,
      subject: `${requirement.name} approved`,
      html: documentApprovedEmail({
        clientName: client.name,
        documentName: requirement.name,
        requestTitle: request.title,
      }),
    });
  }

  await completeRequestIfReady(workspaceId, requirement.requestId.toString());

  return requirement;
}

export async function rejectRequirement(
  workspaceId: string,
  userId: string,
  requirementId: string,
  reason: string
) {
  await connectDB();
  const requirement = await DocumentRequirement.findOne({
    _id: requirementId,
    workspaceId,
  });
  if (!requirement) throw new NotFoundError("Requirement not found");

  requirement.status = "REJECTED";
  requirement.reviewedAt = new Date();
  requirement.rejectionReason = reason;
  await requirement.save();

  if (requirement.currentDocumentId) {
    await Document.findOneAndUpdate(
      { _id: requirement.currentDocumentId, workspaceId },
      {
        $set: {
          status: "REJECTED",
          reviewedAt: new Date(),
          rejectionReason: reason,
        },
      }
    );
  }

  const request = await DocumentRequest.findOne({
    _id: requirement.requestId,
    workspaceId,
  });
  const client = await Client.findOne({
    _id: request?.clientId,
    workspaceId,
  });

  await logActivity({
    workspaceId,
    userId,
    clientId: request?.clientId.toString(),
    requestId: requirement.requestId.toString(),
    documentId: requirement.currentDocumentId?.toString(),
    action: "DOCUMENT_REJECTED",
    description: `${requirement.name} rejected`,
    metadata: { reason },
  });

  if (client?.email && request) {
    await sendEmail({
      to: client.email,
      subject: `${requirement.name} needs re-upload`,
      html: documentRejectedEmail({
        clientName: client.name,
        documentName: requirement.name,
        reason,
        link: `${appUrl()}/request/${request.publicToken}`,
      }),
    });
  }

  return requirement;
}

export async function listDocuments(
  workspaceId: string,
  options: {
    status?: string;
    clientId?: string;
    requestId?: string;
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

  if (options.status) filter.status = options.status;
  if (options.clientId) {
    filter.clientId = new mongoose.Types.ObjectId(options.clientId);
  }
  if (options.requestId) {
    filter.requestId = new mongoose.Types.ObjectId(options.requestId);
  }

  const [items, total] = await Promise.all([
    Document.find(filter)
      .populate("clientId", "name companyName")
      .populate("requestId", "title publicToken")
      .populate("requirementId", "name")
      .sort({ uploadedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Document.countDocuments(filter),
  ]);

  return { items, total, page, limit };
}

export async function getDocument(workspaceId: string, documentId: string) {
  await connectDB();
  const doc = await Document.findOne({ _id: documentId, workspaceId }).lean();
  if (!doc) throw new NotFoundError("Document not found");
  return doc;
}
