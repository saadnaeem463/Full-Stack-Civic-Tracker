"use client";
import React, { useState, useEffect } from "react";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { adaptWorker } from "@/lib/report-adapter";

type Specialty = "Roads crew" | "Electrical" | "Sanitation" | "Parks";
type WorkerUI = ReturnType<typeof adaptWorker>;

const AddWorkers = ({
  handleWorkerAdded,
  isEdit,
  open,
  onOpenChange,
}: {
  handleWorkerAdded: (w: any) => void;
  isEdit: WorkerUI | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) => {
  const [submitting, setSubmitting] = useState(false);
  const [fullname, setFullname] = useState(isEdit?.name ?? "");
  const [email, setEmail] = useState(isEdit?.contact ?? "");
  const [specialty, setSpecialty] = useState<Specialty | "">(
    (isEdit?.specialty as Specialty) ?? ""
  );

  // re-sync fields whenever a different worker gets loaded for editing
  useEffect(() => {
    setFullname(isEdit?.name ?? "");
    setEmail(isEdit?.contact ?? "");
    setSpecialty((isEdit?.specialty as Specialty) ?? "");
  }, [isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { fullname, email, specialty };

    const url = isEdit
      ? `/api/admin/workers?workerId=${isEdit.id}`
      : `/api/admin/workers`;
    const method = isEdit ? "PATCH" : "POST";

    setSubmitting(true);
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (res.ok) {
        handleWorkerAdded(data.worker);
        onOpenChange?.(false);
        if (!isEdit) {
          setFullname("");
          setEmail("");
          setSpecialty("");
        }
        toast.success(isEdit ? "Worker updated" : "Worker added");
      } else {
        toast.error(data.error || "Could not save the worker");
      }
    } catch (err) {
      console.log(err);
      toast.error("Could not save the worker, please try again");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {!isEdit && (
        <DialogTrigger
          render={
            <Button className="self-start sm:self-auto" />
          }
        >
          <PlusIcon />
          Add worker
        </DialogTrigger>
      )}

      <DialogContent className="w-full max-w-md rounded-lg border border-border bg-card p-5">
        <DialogHeader>
          <DialogDescription className="text-[11px] font-semibold uppercase tracking-[.14em] text-muted-foreground">
            {isEdit ? "Edit Worker" : "New Worker"}
          </DialogDescription>
          <DialogTitle className="text-lg font-semibold tracking-tight">
            {isEdit ? "Update member" : "Add a new worker"}
          </DialogTitle>
        </DialogHeader>

        <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
          <label className="block text-xs font-semibold uppercase tracking-[.14em] text-muted-foreground">
            Full name
            <input
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              placeholder="e.g. Rosa Delgado"
              required
              className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-normal normal-case tracking-normal text-foreground outline-none focus:border-primary"
            />
          </label>

          <label className="block text-xs font-semibold uppercase tracking-[.14em] text-muted-foreground">
            Contact email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@city.gov"
              required
              className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-normal normal-case tracking-normal text-foreground outline-none focus:border-primary"
            />
          </label>

          <label className="block text-xs font-semibold uppercase tracking-[.14em] text-muted-foreground">
            Specialty
            <select
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value as Specialty)}
              required
              className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-normal normal-case tracking-normal text-foreground outline-none focus:border-primary"
            >
              <option value="" disabled>
                Choose a specialty
              </option>
              <option value="Roads crew">Roads crew</option>
              <option value="Electrical">Electrical</option>
              <option value="Sanitation">Sanitation</option>
              <option value="Parks">Parks</option>
            </select>
          </label>

          <DialogFooter className="mt-5 flex justify-end gap-2 border-none bg-transparent p-0">
            <Button
              type="submit"
              disabled={submitting}
            >
              {isEdit
                ? submitting
                  ? "Updating…"
                  : "Update worker"
                : submitting
                  ? "Adding…"
                  : "Add worker"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddWorkers;