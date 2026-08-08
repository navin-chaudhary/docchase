"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Check,
  Copy,
  Loader2,
  Mail,
  MessageCircle,
  X,
} from "lucide-react";
import { useApiQuery } from "@/hooks/use-api";
import { apiPost, ApiClientError } from "@/lib/api/client";
import {
  formatBytes,
  formatDate,
  formatDateTime,
  formatRelative,
  idOf,
} from "@/lib/format";
import { buildWhatsAppUrl } from "@/lib/utils/whatsapp";
import { PageContainer, PageHeader } from "@/components/shared/page-header";
import { StateBanner } from "@/components/shared/state-banner";
import {
  DocumentStatusBadge,
  RequestStatusBadge,
} from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

type RequestDetail = {
  request: {
    _id: string;
    title: string;
    description?: string;
    status: string;
    dueDate?: string | null;
    message?: string;
    publicToken: string;
    createdAt: string;
    clientId:
      | string
      | {
          _id: string;
          name: string;
          email?: string;
          phone?: string;
          companyName?: string;
        };
  };
  requirements: Array<{
    _id: string;
    name: string;
    description?: string;
    required: boolean;
    status: string;
    rejectionReason?: string;
    currentDocumentId?: string;
    uploadedAt?: string;
  }>;
  documents: Array<{
    _id: string;
    requirementId: string;
    originalName: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
    status: string;
    uploadedAt: string;
  }>;
  reminders: Array<{
    _id: string;
    channel: string;
    sentAt: string;
    message?: string;
  }>;
  progress: {
    percent: number;
    approved: number;
    uploaded: number;
    pending: number;
    rejected: number;
    totalRequired: number;
  };
  publicLink: string;
};

