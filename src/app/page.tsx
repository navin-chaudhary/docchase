import Link from "next/link";
import {
  ArrowRight,
  Check,
  FileCheck2,
  Link2,
  MessageCircle,
  Play,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { ChecklistMock } from "@/components/landing/checklist-mock";
import { HeroDashboardMock } from "@/components/landing/hero-dashboard-mock";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const trustPoints = [
  "No client login required",
  "Setup in minutes",
  "WhatsApp & email ready",
];

const featureCards = [
  {
    icon: Link2,
    title: "Create requests in minutes",
    body: "Pick a client, choose a template, set a due date, and share one secure link.",
  },
  {
    icon: FileCheck2,
    title: "Collect every document",
    body: "Clients upload PDFs and images from any device — no account needed.",
  },
  {
    icon: MessageCircle,
    title: "Remind without the chase",
    body: "Send email reminders or open WhatsApp with a prefilled follow-up message.",
  },
  {
    icon: ShieldCheck,
    title: "Review with confidence",
    body: "Approve clean files, reject unclear ones with a reason, and track progress.",
  },
];

const steps = [
  {
    step: "01",
    title: "Create a request",
    body: "Select the client, required documents, and due date.",
  },
  {
    step: "02",
    title: "Share the link",
    body: "Send it by WhatsApp or email. Clients upload instantly.",
  },
  {
    step: "03",
    title: "Review & complete",
    body: "Approve, reject, remind, and mark the request done.",
  },
];

const audiences = [
  "CA firms",
  "Accountants",
  "Consultants",
  "Loan agents",
  "Insurance agents",
  "HR consultants",
];

const faqs = [
  {
    q: "Do clients need a DocChase account?",
    a: "No. You send a secure link. Clients open it and upload documents immediately.",
  },
  {
    q: "What file types can clients upload?",
    a: "Clients can upload PDF, JPG, JPEG, PNG, and WEBP files — up to 10MB per file.",
  },
  {
    q: "Can I reject incorrect documents?",
    a: "Yes. Reject with a reason, and the client can re-upload from the same link.",
  },
  {
    q: "Who is DocChase built for?",
    a: "Professionals who regularly collect papers from clients — CAs, accountants, agents, and consultants.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-foreground">
      <SiteHeader />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden pt-24 pb-16 md:pt-28 md:pb-24">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(14,124,116,0.08),transparent_45%),linear-gradient(180deg,#ffffff_0%,#f7faf9_100%)]" />
          <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-10">
            <div className="fade-up">
              <div className="inline-flex items-center gap-2 rounded-full border border-teal-100 bg-teal-50/80 px-3 py-1 text-[12px] font-medium text-primary">
                <Sparkles className="size-3.5" />
                For client-facing professionals
              </div>

              <h1 className="mt-5 font-semibold text-[2.35rem] leading-[1.08] tracking-[-0.02em] text-ink sm:text-5xl md:text-[3.4rem]">
                Stop chasing clients for documents.
              </h1>

              <p className="mt-5 max-w-lg text-base leading-relaxed text-slate-500 sm:text-lg">
                Create document requests, collect files, track what’s missing,
                and remind clients — all from one simple workspace.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href="/register"
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "rounded-full px-5"
                  )}
                >
                  Get started
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="/#how-it-works"
                  className={cn(
                    buttonVariants({ size: "lg", variant: "outline" }),
                    "rounded-full bg-white px-5"
                  )}
                >
                  <span className="mr-1 inline-flex size-6 items-center justify-center rounded-full bg-slate-100">
                    <Play className="size-3 fill-current" />
                  </span>
                  See how it works
                </Link>
              </div>

              <ul className="mt-7 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:gap-x-5">
                {trustPoints.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 text-sm text-slate-500"
                  >
                    <span className="inline-flex size-5 items-center justify-center rounded-full bg-teal-50 text-primary">
                      <Check className="size-3" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="fade-up pb-6 [animation-delay:120ms] lg:pb-0">
              <HeroDashboardMock />
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-20 md:py-24">
          <div className="mx-auto max-w-6xl px-5 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-primary">
                Everything in one place
              </p>
              <h2 className="mt-3 font-semibold text-3xl tracking-[-0.02em] text-ink md:text-4xl">
                Built for smooth client communication
              </h2>
              <p className="mt-4 text-base leading-relaxed text-slate-500">
                Replace scattered WhatsApp threads with a clear request,
                upload, and review workflow.
              </p>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {featureCards.map((card) => (
                <div
                  key={card.title}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft transition-shadow hover:shadow-lift"
                >
                  <div className="inline-flex size-10 items-center justify-center rounded-full bg-teal-50 text-primary">
                    <card.icon className="size-4" />
                  </div>
                  <h3 className="mt-4 text-[15px] font-semibold text-ink">
                    {card.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">
                    {card.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Social proof + checklist */}
        <section className="bg-[#f6f8f9] py-20 md:py-24">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 sm:px-6 lg:grid-cols-2 lg:gap-16">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {["NC", "RS", "AP"].map((initials) => (
                    <span
                      key={initials}
                      className="inline-flex size-9 items-center justify-center rounded-full border-2 border-white bg-teal-100 text-[11px] font-semibold text-teal-800"
                    >
                      {initials}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-slate-500">
                  Loved by CAs, accountants & consultants
                </p>
              </div>

              <h2 className="mt-6 font-semibold text-3xl tracking-[-0.02em] text-ink md:text-[2.6rem] md:leading-tight">
                A better way to collect documents
              </h2>
              <p className="mt-4 max-w-md text-base leading-relaxed text-slate-500">
                See what’s uploaded, what’s missing, and who needs a reminder —
                without digging through chat history.
              </p>

              <Link
                href="/register"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "mt-8 rounded-full px-5"
                )}
              >
                Get started
                <ArrowRight className="size-4" />
              </Link>
            </div>

            <ChecklistMock />
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="py-20 md:py-24">
          <div className="mx-auto max-w-6xl px-5 sm:px-6">
            <div className="max-w-2xl">
              <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-primary">
                How it works
              </p>
              <h2 className="mt-3 font-semibold text-3xl tracking-[-0.02em] text-ink md:text-4xl">
                Three steps. Less chasing.
              </h2>
            </div>

            <ol className="mt-12 grid gap-6 md:grid-cols-3">
              {steps.map((item) => (
                <li
                  key={item.step}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft"
                >
                  <span className="font-semibold text-3xl text-primary/35">
                    {item.step}
                  </span>
                  <h3 className="mt-4 text-lg font-semibold text-ink">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">
                    {item.body}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Who */}
        <section id="who" className="border-y border-slate-100 bg-[#fafbfc] py-20">
          <div className="mx-auto max-w-6xl px-5 sm:px-6">
            <div className="max-w-2xl">
              <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-primary">
                Who it’s for
              </p>
              <h2 className="mt-3 font-semibold text-3xl tracking-[-0.02em] text-ink md:text-4xl">
                Made for professionals who collect papers for a living.
              </h2>
            </div>
            <ul className="mt-10 flex flex-wrap gap-3">
              {audiences.map((item) => (
                <li
                  key={item}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-soft"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-20 md:py-24">
          <div className="mx-auto max-w-6xl px-5 sm:px-6">
            <div className="max-w-2xl">
              <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-primary">
                FAQ
              </p>
              <h2 className="mt-3 font-semibold text-3xl tracking-[-0.02em] text-ink">
                Common questions
              </h2>
            </div>
            <div className="mt-12 grid gap-8 md:grid-cols-2">
              {faqs.map((item) => (
                <div key={item.q} className="border-t border-slate-200 pt-5">
                  <h3 className="text-[15px] font-semibold text-ink">{item.q}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">
                    {item.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="pb-20 md:pb-24">
          <div className="mx-auto max-w-6xl px-5 sm:px-6">
            <div className="rounded-3xl bg-primary px-6 py-14 text-center text-primary-foreground sm:px-10">
              <h2 className="font-semibold text-3xl tracking-[-0.02em] md:text-5xl">
                Stop chasing. Start collecting.
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-primary-foreground/85">
                Set up your workspace, send your first request link, and see
                missing documents clearly.
              </p>
              <Link
                href="/register"
                className={cn(
                  buttonVariants({ size: "lg", variant: "secondary" }),
                  "mt-8 rounded-full bg-white px-5 text-ink hover:bg-white/92"
                )}
              >
                Get started
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
