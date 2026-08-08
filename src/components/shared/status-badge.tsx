import { Badge } from "@/components/ui/badge";
import {
  documentStatusClass,
  documentStatusLabel,
  requestStatusClass,
  requestStatusLabel,
} from "@/lib/format";
import { cn } from "@/lib/utils";

export function RequestStatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "h-6 rounded-md border-0 px-2 text-[11px] font-semibold tracking-wide uppercase ring-1",
        requestStatusClass(status),
        className
      )}
    >
      {requestStatusLabel(status)}
    </Badge>
  );
}

export function DocumentStatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "h-6 rounded-md border-0 px-2 text-[11px] font-semibold tracking-wide uppercase ring-1",
        documentStatusClass(status),
        className
      )}
    >
      {documentStatusLabel(status)}
    </Badge>
  );
}
