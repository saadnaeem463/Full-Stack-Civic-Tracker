'use client';

import { useState } from 'react';
import { FaCheckDouble, FaCoins } from 'react-icons/fa';
import { PlusIcon } from 'lucide-react';

import { Alert, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

const CATEGORIES = ["Roads", "Lightning", "Cleanliness", "Parks"] as const;
type Category = (typeof CATEGORIES)[number];

const CategoryBudgetAllocation = ({
  remainingCategories,
  onAllocated,
  budget
}: {
  remainingCategories : Category[],
  onAllocated?: (allocation: { category: Category; amount: number }) => void;budget : number
}) => {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [category, setCategory] = useState<Category | ''>('');
  const [amount, setAmount] = useState('');
  const [remainingBudget,setRemainingBudget]=useState(budget)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!category) {
      setError('Choose a category first.');
      return;
    }
    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      setError('Enter a valid amount.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/budget/category', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, amount: numericAmount }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data?.error ?? 'Failed to allocate budget for this category.');
        return;
      }

      setSuccess(true);
      onAllocated?.({ category, amount: numericAmount });
      setCategory('');
      setAmount('');
      setRemainingBudget((prev)=>(prev-numericAmount))
    } catch (err) {
      console.log(err);
      setError('Something went wrong while saving the allocation.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog>
      <DialogTrigger
        render={
          <button className="inline-flex items-center gap-2 self-start rounded-lg bg-[#1e5b3e] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#174a32] sm:self-auto" />
        }
      >
        <PlusIcon size={16} className="-mt-0.5 mr-1 inline" />
        Category Budget Allocation
      </DialogTrigger>

      <DialogContent className="w-full max-w-md rounded-2xl border border-[#dfe5dc] bg-[#fbfcf9] p-5">
        <DialogHeader>
          <DialogDescription className="text-[11px] font-bold uppercase tracking-[.12em] text-[#6d7a71]">
            Decide Budget
          </DialogDescription>
            <span className='text-green-600'>
            Remaining Budget : {remainingBudget}
            </span>
        </DialogHeader>

        {error && (
          <Alert className="border-destructive/50 text-destructive mt-2 flex items-center gap-2">
            <AlertTitle>{error}</AlertTitle>
          </Alert>
        )}

        {success && (
          <Alert className="border-success text-success mt-2 flex items-center gap-2">
            <FaCheckDouble />
            <AlertTitle>Category budget allocated successfully.</AlertTitle>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="mt-3 space-y-5">
          <Field>
            <FieldLabel className="flex items-center gap-2">
              <FaCoins className="text-muted-foreground" />
              Category
            </FieldLabel>

            <FieldContent>
              <Select
                value={category}
                onValueChange={(val) => setCategory(val as Category)}
              >
                <SelectTrigger className="bg-muted/50 w-full rounded-lg border border-[#dfe5dc] text-sm">
                  <SelectValue placeholder="Choose a category" />
                </SelectTrigger>
                <SelectContent>
                  {remainingCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldContent>

            <FieldDescription>
              Pick which category this allocation applies to.
            </FieldDescription>
          </Field>

          <Field>
            <FieldLabel>Amount</FieldLabel>
            <FieldContent>
              <input
                type="number"
                step="any"
                required
                placeholder="e.g. 10000000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-[#dfe5dc] bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-[#17211b] outline-none focus:border-[#1e5b3e]"
              />
            </FieldContent>
            <FieldDescription>
              Amount to be allocated for the selected category.
            </FieldDescription>
          </Field>

          <DialogFooter className="mt-2 flex justify-end gap-2 border-none bg-transparent p-0">
            <Button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-[#1e5b3e] px-3 py-2 text-sm font-bold text-white hover:bg-[#174a32] disabled:opacity-60"
            >
              {submitting ? 'Allocating…' : 'Allocate'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryBudgetAllocation;