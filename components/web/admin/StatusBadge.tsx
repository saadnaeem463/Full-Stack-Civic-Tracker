import React from "react";
import { AlertCircleIcon, CheckCircle2Icon, ClockIcon, WrenchIcon } from "lucide-react";
import { ReportStatus } from "@/data/adminData";

type StatusEntry = { className: string; Icon: typeof ClockIcon };

const statusConfig: Record<ReportStatus, StatusEntry> = {
  Reported: { className: "bg-red-100 text-red-700", Icon: AlertCircleIcon },
  Acknowledged: { className: "bg-amber-100 text-amber-700", Icon: ClockIcon },
  "In progress": { className: "bg-amber-100 text-amber-800", Icon: WrenchIcon },
  Resolved: { className: "bg-green-100 text-green-700", Icon: CheckCircle2Icon },
};

const fallback: StatusEntry = { className: "bg-gray-100 text-gray-700", Icon: AlertCircleIcon };

export function StatusBadge({ status }: { status: ReportStatus }) {
  const entry = statusConfig[status] ?? fallback;
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${entry.className}`}>
      <entry.Icon size={13} aria-hidden="true" />
      {status}
    </span>
  );
}
