import { requireSession } from "@/lib/auth/session";
import { handleApiError } from "@/lib/api/handler";
import { success } from "@/lib/api/response";
import { listDocuments } from "@/lib/services/document.service";

export async function GET(req: Request) {
  try {
    const session = await requireSession();
    const { searchParams } = new URL(req.url);
    const data = await listDocuments(session.workspaceId, {
      status: searchParams.get("status") ?? undefined,
      clientId: searchParams.get("clientId") ?? undefined,
      requestId: searchParams.get("requestId") ?? undefined,
      page: Number(searchParams.get("page") || 1),
      limit: Number(searchParams.get("limit") || 20),
    });
    return success(data);
  } catch (err) {
    return handleApiError(err);
  }
}
