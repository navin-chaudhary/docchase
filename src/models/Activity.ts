import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const ActivitySchema = new Schema(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: "Client",
      default: null,
    },
    requestId: {
      type: Schema.Types.ObjectId,
      ref: "DocumentRequest",
      default: null,
      index: true,
    },
    documentId: {
      type: Schema.Types.ObjectId,
      ref: "Document",
      default: null,
    },
    action: {
      type: String,
      enum: [
        "REQUEST_CREATED",
        "REQUEST_SENT",
        "DOCUMENT_UPLOADED",
        "DOCUMENT_APPROVED",
        "DOCUMENT_REJECTED",
        "REMINDER_SENT",
        "REQUEST_COMPLETED",
        "CLIENT_CREATED",
        "TEMPLATE_CREATED",
        "REQUEST_CANCELLED",
      ],
      required: true,
    },
    description: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

ActivitySchema.index({ workspaceId: 1, createdAt: -1 });
ActivitySchema.index({ requestId: 1, createdAt: -1 });

export type IActivity = InferSchemaType<typeof ActivitySchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Activity: Model<IActivity> =
  mongoose.models.Activity ||
  mongoose.model<IActivity>("Activity", ActivitySchema);
