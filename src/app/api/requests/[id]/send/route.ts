import { requireSession } from "@/lib/auth/session";
import { handleApiError } from "@/lib/api/handler";
import { success } from "@/lib/api/response";
import { sendRequest } from "@/lib/services/request.service";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: Request, { params }: Params) {
  try {
    const session = await requireSession();
    const { id } = await params;
    const data = await sendRequest(session.workspaceId, session.id, id);
    return success(data);
  } catch (err) {
    return handleApiError(err);
  }
}
