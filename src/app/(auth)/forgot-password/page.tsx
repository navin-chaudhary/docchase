"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { apiPost, ApiClientError } from "@/lib/api/client";
import { forgotPasswordSchema } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ForgotInput = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: ForgotInput) {
    try {
      const data = await apiPost<{ message: string }>(
        "/api/auth/forgot-password",
        values
      );
      toast.success(data.message);
    } catch (err) {
      const message =
        err instanceof ApiClientError
          ? err.message
          : "Could not send reset email";
      toast.error(message);
    }
  }

  return (
    <div className="surface p-6 sm:p-8">
      <div className="mb-7">
        <h1 className="text-xl font-semibold tracking-tight text-ink">
          Reset your password
        </h1>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          Enter your email and we&apos;ll send a reset link if an account
          exists.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full" size="lg">
          {isSubmitting && <Loader2 className="animate-spin" />}
          Send reset link
        </Button>
      </form>

      <p className="mt-7 text-center text-sm text-muted-foreground">
        <Link
          href="/login"
          className="font-semibold text-primary transition-colors hover:opacity-80"
        >
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
