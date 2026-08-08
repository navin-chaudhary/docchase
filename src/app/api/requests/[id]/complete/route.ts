import { requireSession } from "@/lib/auth/session";
import { handleApiError } from "@/lib/api/handler";
import { success, validationError } from "@/lib/api/response";
import { completeRequestIfReady } from "@/lib/services/request.service";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: Request, { params }: Params) {
  try {
    const session = await requireSession();
    const { id } = await params;
    const request = await completeRequestIfReady(session.workspaceId, id);
    if (!request) {
      return validationError(
        "Not all required documents are approved yet"
      );
    }
    return success(request);
  } catch (err) {
    return handleApiError(err);
  }
}
