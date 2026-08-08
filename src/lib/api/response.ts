import { NextResponse } from "next/server";
import type { ApiErrorResponse, ApiSuccessResponse } from "@/types";

export function success<T>(data: T, status = 200) {
  const body: ApiSuccessResponse<T> = { success: true, data };
  return NextResponse.json(body, { status });
}

export function error(
  code: string,
  message: string,
  status = 400,
  details?: unknown
) {
  const body: ApiErrorResponse = {
    success: false,
    error: { code, message, details },
  };
  return NextResponse.json(body, { status });
}

export function unauthorized(message = "Unauthorized") {
  return error("UNAUTHORIZED", message, 401);
}

export function forbidden(message = "Forbidden") {
  return error("FORBIDDEN", message, 403);
}

export function notFound(message = "Resource not found") {
  return error("NOT_FOUND", message, 404);
}

export function validationError(message: string, details?: unknown) {
  return error("VALIDATION_ERROR", message, 400, details);
}

export function serverError(message = "Internal server error") {
  return error("INTERNAL_ERROR", message, 500);
}
