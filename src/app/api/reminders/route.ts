import { requireSession } from "@/lib/auth/session";
import { handleApiError } from "@/lib/api/handler";
import { success } from "@/lib/api/response";
import { listReminders } from "@/lib/services/reminder.service";

export async function GET(req: Request) {
  try {
    const session = await requireSession();
    const { searchParams } = new URL(req.url);
    const data = await listReminders(session.workspaceId, {
      requestId: searchParams.get("requestId") ?? undefined,
      page: Number(searchParams.get("page") || 1),
      limit: Number(searchParams.get("limit") || 30),
    });
    return success(data);
  } catch (err) {
    return handleApiError(err);
  }
}
