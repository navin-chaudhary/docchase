import { requireSession } from "@/lib/auth/session";
import { handleApiError } from "@/lib/api/handler";
import { success } from "@/lib/api/response";
import { approveRequirement } from "@/lib/services/document.service";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: Request, { params }: Params) {
  try {
    const session = await requireSession();
    const { id } = await params;
    const requirement = await approveRequirement(
      session.workspaceId,
      session.id,
      id
    );
    return success(requirement);
  } catch (err) {
    return handleApiError(err);
  }
}
