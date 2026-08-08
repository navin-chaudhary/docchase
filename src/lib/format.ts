import { format, formatDistanceToNow, isValid, parseISO } from "date-fns";
import type { DocumentStatus, RequestStatus } from "@/types";

export function toDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  const date = typeof value === "string" ? parseISO(value) : value;
  return isValid(date) ? date : null;
}

export function formatDate(
  value: string | Date | null | undefined,
  pattern = "MMM d, yyyy"
): string {
  const date = toDate(value);
  if (!date) return "—";
  return format(date, pattern);
}

export function formatDateTime(value: string | Date | null | undefined): string {
  return formatDate(value, "MMM d, yyyy · h:mm a");
}

export function formatRelative(value: string | Date | null | undefined): string {
  const date = toDate(value);
  if (!date) return "—";
  return formatDistanceToNow(date, { addSuffix: true });
}

export function formatBytes(bytes: number): string {
  if (!bytes || bytes < 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** i;
  return `${value.toFixed(value >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
}

export function requestStatusLabel(status: RequestStatus | string): string {
  return status
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function documentStatusLabel(status: DocumentStatus | string): string {
  return requestStatusLabel(status);
}

export function requestStatusClass(status: RequestStatus | string): string {
  switch (status) {
    case "COMPLETED":
      return "bg-teal-50 text-teal-800 ring-teal-200/80";
    case "OVERDUE":
      return "bg-red-50 text-red-700 ring-red-200/80";
    case "IN_PROGRESS":
      return "bg-amber-50 text-amber-800 ring-amber-200/80";
    case "SENT":
      return "bg-sky-50 text-sky-800 ring-sky-200/80";
    case "DRAFT":
      return "bg-slate-100 text-slate-700 ring-slate-200/80";
    case "CANCELLED":
    case "EXPIRED":
      return "bg-slate-100 text-slate-500 ring-slate-200/80";
    default:
      return "bg-slate-100 text-slate-700 ring-slate-200/80";
  }
}

export function documentStatusClass(status: DocumentStatus | string): string {
  switch (status) {
    case "APPROVED":
      return "bg-teal-50 text-teal-800 ring-teal-200/80";
    case "REJECTED":
      return "bg-red-50 text-red-700 ring-red-200/80";
    case "UPLOADED":
    case "UNDER_REVIEW":
      return "bg-amber-50 text-amber-800 ring-amber-200/80";
    case "PENDING":
    default:
      return "bg-slate-100 text-slate-700 ring-slate-200/80";
  }
}

export function idOf(value: unknown): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object" && value !== null) {
    if ("_id" in value) return String((value as { _id: unknown })._id);
    if ("id" in value) return String((value as { id: unknown }).id);
  }
  return String(value);
}
