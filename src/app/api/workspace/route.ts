import { requireSession } from "@/lib/auth/session";
import { handleApiError } from "@/lib/api/handler";
import { success } from "@/lib/api/response";
import { workspaceUpdateSchema } from "@/lib/validations/workspace";
import { profileUpdateSchema } from "@/lib/validations/auth";
import {
  getWorkspace,
  updateProfile,
  updateWorkspace,
} from "@/lib/services/workspace.service";
import { getProfile } from "@/lib/services/auth.service";

export async function GET() {
  try {
    const session = await requireSession();
    const [workspace, profile] = await Promise.all([
      getWorkspace(session.workspaceId),
      getProfile(session.id, session.workspaceId),
    ]);
    return success({ workspace, profile });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await requireSession();
    const body = await req.json();
    const scope = body.scope as "workspace" | "profile" | undefined;

    if (scope === "profile") {
      const input = profileUpdateSchema.parse(body.data ?? body);
      const profile = await updateProfile(
        session.id,
        session.workspaceId,
        input
      );
      return success({ profile });
    }

    const input = workspaceUpdateSchema.parse(body.data ?? body);
    const workspace = await updateWorkspace(session.workspaceId, input);
    return success({ workspace });
  } catch (err) {
    return handleApiError(err);
  }
}
