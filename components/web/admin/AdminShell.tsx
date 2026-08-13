import React, { useState } from "react";
import { BellIcon, ChevronDownIcon, SearchIcon, XIcon } from "lucide-react";
import { notifications } from "@/data/adminData";

type AdminShellProps = {
  search: string;
  onSearch: (value: string) => void;
  children: React.ReactNode;
};

export function AdminShell({ search, onSearch, children }: AdminShellProps) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const urgentCount = notifications.filter((item) => item.urgent).length;

  return (
    <div className="flex min-h-screen w-full flex-col bg-[#f7f8f4] text-[#17211b]">
      <header className="sticky top-0 z-30 border-b border-[#dfe5dc] bg-[#fbfcf9]/95 backdrop-blur">
        <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
          <label className="flex min-w-0 flex-1 items-center gap-2.5 rounded-lg border border-[#dfe5dc] bg-white px-3 py-2 sm:max-w-md">
            <SearchIcon size={17} className="shrink-0 text-[#6f7c73]" aria-hidden="true" />
            <input
              value={search}
              onChange={(event) => onSearch(event.target.value)}
              placeholder="Search reports, workers, or locations"
              aria-label="Search the portal"
              className="min-w-0 flex-1 border-0 p-0 text-sm outline-none placeholder:text-[#8a948c]"
            />
          </label>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden rounded-full bg-[#e8f1e7] px-2.5 py-1 text-[11px] font-bold uppercase tracking-[.12em] text-[#1e5b3e] sm:inline">Admin</span>
            <div className="relative">
              <button
                onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
                aria-expanded={notifOpen}
                aria-label={`Notifications, ${urgentCount} urgent`}
                className="relative grid h-9 w-9 place-items-center rounded-lg text-[#3f4d44] hover:bg-[#eef3ed]"
              >
                <BellIcon size={19} />
                {urgentCount > 0 && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />}
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-11 z-40 w-[300px] rounded-xl border border-[#dfe5dc] bg-white p-2 shadow-lg">
                  <p className="px-2 py-1.5 text-[11px] font-bold uppercase tracking-[.12em] text-[#6d7a71]">Notification center</p>
                  {notifications.map((item) => (
                    <div key={item.id} className="rounded-lg px-2 py-2 hover:bg-[#f4f7f3]">
                      <p className="flex items-center gap-2 text-sm font-semibold">
                        {item.urgent && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />}
                        {item.title}
                      </p>
                      <p className="mt-0.5 text-xs text-[#6d7a71]">{item.detail}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="relative">
              <button
                onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
                aria-expanded={profileOpen}
                className="flex items-center gap-2 rounded-lg py-1 pl-1 pr-2 hover:bg-[#eef3ed]"
              >
                <span className="grid h-8 w-8 place-items-center rounded-full bg-[#1e5b3e] text-xs font-bold text-white">KO</span>
                <ChevronDownIcon size={15} className="text-[#5b6960]" />
              </button>
              {profileOpen && (
                <div className="absolute right-0 top-11 z-40 w-56 rounded-xl border border-[#dfe5dc] bg-white p-1.5 shadow-lg">
                  <div className="border-b border-[#eef2ec] px-2.5 py-2">
                    <p className="text-sm font-bold">Kwame Osei</p>
                    <p className="text-xs text-[#6d7a71]">Public Works · Admin</p>
                  </div>
                  <button className="mt-1 w-full rounded-lg px-2.5 py-2 text-left text-sm font-medium hover:bg-[#f4f7f3]">Portal settings</button>
                  <button className="w-full rounded-lg px-2.5 py-2 text-left text-sm font-medium hover:bg-[#f4f7f3]">Switch role view</button>
                  <button className="w-full rounded-lg px-2.5 py-2 text-left text-sm font-medium text-[#a4544f] hover:bg-[#fbf1f0]">Sign out</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1 px-4 py-7 sm:px-6 sm:py-9">{children}</main>
    </div>
  );
}

export function PageHeading({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[.15em] text-[#5c8069]">{eyebrow}</p>
        <h1 className="font-display mt-1.5 text-[34px] leading-none tracking-[-.04em] sm:text-[40px]">{title}</h1>
        <p className="mt-2.5 max-w-xl text-sm leading-6 text-[#637068]">{description}</p>
      </div>
      {action}
    </div>
  );
}

export function SectionCard({ title, description, children, action }: { title: string; description?: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-[#dfe5dc] bg-[#fbfcf9] p-5">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-bold tracking-[-.02em]">{title}</h2>
          {description && <p className="mt-1 text-xs text-[#6d7a71]">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function EmptyState({ title, description, icon }: { title: string; description: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-[#cbd6c9] bg-white px-6 py-12 text-center">
      <span className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-[#e8f1e7] text-[#1e5b3e]">{icon ?? <XIcon size={20} />}</span>
      <h3 className="mt-4 text-sm font-bold">{title}</h3>
      <p className="mx-auto mt-1.5 max-w-sm text-xs leading-5 text-[#6d7a71]">{description}</p>
    </div>
  );
}