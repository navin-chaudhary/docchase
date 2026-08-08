import { requireSession } from "@/lib/auth/session";
import { handleApiError } from "@/lib/api/handler";
import { success } from "@/lib/api/response";
import { clientQuerySchema, clientSchema } from "@/lib/validations/client";
import { createClient, listClients } from "@/lib/services/client.service";

export async function GET(req: Request) {
  try {
    const session = await requireSession();
    const { searchParams } = new URL(req.url);
    const query = clientQuerySchema.parse({
      search: searchParams.get("search") ?? undefined,
      status: searchParams.get("status") ?? undefined,
      page: searchParams.get("page") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
    });
    const data = await listClients(session.workspaceId, query);
    return success(data);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireSession();
    const body = await req.json();
    const input = clientSchema.parse(body);
    const client = await createClient(session.workspaceId, session.id, input);
    return success(client, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
