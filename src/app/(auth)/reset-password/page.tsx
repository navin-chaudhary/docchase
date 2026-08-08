"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { apiPost, ApiClientError } from "@/lib/api/client";
import { resetPasswordSchema } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { Skeleton } from "@/components/ui/skeleton";

type ResetInput = z.infer<typeof resetPasswordSchema>;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token, password: "" },
  });

  async function onSubmit(values: ResetInput) {
    try {
      const data = await apiPost<{ message: string }>(
        "/api/auth/reset-password",
        values
      );
      toast.success(data.message);
      router.push("/login");
    } catch (err) {
      const message =
        err instanceof ApiClientError
          ? err.message
          : "Could not reset password";
      toast.error(message);
    }
  }

  if (!token) {
    return (
      <div className="surface p-6 sm:p-8">
        <h1 className="text-xl font-semibold tracking-tight text-ink">
          Invalid link
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          This reset link is missing or invalid. Request a new one.
        </p>
        <Link
          href="/forgot-password"
          className="mt-4 inline-block text-sm font-semibold text-primary hover:opacity-80"
        >
          Request reset link
        </Link>
      </div>
    );
  }

  return (
    <div className="surface p-6 sm:p-8">
      <div className="mb-7">
        <h1 className="text-xl font-semibold tracking-tight text-ink">
          Choose a new password
        </h1>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          Use at least 8 characters for your new password.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input type="hidden" {...register("token")} />
        <div className="space-y-2">
          <Label htmlFor="password">New password</Label>
          <PasswordInput
            id="password"
            autoComplete="new-password"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-xs text-destructive">{errors.password.message}</p>
          )}
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full" size="lg">
          {isSubmitting && <Loader2 className="animate-spin" />}
          Update password
        </Button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="surface space-y-3 p-8">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
