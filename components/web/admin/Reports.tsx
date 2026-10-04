import React, { useMemo, useState } from "react";
import { DownloadIcon, InboxIcon } from "lucide-react";
import { PageHeading, EmptyState } from "./AdminShell";
import { StatusBadge } from "./StatusBadge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Report, ReportStatus, Worker } from "@/data/adminData";
import { buildReportCodes } from "@/lib/report-code";

const statuses: ReportStatus[] = ["Reported", "Acknowledged", "In progress", "Resolved"];

type ReportsProps = {
  reports: Report[];
  workers: Worker[];
  search: string;
  onOpenReport: (report: Report) => void;
  onStatusChange: (id: string, status: ReportStatus) => void;
  onAssign: (id: string, workerId: string | null) => void;
  onBulkStatus: (ids: string[], status: ReportStatus) => void;
};

const CATEGORY_TO_SPECIALTY: Record<string, string> = {
  "Roads": "Roads crew",
  "Lighting": "Electrical",
  "Cleanliness" : "Sanitation",
  "Parks" : "Parks"
};

export function Reports({ reports, workers, search, onOpenReport, onStatusChange, onAssign, onBulkStatus }: ReportsProps) {
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [rangeFilter, setRangeFilter] = useState("All time");
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [unassignTarget, setUnassignTarget] = useState<Report | null>(null);
  const codes = useMemo(() => buildReportCodes(reports.map((r) => r.id)), [reports]);
  const codeOf = (id: string) => codes.get(id) ?? id;

  /** Unassigning drops the report back into the queue, so it always asks first. */
  function handleAssign(report: Report, workerId: string) {
    if (!workerId && report.assignedTo) {
      setUnassignTarget(report);
      return;
    }
    onAssign(report.id, workerId || null);
  }

  const visible = useMemo(() => reports.filter((report) => {
    const matchesStatus = statusFilter === "All" || report.status === statusFilter;
    const matchesCategory = categoryFilter === "All" || report.category === categoryFilter;
    const matchesFlag = !flaggedOnly || report.suspicious;
    const matchesRange = rangeFilter === "All time" ||
    rangeFilter === "Last 7 days" && report.date >= "2026-08-04" ||
    rangeFilter === "Last 30 days" && report.date >= "2026-07-12";
    const haystack = `${report.title} ${report.address} ${report.reporter} ${codeOf(report.id)}`.toLowerCase();
    return matchesStatus && matchesCategory && matchesFlag && matchesRange && haystack.includes(search.toLowerCase());
  }), [reports, statusFilter, categoryFilter, rangeFilter, flaggedOnly, search, codes]);

  const allSelected = visible.length > 0 && selected.length === visible.length;

  function toggleRow(id: string) {
    setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  return (
    <>
      <PageHeading
        eyebrow="Triage queue"
        title="Reports management"
        description="Review incoming citizen reports, move them through the workflow, and assign the right crew."
        action={
        <Button variant="outline" size="sm" className="self-start sm:self-auto">
            <DownloadIcon size={16} /> Export CSV
          </Button>
        } />
      

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-wrap items-center gap-2">
          <FilterSelect label="Status" value={statusFilter} onChange={setStatusFilter} options={["All", ...statuses]} />
          <FilterSelect label="Category" value={categoryFilter} onChange={setCategoryFilter} options={["All", "Roads", "Lighting", "Cleanliness", "Parks"]} />
          <FilterSelect label="Date range" value={rangeFilter} onChange={setRangeFilter} options={["All time", "Last 7 days", "Last 30 days"]} />
          <label className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium">
            <input type="checkbox" checked={flaggedOnly} onChange={(event) => setFlaggedOnly(event.target.checked)} className="h-4 w-4 accent-primary" />
            Suspicious only
          </label>
        </div>

        {selected.length > 0 &&
        <div className="mt-3 flex flex-wrap items-center gap-3 rounded-lg bg-primary/10 px-4 py-3">
            <span className="text-sm font-semibold text-primary">{selected.length} selected</span>
            <label className="text-xs font-semibold text-foreground">
              <span className="sr-only">Change status for selected reports</span>
              <select
              defaultValue=""
              onChange={(event) => {if (event.target.value) {onBulkStatus(selected, event.target.value as ReportStatus);setSelected([]);}}}
              className="ml-1 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-semibold outline-none focus:border-primary">
              
                <option value="">Change status…</option>
                {statuses.map((status) => <option key={status}>{status}</option>)}
              </select>
            </label>
            <Button variant="outline" size="xs">Export selection</Button>
            <Button variant="ghost" size="xs" className="ml-auto" onClick={() => setSelected([])}>Clear</Button>
          </div>
        }

        {visible.length === 0 ? (
          <div className="mt-4">
            <EmptyState title="No reports match these filters" description="Try clearing the search term or widening the status, category, or date filters." icon={<InboxIcon size={20} />} />
          </div>
        ) : (
          <>
            {/* Desktop / tablet: table with a sticky identity column */}
            <div className="mt-4 hidden overflow-x-auto md:block">
              <table className="w-full min-w-[860px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-border text-[11px] font-semibold uppercase tracking-[.1em] text-muted-foreground">
                    <th scope="col" className="sticky left-0 z-10 w-10 bg-card px-2 py-2.5">
                      <input
                      type="checkbox"
                      aria-label="Select all reports"
                      checked={allSelected}
                      onChange={(event) => setSelected(event.target.checked ? visible.map((report) => report.id) : [])}
                      className="h-4 w-4 accent-primary" />
                    
                    </th>
                    <th scope="col" className="sticky left-10 z-10 bg-card px-2 py-2.5 shadow-[8px_0_8px_-8px_rgba(0,0,0,0.25)]">Report</th>
                    <th scope="col" className="px-2 py-2.5">Category</th>
                    <th scope="col" className="px-2 py-2.5">Reporter</th>
                    <th scope="col" className="px-2 py-2.5">Status</th>
                    <th scope="col" className="px-2 py-2.5">Votes</th>
                    <th scope="col" className="px-2 py-2.5">Date</th>
                    <th scope="col" className="px-2 py-2.5">Assigned</th>
                    <th scope="col" className="px-2 py-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((report) =>
                <tr key={report.id} className="border-b border-border align-middle last:border-0 hover:bg-muted/50">
                      <td className="sticky left-0 z-10 bg-card px-2 py-3 hover:bg-muted/50">
                        <input type="checkbox" aria-label={`Select ${codeOf(report.id)}`} checked={selected.includes(report.id)} onChange={() => toggleRow(report.id)} className="h-4 w-4 accent-primary" />
                      </td>
                      <td className="sticky left-10 z-10 w-[230px] min-w-[230px] max-w-[230px] overflow-hidden bg-card px-2 py-3 shadow-[8px_0_8px_-8px_rgba(0,0,0,0.25)] hover:bg-muted/50">
                        <button onClick={() => onOpenReport(report)} className="block w-full min-w-0 text-left">
                          <span className="block truncate text-sm font-semibold hover:text-primary">{report.title}</span>
                          <span className="mt-0.5 block truncate font-mono text-xs text-muted-foreground">{codeOf(report.id)}</span>
                        </button>
                        {report.suspicious && <span className="mt-1 inline-block rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold text-destructive">Flagged</span>}
                      </td>
                      <td className="whitespace-nowrap px-2 py-3 text-sm">{report.category}</td>
                      <td className="max-w-[140px] truncate px-2 py-3 text-sm">{report.reporter}</td>
                      <td className="px-2 py-3">
                        <label>
                          <span className="sr-only">Status for {codeOf(report.id)}</span>
                          <select
                        value={report.status}
                        onChange={(event) => onStatusChange(report.id, event.target.value as ReportStatus)}
                        className="rounded-lg border border-border bg-background px-2 py-1.5 text-xs font-semibold outline-none focus:border-primary">
                        
                            {statuses.map((status) => <option key={status}>{status}</option>)}
                          </select>
                        </label>
                      </td>
                      <td className="px-2 py-3 text-sm tabular-nums">{report.upvotes}</td>
                      <td className="whitespace-nowrap px-2 py-3 text-sm">{report.createdLabel}</td>
                      <td className="px-2 py-3">
                          <label>
                            <span className="sr-only">Assign worker for {codeOf(report.id)}</span>
                            <select
                              value={report.assignedTo ?? ""}
                              onChange={(event) => handleAssign(report, event.target.value)}
                              className="max-w-[140px] rounded-lg border border-border bg-background px-2 py-1.5 text-xs outline-none focus:border-primary">
                              <option value="">Unassigned</option>
                              {workers
                                .filter((worker) => worker.specialty === CATEGORY_TO_SPECIALTY[report.category])
                                .map((worker) => (
                                  <option key={worker.id} value={worker.id}>{worker.name}</option>
                                ))}
                            </select>
                          </label>
                        </td>
                      <td className="px-2 py-3 text-right">
                        <Button variant="outline" size="xs" onClick={() => onOpenReport(report)}>View</Button>
                      </td>
                    </tr>
                )}
                </tbody>
              </table>
            </div>

            {/* Mobile: stacked cards instead of a cramped table */}
            <ul className="mt-4 space-y-3 md:hidden">
              {visible.map((report) => (
                <li key={report.id} className="rounded-lg border border-border bg-background p-4">
                  <div className="flex items-start justify-between gap-3">
                    <button onClick={() => onOpenReport(report)} className="min-w-0 flex-1 text-left">
                      <span className="block truncate text-sm font-semibold">{report.title}</span>
                      <span className="mt-0.5 block truncate font-mono text-xs text-muted-foreground">{codeOf(report.id)}</span>
                    </button>
                    <StatusBadge status={report.status} />
                  </div>

                  {report.suspicious && (
                    <span className="mt-2 inline-block rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold text-destructive">
                      Flagged
                    </span>
                  )}

                  <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-lg bg-muted px-3 py-2">
                      <dt className="text-muted-foreground">Category</dt>
                      <dd className="mt-0.5 font-medium text-foreground">{report.category}</dd>
                    </div>
                    <div className="rounded-lg bg-muted px-3 py-2">
                      <dt className="text-muted-foreground">Reporter</dt>
                      <dd className="mt-0.5 font-medium text-foreground">{report.reporter}</dd>
                    </div>
                    <div className="rounded-lg bg-muted px-3 py-2">
                      <dt className="text-muted-foreground">Votes</dt>
                      <dd className="mt-0.5 font-medium tabular-nums text-foreground">{report.upvotes}</dd>
                    </div>
                    <div className="rounded-lg bg-muted px-3 py-2">
                      <dt className="text-muted-foreground">Date</dt>
                      <dd className="mt-0.5 font-medium text-foreground">{report.createdLabel}</dd>
                    </div>
                  </dl>

                  <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                    <label className="flex-1 text-xs font-semibold text-muted-foreground">
                      <span className="sr-only">Status for {codeOf(report.id)}</span>
                      <select
                        value={report.status}
                        onChange={(event) => onStatusChange(report.id, event.target.value as ReportStatus)}
                        className="mt-1 w-full rounded-lg border border-border bg-card px-2.5 py-2 text-sm font-medium text-foreground outline-none focus:border-primary"
                      >
                        {statuses.map((status) => <option key={status}>{status}</option>)}
                      </select>
                    </label>
                    <label className="flex-1 text-xs font-semibold text-muted-foreground">
                      <span className="sr-only">Assign worker for {codeOf(report.id)}</span>
                      <select
                        value={report.assignedTo ?? ""}
                        onChange={(event) => handleAssign(report, event.target.value)}
                        className="mt-1 w-full rounded-lg border border-border bg-card px-2.5 py-2 text-sm text-foreground outline-none focus:border-primary"
                      >
                        <option value="">Unassigned</option>
                        {workers
                          .filter((worker) => worker.specialty === CATEGORY_TO_SPECIALTY[report.category])
                          .map((worker) => (
                            <option key={worker.id} value={worker.id}>{worker.name}</option>
                          ))}
                      </select>
                    </label>
                  </div>

                  <Button variant="outline" size="sm" className="mt-3 w-full" onClick={() => onOpenReport(report)}>
                    View report
                  </Button>
                </li>
              ))}
            </ul>
          </>
        )}
        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
          <span>Showing {visible.length} of {reports.length} reports</span>
          <div className="flex items-center gap-1">
            <StatusBadge status="Reported" />
            <span className="hidden sm:inline">needs a first response</span>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={!!unassignTarget}
        onOpenChange={(open) => {
          if (!open) setUnassignTarget(null);
        }}
        title="Unassign this worker?"
        description={`"${unassignTarget?.title ?? "This report"}" goes back to the unassigned queue until someone picks it up.`}
        confirmLabel="Unassign"
        onConfirm={() => {
          if (unassignTarget) onAssign(unassignTarget.id, null);
          setUnassignTarget(null);
        }}
      />
    </>);

}

function FilterSelect({ label, value, onChange, options }: {label: string;value: string;onChange: (value: string) => void;options: string[];}) {
  return (
    <label className="text-xs font-semibold text-muted-foreground">
      <span className="sr-only">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium outline-none focus:border-primary">
        {options.map((option) => <option key={option} value={option}>{label}: {option}</option>)}
      </select>
    </label>);

}