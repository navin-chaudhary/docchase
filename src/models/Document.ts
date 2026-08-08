import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const DocumentSchema = new Schema(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },
    requestId: {
      type: Schema.Types.ObjectId,
      ref: "DocumentRequest",
      required: true,
      index: true,
    },
    requirementId: {
      type: Schema.Types.ObjectId,
      ref: "DocumentRequirement",
      required: true,
      index: true,
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: "Client",
      required: true,
      index: true,
    },
    originalName: { type: String, required: true },
    fileName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    storageKey: { type: String, required: true },
    fileType: { type: String, required: true },
    fileSize: { type: Number, required: true },
    status: {
      type: String,
      enum: ["UPLOADED", "UNDER_REVIEW", "APPROVED", "REJECTED"],
      default: "UPLOADED",
    },
    uploadedBy: {
      type: String,
      enum: ["CLIENT", "PROFESSIONAL"],
      default: "CLIENT",
    },
    uploadedAt: { type: Date, default: Date.now },
    reviewedAt: { type: Date, default: null },
    rejectionReason: { type: String, default: null },
  },
  { timestamps: true }
);

DocumentSchema.index({ requestId: 1, requirementId: 1 });

export type IDocument = InferSchemaType<typeof DocumentSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Document: Model<IDocument> =
  mongoose.models.Document ||
  mongoose.model<IDocument>("Document", DocumentSchema);
