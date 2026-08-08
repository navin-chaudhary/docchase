import { requireSession } from "@/lib/auth/session";
import { handleApiError } from "@/lib/api/handler";
import { success } from "@/lib/api/response";
import { clientSchema } from "@/lib/validations/client";
import {
  deleteClient,
  getClientDetail,
  updateClient,
} from "@/lib/services/client.service";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  try {
    const session = await requireSession();
    const { id } = await params;
    const data = await getClientDetail(session.workspaceId, id);
    return success(data);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(req: Request, { params }: Params) {
  try {
    const session = await requireSession();
    const { id } = await params;
    const body = await req.json();
    const input = clientSchema.partial().parse(body);
    const client = await updateClient(session.workspaceId, id, input);
    return success(client);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const session = await requireSession();
    const { id } = await params;
    await deleteClient(session.workspaceId, id);
    return success({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
