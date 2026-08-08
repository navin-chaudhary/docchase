import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const WorkspaceSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    logo: { type: String, default: null },
    email: { type: String, trim: true, lowercase: true, default: "" },
    phone: { type: String, trim: true, default: "" },
    address: { type: String, default: "" },
    website: { type: String, default: "" },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    plan: {
      type: String,
      enum: ["FREE", "STARTER", "PROFESSIONAL"],
      default: "FREE",
    },
    defaultReminderMessage: {
      type: String,
      default:
        "Hi {clientName}, just a reminder that you still have pending documents for {requestTitle}. Please upload them using the link below.",
    },
    defaultRequestMessage: {
      type: String,
      default:
        "Hi {clientName}, please upload the required documents for {requestTitle} using the secure link below.",
    },
  },
  { timestamps: true }
);

export type IWorkspace = InferSchemaType<typeof WorkspaceSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Workspace: Model<IWorkspace> =
  mongoose.models.Workspace ||
  mongoose.model<IWorkspace>("Workspace", WorkspaceSchema);
