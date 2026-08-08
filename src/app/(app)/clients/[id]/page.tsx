"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { FileText, FolderOpen, Loader2, Plus } from "lucide-react";
import { useEffect } from "react";
import { useApiQuery } from "@/hooks/use-api";
import { apiPatch, ApiClientError } from "@/lib/api/client";
import { formatBytes, formatDate, formatDateTime, idOf } from "@/lib/format";
import { clientSchema, type ClientInput } from "@/lib/validations/client";
import { EmptyState } from "@/components/shared/empty-state";
import { PageContainer, PageHeader } from "@/components/shared/page-header";
import { StateBanner } from "@/components/shared/state-banner";
import {
  DocumentStatusBadge,
  RequestStatusBadge,
} from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

type ClientDetail = {
  client: {
    _id: string;
    name: string;
    email?: string;
    phone?: string;
    companyName?: string;
    address?: string;
    notes?: string;
    status: "ACTIVE" | "INACTIVE";
  };
  allRequests: Array<{
    _id: string;
    title: string;
    status: string;
    dueDate?: string | null;
    createdAt: string;
  }>;
  documentHistory: Array<{
    _id: string;
    originalName: string;
    fileSize: number;
    status: string;
    uploadedAt: string;
    fileUrl?: string;
  }>;
  pendingDocuments: Array<{
    _id: string;
    name: string;
    status: string;
    requestId: string;
  }>;
};

export default function ClientDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useApiQuery<ClientDetail>(
    ["clients", id],
    `/api/clients/${id}`,
    undefined,
    { enabled: !!id }
  );

  const form = useForm<ClientInput>({
    resolver: zodResolver(clientSchema),
  });

  useEffect(() => {
    if (!data?.client) return;
    form.reset({
      name: data.client.name || "",
      email: data.client.email || "",
      phone: data.client.phone || "",
      companyName: data.client.companyName || "",
      address: data.client.address || "",
      notes: data.client.notes || "",
      status: data.client.status || "ACTIVE",
    });
  }, [data?.client, form]);

  async function onSave(values: ClientInput) {
    try {
      await apiPatch(`/api/clients/${id}`, values);
      toast.success("Client updated");
      await queryClient.invalidateQueries({ queryKey: ["clients", id] });
      await queryClient.invalidateQueries({ queryKey: ["clients"] });
    } catch (err) {
      toast.error(
        err instanceof ApiClientError ? err.message : "Could not update client"
      );
    }
  }

  if (isLoading) {
    return (
      <PageContainer className="max-w-5xl">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-80 w-full" />
      </PageContainer>
    );
  }

  if (isError || !data) {
    return (
      <PageContainer className="max-w-5xl">
        <StateBanner variant="error" title="Couldn’t load client">
          {error?.message || "Client not found"}
        </StateBanner>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="max-w-5xl">
      <PageHeader
        breadcrumb={
          <>
            <Link
              href="/clients"
              className="transition-colors hover:text-primary"
            >
              Clients
            </Link>{" "}
            / {data.client.name}
          </>
        }
        title={data.client.name}
        description={`${data.client.companyName || "No company"} · ${data.pendingDocuments.length} pending documents`}
        actions={
          <Button
            render={
              <Link href={`/requests/new?clientId=${idOf(data.client._id)}`} />
            }
          >
            <Plus data-icon="inline-start" />
            New request
          </Button>
        }
      />

      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info">Info</TabsTrigger>
          <TabsTrigger value="requests">
            Requests ({data.allRequests.length})
          </TabsTrigger>
          <TabsTrigger value="documents">
            Documents ({data.documentHistory.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="mt-4">
          <Card>
            <CardHeader className="border-b border-border pb-4">
              <CardTitle>Client details</CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              <form
                onSubmit={form.handleSubmit(onSave)}
                className="grid gap-4 sm:grid-cols-2"
              >
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" {...form.register("name")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" {...form.register("email")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" {...form.register("phone")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company</Label>
                  <Input id="companyName" {...form.register("companyName")} />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={form.watch("status") || "ACTIVE"}
                    onValueChange={(value) =>
                      form.setValue("status", value as "ACTIVE" | "INACTIVE")
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="INACTIVE">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" {...form.register("address")} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea id="notes" rows={4} {...form.register("notes")} />
                </div>
                <div className="sm:col-span-2">
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting && (
                      <Loader2 className="animate-spin" />
                    )}
                    Save changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="mt-4 space-y-2">
          {data.allRequests.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No requests yet"
              description="Create a document request for this client."
              action={
                <Button
                  render={
                    <Link
                      href={`/requests/new?clientId=${idOf(data.client._id)}`}
                    />
                  }
                >
                  <Plus data-icon="inline-start" />
                  New request
                </Button>
              }
            />
          ) : (
            data.allRequests.map((req) => (
              <Link
                key={req._id}
                href={`/requests/${idOf(req._id)}`}
                className="surface interactive-press flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:border-primary/25 hover:shadow-lift"
              >
                <div>
                  <p className="text-sm font-medium text-ink">{req.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Created {formatDate(req.createdAt)}
                    {req.dueDate ? ` · Due ${formatDate(req.dueDate)}` : ""}
                  </p>
                </div>
                <RequestStatusBadge status={req.status} />
              </Link>
            ))
          )}
        </TabsContent>

        <TabsContent value="documents" className="mt-4 space-y-2">
          {data.documentHistory.length === 0 ? (
            <EmptyState
              icon={FolderOpen}
              title="No documents uploaded yet"
              description="Files uploaded for this client will appear here."
            />
          ) : (
            data.documentHistory.map((doc) => (
              <div
                key={doc._id}
                className="surface flex items-center justify-between gap-3 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">
                    {doc.originalName}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {formatBytes(doc.fileSize)} · {formatDateTime(doc.uploadedAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <DocumentStatusBadge status={doc.status} />
                  {doc.fileUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      render={
                        <a href={doc.fileUrl} target="_blank" rel="noreferrer" />
                      }
                    >
                      View
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
