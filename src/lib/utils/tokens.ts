import { randomBytes } from "crypto";

export function generatePublicToken(bytes = 16): string {
  return randomBytes(bytes).toString("hex");
}

export function generateResetToken(): string {
  return randomBytes(32).toString("hex");
}
