import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const TemplateDocumentSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    required: { type: Boolean, default: true },
  },
  { _id: false }
);

const DocumentTemplateSchema = new Schema(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    documents: { type: [TemplateDocumentSchema], default: [] },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

DocumentTemplateSchema.index({ workspaceId: 1, name: 1 });

export type IDocumentTemplate = InferSchemaType<
  typeof DocumentTemplateSchema
> & {
  _id: mongoose.Types.ObjectId;
};

export const DocumentTemplate: Model<IDocumentTemplate> =
  mongoose.models.DocumentTemplate ||
  mongoose.model<IDocumentTemplate>("DocumentTemplate", DocumentTemplateSchema);
