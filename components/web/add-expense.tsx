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

const AddExpense = ({ reportId, label, category }: { reportId: string, label: string, category: string }) => {
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget)

        const payload = { amount: formData.get("amount") };

        setSubmitting(true);
        try {
            const res = await fetch('/api/admin/budget', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await res.json();

            if (res.ok) {
                console.log("Request failed!")
            }

            console.log(data.payload)
        } catch (err) {
            console.log(err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog>
            {(
                <DialogTrigger
                    render={
                        <button className="inline-flex items-center gap-2 self-start rounded-lg bg-[#1e5b3e] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#174a32] sm:self-auto" />
                    }
                >
                    <PlusIcon size={16} className="-mt-0.5 mr-1 inline" />
                    Add Expense
                </DialogTrigger>
            )}

            <DialogContent className="w-full max-w-md rounded-2xl border border-[#dfe5dc] bg-[#fbfcf9] p-5">
                <DialogHeader>
                    <DialogDescription className="text-[11px] font-bold uppercase tracking-[.12em] text-[#6d7a71]">
                        Add Expense
                    </DialogDescription>
                </DialogHeader>

                <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
                    <label className="block text-xs font-bold uppercase tracking-[.12em] text-[#6d7a71]">
                        Amount to be alloacted for this
                        <input
                            id="amount"
                            name="amount"
                            placeholder="e.g. 10000000"
                            required
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