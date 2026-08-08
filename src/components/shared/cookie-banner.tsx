"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie } from "lucide-react";
import {
  getCookieConsent,
  setCookieConsent,
  type CookieConsent,
} from "@/lib/cookies";
import { Button } from "@/components/ui/button";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = getCookieConsent();
    setVisible(!consent);
  }, []);

  function choose(value: CookieConsent) {
    setCookieConsent(value);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-4 sm:p-6">
      <div className="mx-auto flex max-w-3xl flex-col gap-4 rounded-2xl border border-border bg-card p-4 shadow-lift sm:flex-row sm:items-center sm:p-5">
        <div className="flex min-w-0 flex-1 gap-3">
          <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
            <Cookie className="size-4" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-ink">We use cookies</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              DocChase uses essential cookies for sign-in and security, and
              optional cookies to improve your experience.{" "}
              <Link
                href="/privacy"
                className="font-medium text-primary underline-offset-2 hover:underline"
              >
                Learn more
              </Link>
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            className="sm:min-w-[100px]"
            onClick={() => choose("rejected")}
          >
            Reject
          </Button>
          <Button className="sm:min-w-[100px]" onClick={() => choose("accepted")}>
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
}
