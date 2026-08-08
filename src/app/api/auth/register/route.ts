import { registerSchema } from "@/lib/validations/auth";
import { registerUser } from "@/lib/services/auth.service";
import { handleApiError } from "@/lib/api/handler";
import { success } from "@/lib/api/response";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const input = registerSchema.parse(body);
    const user = await registerUser(input);
    return success(user, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
