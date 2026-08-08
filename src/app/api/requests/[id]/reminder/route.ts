import { requireSession } from "@/lib/auth/session";
import { handleApiError } from "@/lib/api/handler";
import { success } from "@/lib/api/response";
import { reminderSchema } from "@/lib/validations/request";
import {
  getReminderPreview,
  sendReminder,
} from "@/lib/services/reminder.service";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  try {
    const session = await requireSession();
    const { id } = await params;
    const data = await getReminderPreview(session.workspaceId, id);
    return success(data);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: Request, { params }: Params) {
  try {
    const session = await requireSession();
    const { id } = await params;
    const body = await req.json();
    const input = reminderSchema.parse(body);
    const data = await sendReminder({
      workspaceId: session.workspaceId,
      userId: session.id,
      requestId: id,
      channel: input.channel,
      message: input.message,
    });
    return success(data);
  } catch (err) {
    return handleApiError(err);
  }
}
