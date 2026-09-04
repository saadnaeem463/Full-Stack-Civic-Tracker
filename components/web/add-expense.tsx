"use client";
import React, { useState, useEffect, useRef } from "react";
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
import { ActorProps } from "./admin/ReportPanel";

const AddExpense = ({
  reportId,
  label,
  category,
  actor,
}: {
  reportId: string;
  label: string;
  category: string;
  actor: ActorProps;
}) => {
  const [submitting, setSubmitting] = useState(false);
  const [catBudget, setCatBudget] = useState(0);
  const [errors, setErrors] = useState("");
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const fetchBudget = async () => {
    try {
      const response = await fetch(
        `/api/admin/budget/category?category=${category}`,
      );
      const data = await response.json();

      if (!response.ok) {
        setErrors("Failed to fetch category remaining budget");
      }
      console.log(data);
      setCatBudget(data.remainingBudget);
    } catch (error) {
      setErrors(error);
      console.log("Something went wrong : ", error);
    }
  };

  useEffect(() => {
    if (open) {
      fetchBudget();
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const expense = amount;
    const payload = {
      amount: expense,
      reportId,
      label,
      category,
    };

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/budget/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrors(data.error || "Request failed!");
        return;
      }

      const audit = {
        actorId: actor._id,
        actorRole: actor.role,
        actorName: actor.name,
        action: "expense_added",
        message: `Expense amount of ${expense} for Report ${reportId} has been added  by ${actor.name}`,
      };

      const response = await fetch(`/api/admin/audits`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(audit),
      });

      console.log(data.payload);
      setAmount("");
      await fetchBudget();
    } catch (err) {
      setErrors(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {
        <DialogTrigger
          render={
            <button className="inline-flex items-center gap-2 self-start rounded-lg bg-[#1e5b3e] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#174a32] sm:self-auto" />
          }
        >
          <PlusIcon size={16} className="-mt-0.5 mr-1 inline" />
          Add Expense
        </DialogTrigger>
      }

      <DialogContent className="w-full max-w-md rounded-2xl border border-[#dfe5dc] bg-[#fbfcf9] p-5">
        {errors.length > 0 && <p>{errors}</p>}
        <DialogHeader>
          <DialogDescription className="text-[11px] font-bold uppercase tracking-[.12em] text-[#6d7a71]">
            Add Expense
          </DialogDescription>
          Remaining Budget is : {catBudget}
        </DialogHeader>

        <form ref={formRef} className="mt-4 space-y-3" onSubmit={handleSubmit}>
          <label className="block text-xs font-bold uppercase tracking-[.12em] text-[#6d7a71]">
            Amount to be alloacted for this
            <input
              id="amount"
              name="amount"
              placeholder="e.g. 10000000"
              required
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-[#dfe5dc] bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-[#17211b] outline-none focus:border-[#1e5b3e]"
            />
          </label>

          <DialogFooter className="mt-5 flex justify-end gap-2 border-none bg-transparent p-0">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-[#1e5b3e] px-3 py-2 text-sm font-bold text-white hover:bg-[#174a32] disabled:opacity-60"
            >
              submit
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddExpense;
