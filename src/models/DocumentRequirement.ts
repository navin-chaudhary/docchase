import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const DocumentRequirementSchema = new Schema(
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
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    required: { type: Boolean, default: true },
    status: {
      type: String,
      enum: ["PENDING", "UPLOADED", "UNDER_REVIEW", "APPROVED", "REJECTED"],
      default: "PENDING",
      index: true,
    },
    rejectionReason: { type: String, default: null },
    dueDate: { type: Date, default: null },
    uploadedAt: { type: Date, default: null },
    reviewedAt: { type: Date, default: null },
    currentDocumentId: {
      type: Schema.Types.ObjectId,
      ref: "Document",
      default: null,
    },
  },
  { timestamps: true }
);

DocumentRequirementSchema.index({ requestId: 1, status: 1 });

export type IDocumentRequirement = InferSchemaType<
  typeof DocumentRequirementSchema
> & {
  _id: mongoose.Types.ObjectId;
};

export const DocumentRequirement: Model<IDocumentRequirement> =
  mongoose.models.DocumentRequirement ||
  mongoose.model<IDocumentRequirement>(
    "DocumentRequirement",
    DocumentRequirementSchema
  );
