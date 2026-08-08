import { requireSession } from "@/lib/auth/session";
import { handleApiError } from "@/lib/api/handler";
import { success } from "@/lib/api/response";
import { getDashboardStats } from "@/lib/services/dashboard.service";

export async function GET() {
  try {
    const session = await requireSession();
    const data = await getDashboardStats(session.workspaceId);
    return success(data);
  } catch (err) {
    return handleApiError(err);
  }
}
