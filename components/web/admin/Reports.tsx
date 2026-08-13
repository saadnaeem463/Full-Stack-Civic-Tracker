import React, { useMemo, useState } from "react";
import { DownloadIcon, InboxIcon, SearchIcon } from "lucide-react";

type ReportStatus = "Reported" | "Acknowledged" | "In progress" | "Resolved";

type ReportItem = {
  _id: string;
  userId: string;
  issueType: string;
  title: string;
  details?: string;
  lat?: number;
  lng?: number;
  media: { url: string; type: string; poster?: string }[];
  location: string;
  upVotedBy: string[];
  commentCount: number;
  status: ReportStatus;
  accessibilityFlag: boolean;
  assignedTo: string | null;
  suspicious: boolean;
  createdAt: string;
};

type WorkerItem = {
  _id: string;
  fullname: string;
  email: string;
  specialty: "Roads crew" | "Electrical" | "Sanitation" | "Parks";
  status: "Busy" | "Free";
  jobsCompleted: number;
  currentReport: string | null;
  active: boolean;
};

const statuses: ReportStatus[] = ["Reported", "Acknowledged", "In progress", "Resolved"];

const DUMMY_WORKERS: WorkerItem[] = [
  { _id: "w1", fullname: "Ali Khan", email: "ali@city.gov", specialty: "Roads crew", status: "Free", jobsCompleted: 12, currentReport: null, active: true },
  { _id: "w2", fullname: "Sara Malik", email: "sara@city.gov", specialty: "Electrical", status: "Busy", jobsCompleted: 8, currentReport: "r2", active: true },
  { _id: "w3", fullname: "Bilal Ahmed", email: "bilal@city.gov", specialty: "Sanitation", status: "Free", jobsCompleted: 20, currentReport: null, active: true },
  { _id: "w4", fullname: "Ayesha Noor", email: "ayesha@city.gov", specialty: "Parks", status: "Free", jobsCompleted: 5, currentReport: null, active: true },
];

const DUMMY_REPORTS: ReportItem[] = [
  {
    _id: "r1",
    userId: "u1",
    issueType: "Roads",
    title: "Large pothole near Main Street intersection",
    details: "The pothole is about 2 feet wide and causing traffic issues.",
    lat: 31.5204,
    lng: 74.3587,
    media: [{ url: "/placeholder.jpg", type: "image/jpeg" }],
    location: "Main Street, Lahore",
    upVotedBy: ["u2", "u3", "u4"],
    commentCount: 3,
    status: "Reported",
    accessibilityFlag: false,
    assignedTo: null,
    suspicious: false,
    createdAt: "2026-08-10T09:00:00Z",
  },
  {
    _id: "r2",
    userId: "u2",
    issueType: "Electrical",
    title: "Broken streetlight on Park Avenue",
    details: "Entire block is dark at night.",
    lat: 31.5254,
    lng: 74.3600,
    media: [],
    location: "Park Avenue, Lahore",
    upVotedBy: ["u1", "u5"],
    commentCount: 1,
    status: "Acknowledged",
    accessibilityFlag: true,
    assignedTo: "w2",
    suspicious: false,
    createdAt: "2026-08-08T14:30:00Z",
  },
  {
    _id: "r3",
    userId: "u3",
    issueType: "Sanitation",
    title: "Overflowing garbage bins near school",
    details: "Waste hasn't been collected for 3 days.",
    lat: 31.5180,
    lng: 74.3550,
    media: [{ url: "/garbage.jpg", type: "image/jpeg" }],
    location: "Delhi Gate, Lahore",
    upVotedBy: ["u1", "u2", "u3", "u4", "u5"],
    commentCount: 5,
    status: "In progress",
    accessibilityFlag: false,
    assignedTo: "w3",
    suspicious: false,
    createdAt: "2026-08-05T11:15:00Z",
  },
  {
    _id: "r4",
    userId: "u4",
    issueType: "Parks",
    title: "Vandalism in model town park",
    details: "Benches broken and graffiti on walls.",
    lat: 31.4830,
    lng: 74.3250,
    media: [],
    location: "Model Town Park, Lahore",
    upVotedBy: ["u1"],
    commentCount: 0,
    status: "Resolved",
    accessibilityFlag: false,
    assignedTo: "w4",
    suspicious: true,
    createdAt: "2026-07-28T08:45:00Z",
  },
  {
    _id: "r5",
    userId: "u5",
    issueType: "Roads",
    title: "Blocked drainage causing flooding",
    details: "Rainwater is pooling on the road after every shower.",
    lat: 31.5300,
    lng: 74.3700,
    media: [{ url: "/flood.jpg", type: "image/jpeg" }],
    location: "Gulberg III, Lahore",
    upVotedBy: ["u2", "u3"],
    commentCount: 2,
    status: "Reported",
    accessibilityFlag: true,
    assignedTo: null,
    suspicious: false,
    createdAt: "2026-08-12T16:20:00Z",
  },
];

