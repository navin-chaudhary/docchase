import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const ReminderSchema = new Schema(
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
    clientId: {
      type: Schema.Types.ObjectId,
      ref: "Client",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    channel: {
      type: String,
      enum: ["EMAIL", "WHATSAPP", "MANUAL"],
      required: true,
    },
    message: { type: String, required: true },
    sentAt: { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

ReminderSchema.index({ requestId: 1, sentAt: -1 });
ReminderSchema.index({ clientId: 1, sentAt: -1 });

export type IReminder = InferSchemaType<typeof ReminderSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Reminder: Model<IReminder> =
  mongoose.models.Reminder ||
  mongoose.model<IReminder>("Reminder", ReminderSchema);
