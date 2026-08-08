"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useFieldArray, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useApiQuery } from "@/hooks/use-api";
import { apiDelete, apiPatch, ApiClientError } from "@/lib/api/client";
import { templateSchema, type TemplateInput } from "@/lib/validations/template";
import { PageContainer, PageHeader } from "@/components/shared/page-header";
import { StateBanner } from "@/components/shared/state-banner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

type Template = TemplateInput & { _id: string };

export default function EditTemplatePage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useApiQuery<Template>(
    ["templates", id],
    `/api/templates/${id}`,
    undefined,
    { enabled: !!id }
  );

  const form = useForm<TemplateInput>({
    resolver: zodResolver(templateSchema) as Resolver<TemplateInput>,
    defaultValues: {
      name: "",
      description: "",
      documents: [{ name: "", description: "", required: true }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "documents",
  });

  useEffect(() => {
    if (!data) return;
    form.reset({
      name: data.name,
      description: data.description || "",
      documents: data.documents.map((d) => ({
        name: d.name,
        description: d.description || "",
        required: d.required,
      })),
    });
  }, [data, form]);

  async function onSubmit(values: TemplateInput) {
    try {
      await apiPatch(`/api/templates/${id}`, values);
      toast.success("Template saved");
      await queryClient.invalidateQueries({ queryKey: ["templates"] });
      await queryClient.invalidateQueries({ queryKey: ["templates", id] });
    } catch (err) {
      toast.error(
        err instanceof ApiClientError ? err.message : "Could not save template"
      );
    }
  }

  async function onDelete() {
    if (!confirm("Delete this template?")) return;
    try {
      await apiDelete(`/api/templates/${id}`);
      toast.success("Template deleted");
      await queryClient.invalidateQueries({ queryKey: ["templates"] });
      router.push("/templates");
    } catch (err) {
      toast.error(
        err instanceof ApiClientError ? err.message : "Could not delete"
      );
    }
  }

  if (isLoading) {
    return (
      <PageContainer className="max-w-3xl">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-80 w-full" />
      </PageContainer>
    );
  }

  if (isError || !data) {
    return (
      <PageContainer className="max-w-3xl">
        <StateBanner variant="error" title="Couldn’t load template">
          {error?.message || "Template not found"}
        </StateBanner>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="max-w-3xl">
      <PageHeader
        breadcrumb={
          <>
            <Link
              href="/templates"
              className="transition-colors hover:text-primary"
            >
              Templates
            </Link>{" "}
            / Edit
          </>
        }
        title={data.name}
        description="Update the checklist used when creating requests."
        actions={
          <Button variant="outline" onClick={onDelete}>
            Delete
          </Button>
        }
      />

      <Card>
        <CardHeader className="border-b border-border pb-4">
          <CardTitle>Edit template</CardTitle>
        </CardHeader>
        <CardContent className="pt-5">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...form.register("name")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={3}
                {...form.register("description")}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Documents</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    append({ name: "", description: "", required: true })
                  }
                >
                  <Plus data-icon="inline-start" />
                  Add document
                </Button>
              </div>
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="space-y-3 rounded-[var(--radius)] border border-border bg-background/60 p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 space-y-2">
                      <Label>Document name</Label>
                      <Input {...form.register(`documents.${index}.name`)} />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="mt-7"
                      disabled={fields.length === 1}
                      onClick={() => remove(index)}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input
                      {...form.register(`documents.${index}.description`)}
                    />
                  </div>
                  <label className="flex items-center gap-2 text-sm text-ink">
                    <Checkbox
                      checked={form.watch(`documents.${index}.required`)}
                      onCheckedChange={(checked) =>
                        form.setValue(
                          `documents.${index}.required`,
                          checked === true
                        )
                      }
                    />
                    Required
                  </label>
                </div>
              ))}
            </div>

            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting && (
                <Loader2 className="animate-spin" />
              )}
              Save changes
            </Button>
          </form>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
