import React, { useState, useEffect } from "react";
import { FlagIcon, ImageIcon, MapPinIcon, XIcon } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { Report, ReportStatus, Worker } from "@/data/adminData";
import AddExpense from "../add-expense";
import { ActorProps } from "./ReportPanel";
import { Button } from "@/components/ui/button";
import { pusherClient, REPORTS_CHANNEL, REPORT_UPDATED_EVENT, REPORT_DELETED_EVENT } from "@/lib/pusher-client";

const statuses: ReportStatus[] = ["Reported", "Acknowledged", "In progress", "Resolved"];

type DrawerProps = {
  report: Report;
  workers: Worker[];
  onClose: () => void;
  onStatusChange: (id: string, status: ReportStatus) => void;
  onAssign: (id: string, workerId: string | null) => void;
  onAddNote: (id: string, note: string) => void;
  onFlag: (id: string, reason: string) => void;
  actor: ActorProps;
  
};

const CATEGORY_TO_SPECIALTY: Record<string, string> = {
  "Roads": "Roads crew",
  "Lighting": "Electrical",
  "Cleanliness": "Sanitation",
  "Parks": "Parks"
};

export function ReportDetailsDrawer({ report: initialReport, workers, onClose, onStatusChange, onAssign, onAddNote, onFlag, actor }: DrawerProps) {
  const [report, setReport] = useState<Report>(initialReport);
  const [note, setNote] = useState("");
  const [flagOpen, setFlagOpen] = useState(false);
  const [reason, setReason] = useState("");
  const assignee = workers.find((worker) => worker.id === report.assignedTo);

  // Listen for real-time updates to this specific report
  useEffect(() => {
    const channel = pusherClient.subscribe(REPORTS_CHANNEL);

    const handleReportUpdated = (data: { report: Report }) => {
      if (data?.report && data.report.id === report.id) {
        setReport(data.report);
      }
    };

    const handleReportDeleted = (data: { reportId: string }) => {
      if (data?.reportId === report.id) {
        onClose();
      }
    };

    channel.bind(REPORT_UPDATED_EVENT, handleReportUpdated);
    channel.bind(REPORT_DELETED_EVENT, handleReportDeleted);

    return () => {
      channel.unbind(REPORT_UPDATED_EVENT, handleReportUpdated);
      channel.unbind(REPORT_DELETED_EVENT, handleReportDeleted);
      pusherClient.unsubscribe(REPORTS_CHANNEL);
    };
  }, [report.id, onClose]);

  // Update local state when props change (e.g., from parent re-render)
  useEffect(() => {
    setReport(initialReport);
  }, [initialReport]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button className="absolute inset-0 bg-foreground/40" aria-label="Close report details" onClick={onClose} />
      <section className="relative flex h-full w-full max-w-[620px] flex-col overflow-y-auto bg-card shadow-md" role="dialog" aria-modal="true" aria-label={`Report ${report.id}`}>
        <header className="sticky top-0 z-10 border-b border-border bg-card/95 px-5 py-4 backdrop-blur">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-[.14em] text-muted-foreground">{report.id}</span>
                <StatusBadge status={report.status} />
                {report.suspicious && <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold text-destructive">Flagged</span>}
              </div>
              <h2 className="mt-2 text-lg font-semibold leading-tight tracking-tight">{report.title}</h2>
              <p className="mt-1 text-xs text-muted-foreground">Reported by {report.reporter} · {report.createdLabel} · {report.upvotes} upvotes</p>
            </div>
            <button onClick={onClose} aria-label="Close" className="rounded-lg p-2 text-muted-foreground hover:bg-muted"><XIcon size={19} /></button>
          </div>
        </header>

        <div className="space-y-5 px-5 py-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-xs font-semibold uppercase tracking-[.14em] text-muted-foreground">
              Status
              <select
                value={report.status}
                onChange={(event) => onStatusChange(report.id, event.target.value as ReportStatus)}
                className="mt-1.5 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium normal-case tracking-normal text-foreground outline-none focus:border-primary"
              >
                {statuses.map((status) => <option key={status}>{status}</option>)}
              </select>
            </label>
            <label className="text-xs font-semibold uppercase tracking-[.14em] text-muted-foreground">
              Assigned worker
              <select
                value={report.assignedTo ?? ""}
                onChange={(event) => onAssign(report.id, event.target.value || null)}
                className="mt-1.5 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium normal-case tracking-normal text-foreground outline-none focus:border-primary"
              >
                <option value="">Unassigned</option>
                {workers
                .filter((worker) => worker.specialty === CATEGORY_TO_SPECIALTY[report.category])
                .map((worker) => (
                  <option key={worker.id} value={worker.id}>{worker.name} . {worker.specialty}</option>
                ))}
              </select>
            </label>
          </div>

          <p className="text-sm leading-6 text-muted-foreground">{report.description}</p>

          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-[.14em] text-muted-foreground">Media</h3>
            {report.media.length > 0 ? (
              <div className="flex gap-3 overflow-x-auto">
                {report.media.map((item) => (
                  <img key={item.url} src={item.url} alt={item.alt} className="h-40 w-64 shrink-0 rounded-lg object-cover" />
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-lg border border-dashed border-primary/20 bg-card px-4 py-6 text-xs text-muted-foreground">
                <ImageIcon size={16} /> No photos or video were attached to this report.
              </div>
            )}
          </div>

          <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-4">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"><MapPinIcon size={17} /></span>
            <div>
              <p className="text-sm font-semibold">{report.address}</p>
              <p className="text-xs text-muted-foreground">{report.neighborhood} · {assignee ? `Assigned to ${assignee.name}` : "No crew assigned yet"}</p>
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-[.14em] text-muted-foreground">Status history</h3>
            <ol className="space-y-3 border-l border-border pl-4">
              {report.history.map((entry, index) => (
                <li key={`${entry.status}-${index}`} className="relative">
                  <span className="absolute -left-[22px] top-1.5 h-2.5 w-2.5 rounded-full bg-primary" />
                  <p className="text-sm font-semibold">{entry.status}</p>
                  <p className="text-xs text-muted-foreground">{entry.by} · {entry.time}</p>
                </li>
              ))}
            </ol>
          </div>

          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-[.14em] text-muted-foreground">Public comments</h3>
            {report.comments.length > 0 ? (
              <ul className="space-y-2">
                {report.comments.map((comment, index) => (
                  <li key={index} className="rounded-lg border border-border bg-card p-3">
                    <p className="text-sm">{comment.text}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">{comment.author} · {comment.time}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="rounded-lg border border-dashed border-primary/20 bg-card px-4 py-5 text-xs text-muted-foreground">No residents have commented on this report yet.</p>
            )}
          </div>

          <div className="rounded-lg border border-warning/20 bg-background p-4">
            <h3 className="text-xs font-semibold uppercase tracking-[.14em] text-warning">Internal notes · staff only</h3>
            <ul className="mt-3 space-y-2">
              {report.internalNotes.length === 0 && <li className="text-xs text-muted-foreground">No internal notes recorded.</li>}
              {report.internalNotes.map((entry, index) => (
                <li key={index} className="rounded-lg bg-card p-3">
                  <p className="text-sm">{entry.text}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">{entry.author} · {entry.time}</p>
                </li>
              ))}
            </ul>
            <form
              className="mt-3 flex gap-2"
              onSubmit={(event) => { event.preventDefault(); if (note.trim()) { onAddNote(report.id, note.trim()); setNote(""); } }}
            >
              <label className="sr-only" htmlFor="internal-note">Add an internal note</label>
              <input id="internal-note" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Add a private note for staff" className="min-w-0 flex-1 rounded-lg border border-warning/20 bg-card px-3 py-2 text-sm outline-none focus:border-warning" />
              <Button type="submit">Add note</Button>
            </form>
          </div>

          <Button
            variant="destructive"
            size="sm"
            onClick={() => setFlagOpen(true)}
            className="self-start"
          >
            <FlagIcon size={14} /> {report.suspicious ? "Update fake report flag" : "Flag as fake report"}
          </Button>
          <AddExpense reportId={report.id} label={report.title} actor={actor} category={report.category} />
        </div>

        {flagOpen && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/45 p-4">
            <div className="w-full max-w-md rounded-lg border border-border bg-card p-5" role="dialog" aria-modal="true" aria-label="Confirm flag report">
              <h3 className="text-xl font-semibold tracking-tight">Flag {report.id} as fake?</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">This hides the report from the public map and records the reason in the audit log.</p>
              <label className="mt-4 block text-xs font-semibold uppercase tracking-[.14em] text-muted-foreground">
                Reason (required)
                <textarea
                  required
                  rows={3}
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  className="mt-1.5 w-full resize-none rounded-lg border border-border bg-card px-3 py-2 text-sm font-normal normal-case tracking-normal outline-none focus:border-primary"
                  placeholder="Explain why this report is being removed"
                />
              </label>
              <div className="mt-4 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setFlagOpen(false)}>Cancel</Button>
                <Button
                  variant="destructive"
                  disabled={!reason.trim()}
                  onClick={() => { onFlag(report.id, reason.trim()); setFlagOpen(false); setReason(""); }}
                >
                  Confirm flag
                </Button>
        
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}