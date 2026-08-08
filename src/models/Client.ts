import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const ClientSchema = new Schema(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true, default: "", index: true },
    phone: { type: String, trim: true, default: "", index: true },
    companyName: { type: String, trim: true, default: "" },
    address: { type: String, default: "" },
    notes: { type: String, default: "" },
    tags: { type: [String], default: [] },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
      index: true,
    },
  },
  { timestamps: true }
);

ClientSchema.index({ workspaceId: 1, name: 1 });
ClientSchema.index({ workspaceId: 1, email: 1 });

export type IClient = InferSchemaType<typeof ClientSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Client: Model<IClient> =
  mongoose.models.Client || mongoose.model<IClient>("Client", ClientSchema);
