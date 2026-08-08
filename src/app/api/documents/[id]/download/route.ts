import { requireSession } from "@/lib/auth/session";
import { handleApiError } from "@/lib/api/handler";
import { success } from "@/lib/api/response";
import { getDocument } from "@/lib/services/document.service";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  try {
    const session = await requireSession();
    const { id } = await params;
    const document = await getDocument(session.workspaceId, id);
    return success({
      url: document.fileUrl,
      fileName: document.originalName,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
