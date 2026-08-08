import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const DocumentRequestSchema = new Schema(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: "Client",
      required: true,
      index: true,
    },
    templateId: {
      type: Schema.Types.ObjectId,
      ref: "DocumentTemplate",
      default: null,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    publicToken: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    status: {
      type: String,
      enum: [
        "DRAFT",
        "SENT",
        "IN_PROGRESS",
        "COMPLETED",
        "EXPIRED",
        "CANCELLED",
        "OVERDUE",
      ],
      default: "DRAFT",
      index: true,
    },
    dueDate: { type: Date, default: null, index: true },
    message: { type: String, default: "" },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sentAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    lastReminderAt: { type: Date, default: null },
  },
  { timestamps: true }
);

DocumentRequestSchema.index({ workspaceId: 1, status: 1 });
DocumentRequestSchema.index({ workspaceId: 1, dueDate: 1 });
DocumentRequestSchema.index({ workspaceId: 1, clientId: 1 });

export type IDocumentRequest = InferSchemaType<typeof DocumentRequestSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const DocumentRequest: Model<IDocumentRequest> =
  mongoose.models.DocumentRequest ||
  mongoose.model<IDocumentRequest>("DocumentRequest", DocumentRequestSchema);
