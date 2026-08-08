import { resetPasswordSchema } from "@/lib/validations/auth";
import { resetPassword } from "@/lib/services/auth.service";
import { handleApiError } from "@/lib/api/handler";
import { success } from "@/lib/api/response";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token, password } = resetPasswordSchema.parse(body);
    await resetPassword(token, password);
    return success({ message: "Password updated successfully" });
  } catch (err) {
    return handleApiError(err);
  }
}
