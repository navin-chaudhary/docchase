import type { DocumentStatus } from "@/types";

export function calculateProgress(
  requirements: Array<{ required: boolean; status: DocumentStatus }>
): {
  totalRequired: number;
  approved: number;
  uploaded: number;
  pending: number;
  rejected: number;
  percent: number;
} {
  const required = requirements.filter((r) => r.required);
  const totalRequired = required.length;
  const approved = required.filter((r) => r.status === "APPROVED").length;
  const uploaded = required.filter((r) =>
    ["UPLOADED", "UNDER_REVIEW", "APPROVED"].includes(r.status)
  ).length;
  const pending = required.filter((r) => r.status === "PENDING").length;
  const rejected = required.filter((r) => r.status === "REJECTED").length;
  const percent =
    totalRequired === 0 ? 0 : Math.round((approved / totalRequired) * 100);

  return { totalRequired, approved, uploaded, pending, rejected, percent };
}

export function isRequestComplete(
  requirements: Array<{ required: boolean; status: DocumentStatus }>
): boolean {
  const required = requirements.filter((r) => r.required);
  return (
    required.length > 0 && required.every((r) => r.status === "APPROVED")
  );
}
