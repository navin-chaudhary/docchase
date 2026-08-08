"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { apiPost, ApiClientError } from "@/lib/api/client";
import { idOf } from "@/lib/format";
import { templateSchema, type TemplateInput } from "@/lib/validations/template";
import { PageContainer, PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function NewTemplatePage() {
  const router = useRouter();
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

  async function onSubmit(values: TemplateInput) {
    try {
      const template = await apiPost<{ _id: string }>("/api/templates", values);
      toast.success("Template created");
      router.push(`/templates/${idOf(template._id)}`);
    } catch (err) {
      toast.error(
        err instanceof ApiClientError ? err.message : "Could not create template"
      );
    }
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
            / New
          </>
        }
        title="New template"
        description="Build a reusable checklist for common document requests."
      />

      <Card>
        <CardHeader className="border-b border-border pb-4">
          <CardTitle>Template details</CardTitle>
        </CardHeader>
        <CardContent className="pt-5">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...form.register("name")} />
              {form.formState.errors.name && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.name.message}
                </p>
              )}
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
              {form.formState.errors.documents?.root && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.documents.root.message}
                </p>
              )}
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="space-y-3 rounded-[var(--radius)] border border-border bg-background/60 p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 space-y-2">
                      <Label>Document name</Label>
                      <Input
                        {...form.register(`documents.${index}.name`)}
                        placeholder="e.g. Passport copy"
                      />
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
                      placeholder="Optional guidance for the client"
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

            <div className="flex gap-2">
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && (
                  <Loader2 className="animate-spin" />
                )}
                Create template
              </Button>
              <Button
                type="button"
                variant="outline"
                render={<Link href="/templates" />}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