export default function RequestDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error, refetch } =
    useApiQuery<RequestDetail>(["requests", id], `/api/requests/${id}`, undefined, {
      enabled: !!id,
    });

  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [reminderBusy, setReminderBusy] = useState<string | null>(null);

  const client =
    data && typeof data.request.clientId === "object"
      ? data.request.clientId
      : null;

  const docsByRequirement = useMemo(() => {
    const map = new Map<string, RequestDetail["documents"]>();
    for (const doc of data?.documents || []) {
      const key = idOf(doc.requirementId);
      const list = map.get(key) || [];
      list.push(doc);
      map.set(key, list);
    }
    return map;
  }, [data?.documents]);

  async function invalidate() {
    await queryClient.invalidateQueries({ queryKey: ["requests", id] });
    await queryClient.invalidateQueries({ queryKey: ["requests"] });
    await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    await refetch();
  }

  async function approve(requirementId: string) {
    setBusyId(requirementId);
    try {
      await apiPost(`/api/requirements/${requirementId}/approve`);
      toast.success("Document approved");
      await invalidate();
    } catch (err) {
      toast.error(
        err instanceof ApiClientError ? err.message : "Could not approve"
      );
    } finally {
      setBusyId(null);
    }
  }

  async function reject() {
    if (!rejectTarget || rejectReason.trim().length < 3) {
      toast.error("Please provide a rejection reason");
      return;
    }
    setBusyId(rejectTarget);
    try {
      await apiPost(`/api/requirements/${rejectTarget}/reject`, {
        reason: rejectReason.trim(),
      });
      toast.success("Document rejected");
      setRejectOpen(false);
      setRejectReason("");
      setRejectTarget(null);
      await invalidate();
    } catch (err) {
      toast.error(
        err instanceof ApiClientError ? err.message : "Could not reject"
      );
    } finally {
      setBusyId(null);
    }
  }

  async function sendReminder(channel: "EMAIL" | "WHATSAPP" | "MANUAL") {
    setReminderBusy(channel);
    try {
      const result = await apiPost<{
        whatsappUrl?: string;
        message?: string;
      }>(`/api/requests/${id}/reminder`, { channel });

      if (channel === "WHATSAPP") {
        const phone = client?.phone || "";
        const message =
          result.message ||
          `Reminder for ${data?.request.title}: ${data?.publicLink}`;
        const url = result.whatsappUrl || buildWhatsAppUrl(phone, message);
        window.open(url, "_blank", "noopener,noreferrer");
        toast.success("WhatsApp reminder opened");
      } else if (channel === "EMAIL") {
        toast.success("Email reminder sent");
      } else {
        toast.success("Reminder logged");
      }
      await invalidate();
    } catch (err) {
      toast.error(
        err instanceof ApiClientError ? err.message : "Could not send reminder"
      );
    } finally {
      setReminderBusy(null);
    }
  }

  async function copyLink() {
    if (!data?.publicLink) return;
    try {
      await navigator.clipboard.writeText(data.publicLink);
      toast.success("Link copied");
    } catch {
      toast.error("Could not copy link");
    }
  }

  if (isLoading) {
    return (
      <PageContainer className="max-w-5xl">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </PageContainer>
    );
  }

  if (isError || !data) {
    return (
      <PageContainer className="max-w-5xl">
        <StateBanner variant="error" title="Couldn’t load request">
          {error?.message || "Request not found"}
        </StateBanner>
      </PageContainer>
    );
  }

  const reviewable = ["UPLOADED", "UNDER_REVIEW"];

  return (
    <PageContainer className="max-w-5xl">
      <PageHeader
        breadcrumb={
          <>
            <Link
              href="/requests"
              className="transition-colors hover:text-primary"
            >
              Requests
            </Link>{" "}
            / {data.request.title}
          </>
        }
        title={data.request.title}
        description={
          <>
            {client ? (
              <Link
                href={`/clients/${idOf(client._id)}`}
                className="transition-colors hover:text-primary"
              >
                {client.name}
              </Link>
            ) : (
              "Client"
            )}
            {data.request.dueDate
              ? ` · Due ${formatDate(data.request.dueDate)}`
              : ""}
          </>
        }
        actions={
          <div className="flex flex-wrap gap-2">
            <RequestStatusBadge status={data.request.status} />
            <Button variant="outline" onClick={copyLink}>
              <Copy data-icon="inline-start" />
              Copy link
            </Button>
            <Button
              variant="outline"
              disabled={!!reminderBusy}
              onClick={() => sendReminder("EMAIL")}
            >
              {reminderBusy === "EMAIL" ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Mail data-icon="inline-start" />
              )}
              Email reminder
            </Button>
            <Button
              variant="outline"
              disabled={!!reminderBusy}
              onClick={() => sendReminder("WHATSAPP")}
            >
              {reminderBusy === "WHATSAPP" ? (
                <Loader2 className="animate-spin" />
              ) : (
                <MessageCircle data-icon="inline-start" />
              )}
              WhatsApp
            </Button>
          </div>
        }
      />

      <Card>
        <CardHeader className="border-b border-border pb-4">
          <CardTitle>Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-5">
          <Progress value={data.progress.percent} />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Approved", value: data.progress.approved },
              { label: "Uploaded", value: data.progress.uploaded },
              { label: "Pending", value: data.progress.pending },
              { label: "Rejected", value: data.progress.rejected },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-[calc(var(--radius)-1px)] border border-border bg-background/60 px-3 py-2.5"
              >
                <p className="text-[12px] text-muted-foreground">{item.label}</p>
                <p className="mt-0.5 text-lg font-semibold tabular-nums text-ink">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Public link:{" "}
            <a
              href={data.publicLink}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-primary transition-colors hover:opacity-80"
            >
              {data.publicLink}
            </a>
          </p>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight text-ink">
          Documents
        </h2>
        {data.requirements.map((req) => {
          const docs = docsByRequirement.get(idOf(req._id)) || [];
          const latest = docs[0];
          return (
            <Card key={req._id}>
              <CardContent className="flex flex-col gap-4 py-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-ink">{req.name}</p>
                    <DocumentStatusBadge status={req.status} />
                    {!req.required && (
                      <span className="text-xs text-muted-foreground">
                        Optional
                      </span>
                    )}
                  </div>
                  {req.description && (
                    <p className="text-sm text-muted-foreground">
                      {req.description}
                    </p>
                  )}
                  {req.rejectionReason && (
                    <StateBanner variant="error" title="Rejected">
                      {req.rejectionReason}
                    </StateBanner>
                  )}
                  {latest && (
                    <div className="text-sm text-muted-foreground">
                      <a
                        href={latest.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium text-primary transition-colors hover:opacity-80"
                      >
                        {latest.originalName}
                      </a>
                      <span>
                        {" "}
                        · {formatBytes(latest.fileSize)} ·{" "}
                        {formatDateTime(latest.uploadedAt)}
                      </span>
                      {latest.fileType?.startsWith("image/") && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={latest.fileUrl}
                          alt={latest.originalName}
                          className="mt-2 max-h-40 rounded-[var(--radius)] border border-border"
                        />
                      )}
                    </div>
                  )}
                </div>

                {reviewable.includes(req.status) && (
                  <div className="flex shrink-0 gap-2">
                    <Button
                      size="sm"
                      disabled={busyId === idOf(req._id)}
                      onClick={() => approve(idOf(req._id))}
                    >
                      {busyId === idOf(req._id) ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        <Check data-icon="inline-start" />
                      )}
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busyId === idOf(req._id)}
                      onClick={() => {
                        setRejectTarget(idOf(req._id));
                        setRejectReason("");
                        setRejectOpen(true);
                      }}
                    >
                      <X data-icon="inline-start" />
                      Reject
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {data.reminders.length > 0 && (
        <Card>
          <CardHeader className="border-b border-border pb-4">
            <CardTitle>Reminder history</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-4">
            {data.reminders.map((reminder) => (
              <div
                key={reminder._id}
                className="flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-muted/60"
              >
                <span className="font-medium text-ink">{reminder.channel}</span>
                <span className="text-muted-foreground">
                  {formatRelative(reminder.sentAt)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject document</DialogTitle>
            <DialogDescription>
              Tell the client what needs to be fixed so they can re-upload.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reason">Reason</Label>
            <Textarea
              id="reason"
              rows={4}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Image is blurry — please upload a clearer scan"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>
              Cancel
            </Button>
            <Button disabled={!!busyId} onClick={reject}>
              {busyId && <Loader2 className="animate-spin" />}
              Reject document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
