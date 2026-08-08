"use client";

import Link from "next/link";
import { Activity } from "lucide-react";
import { useApiQuery } from "@/hooks/use-api";
import { formatRelative, idOf } from "@/lib/format";
import { EmptyState } from "@/components/shared/empty-state";
import { PageContainer, PageHeader } from "@/components/shared/page-header";
import { StateBanner } from "@/components/shared/state-banner";
import { Skeleton } from "@/components/ui/skeleton";

type ActivityRow = {
  _id: string;
  action: string;
  description: string;
  createdAt: string;
  requestId?: string | null;
  clientId?: string | null;
};

type ActivitiesResponse = {
  items: ActivityRow[];
  total: number;
  page: number;
  limit: number;
};

export default function ActivityPage() {
  const { data, isLoading, isError, error } = useApiQuery<ActivitiesResponse>(
    ["activities"],
    "/api/activities",
    { limit: 50 }
  );

  return (
    <PageContainer className="max-w-4xl">
      <PageHeader
        title="Activity"
        description="A chronological feed of workspace events."
      />

      {isError ? (
        <StateBanner variant="error" title="Couldn’t load activity">
          {error.message}
        </StateBanner>
      ) : null}

      <div className="space-y-2">
        {isLoading &&
          Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-[var(--radius)]" />
          ))}
        {!isLoading && (data?.items.length ?? 0) === 0 && (
          <EmptyState
            icon={Activity}
            title="No activity yet"
            description="Create a request or wait for a client upload to see events here."
          />
        )}
        {data?.items.map((item) => (
          <div
            key={item._id}
            className="surface flex items-start justify-between gap-4 px-4 py-3.5 transition-colors hover:border-primary/20"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-ink">{item.description}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {item.action.replaceAll("_", " ")}
                {item.requestId ? (
                  <>
                    {" · "}
                    <Link
                      href={`/requests/${idOf(item.requestId)}`}
                      className="font-medium text-primary transition-colors hover:opacity-80"
                    >
                      View request
                    </Link>
                  </>
                ) : null}
                {item.clientId ? (
                  <>
                    {" · "}
                    <Link
                      href={`/clients/${idOf(item.clientId)}`}
                      className="font-medium text-primary transition-colors hover:opacity-80"
                    >
                      View client
                    </Link>
                  </>
                ) : null}
              </p>
            </div>
            <span className="shrink-0 text-xs text-muted-foreground">
              {formatRelative(item.createdAt)}
            </span>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
