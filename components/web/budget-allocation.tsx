"use client";
import React, { useState } from "react";
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

const BudgetAllocation = ({handleSetBudget, variant = "default"} : {handleSetBudget :(amount : number)=>void, variant?: "default" | "outline"}) => {
    const [submitting, setSubmitting] = useState(false);
    const [error,setError]=useState("")

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget)

        const amount= formData.get("amount")
        setSubmitting(true);
        try {
            const res = await fetch('/api/admin/budget', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(amount),
            });
            const data = await res.json();

            if (!res.ok) {
                console.log("Request failed!")
                setError("failed to post budget")
            }

        if (res.ok) {
            handleSetBudget(data.budget.Amount)
        }
            console.log(data.budget)
        } catch (err) {
            console.log(err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog>

            {error && <p className="mb-3 rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">{error}</p>}
            <DialogTrigger
                render={
                    <Button variant={variant} className="self-start sm:self-auto" />
                }
            >
                <PlusIcon />
                Add budget
            </DialogTrigger>

            <DialogContent className="w-full max-w-md rounded-lg border border-border bg-card p-5">
                <DialogHeader>
                    <DialogDescription className="text-[11px] font-semibold uppercase tracking-[.14em] text-muted-foreground">
                        Decide budget
                    </DialogDescription>
                </DialogHeader>

                <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
                    <label className="block text-xs font-semibold uppercase tracking-[.14em] text-muted-foreground">
                        Amount to be allocated
                        <input
                            type="number"
                            id="amount"
                            name="amount"
                            placeholder="e.g. 10000000"
                            required
                            className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-normal normal-case tracking-normal text-foreground outline-none focus:border-primary"
                        />
                    </label>

                    <DialogFooter className="mt-5 flex justify-end gap-2 border-none bg-transparent p-0">
                        <Button
                            type="submit"
                            disabled={submitting}
                        >
                            Submit
                        </Button>
                    </DialogFooter>
                </form>

            </DialogContent>
        </Dialog>
    );
};

export default BudgetAllocation;