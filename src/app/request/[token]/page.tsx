"use client";

import { useCallback, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  CheckCircle2,
  FileUp,
  Loader2,
  Upload,
} from "lucide-react";
import { useApiQuery } from "@/hooks/use-api";
import { apiUpload, ApiClientError } from "@/lib/api/client";
import { formatBytes, formatDate, idOf } from "@/lib/format";
import { ALLOWED_EXTENSIONS, MAX_FILE_SIZE } from "@/types";
import { DocumentStatusBadge } from "@/components/shared/status-badge";
import { StateBanner } from "@/components/shared/state-banner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type PublicRequest = {
  request: {
    title: string;
    description?: string;
    dueDate?: string | null;
    status: string;
    message?: string;
    completedAt?: string | null;
  };
  client: { name: string; companyName?: string } | null;
  professional: {
    name: string;
    logo?: string | null;
    email?: string;
    phone?: string;
  } | null;
  requirements: Array<{
    id: string;
    name: string;
    description?: string;
    required: boolean;
    status: string;
    rejectionReason?: string | null;
    uploadedAt?: string | null;
  }>;
  documents: Array<{
    id: string;
    requirementId: string;
    originalName: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
    status: string;
    uploadedAt: string;
  }>;
  progress: {
    percent: number;
    approved: number;
    uploaded: number;
    pending: number;
    rejected: number;
    totalRequired: number;
  };
  showBranding: boolean;
};

