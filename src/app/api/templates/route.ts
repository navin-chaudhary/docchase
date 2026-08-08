import { requireSession } from "@/lib/auth/session";
import { handleApiError } from "@/lib/api/handler";
import { success } from "@/lib/api/response";
import { templateSchema } from "@/lib/validations/template";
import {
  createTemplate,
  listTemplates,
} from "@/lib/services/template.service";

export async function GET() {
  try {
    const session = await requireSession();
    const items = await listTemplates(session.workspaceId);
    return success({ items });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireSession();
    const body = await req.json();
    const input = templateSchema.parse(body);
    const template = await createTemplate(
      session.workspaceId,
      session.id,
      input
    );
    return success(template, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
