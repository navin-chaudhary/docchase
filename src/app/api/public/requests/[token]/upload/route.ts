import { handleApiError } from "@/lib/api/handler";
import { success, validationError } from "@/lib/api/response";
import { uploadPublicDocument } from "@/lib/services/document.service";

type Params = { params: Promise<{ token: string }> };

export async function POST(req: Request, { params }: Params) {
  try {
    const { token } = await params;
    const form = await req.formData();
    const file = form.get("file");
    const requirementId = form.get("requirementId");

    if (!(file instanceof File)) {
      return validationError("File is required");
    }
    if (typeof requirementId !== "string" || !requirementId) {
      return validationError("requirementId is required");
    }

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    const data = await uploadPublicDocument({
      token,
      requirementId,
      file,
      ip,
    });

    return success(data, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
