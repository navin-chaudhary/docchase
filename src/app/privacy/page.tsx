import Link from "next/link";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white text-foreground">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 py-28 sm:px-6">
        <h1 className="text-3xl font-semibold tracking-tight text-ink">
          Privacy & cookies
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          DocChase uses cookies to keep you signed in, protect your account, and
          remember your cookie preferences.
        </p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-slate-600">
          <section>
            <h2 className="text-base font-semibold text-ink">
              Essential cookies
            </h2>
            <p className="mt-2">
              Required for authentication, security, and basic site operation.
              These cannot be turned off if you use DocChase.
            </p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-ink">
              Preference cookies
            </h2>
            <p className="mt-2">
              Used to remember whether you accepted or rejected non-essential
              cookies via the cookie banner.
            </p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-ink">Your choices</h2>
            <p className="mt-2">
              You can accept or reject non-essential cookies using the banner on
              first visit. Clearing cookies in your browser will show the banner
              again.
            </p>
          </section>
        </div>

        <Link href="/" className={cn(buttonVariants(), "mt-10 inline-flex")}>
          Back to home
        </Link>
      </main>
      <SiteFooter />
    </div>
  );
}
