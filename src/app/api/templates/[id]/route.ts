import { requireSession } from "@/lib/auth/session";
import { handleApiError } from "@/lib/api/handler";
import { success } from "@/lib/api/response";
import { templateSchema } from "@/lib/validations/template";
import {
  deleteTemplate,
  duplicateTemplate,
  getTemplate,
  updateTemplate,
} from "@/lib/services/template.service";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  try {
    const session = await requireSession();
    const { id } = await params;
    const template = await getTemplate(session.workspaceId, id);
    return success(template);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(req: Request, { params }: Params) {
  try {
    const session = await requireSession();
    const { id } = await params;
    const body = await req.json();

    if (body.action === "duplicate") {
      const template = await duplicateTemplate(
        session.workspaceId,
        session.id,
        id
      );
      return success(template, 201);
    }

    const input = templateSchema.parse(body);
    const template = await updateTemplate(session.workspaceId, id, input);
    return success(template);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const session = await requireSession();
    const { id } = await params;
    await deleteTemplate(session.workspaceId, id);
    return success({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
