"use client";

import { Suspense, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FolderOpen } from "lucide-react";
import { useApiQuery } from "@/hooks/use-api";
import { formatBytes, formatDateTime, idOf } from "@/lib/format";
import { EmptyState } from "@/components/shared/empty-state";
import { PageContainer, PageHeader } from "@/components/shared/page-header";
import { StateBanner } from "@/components/shared/state-banner";
import { DocumentStatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
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

type DocumentRow = {
  _id: string;
  originalName: string;
  fileUrl: string;
  fileSize: number;
  status: string;
  uploadedAt: string;
  clientId?: string | { _id?: string; name?: string; companyName?: string };
  requestId?: string | { _id?: string; title?: string };
  requirementId?: string | { _id?: string; name?: string };
};

type DocumentsResponse = {
  items: DocumentRow[];
  total: number;
  page: number;
  limit: number;
};

function DocumentsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = searchParams.get("status") || "ALL";
  const page = Number(searchParams.get("page") || 1);

  const params = useMemo(
    () => ({
      status: status === "ALL" ? undefined : status,
      page,
      limit: 20,
    }),
    [status, page]
  );

  const { data, isLoading, isError, error } = useApiQuery<DocumentsResponse>(
    ["documents"],
    "/api/documents",
    params
  );

  function updateQuery(next: Record<string, string | undefined>) {
    const sp = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(next)) {
      if (!value || value === "ALL") sp.delete(key);
      else sp.set(key, value);
    }
    if (!next.page) sp.delete("page");
    router.push(`/documents?${sp.toString()}`);
  }

  return (
    <PageContainer>
      <PageHeader
        title="Documents"
        description="All uploaded files across your workspace."
        actions={
          <Select
            value={status}
            onValueChange={(value) =>
              updateQuery({ status: value || "ALL", page: undefined })
            }
          >
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All statuses</SelectItem>
              <SelectItem value="UPLOADED">Uploaded</SelectItem>
              <SelectItem value="UNDER_REVIEW">Under review</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      {isError ? (
        <StateBanner variant="error" title="Couldn’t load documents">
          {error.message}
        </StateBanner>
      ) : null}

      {!isLoading && (data?.items.length ?? 0) === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="No documents yet"
          description="Uploaded client files will show up here for review."
        />
      ) : (
        <div className="surface overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Request</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Uploaded</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={6}>
                      <Skeleton className="h-8 w-full" />
                    </TableCell>
                  </TableRow>
                ))}
              {data?.items.map((doc) => {
                const clientName =
                  typeof doc.clientId === "object"
                    ? doc.clientId?.name || doc.clientId?.companyName
                    : "—";
                const requestTitle =
                  typeof doc.requestId === "object"
                    ? doc.requestId?.title
                    : "—";
                const requestId =
                  typeof doc.requestId === "object"
                    ? idOf(doc.requestId?._id)
                    : idOf(doc.requestId);
                return (
                  <TableRow key={doc._id}>
                    <TableCell>
                      <div className="font-medium text-ink">
                        {doc.originalName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatBytes(doc.fileSize)}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {clientName}
                    </TableCell>
                    <TableCell>
                      {requestId ? (
                        <Link
                          href={`/requests/${requestId}`}
                          className="font-medium text-primary transition-colors hover:opacity-80"
                        >
                          {requestTitle}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>
                      <DocumentStatusBadge status={doc.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDateTime(doc.uploadedAt)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        render={
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                          />
                        }
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {data && data.total > data.limit && (
        <div className="flex justify-end gap-2">
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
      )}
    </PageContainer>
  );
}

export default function DocumentsPage() {
  return (
    <Suspense
      fallback={
        <PageContainer>
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-64 w-full" />
        </PageContainer>
      }
    >
      <DocumentsPageContent />
    </Suspense>
  );
}
