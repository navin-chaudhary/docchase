import { forgotPasswordSchema } from "@/lib/validations/auth";
import { requestPasswordReset } from "@/lib/services/auth.service";
import { handleApiError } from "@/lib/api/handler";
import { success } from "@/lib/api/response";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = forgotPasswordSchema.parse(body);
    await requestPasswordReset(email);
    return success({
      message: "If an account exists, a reset link has been sent.",
    });
  } catch (err) {
    return handleApiError(err);
  }
}
