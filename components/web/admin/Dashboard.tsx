import React from "react";
import { ArrowUpRightIcon, InboxIcon } from "lucide-react";
import { PageHeading, SectionCard, EmptyState } from "./AdminShell";
import { StatusBadge } from "./StatusBadge";
import { Report, ReportCategory, ReportStatus, budgetCategories, workers } from "../data/adminData";

const statusOrder: ReportStatus[] = ["Reported", "Acknowledged", "In progress", "Resolved"];
const statusColor: Record<ReportStatus, string> = {
  Reported: "#dc2626",
  Acknowledged: "#d97706",
  "In progress": "#b45309",
  Resolved: "#15803d"
};
const categories: ReportCategory[] = ["Roads", "Lighting", "Cleanliness", "Parks"];

function currency(value: number) {
  return `$${value.toLocaleString("en-US")}`;
}

export function Dashboard({ reports, onOpenReport, onSeeAll }: {reports: Report[];onOpenReport: (report: Report) => void;onSeeAll: () => void;}) {
  const openReports = reports.filter((report) => report.status !== "Resolved");
  const busyWorkers = workers.filter((worker) => worker.status === "Busy");
  const totalBudget = budgetCategories.reduce((sum, item) => sum + item.allocated, 0);
  const spentBudget = budgetCategories.reduce((sum, item) => sum + item.spent, 0);
  const statusCounts = statusOrder.map((status) => ({ status, count: reports.filter((report) => report.status === status).length }));
  const categoryCounts = categories.map((category) => ({ category, count: reports.filter((report) => report.category === category).length }));
  const maxCategory = Math.max(...categoryCounts.map((item) => item.count), 1);
  const recent = [...reports].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);
  const busyShare = Math.round(busyWorkers.length / workers.length * 100);

  return (
    <>
      <PageHeading
        eyebrow="Tuesday, August 11"
        title="Operations overview"
        description="Where the city's open work stands right now — the urgent queue, who is available, and how the maintenance budget is holding up."
        action={
        <button onClick={onSeeAll} className="inline-flex items-center gap-2 self-start rounded-lg bg-[#1e5b3e] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#174a32] sm:self-auto">
            Open report queue <ArrowUpRightIcon size={16} />
          </button>
        } />
      

      <div className="grid gap-4 lg:grid-cols-[1.15fr_1fr]">
        <section className="rounded-2xl border border-[#dfe5dc] bg-[#fbfcf9] p-5" aria-label="Report workload">
          <p className="text-[11px] font-bold uppercase tracking-[.14em] text-[#5c8069]">Needs attention</p>
          <div className="mt-3 flex flex-wrap items-end gap-x-8 gap-y-4">
            <div>
              <strong className="font-display block text-[62px] leading-[.85] tracking-[-.05em] text-[#1e5b3e]">{openReports.length}</strong>
              <span className="mt-2 block text-sm font-medium text-[#5b6960]">Open reports</span>
            </div>
            <div className="flex gap-6 border-l border-[#e4e9e1] pl-6">
              <MiniStat label="Total reports" value={String(reports.length)} />
              <MiniStat label="Breaching SLA" value={String(reports.filter((report) => report.status !== "Resolved" && report.slaHoursLeft <= 6).length)} tone="urgent" />
              <MiniStat label="Flagged" value={String(reports.filter((report) => report.suspicious).length)} />
            </div>
          </div>
        </section>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-2">
          <StatCard label="Resources" value={String(workers.length)} note="Field workers" />
          <StatCard label="Busy" value={String(busyWorkers.length)} note="Currently allocated" />
          <StatCard label="Free" value={String(workers.length - busyWorkers.length)} note="Available now" />
          <StatCard label="Budget left" value={currency(totalBudget - spentBudget)} note={`of ${currency(totalBudget)}`} />
        </div>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <SectionCard
          title="Recent reports"
          description="Newest submissions from residents across the city."
          action={<button onClick={onSeeAll} className="text-xs font-bold text-[#1e5b3e] hover:underline">View all</button>}>
          
          {recent.length === 0 ?
          <EmptyState title="No reports yet" description="New citizen submissions will appear here as soon as they arrive." icon={<InboxIcon size={20} />} /> :

          <ul className="divide-y divide-[#eef2ec]">
              {recent.map((report) =>
            <li key={report.id} className="flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{report.title}</p>
                    <p className="mt-0.5 truncate text-xs text-[#6d7a71]">{report.id} · {report.address} · {report.createdLabel}</p>
                  </div>
                  <StatusBadge status={report.status} />
                  <button onClick={() => onOpenReport(report)} className="rounded-lg border border-[#dfe5dc] px-2.5 py-1.5 text-xs font-bold text-[#25603f] hover:bg-[#eef4ed]">View</button>
                </li>
            )}
            </ul>
          }
        </SectionCard>

        <div className="grid gap-4">
          <SectionCard title="Reports by status" description="Distribution of the full report set.">
            <div className="flex flex-wrap items-center gap-6">
              <StatusDonut data={statusCounts} total={reports.length} />
              <ul className="flex-1 space-y-2">
                {statusCounts.map((item) =>
                <li key={item.status} className="flex items-center gap-2 text-sm">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: statusColor[item.status] }} aria-hidden="true" />
                    <span className="flex-1 text-[#4d5b52]">{item.status}</span>
                    <strong className="tabular-nums">{item.count}</strong>
                  </li>
                )}
              </ul>
            </div>
          </SectionCard>

          <SectionCard title="Worker allocation" description={`${busyShare}% of the crew is currently assigned.`}>
            <div className="h-3 w-full overflow-hidden rounded-full bg-[#e8f1e7]">
              <div className="h-full rounded-full bg-[#1e5b3e]" style={{ width: `${busyShare}%` }} role="img" aria-label={`${busyWorkers.length} of ${workers.length} workers busy`} />
            </div>
            <div className="mt-3 flex justify-between text-xs font-medium text-[#5b6960]">
              <span>{busyWorkers.length} busy</span>
              <span>{workers.length - busyWorkers.length} free</span>
            </div>
            <ul className="mt-4 space-y-2">
              {busyWorkers.map((worker) =>
              <li key={worker.id} className="flex items-center gap-2.5 rounded-lg bg-[#f4f7f3] px-3 py-2">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-[#dbe8dc] text-[10px] font-bold text-[#1e5b3e]">{worker.initials}</span>
                  <span className="min-w-0 flex-1 truncate text-xs font-semibold">{worker.name}</span>
                  <span className="text-[11px] text-[#6d7a71]">{worker.currentReport}</span>
                </li>
              )}
            </ul>
          </SectionCard>
        </div>
      </div>

      <div className="mt-4">
        <SectionCard title="Reports by category" description="Where maintenance demand is concentrated.">
          <div className="space-y-3">
            {categoryCounts.map((item) =>
            <div key={item.category} className="flex items-center gap-3">
                <span className="w-24 shrink-0 text-sm font-medium text-[#4d5b52]">{item.category}</span>
                <div className="h-7 flex-1 overflow-hidden rounded-md bg-[#eff3ee]">
                  <div className="h-full rounded-md bg-[#b9d0b9]" style={{ width: `${item.count / maxCategory * 100}%` }} />
                </div>
                <strong className="w-6 text-right text-sm tabular-nums">{item.count}</strong>
              </div>
            )}
          </div>
        </SectionCard>
      </div>
    </>);

}

