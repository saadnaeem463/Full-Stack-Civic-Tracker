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

type Category = "Roads" | "Lightning" | "Cleanliness" | "Parks";

const CategoryBudgetAllocation = ({
  remainingCategories,
  onAllocated,
  budget,
  variant = 'default',
}: {
  remainingCategories : Category[],
  onAllocated?: (allocation: { category: Category; amount: number }) => void;
  budget : number;
  variant?: 'default' | 'outline';
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
          <Button variant={variant} className="self-start sm:self-auto" />
        }
      >
        <PlusIcon />
        Allocate category budget
      </DialogTrigger>

      <DialogContent className="w-full max-w-md rounded-lg border border-border bg-card p-5">
        <DialogHeader>
          <DialogDescription className="text-[11px] font-semibold uppercase tracking-[.14em] text-muted-foreground">
            Decide budget
          </DialogDescription>
            <span className='text-sm font-medium text-foreground'>
            Remaining budget: {remainingBudget}
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
                <SelectTrigger className="bg-muted/50 w-full rounded-lg border border-border text-sm">
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
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-normal normal-case tracking-normal text-foreground outline-none focus:border-primary"
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