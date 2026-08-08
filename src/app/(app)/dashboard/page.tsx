"use client";

import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  FolderOpen,
  Plus,
  Users,
} from "lucide-react";
import { useApiQuery } from "@/hooks/use-api";
import { formatDate, formatRelative, idOf } from "@/lib/format";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/shared/empty-state";
import { PageContainer, PageHeader } from "@/components/shared/page-header";
import { RequestStatusBadge } from "@/components/shared/status-badge";
import { StatCard } from "@/components/shared/stat-card";
import { StateBanner } from "@/components/shared/state-banner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type DashboardData = {
  cards: {
    totalClients: number;
    totalRequests: number;
    pendingDocuments: number;
    completedRequests: number;
    overdueRequests: number;
  };
  recentActivity: Array<{
    _id: string;
    action: string;
    description: string;
    createdAt: string;
  }>;
  upcomingReminders: Array<{
    _id: string;
    title: string;
    status: string;
    dueDate?: string | null;
    pendingCount: number;
    lastReminderAt?: string | null;
    clientId?: { name?: string; companyName?: string } | string;
  }>;
};

const stats = [
  {
    key: "totalClients" as const,
    label: "Active clients",
    icon: Users,
    href: "/clients",
    tone: "default" as const,
  },
  {
    key: "totalRequests" as const,
    label: "Total requests",
    icon: FileText,
    href: "/requests",
    tone: "default" as const,
  },
  {
    key: "pendingDocuments" as const,
    label: "Pending documents",
    icon: FolderOpen,
    href: "/documents",
    tone: "warning" as const,
  },
  {
    key: "completedRequests" as const,
    label: "Completed",
    icon: CheckCircle2,
    href: "/requests?status=COMPLETED",
    tone: "success" as const,
  },
  {
    key: "overdueRequests" as const,
    label: "Overdue",
    icon: AlertTriangle,
    href: "/requests?overdue=true",
    tone: "danger" as const,
  },
];

export default function DashboardPage() {
  const { data, isLoading, isError, error, refetch } = useApiQuery<DashboardData>(
    ["dashboard"],
    "/api/dashboard"
  );

  return (
    <PageContainer>
      <PageHeader
        title="Dashboard"
        description="Track requests, pending documents, and upcoming follow-ups."
        actions={
          <Link
            href="/requests/new"
            className={cn(buttonVariants(), "inline-flex")}
          >
            <Plus className="size-4" />
            New request
          </Link>
        }
      />

      {isError ? (
        <StateBanner
          variant="error"
          title="Couldn’t load dashboard"
          action={
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          }
        >
          {error.message}
        </StateBanner>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map((stat, index) => (
          <div
            key={stat.key}
            className="fade-up"
            style={{ animationDelay: `${index * 40}ms` }}
          >
            <StatCard
              label={stat.label}
              value={data?.cards[stat.key] ?? 0}
              href={stat.href}
              icon={stat.icon}
              loading={isLoading}
              tone={stat.tone}
            />
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
            <CardTitle>Recent activity</CardTitle>
            <Link
              href="/activity"
              className="text-[12px] font-semibold text-primary transition-colors hover:opacity-80"
            >
              View all
            </Link>
          </CardHeader>
          <CardContent className="space-y-1 pt-4">
            {isLoading &&
              Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))}
            {!isLoading && (data?.recentActivity.length ?? 0) === 0 && (
              <EmptyState
                title="No activity yet"
                description="Create a request or wait for a client upload to see activity here."
                className="border-0 bg-transparent py-10"
              />
            )}
            {data?.recentActivity.map((item) => (
              <div
                key={item._id}
                className="flex items-start justify-between gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-muted/60"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink">
                    {item.description}
                  </p>
                  <p className="mt-0.5 text-[12px] text-muted-foreground">
                    {item.action.replaceAll("_", " ")}
                  </p>
                </div>
                <span className="shrink-0 text-[12px] text-muted-foreground">
                  {formatRelative(item.createdAt)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
            <CardTitle>Needs attention</CardTitle>
            <Link
              href="/reminders"
              className="text-[12px] font-semibold text-primary transition-colors hover:opacity-80"
            >
              View all
            </Link>
          </CardHeader>
          <CardContent className="space-y-2 pt-4">
            {isLoading &&
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            {!isLoading && (data?.upcomingReminders.length ?? 0) === 0 && (
              <EmptyState
                title="You’re caught up"
                description="No open requests need reminders right now."
                className="border-0 bg-transparent py-10"
              />
            )}
            {data?.upcomingReminders.map((item) => {
              const clientName =
                typeof item.clientId === "object"
                  ? item.clientId?.name || item.clientId?.companyName
                  : null;
              return (
                <Link
                  key={item._id}
                  href={`/requests/${idOf(item._id)}`}
                  className="flex items-start justify-between gap-3 rounded-[calc(var(--radius)-1px)] border border-border bg-background/60 px-3.5 py-3 transition-all hover:border-primary/25 hover:bg-card hover:shadow-soft"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink">
                      {item.title}
                    </p>
                    <p className="mt-1 text-[12px] text-muted-foreground">
                      {clientName || "Client"} · {item.pendingCount} pending
                      {item.dueDate ? ` · due ${formatDate(item.dueDate)}` : ""}
                    </p>
                  </div>
                  <RequestStatusBadge status={item.status} />
                </Link>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
