import { Logo } from "@/components/shared/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 left-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(14,124,116,0.12),transparent_68%)]" />
        <div className="absolute inset-0 opacity-[0.35] [background-image:linear-gradient(rgba(12,18,34,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(12,18,34,0.035)_1px,transparent_1px)] [background-size:40px_40px]" />
      </div>

      <div className="relative z-10 mb-8 flex flex-col items-center text-center">
        <Logo href="/" size="lg" />
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
          Stop chasing clients for documents.
        </p>
      </div>

      <div className="relative z-10 w-full max-w-[420px] fade-up">{children}</div>
    </div>
  );
}
