import { ZodError } from "zod";
import { AppError } from "./errors";
import { error, serverError } from "./response";

export function handleApiError(err: unknown) {
  if (err instanceof AppError) {
    return error(err.code, err.message, err.status, err.details);
  }

  if (err instanceof ZodError) {
    return error(
      "VALIDATION_ERROR",
      "Invalid request data",
      400,
      err.flatten()
    );
  }

  console.error("Unhandled API error:", err);
  return serverError();
}
