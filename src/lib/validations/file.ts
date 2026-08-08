import { ALLOWED_EXTENSIONS, ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from "@/types";
import { ValidationError } from "@/lib/api/errors";

export function validateUploadFile(file: File) {
  if (!file) {
    throw new ValidationError("No file provided");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new ValidationError("File size must be 10MB or less");
  }

  const name = file.name.toLowerCase();
  const hasAllowedExt = ALLOWED_EXTENSIONS.some((ext) => name.endsWith(ext));
  const hasAllowedType = (ALLOWED_FILE_TYPES as readonly string[]).includes(
    file.type
  );

  if (!hasAllowedExt || (!hasAllowedType && file.type !== "")) {
    throw new ValidationError(
      "Only PDF, JPG, JPEG, PNG, and WEBP files are allowed"
    );
  }

  return true;
}
