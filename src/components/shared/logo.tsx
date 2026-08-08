import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({
  href = "/",
  className,
  markClassName,
  wordmark = true,
  size = "md",
}: {
  href?: string;
  className?: string;
  markClassName?: string;
  wordmark?: boolean;
  size?: "sm" | "md" | "lg";
  tone?: "display" | "sans";
}) {
  const markPx = size === "sm" ? 28 : size === "lg" ? 40 : 32;
  const textSize =
    size === "sm" ? "text-base" : size === "lg" ? "text-[1.65rem]" : "text-lg";

  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-2.5 transition-opacity hover:opacity-90",
        className
      )}
    >
      <Image
        src="/logo.png"
        alt="DocChase"
        width={markPx}
        height={markPx}
        className={cn("rounded-[9px] shadow-soft", markClassName)}
        priority
      />
      {wordmark ? (
        <span className={cn("font-semibold tracking-tight text-ink", textSize)}>
          DocChase
        </span>
      ) : null}
    </Link>
  );
}
