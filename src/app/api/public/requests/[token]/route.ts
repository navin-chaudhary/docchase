import { handleApiError } from "@/lib/api/handler";
import { success } from "@/lib/api/response";
import { getPublicRequest } from "@/lib/services/request.service";

type Params = { params: Promise<{ token: string }> };

export async function GET(_req: Request, { params }: Params) {
  try {
    const { token } = await params;
    const data = await getPublicRequest(token);
    return success(data);
  } catch (err) {
    return handleApiError(err);
  }
}
