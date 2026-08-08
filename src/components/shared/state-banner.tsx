import { AlertCircle, CheckCircle2, Info, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const variants = {
  error: {
    icon: AlertCircle,
    className: "border-red-200 bg-red-50 text-red-800",
  },
  success: {
    icon: CheckCircle2,
    className: "border-teal-200 bg-teal-50 text-teal-900",
  },
  info: {
    icon: Info,
    className: "border-sky-200 bg-sky-50 text-sky-900",
  },
  loading: {
    icon: Loader2,
    className: "border-border bg-card text-muted-foreground",
  },
} as const;

export function StateBanner({
  variant = "info",
  title,
  children,
  action,
  className,
}: {
  variant?: keyof typeof variants;
  title?: string;
  children?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  const config = variants[variant];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-[var(--radius)] border px-4 py-3 text-sm shadow-soft",
        config.className,
        className
      )}
    >
      <Icon
        className={cn(
          "mt-0.5 size-4 shrink-0",
          variant === "loading" && "animate-spin"
        )}
      />
      <div className="min-w-0 flex-1">
        {title ? <p className="font-medium">{title}</p> : null}
        {children ? (
          <div className={cn(title && "mt-0.5 opacity-90")}>{children}</div>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
