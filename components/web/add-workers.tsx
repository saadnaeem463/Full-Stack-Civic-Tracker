"use client";
import React, { useState, useEffect } from "react";
import { PlusIcon } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
      } else {
        console.error(data.error);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {!isEdit && (
        <DialogTrigger
          render={
            <button className="inline-flex items-center gap-2 self-start rounded-lg bg-[#1e5b3e] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#174a32] sm:self-auto" />
          }
        >
          <PlusIcon size={16} className="-mt-0.5 mr-1 inline" />
          Add worker
        </DialogTrigger>
      )}

      <DialogContent className="w-full max-w-md rounded-2xl border border-[#dfe5dc] bg-[#fbfcf9] p-5">
        <DialogHeader>
          <DialogDescription className="text-[11px] font-bold uppercase tracking-[.12em] text-[#6d7a71]">
            {isEdit ? "Edit Worker" : "New Worker"}
          </DialogDescription>
          <DialogTitle className="font-display text-2xl tracking-[-.03em]">
            {isEdit ? "Update member" : "Add a new worker"}
          </DialogTitle>
        </DialogHeader>

        <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
          <label className="block text-xs font-bold uppercase tracking-[.12em] text-[#6d7a71]">
            Full name
            <input
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              placeholder="e.g. Rosa Delgado"
              required
              className="mt-1.5 w-full rounded-lg border border-[#dfe5dc] bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-[#17211b] outline-none focus:border-[#1e5b3e]"
            />
          </label>

          <label className="block text-xs font-bold uppercase tracking-[.12em] text-[#6d7a71]">
            Contact email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@city.gov"
              required
              className="mt-1.5 w-full rounded-lg border border-[#dfe5dc] bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-[#17211b] outline-none focus:border-[#1e5b3e]"
            />
          </label>

          <label className="block text-xs font-bold uppercase tracking-[.12em] text-[#6d7a71]">
            Specialty
            <select
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value as Specialty)}
              required
              className="mt-1.5 w-full rounded-lg border border-[#dfe5dc] bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-[#17211b] outline-none focus:border-[#1e5b3e]"
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
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-[#1e5b3e] px-3 py-2 text-sm font-bold text-white hover:bg-[#174a32] disabled:opacity-60"
            >
              {isEdit
                ? submitting
                  ? "Updating…"
                  : "Update worker"
                : submitting
                  ? "Adding…"
                  : "Add worker"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddWorkers;