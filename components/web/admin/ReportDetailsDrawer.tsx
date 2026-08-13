import React, { useState } from "react";
import { FlagIcon, ImageIcon, MapPinIcon, XIcon } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { Report, ReportStatus, Worker } from "@/data/adminData";

const statuses: ReportStatus[] = ["Reported", "Acknowledged", "In progress", "Resolved"];

type DrawerProps = {
  report: Report;
  workers: Worker[];
  onClose: () => void;
  onStatusChange: (id: string, status: ReportStatus) => void;
  onAssign: (id: string, workerId: string | null) => void;
  onAddNote: (id: string, note: string) => void;
  onFlag: (id: string, reason: string) => void;
};

export function ReportDetailsDrawer({ report, workers, onClose, onStatusChange, onAssign, onAddNote, onFlag }: DrawerProps) {
  const [note, setNote] = useState("");
  const [flagOpen, setFlagOpen] = useState(false);
  const [reason, setReason] = useState("");
  const assignee = workers.find((worker) => worker.id === report.assignedTo);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button className="absolute inset-0 bg-[#15231a]/40" aria-label="Close report details" onClick={onClose} />
      <section className="relative flex h-full w-full max-w-[620px] flex-col overflow-y-auto bg-[#fbfcf9] shadow-2xl" role="dialog" aria-modal="true" aria-label={`Report ${report.id}`}>
        <header className="sticky top-0 z-10 border-b border-[#dfe5dc] bg-[#fbfcf9]/95 px-5 py-4 backdrop-blur">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-[.13em] text-[#6d7a71]">{report.id}</span>
                <StatusBadge status={report.status} />
                {report.suspicious && <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">Flagged</span>}
              </div>
              <h2 className="font-display mt-2 text-2xl leading-tight tracking-[-.03em]">{report.title}</h2>
              <p className="mt-1 text-xs text-[#6d7a71]">Reported by {report.reporter} · {report.createdLabel} · {report.upvotes} upvotes</p>
            </div>
            <button onClick={onClose} aria-label="Close" className="rounded-lg p-2 text-[#5b6960] hover:bg-[#eef3ed]"><XIcon size={19} /></button>
          </div>
        </header>

        <div className="space-y-5 px-5 py-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-xs font-bold uppercase tracking-[.12em] text-[#6d7a71]">
              Status
              <select
                value={report.status}
                onChange={(event) => onStatusChange(report.id, event.target.value as ReportStatus)}
                className="mt-1.5 w-full rounded-lg border border-[#dfe5dc] bg-white px-3 py-2 text-sm font-medium normal-case tracking-normal text-[#17211b] outline-none focus:border-[#1e5b3e]"
              >
                {statuses.map((status) => <option key={status}>{status}</option>)}
              </select>
            </label>
            <label className="text-xs font-bold uppercase tracking-[.12em] text-[#6d7a71]">
              Assigned worker
              <select
                value={report.assignedTo ?? ""}
                onChange={(event) => onAssign(report.id, event.target.value || null)}
                className="mt-1.5 w-full rounded-lg border border-[#dfe5dc] bg-white px-3 py-2 text-sm font-medium normal-case tracking-normal text-[#17211b] outline-none focus:border-[#1e5b3e]"
              >
                <option value="">Unassigned</option>
                {workers.map((worker) => <option key={worker.id} value={worker.id}>{worker.name} · {worker.specialty}</option>)}
              </select>
            </label>
          </div>

          <p className="text-sm leading-6 text-[#4a574f]">{report.description}</p>

          <div>
            <h3 className="mb-2 text-xs font-bold uppercase tracking-[.12em] text-[#6d7a71]">Media</h3>
            {report.media.length > 0 ? (
              <div className="flex gap-3 overflow-x-auto">
                {report.media.map((item) => (
                  <img key={item.url} src={item.url} alt={item.alt} className="h-40 w-64 shrink-0 rounded-xl object-cover" />
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-xl border border-dashed border-[#cbd6c9] bg-white px-4 py-6 text-xs text-[#6d7a71]">
                <ImageIcon size={16} /> No photos or video were attached to this report.
              </div>
            )}
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-[#dfe5dc] bg-white p-4">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#e8f1e7] text-[#1e5b3e]"><MapPinIcon size={17} /></span>
            <div>
              <p className="text-sm font-semibold">{report.address}</p>
              <p className="text-xs text-[#6d7a71]">{report.neighborhood} · {assignee ? `Assigned to ${assignee.name}` : "No crew assigned yet"}</p>
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-[.12em] text-[#6d7a71]">Status history</h3>
            <ol className="space-y-3 border-l border-[#dfe5dc] pl-4">
              {report.history.map((entry, index) => (
                <li key={`${entry.status}-${index}`} className="relative">
                  <span className="absolute -left-[22px] top-1.5 h-2.5 w-2.5 rounded-full bg-[#1e5b3e]" />
                  <p className="text-sm font-semibold">{entry.status}</p>
                  <p className="text-xs text-[#6d7a71]">{entry.by} · {entry.time}</p>
                </li>
              ))}
            </ol>
          </div>

          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-[.12em] text-[#6d7a71]">Public comments</h3>
            {report.comments.length > 0 ? (
              <ul className="space-y-2">
                {report.comments.map((comment, index) => (
                  <li key={index} className="rounded-xl border border-[#dfe5dc] bg-white p-3">
                    <p className="text-sm">{comment.text}</p>
                    <p className="mt-1 text-[11px] text-[#6d7a71]">{comment.author} · {comment.time}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="rounded-xl border border-dashed border-[#cbd6c9] bg-white px-4 py-5 text-xs text-[#6d7a71]">No residents have commented on this report yet.</p>
            )}
          </div>

          <div className="rounded-xl border border-[#e2dfcd] bg-[#faf8ef] p-4">
            <h3 className="text-xs font-bold uppercase tracking-[.12em] text-[#8a7742]">Internal notes · staff only</h3>
            <ul className="mt-3 space-y-2">
              {report.internalNotes.length === 0 && <li className="text-xs text-[#7d7658]">No internal notes recorded.</li>}
              {report.internalNotes.map((entry, index) => (
                <li key={index} className="rounded-lg bg-white p-3">
                  <p className="text-sm">{entry.text}</p>
                  <p className="mt-1 text-[11px] text-[#7d7658]">{entry.author} · {entry.time}</p>
                </li>
              ))}
            </ul>
            <form
              className="mt-3 flex gap-2"
              onSubmit={(event) => { event.preventDefault(); if (note.trim()) { onAddNote(report.id, note.trim()); setNote(""); } }}
            >
              <label className="sr-only" htmlFor="internal-note">Add an internal note</label>
              <input id="internal-note" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Add a private note for staff" className="min-w-0 flex-1 rounded-lg border border-[#e0dcc7] bg-white px-3 py-2 text-sm outline-none focus:border-[#8a7742]" />
              <button className="rounded-lg bg-[#1e5b3e] px-3 py-2 text-xs font-bold text-white">Add note</button>
            </form>
          </div>

          <button onClick={() => setFlagOpen(true)} className="inline-flex items-center gap-2 rounded-lg border border-[#e8d3d1] px-3 py-2 text-xs font-bold text-[#a4544f] hover:bg-[#fbf1f0]">
            <FlagIcon size={14} /> {report.suspicious ? "Update fake report flag" : "Flag as fake report"}
          </button>
        </div>

        {flagOpen && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-[#15231a]/45 p-4">
            <div className="w-full max-w-md rounded-2xl border border-[#dfe5dc] bg-[#fbfcf9] p-5" role="dialog" aria-modal="true" aria-label="Confirm flag report">
              <h3 className="font-display text-xl tracking-[-.03em]">Flag {report.id} as fake?</h3>
              <p className="mt-2 text-sm leading-6 text-[#5b6960]">This hides the report from the public map and records the reason in the audit log.</p>
              <label className="mt-4 block text-xs font-bold uppercase tracking-[.12em] text-[#6d7a71]">
                Reason (required)
                <textarea
                  required
                  rows={3}
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  className="mt-1.5 w-full resize-none rounded-lg border border-[#dfe5dc] bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal outline-none focus:border-[#1e5b3e]"
                  placeholder="Explain why this report is being removed"
                />
              </label>
              <div className="mt-4 flex justify-end gap-2">
                <button onClick={() => setFlagOpen(false)} className="rounded-lg border border-[#dfe5dc] px-3 py-2 text-sm font-semibold">Cancel</button>
                <button
                  disabled={!reason.trim()}
                  onClick={() => { onFlag(report.id, reason.trim()); setFlagOpen(false); setReason(""); }}
                  className="rounded-lg bg-[#a4544f] px-3 py-2 text-sm font-bold text-white disabled:opacity-40"
                >
                  Confirm flag
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}