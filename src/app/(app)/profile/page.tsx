"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { useApiQuery } from "@/hooks/use-api";
import { apiPatch, ApiClientError } from "@/lib/api/client";
import { profileUpdateSchema } from "@/lib/validations/auth";
import { workspaceUpdateSchema } from "@/lib/validations/workspace";
import { PageContainer, PageHeader } from "@/components/shared/page-header";
import { StateBanner } from "@/components/shared/state-banner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

type WorkspaceSettings = {
  workspace: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    website?: string;
    defaultReminderMessage?: string;
    defaultRequestMessage?: string;
  };
  profile: {
    name: string;
    email: string;
    phone?: string;
  };
};

type WorkspaceForm = z.infer<typeof workspaceUpdateSchema>;
type ProfileForm = z.infer<typeof profileUpdateSchema>;

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const { update } = useSession();
  const { data, isLoading, isError, error } = useApiQuery<WorkspaceSettings>(
    ["workspace"],
    "/api/workspace"
  );

  const workspaceForm = useForm<WorkspaceForm>({
    resolver: zodResolver(workspaceUpdateSchema),
  });

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileUpdateSchema),
  });

  useEffect(() => {
    if (!data) return;
    workspaceForm.reset({
      name: data.workspace.name || "",
      email: data.workspace.email || "",
      phone: data.workspace.phone || "",
      address: data.workspace.address || "",
      website: data.workspace.website || "",
      defaultReminderMessage: data.workspace.defaultReminderMessage || "",
      defaultRequestMessage: data.workspace.defaultRequestMessage || "",
    });
    profileForm.reset({
      name: data.profile.name || "",
      phone: data.profile.phone || "",
    });
  }, [data, workspaceForm, profileForm]);

  async function saveWorkspace(values: WorkspaceForm) {
    try {
      await apiPatch("/api/workspace", { scope: "workspace", data: values });
      toast.success("Workspace updated");
      await queryClient.invalidateQueries({ queryKey: ["workspace"] });
    } catch (err) {
      toast.error(
        err instanceof ApiClientError ? err.message : "Could not save workspace"
      );
    }
  }

  async function saveProfile(values: ProfileForm) {
    try {
      await apiPatch("/api/workspace", { scope: "profile", data: values });
      await update({ name: values.name });
      toast.success("Profile updated");
      await queryClient.invalidateQueries({ queryKey: ["workspace"] });
    } catch (err) {
      toast.error(
        err instanceof ApiClientError ? err.message : "Could not save profile"
      );
    }
  }

  if (isLoading) {
    return (
      <PageContainer className="max-w-3xl">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </PageContainer>
    );
  }

  if (isError || !data) {
    return (
      <PageContainer className="max-w-3xl">
        <StateBanner variant="error" title="Couldn’t load profile">
          {error?.message || "Could not load profile"}
        </StateBanner>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="max-w-3xl">
      <PageHeader
        title="Profile"
        description="Manage your account and workspace defaults."
      />

      <Card>
        <CardHeader className="border-b border-border pb-4">
          <CardTitle>Your details</CardTitle>
        </CardHeader>
        <CardContent className="pt-5">
          <form
            onSubmit={profileForm.handleSubmit(saveProfile)}
            className="grid gap-4 sm:grid-cols-2"
          >
            <div className="space-y-2">
              <Label htmlFor="profileName">Name</Label>
              <Input id="profileName" {...profileForm.register("name")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profileEmail">Email</Label>
              <Input
                id="profileEmail"
                value={data.profile.email}
                disabled
                readOnly
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="profilePhone">Phone</Label>
              <Input id="profilePhone" {...profileForm.register("phone")} />
            </div>
            <div className="sm:col-span-2">
              <Button
                type="submit"
                disabled={profileForm.formState.isSubmitting}
              >
                {profileForm.formState.isSubmitting && (
                  <Loader2 className="animate-spin" />
                )}
                Save profile
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b border-border pb-4">
          <CardTitle>Workspace</CardTitle>
        </CardHeader>
        <CardContent className="pt-5">
          <form
            onSubmit={workspaceForm.handleSubmit(saveWorkspace)}
            className="grid gap-4 sm:grid-cols-2"
          >
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="workspaceName">Workspace name</Label>
              <Input id="workspaceName" {...workspaceForm.register("name")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="workspaceEmail">Email</Label>
              <Input
                id="workspaceEmail"
                type="email"
                {...workspaceForm.register("email")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="workspacePhone">Phone</Label>
              <Input
                id="workspacePhone"
                {...workspaceForm.register("phone")}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="website">Website</Label>
              <Input id="website" {...workspaceForm.register("website")} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" {...workspaceForm.register("address")} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="defaultRequestMessage">
                Default request message
              </Label>
              <Textarea
                id="defaultRequestMessage"
                rows={3}
                {...workspaceForm.register("defaultRequestMessage")}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="defaultReminderMessage">
                Default reminder message
              </Label>
              <Textarea
                id="defaultReminderMessage"
                rows={3}
                {...workspaceForm.register("defaultReminderMessage")}
              />
              <p className="text-xs text-muted-foreground">
                Placeholders: {"{clientName}"}, {"{requestTitle}"},{" "}
                {"{pendingCount}"}, {"{link}"}
              </p>
            </div>
            <div className="sm:col-span-2">
              <Button
                type="submit"
                disabled={workspaceForm.formState.isSubmitting}
              >
                {workspaceForm.formState.isSubmitting && (
                  <Loader2 className="animate-spin" />
                )}
                Save workspace
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
