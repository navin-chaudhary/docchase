import { requireSession } from "@/lib/auth/session";
import { handleApiError } from "@/lib/api/handler";
import { success } from "@/lib/api/response";
import {
  cancelRequest,
  getRequestDetail,
} from "@/lib/services/request.service";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  try {
    const session = await requireSession();
    const { id } = await params;
    const data = await getRequestDetail(session.workspaceId, id);
    return success(data);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const session = await requireSession();
    const { id } = await params;
    const request = await cancelRequest(session.workspaceId, session.id, id);
    return success(request);
  } catch (err) {
    return handleApiError(err);
  }
}
