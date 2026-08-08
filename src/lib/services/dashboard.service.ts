import mongoose from "mongoose";
import { connectDB } from "@/lib/db/connect";
import {
  Activity,
  Client,
  DocumentRequest,
  DocumentRequirement,
  Reminder,
} from "@/models";
import { refreshOverdueStatuses } from "./request.service";

export async function getDashboardStats(workspaceId: string) {
  await connectDB();
  await refreshOverdueStatuses(workspaceId);

  const ws = new mongoose.Types.ObjectId(workspaceId);

  const [
    totalClients,
    totalRequests,
    completedRequests,
    overdueRequests,
    pendingDocuments,
    recentActivity,
    upcomingReminders,
  ] = await Promise.all([
    Client.countDocuments({ workspaceId: ws, status: "ACTIVE" }),
    DocumentRequest.countDocuments({ workspaceId: ws }),
    DocumentRequest.countDocuments({ workspaceId: ws, status: "COMPLETED" }),
    DocumentRequest.countDocuments({ workspaceId: ws, status: "OVERDUE" }),
    DocumentRequirement.countDocuments({
      workspaceId: ws,
      required: true,
      status: { $in: ["PENDING", "REJECTED", "UPLOADED", "UNDER_REVIEW"] },
    }),
    Activity.find({ workspaceId: ws })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean(),
    DocumentRequest.find({
      workspaceId: ws,
      status: { $in: ["SENT", "IN_PROGRESS", "OVERDUE"] },
    })
      .populate("clientId", "name companyName phone email")
      .sort({ dueDate: 1 })
      .limit(8)
      .lean(),
  ]);

  const reminderRequestIds = upcomingReminders.map((r) => r._id);
  const pendingByRequest = await DocumentRequirement.aggregate([
    {
      $match: {
        workspaceId: ws,
        requestId: { $in: reminderRequestIds },
        required: true,
        status: { $in: ["PENDING", "REJECTED"] },
      },
    },
    { $group: { _id: "$requestId", count: { $sum: 1 } } },
  ]);

  const pendingMap = new Map(
    pendingByRequest.map((p) => [p._id.toString(), p.count as number])
  );

  const lastReminders = await Reminder.find({
    workspaceId: ws,
    requestId: { $in: reminderRequestIds },
  })
    .sort({ sentAt: -1 })
    .lean();

  const lastReminderMap = new Map<string, Date>();
  for (const rem of lastReminders) {
    const key = rem.requestId.toString();
    if (!lastReminderMap.has(key)) {
      lastReminderMap.set(key, rem.sentAt);
    }
  }

  return {
    cards: {
      totalClients,
      totalRequests,
      pendingDocuments,
      completedRequests,
      overdueRequests,
    },
    recentActivity,
    upcomingReminders: upcomingReminders.map((req) => ({
      ...req,
      pendingCount: pendingMap.get(req._id.toString()) ?? 0,
      lastReminderAt:
        lastReminderMap.get(req._id.toString()) ?? req.lastReminderAt,
    })),
  };
}
