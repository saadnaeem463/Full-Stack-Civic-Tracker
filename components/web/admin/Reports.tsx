import React, { useMemo, useState } from "react";
import { DownloadIcon, InboxIcon, SearchIcon } from "lucide-react";
import { PageHeading, EmptyState } from "./AdminShell";
import { StatusBadge } from "./StatusBadge";
import { Report, ReportStatus, Worker } from "@/data/adminData";

const statuses: ReportStatus[] = ["Reported", "Acknowledged", "In progress", "Resolved"];

type ReportsProps = {
  reports: Report[];
  workers: Worker[];
  search: string;
  onSearch: (value: string) => void;
  onOpenReport: (report: Report) => void;
  onStatusChange: (id: string, status: ReportStatus) => void;
  onAssign: (id: string, workerId: string | null) => void;
  onBulkStatus: (ids: string[], status: ReportStatus) => void;
};

export function Reports({ reports, workers, search, onSearch, onOpenReport, onStatusChange, onAssign, onBulkStatus }: ReportsProps) {
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [rangeFilter, setRangeFilter] = useState("All time");
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  const visible = useMemo(() => reports.filter((report) => {
    const matchesStatus = statusFilter === "All" || report.status === statusFilter;
    const matchesCategory = categoryFilter === "All" || report.category === categoryFilter;
    const matchesFlag = !flaggedOnly || report.suspicious;
    const matchesRange = rangeFilter === "All time" ||
    rangeFilter === "Last 7 days" && report.date >= "2026-08-04" ||
    rangeFilter === "Last 30 days" && report.date >= "2026-07-12";
    const haystack = `${report.title} ${report.address} ${report.reporter} ${report.id}`.toLowerCase();
    return matchesStatus && matchesCategory && matchesFlag && matchesRange && haystack.includes(search.toLowerCase());
  }), [reports, statusFilter, categoryFilter, rangeFilter, flaggedOnly, search]);

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
        <button className="inline-flex items-center gap-2 self-start rounded-lg border border-[#dfe5dc] bg-[#fbfcf9] px-4 py-2.5 text-sm font-semibold text-[#25603f] hover:bg-[#eef4ed] sm:self-auto">
            <DownloadIcon size={16} /> Export CSV
          </button>
        } />
      

      <div className="rounded-2xl border border-[#dfe5dc] bg-[#fbfcf9] p-4">
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex min-w-[220px] flex-1 items-center gap-2 rounded-lg border border-[#dfe5dc] bg-white px-3 py-2">
            <SearchIcon size={16} className="text-[#6f7c73]" aria-hidden="true" />
            <input value={search} onChange={(event) => onSearch(event.target.value)} placeholder="Search reports" aria-label="Search reports" className="min-w-0 flex-1 border-0 p-0 text-sm outline-none" />
          </label>
          <FilterSelect label="Status" value={statusFilter} onChange={setStatusFilter} options={["All", ...statuses]} />
          <FilterSelect label="Category" value={categoryFilter} onChange={setCategoryFilter} options={["All", "Roads", "Lighting", "Cleanliness", "Parks"]} />
          <FilterSelect label="Date range" value={rangeFilter} onChange={setRangeFilter} options={["All time", "Last 7 days", "Last 30 days"]} />
          <label className="flex items-center gap-2 rounded-lg border border-[#dfe5dc] bg-white px-3 py-2 text-sm font-medium">
            <input type="checkbox" checked={flaggedOnly} onChange={(event) => setFlaggedOnly(event.target.checked)} className="h-4 w-4 accent-[#1e5b3e]" />
            Suspicious only
          </label>
        </div>

        {selected.length > 0 &&
        <div className="mt-3 flex flex-wrap items-center gap-3 rounded-xl bg-[#e8f1e7] px-4 py-3">
            <span className="text-sm font-semibold text-[#1e5b3e]">{selected.length} selected</span>
            <label className="text-xs font-semibold text-[#3f5546]">
              <span className="sr-only">Change status for selected reports</span>
              <select
              defaultValue=""
              onChange={(event) => {if (event.target.value) {onBulkStatus(selected, event.target.value as ReportStatus);setSelected([]);}}}
              className="ml-1 rounded-lg border border-[#c5d8c6] bg-white px-2.5 py-1.5 text-xs font-semibold outline-none">
              
                <option value="">Change status…</option>
                {statuses.map((status) => <option key={status}>{status}</option>)}
              </select>
            </label>
            <button className="rounded-lg border border-[#c5d8c6] bg-white px-2.5 py-1.5 text-xs font-bold text-[#25603f]">Export selection</button>
            <button onClick={() => setSelected([])} className="ml-auto text-xs font-bold text-[#4a6b54] hover:underline">Clear</button>
          </div>
        }

        <div className="mt-4 overflow-x-auto">
          {visible.length === 0 ?
          <EmptyState title="No reports match these filters" description="Try clearing the search term or widening the status, category, or date filters." icon={<InboxIcon size={20} />} /> :

          <table className="w-full min-w-[980px] border-collapse text-left">
              <thead>
                <tr className="border-b border-[#dfe5dc] text-[11px] font-bold uppercase tracking-[.1em] text-[#6d7a71]">
                  <th scope="col" className="px-2 py-2.5">
                    <input
                    type="checkbox"
                    aria-label="Select all reports"
                    checked={allSelected}
                    onChange={(event) => setSelected(event.target.checked ? visible.map((report) => report.id) : [])}
                    className="h-4 w-4 accent-[#1e5b3e]" />
                  
                  </th>
                  <th scope="col" className="px-2 py-2.5">Report</th>
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
              <tr key={report.id} className="border-b border-[#eef2ec] align-middle last:border-0 hover:bg-[#f5f8f4]">
                    <td className="px-2 py-3">
                      <input type="checkbox" aria-label={`Select ${report.id}`} checked={selected.includes(report.id)} onChange={() => toggleRow(report.id)} className="h-4 w-4 accent-[#1e5b3e]" />
                    </td>
                    <td className="max-w-[280px] px-2 py-3">
                      <button onClick={() => onOpenReport(report)} className="text-left">
                        <span className="block truncate text-sm font-semibold hover:text-[#1e5b3e]">{report.title}</span>
                        <span className="mt-0.5 block truncate text-xs text-[#6d7a71]">{report.id} · {report.address}</span>
                      </button>
                      {report.suspicious && <span className="mt-1 inline-block rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">Flagged</span>}
                    </td>
                    <td className="px-2 py-3 text-sm text-[#4d5b52]">{report.category}</td>
                    <td className="px-2 py-3 text-sm text-[#4d5b52]">{report.reporter}</td>
                    <td className="px-2 py-3">
                      <label>
                        <span className="sr-only">Status for {report.id}</span>
                        <select
                      value={report.status}
                      onChange={(event) => onStatusChange(report.id, event.target.value as ReportStatus)}
                      className="rounded-lg border border-[#dfe5dc] bg-white px-2 py-1.5 text-xs font-semibold outline-none focus:border-[#1e5b3e]">
                      
                          {statuses.map((status) => <option key={status}>{status}</option>)}
                        </select>
                      </label>
                    </td>
                    <td className="px-2 py-3 text-sm tabular-nums text-[#4d5b52]">{report.upvotes}</td>
                    <td className="whitespace-nowrap px-2 py-3 text-sm text-[#4d5b52]">{report.createdLabel}</td>
                    <td className="px-2 py-3">
                      <label>
                        <span className="sr-only">Assign worker for {report.id}</span>
                        <select
                      value={report.assignedTo ?? ""}
                      onChange={(event) => onAssign(report.id, event.target.value || null)}
                      className="max-w-[140px] rounded-lg border border-[#dfe5dc] bg-white px-2 py-1.5 text-xs outline-none focus:border-[#1e5b3e]">
                      
                          <option value="">Unassigned</option>
                          {workers.map((worker) => <option key={worker.id} value={worker.id}>{worker.name}</option>)}
                        </select>
                      </label>
                    </td>
                    <td className="px-2 py-3 text-right">
                      <button onClick={() => onOpenReport(report)} className="rounded-lg border border-[#dfe5dc] px-2.5 py-1.5 text-xs font-bold text-[#25603f] hover:bg-[#eef4ed]">View</button>
                    </td>
                  </tr>
              )}
              </tbody>
            </table>
          }
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-[#6d7a71]">
          <span>Showing {visible.length} of {reports.length} reports</span>
          <div className="flex items-center gap-1">
            <StatusBadge status="Reported" />
            <span className="hidden sm:inline">needs a first response</span>
          </div>
        </div>
      </div>
    </>);

}

function FilterSelect({ label, value, onChange, options }: {label: string;value: string;onChange: (value: string) => void;options: string[];}) {
  return (
    <label className="text-xs font-semibold text-[#5b6960]">
      <span className="sr-only">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="rounded-lg border border-[#dfe5dc] bg-white px-3 py-2 text-sm font-medium outline-none focus:border-[#1e5b3e]">
        {options.map((option) => <option key={option} value={option}>{label}: {option}</option>)}
      </select>
    </label>);

}