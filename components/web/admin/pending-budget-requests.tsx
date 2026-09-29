"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface BudgetRequestProp {
  _id: string;
  category: string;
  requesterNote: string;
  createdAt: string;
}

const PendingBudgetRequests = ({ onResolved }: { onResolved?: () => void }) => {
  const [requests, setRequests] = useState<BudgetRequestProp[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [mode, setMode] = useState<"approve" | "reject" | null>(null);
  const [amount, setAmount] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/admin/budget/requests?status=Pending");
      const data = await res.json();
      setRequests(data.requests ?? []);
    } catch (err) {
      console.log("Failed to fetch budget requests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const openAction = (id: string, nextMode: "approve" | "reject") => {
    setActiveId(id);
    setMode(nextMode);
    setAmount("");
    setAdminNote("");
    setError("");
  };

  const closeAction = () => {
    setActiveId(null);
    setMode(null);
  };

  const handleApprove = async (request: BudgetRequestProp) => {
    if (!adminNote.trim()) {
      setError("Add a note explaining your decision.");
      return;
    }
    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      setError("Enter a valid amount to allocate.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const allocRes = await fetch("/api/admin/budget/category", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: request.category, amount: numericAmount }),
      });
      const allocData = await allocRes.json();
      if (!allocRes.ok) {
        setError(allocData.error || "Failed to allocate budget.");
        return;
      }

      const reviewRes = await fetch(`/api/admin/budget/requests?requestId=${request._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Approved", adminNote }),
      });
      const reviewData = await reviewRes.json();
      if (!reviewRes.ok) {
        setError(reviewData.error || "Budget was allocated, but marking the request approved failed.");
        return;
      }

      setRequests((prev) => prev.filter((r) => r._id !== request._id));
      closeAction();
      onResolved?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async (request: BudgetRequestProp) => {
    if (!adminNote.trim()) {
      setError("Add a reason for rejecting this request.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/budget/requests?requestId=${request._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Rejected", adminNote }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to reject request.");
        return;
      }

      setRequests((prev) => prev.filter((r) => r._id !== request._id));
      closeAction();
      onResolved?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || requests.length === 0) return null;

  return (
    <div className="mb-4 rounded-lg border border-destructive/20 bg-destructive/10 p-5 shadow-xs">
      <p className="text-sm font-semibold tracking-tight text-foreground">Pending budget requests</p>
      <p className="mb-4 mt-1 text-xs text-muted-foreground">
        {requests.length} categor{requests.length === 1 ? "y needs" : "ies need"} a budget decision.
      </p>

      <div className="space-y-3">
        {requests.map((request) => (
          <div key={request._id} className="rounded-lg border border-border bg-card p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">{request.category}</p>
                <p className="mt-1 text-xs text-muted-foreground">{request.requesterNote}</p>
              </div>
              {activeId !== request._id && (
                <div className="flex shrink-0 gap-2">
                  <Button
                    size="sm"
                    onClick={() => openAction(request._id, "approve")}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => openAction(request._id, "reject")}
                  >
                    Reject
                  </Button>
                </div>
              )}
            </div>

            {activeId === request._id && (
              <div className="mt-3 space-y-2 border-t border-muted pt-3">
                {error && <p className="text-xs font-medium text-destructive">{error}</p>}

                {mode === "approve" && (
                  <input
                    type="number"
                    step="any"
                    placeholder="Amount to allocate"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                )}

                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder={mode === "approve" ? "Note for this decision" : "Reason for rejecting"}
                  rows={2}
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary"
                />

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={closeAction}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant={mode === "approve" ? "default" : "destructive"}
                    disabled={submitting}
                    onClick={() => (mode === "approve" ? handleApprove(request) : handleReject(request))}
                  >
                    {submitting ? "Saving…" : mode === "approve" ? "Confirm Approval" : "Confirm Rejection"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PendingBudgetRequests;