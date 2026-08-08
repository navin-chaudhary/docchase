import Link from "next/link";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export function StatCard({
  label,
  value,
  href,
  icon: Icon,
  loading,
  tone = "default",
  className,
}: {
  label: string;
  value: string | number;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
  loading?: boolean;
  tone?: "default" | "warning" | "danger" | "success";
  className?: string;
}) {
  const toneClass =
    tone === "danger"
      ? "hover:border-red-200"
      : tone === "warning"
        ? "hover:border-amber-200"
        : tone === "success"
          ? "hover:border-teal-200"
          : "hover:border-primary/30";

  const content = (
    <div
      className={cn(
        "group surface interactive-press relative h-full overflow-hidden p-4 sm:p-5",
        href && "hover:shadow-lift",
        toneClass,
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[13px] font-medium text-muted-foreground">{label}</p>
        {Icon ? (
          <span
            className={cn(
              "flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors",
              href && "group-hover:bg-accent group-hover:text-accent-foreground"
            )}
          >
            <Icon className="size-4" />
          </span>
        ) : null}
      </div>
      <div className="mt-3">
        {loading ? (
          <Skeleton className="h-9 w-16" />
        ) : (
          <p className="text-[1.85rem] font-semibold tracking-tight text-ink tabular-nums">
            {value}
          </p>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full">
        {content}
      </Link>
    );
  }

  return content;
}
