"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDownIcon, LogOutIcon, UserIcon } from "lucide-react";
import { Avatar } from "@base-ui/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

type ProfileMenuUser = {
  name: string;
  email?: string;
  role: string;
  avatar?: string;
} | null;

function roleLabel(role?: string) {
  return role === "admin" ? "Admin" : role === "moderator" ? "Moderator" : "Citizen";
}

function rolePillClass(role?: string) {
  return role === "admin"
    ? "bg-primary/10 text-primary"
    : role === "moderator"
      ? "bg-info/10 text-info"
      : "bg-muted text-muted-foreground";
}

function AvatarMark({ user, size = "h-8 w-8" }: { user: NonNullable<ProfileMenuUser>; size?: string }) {
  return (
    <Avatar.Root
      className={`grid ${size} shrink-0 place-items-center overflow-hidden rounded-full bg-primary text-xs font-semibold text-primary-foreground`}
    >
      {user.avatar ? <Avatar.Image src={user.avatar} alt="" className="h-full w-full object-cover" /> : null}
      <Avatar.Fallback>{user.name?.charAt(0).toUpperCase() || "?"}</Avatar.Fallback>
    </Avatar.Root>
  );
}

function RolePill({ role }: { role?: string }) {
  return (
    <span
      className={`mt-1.5 inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[.14em] ${rolePillClass(role)}`}
    >
      {roleLabel(role)}
    </span>
  );
}

function Identity({ user }: { user: NonNullable<ProfileMenuUser> }) {
  return (
    <div className="min-w-0">
      <p className="truncate text-sm font-semibold">{user.name}</p>
      {user.email ? <p className="truncate text-xs text-muted-foreground">{user.email}</p> : null}
      <RolePill role={user.role} />
    </div>
  );
}

export function ProfileMenu({ user, onLogout }: { user: ProfileMenuUser; onLogout: () => void }) {
  const isMobile = useIsMobile();
  const router = useRouter();

  if (!user) return null;

  const triggerClass =
    "flex cursor-pointer items-center gap-1.5 rounded-lg py-1 pl-1 pr-1.5 text-muted-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60";
  const trigger = (
    <>
      <AvatarMark user={user} />
      <ChevronDownIcon size={15} aria-hidden="true" className="hidden sm:block" />
      <span className="sr-only">Account menu for {user.name}</span>
    </>
  );

  // below the sidebar breakpoint an anchored dropdown is too small to use,
  // so the same actions open as a full width bottom sheet instead
  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger render={<button type="button" aria-label="Account menu" className={triggerClass} />}>
          {trigger}
        </SheetTrigger>
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetHeader className="border-b border-border pb-4">
            <div className="flex items-center gap-3">
              <AvatarMark user={user} size="h-11 w-11" />
              <div className="min-w-0">
                <SheetTitle className="truncate text-left">{user.name}</SheetTitle>
                <SheetDescription className="truncate text-muted-foreground">
                  {user.email ?? "Signed in"}
                </SheetDescription>
                <RolePill role={user.role} />
              </div>
            </div>
          </SheetHeader>
          <div className="flex flex-col gap-1 px-4 pb-8">
            <Button
              variant="ghost"
              className="justify-start gap-2"
              onClick={() => {
                router.push("/profile");
              }}
            >
              <UserIcon size={16} aria-hidden="true" />
              Edit profile
            </Button>
            <Button
              variant="ghost"
              className="justify-start gap-2 text-destructive hover:text-destructive"
              onClick={onLogout}
            >
              <LogOutIcon size={16} aria-hidden="true" />
              Logout
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<button type="button" aria-label="Account menu" className={triggerClass} />}>
        {trigger}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-72 p-0">
        <div className="flex items-center gap-3 border-b border-border px-3 py-3">
          <AvatarMark user={user} size="h-10 w-10" />
          <Identity user={user} />
        </div>
        <div className="p-1">
          <DropdownMenuItem render={<Link href="/profile" />} className="gap-2">
            <UserIcon size={16} className="text-muted-foreground" aria-hidden="true" />
            Edit profile
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={onLogout} className="gap-2">
            <LogOutIcon size={16} aria-hidden="true" />
            Logout
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