export default function PublicRequestPage() {
  const params = useParams<{ token: string }>();
  const token = params.token;
  const queryClient = useQueryClient();
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const { data, isLoading, isError, error, refetch } = useApiQuery<PublicRequest>(
    ["public-request", token],
    `/api/public/requests/${token}`,
    undefined,
    { enabled: !!token }
  );

  const docsByRequirement = useMemo(() => {
    const map = new Map<string, PublicRequest["documents"][number]>();
    for (const doc of data?.documents || []) {
      map.set(idOf(doc.requirementId), doc);
    }
    return map;
  }, [data?.documents]);

  const uploadFile = useCallback(
    async (requirementId: string, file: File) => {
      if (file.size > MAX_FILE_SIZE) {
        toast.error("File must be 10MB or smaller");
        return;
      }

      const ext = `.${file.name.split(".").pop()?.toLowerCase() || ""}`;
      if (
        !ALLOWED_EXTENSIONS.includes(
          ext as (typeof ALLOWED_EXTENSIONS)[number]
        )
      ) {
        toast.error("Only PDF and image files are allowed");
        return;
      }

      setUploadingId(requirementId);
      setUploadProgress(15);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("requirementId", requirementId);

      const progressTimer = window.setInterval(() => {
        setUploadProgress((p) => (p >= 90 ? p : p + 8));
      }, 180);

      try {
        await apiUpload(`/api/public/requests/${token}/upload`, formData);
        setUploadProgress(100);
        toast.success("Document uploaded");
        await queryClient.invalidateQueries({
          queryKey: ["public-request", token],
        });
        await refetch();
      } catch (err) {
        toast.error(
          err instanceof ApiClientError ? err.message : "Upload failed"
        );
      } finally {
        window.clearInterval(progressTimer);
        setUploadingId(null);
        setUploadProgress(0);
      }
    },
    [token, queryClient, refetch]
  );

  function onDrop(requirementId: string, e: React.DragEvent) {
    e.preventDefault();
    setDragOverId(null);
    const file = e.dataTransfer.files?.[0];
    if (file) void uploadFile(requirementId, file);
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background px-4 py-10">
        <div className="page-enter mx-auto max-w-2xl space-y-4">
          <div className="flex flex-col items-center gap-3">
            <Skeleton className="size-11 rounded-xl" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-8 w-56" />
          </div>
          <Skeleton className="h-32 w-full rounded-[var(--radius)]" />
          <Skeleton className="h-40 w-full rounded-[var(--radius)]" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="page-enter w-full max-w-md">
          <StateBanner variant="error" title="Link unavailable">
            {error?.message ||
              "This document request link is invalid or no longer available."}
          </StateBanner>
        </div>
      </div>
    );
  }

  const completed = data.request.status === "COMPLETED";
  const canUpload = !["CANCELLED", "EXPIRED", "COMPLETED"].includes(
    data.request.status
  );

  return (
    <div className="min-h-screen bg-background px-4 py-8 sm:py-12">
      <div className="page-enter mx-auto max-w-2xl space-y-6">
        <div className="text-center">
          {data.professional?.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={data.professional.logo}
              alt={data.professional.name}
              className="mx-auto mb-3 h-10 object-contain"
            />
          ) : (
            <div className="mx-auto mb-3 flex size-11 items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-soft">
              {(data.professional?.name || "D").charAt(0)}
            </div>
          )}
          <p className="text-sm font-medium text-primary">
            {data.professional?.name || "Document request"}
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            {data.request.title}
          </h1>
          {data.client && (
            <p className="mt-1.5 text-sm text-muted-foreground">
              For {data.client.name}
              {data.client.companyName ? ` · ${data.client.companyName}` : ""}
            </p>
          )}
        </div>

        <Card>
          <CardContent className="space-y-4 py-5">
            {data.request.message && (
              <p className="text-sm leading-relaxed whitespace-pre-wrap text-ink">
                {data.request.message}
              </p>
            )}
            {data.request.description && (
              <p className="text-sm text-muted-foreground">
                {data.request.description}
              </p>
            )}
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              {data.request.dueDate && (
                <span>Due {formatDate(data.request.dueDate)}</span>
              )}
              <span>
                {data.progress.approved}/{data.progress.totalRequired} approved
              </span>
            </div>
            <div className="space-y-2">
              <Progress value={data.progress.percent} />
              <p className="text-xs text-muted-foreground">
                {data.progress.percent}% complete
              </p>
            </div>
          </CardContent>
        </Card>

        {completed && (
          <StateBanner variant="success" title="All set">
            All required documents have been approved. Thank you!
          </StateBanner>
        )}

        <div className="space-y-3">
          {data.requirements.map((req) => {
            const doc = docsByRequirement.get(req.id);
            const needsUpload = ["PENDING", "REJECTED"].includes(req.status);
            const isUploading = uploadingId === req.id;

            return (
              <Card key={req.id} className="overflow-hidden">
                <CardHeader className="flex flex-row items-start justify-between gap-3 border-b border-border pb-4">
                  <div className="min-w-0">
                    <CardTitle className="text-base">{req.name}</CardTitle>
                    {req.description && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {req.description}
                      </p>
                    )}
                  </div>
                  <DocumentStatusBadge status={req.status} />
                </CardHeader>
                <CardContent className="space-y-3 pt-4">
                  {req.rejectionReason && (
                    <StateBanner variant="error" title="Needs re-upload">
                      {req.rejectionReason}
                    </StateBanner>
                  )}

                  {doc && (
                    <div className="rounded-[var(--radius)] border border-border bg-muted/40 px-3.5 py-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-ink">
                            {doc.originalName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatBytes(doc.fileSize)}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          render={
                            <a
                              href={doc.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                            />
                          }
                        >
                          Preview
                        </Button>
                      </div>
                      {doc.fileType?.startsWith("image/") && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={doc.fileUrl}
                          alt={doc.originalName}
                          className="mt-2 max-h-48 w-full rounded-md object-contain"
                        />
                      )}
                    </div>
                  )}

                  {canUpload && needsUpload && (
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragOverId(req.id);
                      }}
                      onDragLeave={() => setDragOverId(null)}
                      onDrop={(e) => onDrop(req.id, e)}
                      className={cn(
                        "rounded-[var(--radius)] border border-dashed px-4 py-7 text-center transition-colors",
                        dragOverId === req.id
                          ? "border-primary bg-accent"
                          : "border-border bg-card"
                      )}
                    >
                      {isUploading ? (
                        <div className="space-y-2">
                          <Loader2 className="mx-auto size-6 animate-spin text-primary" />
                          <p className="text-sm text-muted-foreground">
                            Uploading...
                          </p>
                          <Progress
                            value={uploadProgress}
                            className="mx-auto max-w-xs"
                          />
                        </div>
                      ) : (
                        <>
                          <div className="mx-auto flex size-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                            <FileUp className="size-5" />
                          </div>
                          <p className="mt-3 text-sm font-medium text-ink">
                            Drag and drop a file here
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            PDF, JPG, PNG, or WEBP up to 10MB
                          </p>
                          <label className="mt-4 inline-flex">
                            <input
                              type="file"
                              className="hidden"
                              accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) void uploadFile(req.id, file);
                                e.target.value = "";
                              }}
                            />
                            <span className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-[var(--radius)] bg-primary px-3.5 text-sm font-medium text-primary-foreground shadow-soft transition-opacity hover:opacity-90">
                              <Upload className="size-4" />
                              Choose file
                            </span>
                          </label>
                        </>
                      )}
                    </div>
                  )}

                  {!needsUpload && req.status === "APPROVED" && (
                    <p className="flex items-center gap-1.5 text-sm font-medium text-primary">
                      <CheckCircle2 className="size-4" />
                      Approved
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {data.showBranding && (
          <p className="pb-6 text-center text-xs text-muted-foreground">
            Powered by DocChase
          </p>
        )}
      </div>
    </div>
  );
}
