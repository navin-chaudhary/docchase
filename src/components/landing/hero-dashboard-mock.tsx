import {
  Bell,
  CheckCircle2,
  FileStack,
  FileText,
  FolderOpen,
  LayoutDashboard,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { icon: LayoutDashboard, label: "Dashboard", active: false },
  { icon: FileText, label: "Requests", active: true },
  { icon: FolderOpen, label: "Documents", active: false },
  { icon: Users, label: "Clients", active: false },
  { icon: Bell, label: "Reminders", active: false },
  { icon: FileStack, label: "Templates", active: false },
];

const stats = [
  { label: "Total", value: "48" },
  { label: "Completed", value: "19" },
  { label: "In progress", value: "21" },
  { label: "Overdue", value: "8" },
];

const rows = [
  {
    request: "ITR Filing 2025-26",
    client: "Rahul Shah",
    status: "In progress",
    tone: "amber",
    updated: "2h ago",
  },
  {
    request: "KYC Documents",
    client: "Acme Corp",
    status: "Completed",
    tone: "teal",
    updated: "Yesterday",
  },
  {
    request: "Loan Application",
    client: "Neha Patel",
    status: "Overdue",
    tone: "red",
    updated: "3d ago",
  },
  {
    request: "Company Registration",
    client: "Bright Solutions",
    status: "In progress",
    tone: "amber",
    updated: "5h ago",
  },
];

function statusClass(tone: string) {
  if (tone === "teal") return "bg-teal-50 text-teal-700";
  if (tone === "red") return "bg-red-50 text-red-700";
  return "bg-amber-50 text-amber-800";
}

export function HeroDashboardMock() {
  return (
    <div className="relative mx-auto w-full max-w-[560px]">
      <div className="absolute -inset-6 rounded-[28px] bg-[radial-gradient(circle_at_30%_20%,rgba(14,124,116,0.18),transparent_55%)]" />
      <div className="relative overflow-hidden rounded-2xl border border-[#e5e9ef] bg-white shadow-[0_24px_60px_-28px_rgba(12,18,34,0.35)]">
        <div className="flex min-h-[340px]">
          <aside className="hidden w-[72px] shrink-0 border-r border-[#eef1f5] bg-[#fbfcfd] p-3 sm:block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="DocChase"
              className="mb-5 size-8 rounded-lg shadow-soft"
            />
            <div className="space-y-1.5">
              {nav.map((item) => (
                <div
                  key={item.label}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-lg px-1 py-2 text-[9px] font-medium",
                    item.active
                      ? "bg-teal-50 text-primary"
                      : "text-slate-400"
                  )}
                  title={item.label}
                >
                  <item.icon className="size-3.5" />
                  <span className="truncate">{item.label.split(" ")[0]}</span>
                </div>
              ))}
            </div>
          </aside>

          <div className="min-w-0 flex-1 p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium text-slate-400">Workspace</p>
                <h3 className="text-sm font-semibold text-slate-900">Requests</h3>
              </div>
              <div className="rounded-lg bg-primary px-2.5 py-1 text-[10px] font-semibold text-white">
                + New
              </div>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-[#eef1f5] bg-[#fbfcfd] px-2.5 py-2"
                >
                  <p className="text-[10px] text-slate-400">{stat.label}</p>
                  <p className="mt-0.5 text-base font-semibold text-slate-900">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="overflow-hidden rounded-xl border border-[#eef1f5]">
              <div className="grid grid-cols-[1.4fr_1fr_0.9fr_0.7fr] gap-2 border-b border-[#eef1f5] bg-[#fbfcfd] px-3 py-2 text-[9px] font-semibold uppercase tracking-wide text-slate-400">
                <span>Request</span>
                <span>Client</span>
                <span>Status</span>
                <span className="text-right">Updated</span>
              </div>
              {rows.map((row) => (
                <div
                  key={row.request}
                  className="grid grid-cols-[1.4fr_1fr_0.9fr_0.7fr] items-center gap-2 border-b border-[#eef1f5] px-3 py-2.5 last:border-0"
                >
                  <span className="truncate text-[11px] font-medium text-slate-800">
                    {row.request}
                  </span>
                  <span className="truncate text-[11px] text-slate-500">
                    {row.client}
                  </span>
                  <span
                    className={cn(
                      "w-fit rounded-full px-2 py-0.5 text-[9px] font-semibold capitalize",
                      statusClass(row.tone)
                    )}
                  >
                    {row.status}
                  </span>
                  <span className="text-right text-[10px] text-slate-400">
                    {row.updated}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="absolute -bottom-3 right-4 flex max-w-[240px] items-start gap-2.5 rounded-xl border border-[#e5e9ef] bg-white p-3 shadow-[0_12px_30px_-16px_rgba(12,18,34,0.4)] sm:right-8">
        <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-teal-50 text-primary">
          <Bell className="size-3.5" />
        </div>
        <div>
          <p className="text-[11px] font-semibold text-slate-900">
            Reminder sent to Acme Corp
          </p>
          <p className="mt-0.5 text-[10px] leading-snug text-slate-500">
            2 missing documents still pending
          </p>
        </div>
        <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-primary" />
      </div>
    </div>
  );
}