type ReportsProps = {
  reports: ReportItem[];
  search: string;
  onSearch: (value: string) => void;
  onOpenReport: (report: ReportItem) => void;
  onStatusChange: (id: string, status: ReportStatus) => void;
  onAssign: (id: string, workerId: string | null) => void;
  onBulkStatus: (ids: string[], status: ReportStatus) => void;
};

export function Reports({ reports, search, onSearch, onOpenReport, onStatusChange, onAssign, onBulkStatus }: ReportsProps) {
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  const categories = useMemo(() => {
    const set = new Set(reports.map((r) => r.issueType));
    return ["All", ...Array.from(set)];
  }, [reports]);

  const visible = useMemo(() => reports.filter((report) => {
    const matchesStatus = statusFilter === "All" || report.status === statusFilter;
    const matchesCategory = categoryFilter === "All" || report.issueType === categoryFilter;
    const matchesFlag = !flaggedOnly || report.suspicious;
    const haystack = `${report.title} ${report.location} ${report.userId} ${report._id}`.toLowerCase();
    return matchesStatus && matchesCategory && matchesFlag && haystack.includes(search.toLowerCase());
  }), [reports, statusFilter, categoryFilter, flaggedOnly, search]);

  const allSelected = visible.length > 0 && selected.length === visible.length;

  function toggleRow(id: string) {
    setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  function workerName(id: string | null) {
    if (!id) return "Unassigned";
    const w = DUMMY_WORKERS.find((w) => w._id === id);
    return w ? w.fullname : "Unknown";
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  return (
    <>
      <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#6d7a71]">Triage queue</p>
          <h1 className="mt-1 text-2xl font-extrabold text-[#1a2e22]">Reports management</h1>
          <p className="mt-0.5 text-sm text-[#6d7a71]">Review incoming citizen reports, move them through the workflow, and assign the right crew.</p>
        </div>
        <button className="mt-3 inline-flex items-center gap-2 self-start rounded-lg border border-[#dfe5dc] bg-[#fbfcf9] px-4 py-2.5 text-sm font-semibold text-[#25603f] hover:bg-[#eef4ed] sm:mt-0 sm:self-auto">
          <DownloadIcon size={16} /> Export CSV
        </button>
      </div>

      <div className="rounded-2xl border border-[#dfe5dc] bg-[#fbfcf9] p-4">
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex min-w-[220px] flex-1 items-center gap-2 rounded-lg border border-[#dfe5dc] bg-white px-3 py-2">
            <SearchIcon size={16} className="text-[#6f7c73]" aria-hidden="true" />
            <input value={search} onChange={(event) => onSearch(event.target.value)} placeholder="Search reports" aria-label="Search reports" className="min-w-0 flex-1 border-0 p-0 text-sm outline-none" />
          </label>
          <FilterSelect label="Status" value={statusFilter} onChange={setStatusFilter} options={["All", ...statuses]} />
          <FilterSelect label="Category" value={categoryFilter} onChange={setCategoryFilter} options={categories} />
          <label className="flex items-center gap-2 rounded-lg border border-[#dfe5dc] bg-white px-3 py-2 text-sm font-medium">
            <input type="checkbox" checked={flaggedOnly} onChange={(event) => setFlaggedOnly(event.target.checked)} className="h-4 w-4 accent-[#1e5b3e]" />
            Suspicious only
          </label>
        </div>

        {selected.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-3 rounded-xl bg-[#e8f1e7] px-4 py-3">
            <span className="text-sm font-semibold text-[#1e5b3e]">{selected.length} selected</span>
            <label className="text-xs font-semibold text-[#3f5546]">
              <span className="sr-only">Change status for selected reports</span>
              <select
                defaultValue=""
                onChange={(event) => { if (event.target.value) { onBulkStatus(selected, event.target.value as ReportStatus); setSelected([]); } }}
                className="ml-1 rounded-lg border border-[#c5d8c6] bg-white px-2.5 py-1.5 text-xs font-semibold outline-none"
              >
                <option value="">Change status...</option>
                {statuses.map((status) => <option key={status}>{status}</option>)}
              </select>
            </label>
            <button className="rounded-lg border border-[#c5d8c6] bg-white px-2.5 py-1.5 text-xs font-bold text-[#25603f]">Export selection</button>
            <button onClick={() => setSelected([])} className="ml-auto text-xs font-bold text-[#4a6b54] hover:underline">Clear</button>
          </div>
        )}

        <div className="mt-4 overflow-x-auto">
          {visible.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e8f1e7]">
                <InboxIcon size={20} className="text-[#6d7a71]" />
              </div>
              <h3 className="mt-3 text-sm font-bold text-[#1a2e22]">No reports match these filters</h3>
              <p className="mt-1 max-w-xs text-xs text-[#6d7a71]">Try clearing the search term or widening the status, category, or date filters.</p>
            </div>
          ) : (
            <table className="w-full min-w-[980px] border-collapse text-left">
              <thead>
                <tr className="border-b border-[#dfe5dc] text-[11px] font-bold uppercase tracking-[.1em] text-[#6d7a71]">
                  <th scope="col" className="px-2 py-2.5">
                    <input
                      type="checkbox"
                      aria-label="Select all reports"
                      checked={allSelected}
                      onChange={(event) => setSelected(event.target.checked ? visible.map((report) => report._id) : [])}
                      className="h-4 w-4 accent-[#1e5b3e]"
                    />
                  </th>
                  <th scope="col" className="px-2 py-2.5">Report</th>
                  <th scope="col" className="px-2 py-2.5">Category</th>
                  <th scope="col" className="px-2 py-2.5">Status</th>
                  <th scope="col" className="px-2 py-2.5">Votes</th>
                  <th scope="col" className="px-2 py-2.5">Date</th>
                  <th scope="col" className="px-2 py-2.5">Assigned</th>
                  <th scope="col" className="px-2 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((report) => (
                  <tr key={report._id} className="border-b border-[#eef2ec] align-middle last:border-0 hover:bg-[#f5f8f4]">
                    <td className="px-2 py-3">
                      <input type="checkbox" aria-label={`Select ${report._id}`} checked={selected.includes(report._id)} onChange={() => toggleRow(report._id)} className="h-4 w-4 accent-[#1e5b3e]" />
                    </td>
                    <td className="max-w-[280px] px-2 py-3">
                      <button onClick={() => onOpenReport(report)} className="text-left">
                        <span className="block truncate text-sm font-semibold hover:text-[#1e5b3e]">{report.title}</span>
                        <span className="mt-0.5 block truncate text-xs text-[#6d7a71]">{report._id} · {report.location}</span>
                      </button>
                      {report.suspicious && <span className="mt-1 inline-block rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">Flagged</span>}
                    </td>
                    <td className="px-2 py-3 text-sm text-[#4d5b52]">{report.issueType}</td>
                    <td className="px-2 py-3">
                      <label>
                        <span className="sr-only">Status for {report._id}</span>
                        <select
                          value={report.status}
                          onChange={(event) => onStatusChange(report._id, event.target.value as ReportStatus)}
                          className="rounded-lg border border-[#dfe5dc] bg-white px-2 py-1.5 text-xs font-semibold outline-none focus:border-[#1e5b3e]"
                        >
                          {statuses.map((status) => <option key={status}>{status}</option>)}
                        </select>
                      </label>
                    </td>
                    <td className="px-2 py-3 text-sm tabular-nums text-[#4d5b52]">{report.upVotedBy.length}</td>
                    <td className="whitespace-nowrap px-2 py-3 text-sm text-[#4d5b52]">{formatDate(report.createdAt)}</td>
                    <td className="px-2 py-3">
                      <label>
                        <span className="sr-only">Assign worker for {report._id}</span>
                        <select
                          value={report.assignedTo ?? ""}
                          onChange={(event) => onAssign(report._id, event.target.value || null)}
                          className="max-w-[140px] rounded-lg border border-[#dfe5dc] bg-white px-2 py-1.5 text-xs outline-none focus:border-[#1e5b3e]"
                        >
                          <option value="">Unassigned</option>
                          {DUMMY_WORKERS.map((w) => <option key={w._id} value={w._id}>{w.fullname}</option>)}
                        </select>
                      </label>
                    </td>
                    <td className="px-2 py-3 text-right">
                      <button onClick={() => onOpenReport(report)} className="rounded-lg border border-[#dfe5dc] px-2.5 py-1.5 text-xs font-bold text-[#25603f] hover:bg-[#eef4ed]">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-[#6d7a71]">
          <span>Showing {visible.length} of {reports.length} reports</span>
          <div className="flex items-center gap-1.5">
            <span className="inline-block rounded-full border border-[#dfe5dc] bg-[#fbfcf9] px-2 py-0.5 text-[10px] font-bold text-[#6d7a71]">Reported</span>
            <span className="hidden sm:inline">needs a first response</span>
          </div>
        </div>
      </div>
    </>
  );
}

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) {
  return (
    <label className="text-xs font-semibold text-[#5b6960]">
      <span className="sr-only">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="rounded-lg border border-[#dfe5dc] bg-white px-3 py-2 text-sm font-medium outline-none focus:border-[#1e5b3e]">
        {options.map((option) => <option key={option} value={option}>{label}: {option}</option>)}
      </select>
    </label>
  );
}
