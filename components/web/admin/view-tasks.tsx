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

const STATUS_COLORS: Record<string, string> = {
    Reported: "bg-red-100 text-red-700",
    Acknowledged: "bg-blue-100 text-blue-700",
    "In progress": "bg-amber-100 text-amber-700",
    Resolved: "bg-green-100 text-green-700",
};

const ViewTasks = ({ currentReports }: { currentReports: string }) => {
    const [open, setOpen] = useState(false);
    const [report, setReport] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [catBudget, setCatBudget] = useState(0);

    const reportId = currentReports;

    useEffect(() => {
        if (!open || !reportId) return;
        setLoading(true);
        fetch(`/api/admin/reports?reportId=${reportId}`)
            .then((res) => res.json())
            .then((data) => {
                if (data.error) {
                    setErrors(data.error);
                } else {
                    setReport(data.report);
                }
            })
            .catch(() => setErrors("Failed to load report details"))
            .finally(() => setLoading(false));
    }, [open, reportId]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        const payload = {
            amount: formData.get("amount"),
            reportId,
            label: report?.issueType ?? "",
            category: report?.issueType ?? "",
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

            console.log(data.payload);
            setOpen(false);
        } catch (err) {
            setErrors(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger
                render={
                    <button className="inline-flex items-center gap-2 self-start rounded-lg bg-[#1e5b3e] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#174a32] sm:self-auto" />
                }
            >
                <PlusIcon size={16} className="-mt-0.5 mr-1 inline" />
                View Task
            </DialogTrigger>

            <DialogContent className="w-full max-w-lg rounded-2xl border border-[#dfe5dc] bg-[#fbfcf9] p-5">
                {errors.length > 0 && (
                    <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-[#a4544f]">
                        {errors}
                    </p>
                )}

                <DialogHeader>
                    <DialogDescription className="text-[11px] font-bold uppercase tracking-[.12em] text-[#6d7a71]">
                        Assigned Report Details
                    </DialogDescription>
                </DialogHeader>

                {loading ? (
                    <p className="py-6 text-center text-sm text-[#6d7a71]">Loading report…</p>
                ) : report ? (
                    <div className="mt-4 space-y-4">
                        {/* Title + Status */}
                        <div className="flex items-start justify-between gap-3">
                            <h3 className="text-base font-bold tracking-[-.02em]">{report.title}</h3>
                            <span
                                className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                    STATUS_COLORS[report.status] ?? "bg-gray-100 text-gray-700"
                                }`}
                            >
                                {report.status}
                            </span>
                        </div>

                        {/* Details grid */}
                        <dl className="grid grid-cols-2 gap-3 text-sm">
                            <div className="rounded-lg bg-[#f4f7f3] px-3 py-2">
                                <dt className="text-[10px] font-bold uppercase tracking-[.1em] text-[#6d7a71]">
                                    Category
                                </dt>
                                <dd className="mt-0.5 font-medium">{report.issueType}</dd>
                            </div>
                            <div className="rounded-lg bg-[#f4f7f3] px-3 py-2">
                                <dt className="text-[10px] font-bold uppercase tracking-[.1em] text-[#6d7a71]">
                                    Location
                                </dt>
                                <dd className="mt-0.5 font-medium">{report.location}</dd>
                            </div>
                            <div className="rounded-lg bg-[#f4f7f3] px-3 py-2">
                                <dt className="text-[10px] font-bold uppercase tracking-[.1em] text-[#6d7a71]">
                                    Reporter
                                </dt>
                                <dd className="mt-0.5 font-medium">
                                    {report.userId?.name ?? "Unknown"}
                                </dd>
                            </div>
                            <div className="rounded-lg bg-[#f4f7f3] px-3 py-2">
                                <dt className="text-[10px] font-bold uppercase tracking-[.1em] text-[#6d7a71]">
                                    Upvotes
                                </dt>
                                <dd className="mt-0.5 font-medium">{report.upVotedBy?.length ?? 0}</dd>
                            </div>
                        </dl>

                        {/* Description */}
                        {report.details && (
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-[.1em] text-[#6d7a71]">
                                    Description
                                </p>
                                <p className="mt-1 text-sm leading-5 text-[#17211b]">{report.details}</p>
                            </div>
                        )}

                        {/* Media */}
                        {report.media?.length > 0 && (
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-[.1em] text-[#6d7a71]">
                                    Attachments
                                </p>
                                <div className="mt-2 flex gap-2 overflow-x-auto">
                                    {report.media.map((m: any, i: number) =>
                                        m.type === "video" ? (
                                            <video
                                                key={i}
                                                src={m.url}
                                                className="h-20 w-20 shrink-0 rounded-lg object-cover"
                                                controls
                                            />
                                        ) : (
                                            <img
                                                key={i}
                                                src={m.url}
                                                alt={m.type}
                                                className="h-20 w-20 shrink-0 rounded-lg object-cover"
                                            />
                                        )
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Assigned worker */}
                        {report.assignedTo && (
                            <div className="rounded-lg border border-[#dfe5dc] bg-white px-3 py-2">
                                <p className="text-[10px] font-bold uppercase tracking-[.1em] text-[#6d7a71]">
                                    Assigned Worker
                                </p>
                                <p className="mt-0.5 text-sm font-medium">
                                    {report.assignedTo.fullname} — {report.assignedTo.specialty}
                                </p>
                            </div>
                        )}
                    </div>
                ) : (
                    <p className="py-6 text-center text-sm text-[#6d7a71]">No report data</p>
                )}

                {/* Expense form */}
                <form className="mt-5 space-y-3 border-t border-[#dfe5dc] pt-5" onSubmit={handleSubmit}>
                    <label className="block text-xs font-bold uppercase tracking-[.12em] text-[#6d7a71]">
                        Amount to be allocated for this
                        <input
                            id="amount"
                            name="amount"
                            placeholder="e.g. 10000000"
                            required
                            type="number"
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

export default ViewTasks;