function StatCard({ label, value, note }: {label: string;value: string;note: string;}) {
  return (
    <div className="rounded-xl border border-[#dfe5dc] bg-[#fbfcf9] p-4">
      <p className="text-[11px] font-bold uppercase tracking-[.12em] text-[#6d7a71]">{label}</p>
      <strong className="mt-2 block text-2xl tracking-[-.03em]">{value}</strong>
      <span className="mt-1 block text-[11px] text-[#77837b]">{note}</span>
    </div>);

}

function MiniStat({ label, value, tone }: {label: string;value: string;tone?: "urgent";}) {
  return (
    <div>
      <strong className={`block text-2xl tracking-[-.03em] ${tone === "urgent" ? "text-red-700" : ""}`}>{value}</strong>
      <span className="mt-1 block text-xs text-[#6d7a71]">{label}</span>
    </div>);

}

function StatusDonut({ data, total }: {data: {status: ReportStatus;count: number;}[];total: number;}) {
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;
  return (
    <svg viewBox="0 0 120 120" className="h-32 w-32" role="img" aria-label="Reports by status donut chart">
      <circle cx="60" cy="60" r={radius} fill="none" stroke="#eff3ee" strokeWidth="16" />
      {data.map((item) => {
        const length = total ? item.count / total * circumference : 0;
        const dash = `${length} ${circumference - length}`;
        const rotation = offset / circumference * 360 - 90;
        offset += length;
        return (
          <circle
            key={item.status}
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke={statusColor[item.status]}
            strokeWidth="16"
            strokeDasharray={dash}
            transform={`rotate(${rotation} 60 60)`} />);


      })}
      <text x="60" y="58" textAnchor="middle" className="fill-[#17211b] text-[19px] font-bold">{total}</text>
      <text x="60" y="74" textAnchor="middle" className="fill-[#6d7a71] text-[9px]">reports</text>
    </svg>);

}