"use client";
import React, { useState, useEffect, useRef } from "react";
import { PlusIcon } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
  const [requestPending, setRequestPending] = useState(false);
  const [budgetExceeded, setBudgetExceeded] = useState(false);
  const [requestNote, setRequestNote] = useState("");
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
      setErrors(error instanceof Error ? error.message : "Failed to fetch category budget");
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
    setBudgetExceeded(false);
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
        if (res.status === 409) setBudgetExceeded(true);
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

  const handleRequestBudget = async () => {
    if (!requestNote.trim()) {
      setErrors("Please add a reason for the budget request");
      return;
    }

    try {
      const res = await fetch("/api/admin/budget/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, note: requestNote }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrors(data.error || "Failed to request budget");
        return;
      }

      setRequestPending(true);
      setErrors("");
    } catch (err) {
      setErrors(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm" className="self-start sm:self-auto" />
        }
      >
        <PlusIcon />
        Add expense
      </DialogTrigger>

      <DialogContent className="w-full max-w-md rounded-lg border border-border bg-card p-5">
        {errors.length > 0 && (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">{errors}</p>
        )}

        {budgetExceeded && !requestPending && (
          <div className="mt-2 space-y-2">
            <textarea
              value={requestNote}
              onChange={(e) => setRequestNote(e.target.value)}
              placeholder="Why does this category need more budget?"
              required
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              rows={2}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRequestBudget}
            >
              Request budget increase
            </Button>
          </div>
        )}

        {requestPending && (
          <p className="mt-2 text-xs font-medium text-primary">
            Budget request pending admin approval.
          </p>
        )}
        <DialogHeader>
          <DialogDescription className="text-[11px] font-semibold uppercase tracking-[.14em] text-muted-foreground">
            Add expense
          </DialogDescription>
          <p className="text-xs text-muted-foreground">
            Remaining category budget: <span className="font-medium tabular-nums text-foreground">{catBudget}</span>
          </p>
        </DialogHeader>

        <form ref={formRef} className="mt-4 space-y-3" onSubmit={handleSubmit}>
          <label className="block text-xs font-semibold uppercase tracking-[.14em] text-muted-foreground">
            Amount
            <input
              id="amount"
              name="amount"
              placeholder="e.g. 10000000"
              required
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-normal normal-case tracking-normal text-foreground outline-none focus:border-primary"
            />
          </label>

          <DialogFooter className="mt-5 flex justify-end gap-2 border-none bg-transparent p-0">
            <Button type="submit" disabled={submitting}>
              Submit
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddExpense;
