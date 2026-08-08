import { requireSession } from "@/lib/auth/session";
import { handleApiError } from "@/lib/api/handler";
import { success } from "@/lib/api/response";
import {
  createRequestSchema,
  requestQuerySchema,
} from "@/lib/validations/request";
import { createRequest, listRequests } from "@/lib/services/request.service";

export async function GET(req: Request) {
  try {
    const session = await requireSession();
    const { searchParams } = new URL(req.url);
    const query = requestQuerySchema.parse({
      status: searchParams.get("status") ?? undefined,
      clientId: searchParams.get("clientId") ?? undefined,
      overdue: searchParams.get("overdue") ?? undefined,
      search: searchParams.get("search") ?? undefined,
      page: searchParams.get("page") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
    });
    const data = await listRequests(session.workspaceId, query);
    return success(data);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireSession();
    const body = await req.json();
    const input = createRequestSchema.parse(body);
    const data = await createRequest(session.workspaceId, session.id, input);
    return success(data, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
