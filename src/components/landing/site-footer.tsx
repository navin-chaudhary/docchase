import Link from "next/link";
import { Logo } from "@/components/shared/logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-12 sm:px-6 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm">
          <Logo href="/" tone="sans" />
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Document collection for CA firms, accountants, and consultants —
            without the WhatsApp chase.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-muted-foreground">
          <Link href="/#how-it-works" className="transition-colors hover:text-ink">
            How it works
          </Link>
          <Link href="/#features" className="transition-colors hover:text-ink">
            Features
          </Link>
          <Link href="/#who" className="transition-colors hover:text-ink">
            Who it&apos;s for
          </Link>
          <Link href="/login" className="transition-colors hover:text-ink">
            Log in
          </Link>
          <Link href="/register" className="transition-colors hover:text-ink">
            Get started
          </Link>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 text-xs text-muted-foreground sm:px-6">
          <span>© {new Date().getFullYear()} DocChase</span>
          <a
            href="https://navin-dev.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-ink"
          >
            Built by Navin Chaudhary 🧑‍💻
          </a>
        </div>
      </div>
    </footer>
  );
}
