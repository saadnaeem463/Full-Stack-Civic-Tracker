"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { SearchIcon, WalletIcon } from "lucide-react";
import { pusherClient, BUDGET_CHANNEL, NEW_BUDGET_REQUEST_EVENT, BUDGET_REQUEST_RESOLVED_EVENT } from "@/lib/pusher-client";
import { NotificationBell } from "@/components/web/notification-bell";
import { ThemeToggle } from "@/components/web/theme-toggle";
import { ProfileMenu } from "@/components/web/profile-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { getMe, userLogout } from "@/lib/services/auth.services";
import { AnimatePresence, PopPanel, motion } from "@/components/motion";
import { EmptyState, PageHeading, SectionCard } from "./primitives";

export { EmptyState, PageHeading, SectionCard };

/** Header search box value, shared with whatever admin page is mounted. */
const AdminSearchContext = React.createContext<string>("");

export function useAdminSearch() {
  return React.useContext(AdminSearchContext);
}

type AdminShellProps = {
  search: string;
  onSearch: (value: string) => void;
  children: React.ReactNode;
};

type NotificationItem = {
  id: string;
  title: string;
  detail: string;
  urgent: boolean;
};

export function AdminShell({ search, onSearch, children }: AdminShellProps) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [user, setUser] = useState<{ name: string; email: string; role: string; avatar?: string } | null>(null);
  const router = useRouter();
  const budgetRef = useRef<HTMLDivElement>(null);
  const urgentCount = notifications.filter((item) => item.urgent).length;
  const roleLabel = user?.role === "moderator" ? "Moderator" : "Admin";

  async function handleLogout() {
    await userLogout();
    setUser(null);
    router.push("/auth/login");
  }

  useEffect(() => {
    if (!notifOpen) return;
    const onDown = (event: PointerEvent) => {
      if (!budgetRef.current?.contains(event.target as Node)) setNotifOpen(false);
    };
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setNotifOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [notifOpen]);

  useEffect(() => {
    getMe()
      .then((res) => {
        if (res.user) setUser(res.user);
      })
      .catch((err) => console.log("Failed to load current user:", err));
  }, []);

  useEffect(() => {
    fetch("/api/admin/budget/requests?status=Pending")
      .then((res) => res.json())
      .then((data) => {
        setNotifications(
          (data.requests ?? []).map((r: { _id: string; category: string }) => ({
            id: r._id,
            title: "Budget request pending",
            detail: `Category Budget Request for ${r.category}`,
            urgent: true,
          }))
        );
      })
      .catch((err) => console.log("Failed to load pending budget requests:", err));
  }, []);

  useEffect(() => {
    const channel = pusherClient.subscribe(BUDGET_CHANNEL);

    channel.bind(NEW_BUDGET_REQUEST_EVENT, (data: { requestId: string; category: string }) => {
      setNotifications((prev) => {
        if (prev.some((n) => n.id === data.requestId)) return prev;
        return [
          {
            id: data.requestId,
            title: "Budget request pending",
            detail: `Category Budget Request for ${data.category}`,
            urgent: true,
          },
          ...prev,
        ];
      });
    });

    channel.bind(BUDGET_REQUEST_RESOLVED_EVENT, (data: { requestId: string }) => {
      setNotifications((prev) => prev.filter((n) => n.id !== data.requestId));
    });

    return () => {
      channel.unbind(NEW_BUDGET_REQUEST_EVENT);
      channel.unbind(BUDGET_REQUEST_RESOLVED_EVENT);
      pusherClient.unsubscribe(BUDGET_CHANNEL);
    };
  }, []);

  return (
    <div className="flex min-h-screen w-full flex-col bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
        <div className="flex min-h-16 flex-wrap items-center gap-3 px-4 py-2 sm:flex-nowrap sm:px-6 sm:py-0">
          <SidebarTrigger aria-label="Toggle sidebar" className="-ml-2 shrink-0" />
          <label className="order-last flex w-full min-w-0 flex-1 items-center gap-2.5 rounded-lg border border-border bg-card px-3 py-2 focus-within:ring-2 focus-within:ring-ring/60 sm:order-none sm:max-w-md">
            <SearchIcon size={17} className="shrink-0 text-muted-foreground" aria-hidden="true" />
            <input
              value={search}
              onChange={(event) => onSearch(event.target.value)}
              placeholder="Search reports, workers, or locations"
              aria-label="Search the portal"
              className="min-w-0 flex-1 border-0 bg-transparent p-0 text-sm outline-none placeholder:text-muted-foreground"
            />
          </label>
          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            {user && (
              <span
                className={`hidden rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[.14em] sm:inline ${
                  user.role === "moderator" ? "bg-info/10 text-info" : "bg-primary/10 text-primary"
                }`}
              >
                {roleLabel}
              </span>
            )}
            <ThemeToggle />
            <NotificationBell />
            {urgentCount > 0 && (
            <div className="relative" ref={budgetRef}>
              <motion.button
                type="button"
                whileTap={{ scale: 0.92 }}
                onClick={() => setNotifOpen(!notifOpen)}
                aria-expanded={notifOpen}
                title="Pending budget requests"
                aria-label={`Pending budget requests, ${urgentCount} awaiting a decision`}
                className="relative grid h-9 w-9 place-items-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
              >
                <WalletIcon size={19} />
                <span className="absolute right-1 top-1 grid min-w-4 place-items-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-4 text-primary-foreground">
                  {urgentCount > 9 ? "9+" : urgentCount}
                </span>
              </motion.button>
              <AnimatePresence>
              {notifOpen && (
                <PopPanel className="absolute right-0 top-11 z-40 w-[min(20rem,calc(100vw-2rem))] rounded-xl border border-border bg-popover p-2 shadow-lg">
                  <p className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-[.12em] text-muted-foreground">Budget requests</p>
                  <p className="px-2 pb-1.5 text-xs text-muted-foreground">Pending category allocations waiting on your decision.</p>
                  {notifications.map((item) => (
                    <div key={item.id} className="rounded-lg px-2 py-2 hover:bg-accent">
                      <p className="flex items-center gap-2 text-sm font-semibold">
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-destructive" />
                        {item.title}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{item.detail}</p>
                    </div>
                  ))}
                </PopPanel>
              )}
              </AnimatePresence>
            </div>
            )}
            <ProfileMenu user={user} onLogout={handleLogout} />
          </div>
        </div>
      </header>
      <div className="flex-1 px-4 py-7 sm:px-6 sm:py-9">
        <AdminSearchContext.Provider value={search}>{children}</AdminSearchContext.Provider>
      </div>
    </div>
  );
}