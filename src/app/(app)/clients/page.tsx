"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Plus, Search, Users } from "lucide-react";
import { Suspense } from "react";
import { useApiQuery } from "@/hooks/use-api";
import { apiPost, ApiClientError } from "@/lib/api/client";
import { formatDate, idOf } from "@/lib/format";
import { clientSchema, type ClientInput } from "@/lib/validations/client";
import { EmptyState } from "@/components/shared/empty-state";
import { PageContainer, PageHeader } from "@/components/shared/page-header";
import { StateBanner } from "@/components/shared/state-banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

type ClientRow = {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  companyName?: string;
  status: "ACTIVE" | "INACTIVE";
  updatedAt: string;
};

type ClientsResponse = {
  items: ClientRow[];
  total: number;
  page: number;
  limit: number;
};

function ClientsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "ALL";
  const page = Number(searchParams.get("page") || 1);

  const params = useMemo(
    () => ({ search: search || undefined, status, page, limit: 20 }),
    [search, status, page]
  );

  const { data, isLoading, isError, error } = useApiQuery<ClientsResponse>(
    ["clients"],
    "/api/clients",
    params
  );

  const form = useForm<ClientInput>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      companyName: "",
      address: "",
      notes: "",
      status: "ACTIVE",
    },
  });

  function updateQuery(next: Record<string, string | undefined>) {
    const sp = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(next)) {
      if (!value || value === "ALL") sp.delete(key);
      else sp.set(key, value);
    }
    if (!next.page) sp.delete("page");
    router.push(`/clients?${sp.toString()}`);
  }

  async function onCreate(values: ClientInput) {
    try {
      const client = await apiPost<{ _id: string }>("/api/clients", values);
      toast.success("Client created");
      setOpen(false);
      form.reset();
      await queryClient.invalidateQueries({ queryKey: ["clients"] });
      router.push(`/clients/${idOf(client._id)}`);
    } catch (err) {
      toast.error(
        err instanceof ApiClientError ? err.message : "Could not create client"
      );
    }
  }

  return (
    <PageContainer>
      <PageHeader
        title="Clients"
        description="Manage contacts you collect documents from."
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus data-icon="inline-start" />
            Add client
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            defaultValue={search}
            placeholder="Search name, email, phone..."
            className="pl-9"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                updateQuery({
                  search: (e.target as HTMLInputElement).value.trim() || undefined,
                  page: undefined,
                });
              }
            }}
          />
        </div>
        <Select
          value={status}
          onValueChange={(value) =>
            updateQuery({ status: value || "ALL", page: undefined })
          }
        >
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="INACTIVE">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isError ? (
        <StateBanner variant="error" title="Couldn’t load clients">
          {error.message}
        </StateBanner>
      ) : null}

      {!isLoading && (data?.items.length ?? 0) === 0 ? (
        <EmptyState
          icon={Users}
          title="No clients found"
          description="Add your first client to start sending document requests."
          action={
            <Button onClick={() => setOpen(true)}>
              <Plus data-icon="inline-start" />
              Add client
            </Button>
          }
        />
      ) : (
        <div className="surface overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Updated</TableHead>
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
              {data?.items.map((client) => (
                <TableRow
                  key={client._id}
                  className="cursor-pointer"
                  onClick={() => router.push(`/clients/${idOf(client._id)}`)}
                >
                  <TableCell className="font-medium text-ink">
                    {client.name}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {client.companyName || "—"}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-ink">
                      {client.email || "—"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {client.phone || ""}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        client.status === "ACTIVE"
                          ? "border-0 bg-accent text-accent-foreground ring-1 ring-primary/15"
                          : "border-0 bg-muted text-muted-foreground ring-1 ring-border"
                      }
                    >
                      {client.status === "ACTIVE" ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(client.updatedAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {data && data.total > data.limit && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Showing {(data.page - 1) * data.limit + 1}–
            {Math.min(data.page * data.limit, data.total)} of {data.total}
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add client</DialogTitle>
            <DialogDescription>
              Create a contact you can send document requests to.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={form.handleSubmit(onCreate)}
            className="space-y-3"
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" {...form.register("name")} />
                {form.formState.errors.name && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...form.register("email")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" {...form.register("phone")} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="companyName">Company</Label>
                <Input id="companyName" {...form.register("companyName")} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" rows={3} {...form.register("notes")} />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && (
                  <Loader2 className="animate-spin" />
                )}
                Create client
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}

export default function ClientsPage() {
  return (
    <Suspense
      fallback={
        <PageContainer>
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-64 w-full" />
        </PageContainer>
      }
    >
      <ClientsPageContent />
    </Suspense>
  );
}
