"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { useApiQuery } from "@/hooks/use-api";
import { formatDateTime, idOf } from "@/lib/format";
import { EmptyState } from "@/components/shared/empty-state";
import { PageContainer, PageHeader } from "@/components/shared/page-header";
import { StateBanner } from "@/components/shared/state-banner";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type ReminderRow = {
  _id: string;
  channel: string;
  message?: string;
  sentAt: string;
  requestId?:
    | string
    | {
        _id?: string;
        title?: string;
      };
};

type RemindersResponse = {
  items: ReminderRow[];
  total: number;
  page: number;
  limit: number;
};

export default function RemindersPage() {
  const { data, isLoading, isError, error } = useApiQuery<RemindersResponse>(
    ["reminders"],
    "/api/reminders",
    { limit: 50 }
  );

  return (
    <PageContainer>
      <PageHeader
        title="Reminders"
        description="History of email, WhatsApp, and manual follow-ups."
      />

      {isError ? (
        <StateBanner variant="error" title="Couldn’t load reminders">
          {error.message}
        </StateBanner>
      ) : null}

      {!isLoading && (data?.items.length ?? 0) === 0 ? (
        <EmptyState
          icon={Bell}
          title="No reminders sent yet"
          description="Reminders you send from a request will appear in this history."
        />
      ) : (
        <div className="surface overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request</TableHead>
                <TableHead>Channel</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Sent</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={4}>
                      <Skeleton className="h-8 w-full" />
                    </TableCell>
                  </TableRow>
                ))}
              {data?.items.map((reminder) => {
                const title =
                  typeof reminder.requestId === "object"
                    ? reminder.requestId?.title || "Request"
                    : "Request";
                const requestId =
                  typeof reminder.requestId === "object"
                    ? idOf(reminder.requestId?._id)
                    : idOf(reminder.requestId);
                return (
                  <TableRow key={reminder._id}>
                    <TableCell>
                      {requestId ? (
                        <Link
                          href={`/requests/${requestId}`}
                          className="font-medium text-primary transition-colors hover:opacity-80"
                        >
                          {title}
                        </Link>
                      ) : (
                        title
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{reminder.channel}</Badge>
                    </TableCell>
                    <TableCell className="max-w-md truncate text-muted-foreground">
                      {reminder.message || "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDateTime(reminder.sentAt)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </PageContainer>
  );
}
