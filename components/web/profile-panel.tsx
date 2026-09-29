"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { CameraIcon, FileTextIcon, KeyRoundIcon, RotateCcwIcon } from "lucide-react";
import { ChangePasswordSchema, UpdateProfileSchema } from "@/app/schemas/auth";
import { ApiError, issueFor } from "@/lib/api";
import {
  changePassword,
  getProfile,
  updateProfile,
  type ProfileUser,
} from "@/lib/services/profile.services";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { EmptyState, PageLoading, SectionCard } from "@/components/web/admin/primitives";
import { Stagger, StaggerItem } from "@/components/motion";

type DetailsValues = z.infer<typeof UpdateProfileSchema>;
type PasswordValues = z.infer<typeof ChangePasswordSchema>;

function fieldIssues<T extends string>(error: unknown, fields: readonly T[], apply: (field: T, message: string) => void) {
  if (!(error instanceof ApiError)) return false;
  let matched = false;
  for (const field of fields) {
    const message = issueFor(error.issues, field);
    if (message) {
      apply(field, message);
      matched = true;
    }
  }
  return matched;
}

function ProfileDetailsForm({ user, onSaved }: { user: ProfileUser; onSaved: (user: ProfileUser) => void }) {
  const [formError, setFormError] = useState("");
  const [uploading, setUploading] = useState(false);

  const form = useForm<DetailsValues>({
    resolver: zodResolver(UpdateProfileSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      avatar: user.avatar ?? "",
    },
  });

  const { isDirty, isSubmitting } = form.formState;
  const avatar = useWatch({ control: form.control, name: "avatar" });
  const initial = (user.name || "?").charAt(0).toUpperCase();

  async function onSubmit(values: DetailsValues) {
    setFormError("");
    try {
      const result = await updateProfile(values);
      onSaved(result.user);
      form.reset({ name: result.user.name, email: result.user.email, avatar: result.user.avatar ?? "" });
      toast.success(
        result.requiresEmailVerification
          ? "Profile updated. Check your inbox to verify your new email."
          : "Profile updated"
      );
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        setFormError(error.message);
        return;
      }
      const matched = fieldIssues(error, ["name", "email", "avatar"] as const, (field, message) =>
        form.setError(field, { message })
      );
      if (!matched) {
        setFormError(error instanceof Error ? error.message : "Could not save your profile, please try again");
      }
    }
  }

  async function onAvatarChange(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setFormError("");
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/upload", { method: "POST", body });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Upload failed");
      form.setValue("avatar", data.url, { shouldDirty: true, shouldValidate: true });
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Could not upload that image");
    } finally {
      setUploading(false);
    }
  }

  return (
    <SectionCard
      title="Profile details"
      description="Your name, email and photo as other people see them across the app."
    >
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <FieldGroup className="gap-5">
          {formError && (
            <Alert variant="destructive" className="flex items-center gap-2" role="alert">
              <AlertTitle>{formError}</AlertTitle>
            </Alert>
          )}

          <div className="flex flex-wrap items-center gap-4">
            <span className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-full bg-primary text-xl font-semibold text-primary-foreground">
              {avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatar} alt="" className="h-full w-full object-cover" />
              ) : (
                initial
              )}
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-muted focus-within:ring-2 focus-within:ring-ring/60">
                <CameraIcon size={16} className="text-muted-foreground" aria-hidden="true" />
                {uploading ? "Uploading…" : avatar ? "Change photo" : "Add photo"}
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  disabled={uploading}
                  aria-label="Upload a profile photo"
                  onChange={(event) => onAvatarChange(event.target.files?.[0])}
                />
              </label>
              {avatar && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => form.setValue("avatar", "", { shouldDirty: true })}
                  disabled={uploading}
                >
                  Remove
                </Button>
              )}
            </div>
          </div>

          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor="profile-name">Full name</FieldLabel>
                <Input
                  id="profile-name"
                  aria-invalid={fieldState.invalid}
                  placeholder="John Dove"
                  type="text"
                  {...field}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor="profile-email">Email</FieldLabel>
                <Input
                  id="profile-email"
                  aria-invalid={fieldState.invalid}
                  placeholder="johndove123@gmail.com"
                  type="email"
                  {...field}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                <p className="text-xs text-muted-foreground">
                  Changing your email asks you to verify the new address before it is used anywhere.
                </p>
              </Field>
            )}
          />

          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={!isDirty || isSubmitting || uploading}>
              {isSubmitting ? "Saving…" : "Save changes"}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={!isDirty || isSubmitting}
              onClick={() => {
                setFormError("");
                form.reset({ name: user.name, email: user.email, avatar: user.avatar ?? "" });
              }}
            >
              <RotateCcwIcon size={16} aria-hidden="true" />
              Cancel
            </Button>
          </div>
        </FieldGroup>
      </form>
    </SectionCard>
  );
}

