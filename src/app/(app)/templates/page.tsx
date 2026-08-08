"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Copy, LayoutTemplate, Plus, Trash2 } from "lucide-react";
import { useApiQuery } from "@/hooks/use-api";
import { apiDelete, apiPatch, ApiClientError } from "@/lib/api/client";
import { formatDate, idOf } from "@/lib/format";
import { EmptyState } from "@/components/shared/empty-state";
import { PageContainer, PageHeader } from "@/components/shared/page-header";
import { StateBanner } from "@/components/shared/state-banner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type Template = {
  _id: string;
  name: string;
  description?: string;
  documents: Array<{ name: string; required: boolean }>;
  updatedAt: string;
};

export default function TemplatesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error } = useApiQuery<{ items: Template[] }>(
    ["templates"],
    "/api/templates"
  );

  async function duplicate(id: string) {
    try {
      const template = await apiPatch<Template>(`/api/templates/${id}`, {
        action: "duplicate",
      });
      toast.success("Template duplicated");
      await queryClient.invalidateQueries({ queryKey: ["templates"] });
      router.push(`/templates/${idOf(template._id)}`);
    } catch (err) {
      toast.error(
        err instanceof ApiClientError ? err.message : "Could not duplicate"
      );
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this template?")) return;
    try {
      await apiDelete(`/api/templates/${id}`);
      toast.success("Template deleted");
      await queryClient.invalidateQueries({ queryKey: ["templates"] });
    } catch (err) {
      toast.error(
        err instanceof ApiClientError ? err.message : "Could not delete"
      );
    }
  }

  return (
    <PageContainer>
      <PageHeader
        title="Templates"
        description="Reusable document checklists for faster requests."
        actions={
          <Button render={<Link href="/templates/new" />}>
            <Plus data-icon="inline-start" />
            New template
          </Button>
        }
      />

      {isError ? (
        <StateBanner variant="error" title="Couldn’t load templates">
          {error.message}
        </StateBanner>
      ) : null}

      {!isLoading && (data?.items.length ?? 0) === 0 ? (
        <EmptyState
          icon={LayoutTemplate}
          title="No templates yet"
          description="Create one to speed up new document requests."
          action={
            <Button render={<Link href="/templates/new" />}>
              <Plus data-icon="inline-start" />
              New template
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {isLoading &&
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-40 w-full rounded-[var(--radius)]" />
            ))}
          {data?.items.map((template, index) => (
            <Card
              key={template._id}
              className="fade-up interactive-press transition-shadow hover:shadow-lift"
              style={{ animationDelay: `${index * 40}ms` }}
            >
              <CardHeader className="flex flex-row items-start justify-between gap-2">
                <div className="min-w-0">
                  <CardTitle>
                    <Link
                      href={`/templates/${idOf(template._id)}`}
                      className="transition-colors hover:text-primary"
                    >
                      {template.name}
                    </Link>
                  </CardTitle>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {template.documents.length} documents · Updated{" "}
                    {formatDate(template.updatedAt)}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => duplicate(idOf(template._id))}
                    aria-label="Duplicate"
                  >
                    <Copy />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => remove(idOf(template._id))}
                    aria-label="Delete"
                  >
                    <Trash2 />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {template.description || "No description"}
                </p>
                <ul className="mt-3 space-y-1">
                  {template.documents.slice(0, 3).map((doc, idx) => (
                    <li key={idx} className="truncate text-xs text-muted-foreground">
                      {doc.required ? "•" : "○"} {doc.name}
                    </li>
                  ))}
                  {template.documents.length > 3 && (
                    <li className="text-xs text-muted-foreground/80">
                      +{template.documents.length - 3} more
                    </li>
                  )}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
