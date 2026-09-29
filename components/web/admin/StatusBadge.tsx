import React from "react";
import { AlertCircleIcon, CheckCircle2Icon, ClockIcon, WrenchIcon } from "lucide-react";
import { ReportStatus } from "@/data/adminData";

type StatusEntry = { className: string; Icon: typeof ClockIcon };

const statusConfig: Record<ReportStatus, StatusEntry> = {
  Reported: { className: "bg-destructive/10 text-destructive", Icon: AlertCircleIcon },
  Acknowledged: { className: "bg-info/10 text-info", Icon: ClockIcon },
  "In progress": { className: "bg-warning/10 text-warning", Icon: WrenchIcon },
  Resolved: { className: "bg-success/10 text-success", Icon: CheckCircle2Icon },
};

const fallback: StatusEntry = { className: "bg-muted text-muted-foreground", Icon: AlertCircleIcon };

export function StatusBadge({ status }: { status: ReportStatus }) {
  const entry = statusConfig[status] ?? fallback;
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${entry.className}`}>
      <entry.Icon size={13} aria-hidden="true" />
      {status}
    </span>
  );
}
