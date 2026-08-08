import mongoose from "mongoose";
import { connectDB } from "@/lib/db/connect";
import { DocumentTemplate } from "@/models";
import { NotFoundError } from "@/lib/api/errors";
import { logActivity } from "./activity.service";
import type { TemplateInput } from "@/lib/validations/template";

export async function listTemplates(workspaceId: string) {
  await connectDB();
  return DocumentTemplate.find({
    workspaceId: new mongoose.Types.ObjectId(workspaceId),
  })
    .sort({ updatedAt: -1 })
    .lean();
}

export async function createTemplate(
  workspaceId: string,
  userId: string,
  input: TemplateInput
) {
  await connectDB();
  const template = await DocumentTemplate.create({
    workspaceId,
    createdBy: userId,
    name: input.name,
    description: input.description ?? "",
    documents: input.documents,
  });

  await logActivity({
    workspaceId,
    userId,
    action: "TEMPLATE_CREATED",
    description: `Template "${template.name}" created`,
    metadata: { templateId: template._id.toString() },
  });

  return template;
}

export async function getTemplate(workspaceId: string, templateId: string) {
  await connectDB();
  const template = await DocumentTemplate.findOne({
    _id: templateId,
    workspaceId,
  }).lean();
  if (!template) throw new NotFoundError("Template not found");
  return template;
}

export async function updateTemplate(
  workspaceId: string,
  templateId: string,
  input: TemplateInput
) {
  await connectDB();
  const template = await DocumentTemplate.findOneAndUpdate(
    { _id: templateId, workspaceId },
    {
      $set: {
        name: input.name,
        description: input.description ?? "",
        documents: input.documents,
      },
    },
    { new: true }
  );
  if (!template) throw new NotFoundError("Template not found");
  return template;
}

export async function deleteTemplate(workspaceId: string, templateId: string) {
  await connectDB();
  const template = await DocumentTemplate.findOneAndDelete({
    _id: templateId,
    workspaceId,
  });
  if (!template) throw new NotFoundError("Template not found");
  return { ok: true };
}

export async function duplicateTemplate(
  workspaceId: string,
  userId: string,
  templateId: string
) {
  const original = await getTemplate(workspaceId, templateId);
  return createTemplate(workspaceId, userId, {
    name: `${original.name} (Copy)`,
    description: original.description ?? "",
    documents: original.documents.map((d) => ({
      name: d.name,
      description: d.description ?? "",
      required: d.required,
    })),
  });
}