function ChangePasswordForm() {
  const [formError, setFormError] = useState("");

  const form = useForm<PasswordValues>({
    resolver: zodResolver(ChangePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const { isDirty, isSubmitting } = form.formState;

  async function onSubmit(values: PasswordValues) {
    setFormError("");
    try {
      await changePassword(values);
      form.reset({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
      toast.success("Password updated");
    } catch (error) {
      const matched = fieldIssues(
        error,
        ["currentPassword", "newPassword", "confirmNewPassword"] as const,
        (field, message) => form.setError(field, { message })
      );
      if (!matched) {
        setFormError(error instanceof Error ? error.message : "Could not change your password, please try again");
      }
    }
  }

  return (
    <SectionCard
      title="Change password"
      description="Confirm your current password first — password changes never happen as part of a profile save."
    >
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <FieldGroup className="gap-5">
          {formError && (
            <Alert variant="destructive" className="flex items-center gap-2" role="alert">
              <AlertTitle>{formError}</AlertTitle>
            </Alert>
          )}

          <Controller
            name="currentPassword"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor="current-password">Current password</FieldLabel>
                <Input
                  id="current-password"
                  aria-invalid={fieldState.invalid}
                  placeholder="Type your current password"
                  type="password"
                  autoComplete="current-password"
                  {...field}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="newPassword"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor="new-password">New password</FieldLabel>
                <Input
                  id="new-password"
                  aria-invalid={fieldState.invalid}
                  placeholder="At least 8 characters"
                  type="password"
                  autoComplete="new-password"
                  {...field}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="confirmNewPassword"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor="confirm-password">Confirm new password</FieldLabel>
                <Input
                  id="confirm-password"
                  aria-invalid={fieldState.invalid}
                  placeholder="Repeat the new password"
                  type="password"
                  autoComplete="new-password"
                  {...field}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={!isDirty || isSubmitting}>
              <KeyRoundIcon size={16} aria-hidden="true" />
              {isSubmitting ? "Updating…" : "Update password"}
            </Button>
          </div>
        </FieldGroup>
      </form>
    </SectionCard>
  );
}

type MyReport = {
  _id: string;
  title: string;
  issueType?: string;
  status?: string;
  location?: string;
  createdAt: string;
  upVotedBy?: string[];
  comments?: unknown[];
};

const REPORT_STATUS_STYLE: Record<string, string> = {
  Reported: "bg-destructive/10 text-destructive",
  Acknowledged: "bg-info/10 text-info",
  "In progress": "bg-warning/15 text-warning",
  Resolved: "bg-success/10 text-success",
};

function MyReportsSection({ userId }: { userId: string }) {
  const [reports, setReports] = useState<MyReport[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/reports")
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Failed to load your reports"))))
      .then((data) => {
        if (cancelled) return;
        const all: (MyReport & { userId?: { _id?: string } | string })[] = data.reports ?? [];
        const mine = all.filter((r) => {
          const owner = typeof r.userId === "string" ? r.userId : r.userId?._id;
          return owner === userId;
        });
        mine.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setReports(mine);
      })
      .catch((err) => !cancelled && setError(err instanceof Error ? err.message : "Failed to load your reports"));
    return () => {
      cancelled = true;
    };
  }, [userId]);

  return (
    <SectionCard title="Your reports" description="Every issue you've reported, and where it stands.">
      {reports === null && !error && (
        <div className="space-y-2" role="status" aria-live="polite">
          <span className="sr-only">Loading your reports…</span>
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      )}
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      {reports !== null && !error && reports.length === 0 && (
        <EmptyState
          title="You haven't reported anything yet"
          description="Reports you submit from the map will show up here, along with their current status."
          icon={<FileTextIcon size={20} />}
        />
      )}
      {reports !== null && reports.length > 0 && (
        <Stagger className="space-y-2">
          {reports.map((report) => (
            <StaggerItem
              key={report._id}
              className="flex flex-col gap-2 rounded-lg border border-border bg-background p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{report.title}</p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {report.issueType ?? "General"} · {new Date(report.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  {report.location ? ` · ${report.location}` : ""}
                </p>
              </div>
              <span
                className={`inline-flex w-fit shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                  REPORT_STATUS_STYLE[report.status ?? "Reported"] ?? REPORT_STATUS_STYLE.Reported
                }`}
              >
                {report.status ?? "Reported"}
              </span>
            </StaggerItem>
          ))}
        </Stagger>
      )}
    </SectionCard>
  );
}

export function ProfilePanel() {
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  function load() {
    return getProfile()
      .then((result) => {
        setUser(result.user);
        setLoadError("");
      })
      .catch((error: unknown) => {
        if (error instanceof ApiError && error.status === 401) return;
        setLoadError(error instanceof Error ? error.message : "Could not load your profile");
      })
      .finally(() => {
        setLoading(false);
      });
  }

  function retry() {
    setLoading(true);
    setLoadError("");
    load();
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) return <PageLoading label="Loading your profile…" />;

  if (loadError) {
    return (
      <div className="flex flex-col items-center gap-4">
        <EmptyState
          title="We could not load your profile"
          description={loadError}
          icon={<RotateCcwIcon size={20} />}
        />
        <Button type="button" variant="outline" onClick={retry}>
          Try again
        </Button>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex flex-col gap-5">
      <ProfileDetailsForm user={user} onSaved={setUser} />
      <MyReportsSection userId={user._id} />
      <ChangePasswordForm />
    </div>
  );
}
