"use client";

import { Suspense, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FileText, Plus, Search } from "lucide-react";
import { useApiQuery } from "@/hooks/use-api";
import { formatDate, idOf } from "@/lib/format";
import { EmptyState } from "@/components/shared/empty-state";
import { PageContainer, PageHeader } from "@/components/shared/page-header";
import { StateBanner } from "@/components/shared/state-banner";
import { RequestStatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type RequestRow = {
  _id: string;
  title: string;
  status: string;
  dueDate?: string | null;
  updatedAt: string;
  clientId?:
    | string
    | { _id?: string; name?: string; companyName?: string; email?: string };
  progress?: {
    percent: number;
    approved: number;
    totalRequired: number;
  };
};

type RequestsResponse = {
  items: RequestRow[];
  total: number;
  page: number;
  limit: number;
};

function RequestsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = searchParams.get("status") || "ALL";
  const overdue = searchParams.get("overdue") || "false";
  const search = searchParams.get("search") || "";
  const page = Number(searchParams.get("page") || 1);

  const params = useMemo(
    () => ({
      status: overdue === "true" || status === "ALL" ? undefined : status,
      overdue: overdue === "true" ? "true" : undefined,
      search: search || undefined,
      page,
      limit: 20,
    }),
    [status, overdue, search, page]
  );

  const { data, isLoading, isError, error } = useApiQuery<RequestsResponse>(
    ["requests"],
    "/api/requests",
    params
  );

  function updateQuery(next: Record<string, string | undefined>) {
    const sp = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(next)) {
      if (!value || value === "ALL" || value === "false") sp.delete(key);
      else sp.set(key, value);
    }
    if (!next.page) sp.delete("page");
    router.push(`/requests?${sp.toString()}`);
  }

  return (
    <PageContainer>
      <PageHeader
        title="Requests"
        description="Track document collection progress across clients."
        actions={
          <Button render={<Link href="/requests/new" />}>
            <Plus data-icon="inline-start" />
            New request
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            defaultValue={search}
            placeholder="Search requests..."
            className="pl-9"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                updateQuery({
                  search:
                    (e.target as HTMLInputElement).value.trim() || undefined,
                });
              }
            }}
          />
        </div>
        <Select
          value={overdue === "true" ? "OVERDUE_ONLY" : status}
          onValueChange={(value) => {
            if (value === "OVERDUE_ONLY") {
              updateQuery({ overdue: "true", status: undefined });
            } else {
              updateQuery({
                status: value || "ALL",
                overdue: undefined,
              });
            }
          }}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="SENT">Sent</SelectItem>
            <SelectItem value="IN_PROGRESS">In progress</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="OVERDUE">Overdue</SelectItem>
            <SelectItem value="OVERDUE_ONLY">Overdue only</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isError ? (
        <StateBanner variant="error" title="Couldn’t load requests">
          {error.message}
        </StateBanner>
      ) : null}

      {!isLoading && (data?.items.length ?? 0) === 0 ? (
        <EmptyState
          icon={FileText}
          title="No requests found"
          description="Create a request to start collecting documents from a client."
          action={
            <Button render={<Link href="/requests/new" />}>
              <Plus data-icon="inline-start" />
              New request
            </Button>
          }
        />
      ) : (
        <div className="surface overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Due</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={5}>
                      <Skeleton className="h-8 w-full" />
                    </TableCell>
                  </TableRow>
                ))}
              {data?.items.map((req) => {
                const clientName =
                  typeof req.clientId === "object"
                    ? req.clientId?.name || req.clientId?.companyName
                    : "Client";
                return (
                  <TableRow
                    key={req._id}
                    className="cursor-pointer"
                    onClick={() => router.push(`/requests/${idOf(req._id)}`)}
                  >
                    <TableCell className="font-medium text-ink">
                      {req.title}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {clientName}
                    </TableCell>
                    <TableCell>
                      <RequestStatusBadge status={req.status} />
                    </TableCell>
                    <TableCell className="min-w-36">
                      <div className="space-y-1">
                        <Progress value={req.progress?.percent ?? 0} />
                        <p className="text-xs text-muted-foreground">
                          {req.progress?.approved ?? 0}/
                          {req.progress?.totalRequired ?? 0} approved
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(req.dueDate)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {data && data.total > data.limit && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Page {data.page} · {data.total} total
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={data.page <= 1}
              onClick={() => updateQuery({ page: String(data.page - 1) })}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              disabled={data.page * data.limit >= data.total}
              onClick={() => updateQuery({ page: String(data.page + 1) })}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </PageContainer>
  );
}

export default function RequestsPage() {
  return (
    <Suspense
      fallback={
        <PageContainer>
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-64 w-full" />
        </PageContainer>
      }
    >
      <RequestsPageContent />
    </Suspense>
  );
}
