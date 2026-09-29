import { useId } from 'react';
import type React from 'react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const Dialog13 = () => {
  const id = useId();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Add form submission logic here
  };

  return (
    <Dialog>
      <DialogTrigger>
        <Button
          variant="outline"
          className="rounded-xl border border-primary/20 bg-primary/10 px-6 py-2 font-medium text-primary transition-all hover:bg-primary/15"
        >
          Sign Up
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-2xl border border-border bg-popover p-6 shadow-xl sm:max-w-md">
        <DialogHeader className="space-y-1.5 text-left">
          <DialogTitle className="text-2xl font-bold text-foreground">
            Create your account
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Sign up free to get started, no card needed.
          </DialogDescription>
        </DialogHeader>
        <form className="mt-2 flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="first-name">First name</Label>
              <Input
                id="first-name"
                name="firstname"
                placeholder="e.g. Alex"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="last-name">Last name</Label>
              <Input
                id="last-name"
                name="lastname"
                placeholder="e.g. Smith"
                required
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              type="email"
              id="email"
              name="useremail"
              placeholder="alex@email.com"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Create password</Label>
            <Input
              type="password"
              id="password"
              name="userpassword"
              placeholder="At least 8 characters"
              required
            />
          </div>
          <div className="mt-1 flex items-start gap-3">
            <Checkbox
              id={id}
              className="mt-0.5 focus-visible:ring-ring data-[state=checked]:border-primary/20 data-[state=checked]:bg-primary"
              defaultChecked
              required
            />
            <Label
              htmlFor={id}
              className="block text-sm leading-snug font-normal text-muted-foreground"
            >
              <span className="inline">
                I agree to the{' '}
                <a
                  href="#"
                  className="font-medium text-foreground underline transition-colors hover:no-underline"
                >
                  Terms of Service
                </a>{' '}
                and{' '}
                <a
                  href="#"
                  className="font-medium text-foreground underline transition-colors hover:no-underline"
                >
                  Privacy Policy
                </a>
              </span>
            </Label>
          </div>
          <DialogFooter className="m-0 mt-2 flex-col gap-3 border-none bg-transparent p-0 pt-4 sm:flex-col">
            <Button
              type="submit"
              className="w-full rounded-xl bg-primary py-2.5 font-semibold text-white shadow-md transition-all hover:bg-primary/90 focus-visible:ring-ring"
            >
              Create account
            </Button>
            <div className="flex items-center gap-4 before:h-px before:flex-1 before:bg-muted after:h-px after:flex-1 after:bg-muted">
              <span className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                Or sign up with
              </span>
            </div>
            <Button
              variant="outline"
              className="flex w-full items-center gap-2 rounded-xl border border-border bg-card py-2.5 font-medium text-foreground shadow-sm transition-all hover:bg-muted focus-visible:ring-ring"
            >
              <img
                src="https://api.iconify.design/logos:google-icon.svg"
                alt="Google Icon"
                className="size-4"
              />
              Continue with Google
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default Dialog13;
