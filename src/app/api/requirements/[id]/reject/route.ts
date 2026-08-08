import { requireSession } from "@/lib/auth/session";
import { handleApiError } from "@/lib/api/handler";
import { success } from "@/lib/api/response";
import { rejectSchema } from "@/lib/validations/request";
import { rejectRequirement } from "@/lib/services/document.service";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Params) {
  try {
    const session = await requireSession();
    const { id } = await params;
    const body = await req.json();
    const { reason } = rejectSchema.parse(body);
    const requirement = await rejectRequirement(
      session.workspaceId,
      session.id,
      id,
      reason
    );
    return success(requirement);
  } catch (err) {
    return handleApiError(err);
  }
}
