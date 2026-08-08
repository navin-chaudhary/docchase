"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Check, Loader2, Plus, Trash2 } from "lucide-react";
import { useApiQuery } from "@/hooks/use-api";
import { apiPost, ApiClientError } from "@/lib/api/client";
import { idOf } from "@/lib/format";
import { PageContainer, PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type Client = {
  _id: string;
  name: string;
  email?: string;
  companyName?: string;
};

type Template = {
  _id: string;
  name: string;
  description?: string;
  documents: Array<{
    name: string;
    description?: string;
    required: boolean;
  }>;
};

type DocDraft = {
  name: string;
  description: string;
  required: boolean;
};

const steps = [
  "Client",
  "Template",
  "Documents",
  "Due date",
  "Message",
  "Create",
] as const;

function NewRequestWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialClientId = searchParams.get("clientId") || "";

  const [step, setStep] = useState(0);
  const [clientId, setClientId] = useState(initialClientId);
  const [clientSearch, setClientSearch] = useState("");
  const [mode, setMode] = useState<"template" | "custom">("template");
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [documents, setDocuments] = useState<DocDraft[]>([
    { name: "", description: "", required: true },
  ]);
  const [dueDate, setDueDate] = useState("");
  const [message, setMessage] = useState("");
  const [sendNow, setSendNow] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const { data: clientsData, isLoading: clientsLoading } = useApiQuery<{
    items: Client[];
  }>(["clients", "picker"], "/api/clients", {
    search: clientSearch || undefined,
    status: "ACTIVE",
    limit: 50,
  });

  const { data: templatesData, isLoading: templatesLoading } = useApiQuery<{
    items: Template[];
  }>(["templates"], "/api/templates");

  const selectedClient = useMemo(
    () => clientsData?.items.find((c) => idOf(c._id) === clientId),
    [clientsData, clientId]
  );

  function applyTemplate(template: Template) {
    setTemplateId(idOf(template._id));
    setMode("template");
    setTitle(template.name);
    setDescription(template.description || "");
    setDocuments(
      template.documents.map((d) => ({
        name: d.name,
        description: d.description || "",
        required: d.required,
      }))
    );
  }

  function useCustom() {
    setMode("custom");
    setTemplateId(null);
    if (!title) setTitle("Document request");
    if (documents.length === 0 || !documents[0].name) {
      setDocuments([{ name: "", description: "", required: true }]);
    }
  }

  function canContinue() {
    if (step === 0) return !!clientId;
    if (step === 1) {
      if (mode === "template") return !!templateId;
      return title.trim().length >= 2;
    }
    if (step === 2) {
      return (
        documents.length > 0 &&
        documents.every((d) => d.name.trim().length > 0)
      );
    }
    return true;
  }

  async function createRequest() {
    if (!clientId || !title.trim() || documents.some((d) => !d.name.trim())) {
      toast.error("Please complete all required fields");
      return;
    }

    setSubmitting(true);
    try {
      const dueIso = dueDate
        ? new Date(`${dueDate}T23:59:59.000Z`).toISOString()
        : null;

      const result = await apiPost<{ request: { _id: string } }>(
        "/api/requests",
        {
          clientId,
          templateId: mode === "template" ? templateId : null,
          title: title.trim(),
          description: description.trim(),
          message: message.trim(),
          dueDate: dueIso,
          documents: documents.map((d) => ({
            name: d.name.trim(),
            description: d.description.trim(),
            required: d.required,
          })),
          sendNow,
        }
      );

      toast.success(sendNow ? "Request created and sent" : "Draft request created");
      router.push(`/requests/${idOf(result.request._id)}`);
    } catch (err) {
      toast.error(
        err instanceof ApiClientError ? err.message : "Could not create request"
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PageContainer className="max-w-3xl">
      <PageHeader
        breadcrumb={
          <>
            <Link
              href="/requests"
              className="transition-colors hover:text-primary"
            >
              Requests
            </Link>{" "}
            / New
          </>
        }
        title="New request"
        description="Walk through client, documents, and delivery in a few steps."
      />

      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {steps.map((label, index) => (
          <div key={label} className="flex items-center gap-1.5">
            <div
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-md text-xs font-semibold transition-colors",
                index === step
                  ? "bg-primary text-primary-foreground"
                  : index < step
                    ? "bg-accent text-accent-foreground"
                    : "bg-muted text-muted-foreground"
              )}
            >
              {index < step ? <Check className="size-3.5" /> : index + 1}
            </div>
            <span
              className={cn(
                "hidden whitespace-nowrap text-xs sm:inline",
                index === step
                  ? "font-medium text-ink"
                  : "text-muted-foreground"
              )}
            >
              {label}
            </span>
            {index < steps.length - 1 ? (
              <div className="mx-1 h-px w-4 shrink-0 bg-border sm:w-6" />
            ) : null}
          </div>
        ))}
      </div>

      <Card>
        <CardHeader className="border-b border-border pb-4">
          <CardTitle>{steps[step]}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-5">
          {step === 0 && (
            <>
              <Input
                placeholder="Search clients..."
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
              />
              <div className="max-h-80 space-y-2 overflow-y-auto">
                {clientsLoading && <Skeleton className="h-16 w-full" />}
                {clientsData?.items.map((client) => {
                  const selected = idOf(client._id) === clientId;
                  return (
                    <button
                      key={client._id}
                      type="button"
                      onClick={() => setClientId(idOf(client._id))}
                      className={cn(
                        "interactive-press w-full rounded-[var(--radius)] border px-4 py-3 text-left transition-colors",
                        selected
                          ? "border-primary bg-accent"
                          : "border-border hover:bg-muted/60"
                      )}
                    >
                      <p className="text-sm font-medium text-ink">
                        {client.name}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {[client.companyName, client.email]
                          .filter(Boolean)
                          .join(" · ") || "No contact details"}
                      </p>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant={mode === "template" ? "default" : "outline"}
                  onClick={() => setMode("template")}
                >
                  Use template
                </Button>
                <Button
                  type="button"
                  variant={mode === "custom" ? "default" : "outline"}
                  onClick={useCustom}
                >
                  Custom request
                </Button>
              </div>

              {mode === "template" ? (
                <div className="space-y-2">
                  {templatesLoading && <Skeleton className="h-20 w-full" />}
                  {(templatesData?.items.length ?? 0) === 0 &&
                    !templatesLoading && (
                      <p className="text-sm text-muted-foreground">
                        No templates available. Switch to custom or{" "}
                        <Link
                          href="/templates/new"
                          className="font-medium text-primary transition-colors hover:opacity-80"
                        >
                          create a template
                        </Link>
                        .
                      </p>
                    )}
                  {templatesData?.items.map((template) => {
                    const selected = templateId === idOf(template._id);
                    return (
                      <button
                        key={template._id}
                        type="button"
                        onClick={() => applyTemplate(template)}
                        className={cn(
                          "interactive-press w-full rounded-[var(--radius)] border px-4 py-3 text-left transition-colors",
                          selected
                            ? "border-primary bg-accent"
                            : "border-border hover:bg-muted/60"
                        )}
                      >
                        <p className="text-sm font-medium text-ink">
                          {template.name}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {template.documents.length} documents
                        </p>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label>Request title</Label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Onboarding documents"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
              )}

              {mode === "template" && templateId && (
                <div className="space-y-2">
                  <Label>Request title</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              {documents.map((doc, index) => (
                <div
                  key={index}
                  className="space-y-3 rounded-[var(--radius)] border border-border bg-background/60 p-4"
                >
                  <div className="flex gap-2">
                    <div className="flex-1 space-y-2">
                      <Label>Document name</Label>
                      <Input
                        value={doc.name}
                        onChange={(e) => {
                          const next = [...documents];
                          next[index] = { ...doc, name: e.target.value };
                          setDocuments(next);
                        }}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="mt-7"
                      disabled={documents.length === 1}
                      onClick={() =>
                        setDocuments(documents.filter((_, i) => i !== index))
                      }
                    >
                      <Trash2 />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input
                      value={doc.description}
                      onChange={(e) => {
                        const next = [...documents];
                        next[index] = {
                          ...doc,
                          description: e.target.value,
                        };
                        setDocuments(next);
                      }}
                    />
                  </div>
                  <label className="flex items-center gap-2 text-sm text-ink">
                    <Checkbox
                      checked={doc.required}
                      onCheckedChange={(checked) => {
                        const next = [...documents];
                        next[index] = { ...doc, required: checked === true };
                        setDocuments(next);
                      }}
                    />
                    Required
                  </label>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setDocuments([
                    ...documents,
                    { name: "", description: "", required: true },
                  ])
                }
              >
                <Plus data-icon="inline-start" />
                Add document
              </Button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due date (optional)</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Clients will see this deadline on the upload page.
              </p>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="message">Message to client</Label>
                <Textarea
                  id="message"
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Add context or instructions for the client..."
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-ink">
                <Checkbox
                  checked={sendNow}
                  onCheckedChange={(checked) => setSendNow(checked === true)}
                />
                Send request now (email client if available)
              </label>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-3 text-sm">
              <div className="space-y-2 rounded-[var(--radius)] border border-border bg-muted/50 p-4">
                <p>
                  <span className="text-muted-foreground">Client:</span>{" "}
                  <span className="font-medium text-ink">
                    {selectedClient?.name || "—"}
                  </span>
                </p>
                <p>
                  <span className="text-muted-foreground">Title:</span>{" "}
                  <span className="font-medium text-ink">{title || "—"}</span>
                </p>
                <p>
                  <span className="text-muted-foreground">Documents:</span>{" "}
                  <span className="text-ink">{documents.length}</span>
                </p>
                <p>
                  <span className="text-muted-foreground">Due date:</span>{" "}
                  <span className="text-ink">{dueDate || "None"}</span>
                </p>
                <p>
                  <span className="text-muted-foreground">Send now:</span>{" "}
                  <span className="text-ink">
                    {sendNow ? "Yes" : "Save as draft"}
                  </span>
                </p>
              </div>
              <ul className="space-y-1 text-muted-foreground">
                {documents.map((d, i) => (
                  <li key={i}>
                    {d.required ? "•" : "○"} {d.name}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-between pt-2">
            <Button
              type="button"
              variant="outline"
              disabled={step === 0 || submitting}
              onClick={() => setStep((s) => Math.max(0, s - 1))}
            >
              Back
            </Button>
            {step < steps.length - 1 ? (
              <Button
                type="button"
                disabled={!canContinue()}
                onClick={() => setStep((s) => s + 1)}
              >
                Continue
              </Button>
            ) : (
              <Button
                type="button"
                disabled={submitting || !canContinue()}
                onClick={createRequest}
              >
                {submitting && <Loader2 className="animate-spin" />}
                Create request
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}

export default function NewRequestPage() {
  return (
    <Suspense
      fallback={
        <PageContainer className="max-w-3xl">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-80 w-full" />
        </PageContainer>
      }
    >
      <NewRequestWizard />
    </Suspense>
  );
}
