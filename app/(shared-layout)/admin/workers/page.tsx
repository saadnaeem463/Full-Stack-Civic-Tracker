"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { UsersIcon } from "lucide-react";
import AddWorkers from "@/components/web/add-workers";
import { adaptWorker } from "@/lib/report-adapter";
import ViewTasks from "@/components/web/admin/view-tasks";
import { User } from "@/types/user";
import { getMe } from "@/lib/services/auth.services";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  EmptyState,
  PageHeading,
  PageLoading,
  SectionCard,
  pageContainer,
} from "@/components/web/admin/primitives";
const WrokersAdmin = () => {
  const [user, setUser] = useState<User | null>(null);
  const isAdmin = user?.role === "admin";
  const [workers, setWorkers] = useState<ReturnType<typeof adaptWorker>[]>([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState("");
  const [removeTarget, setRemoveTarget] = useState<ReturnType<typeof adaptWorker> | null>(null);
  const [editingWorker, setEditingWorker] = useState<ReturnType<
    typeof adaptWorker
  > | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const res = await fetch("/api/admin/workers");
        if (res.status === 401) {
          window.location.assign("/auth/login");
          return;
        }
        if (!res.ok) throw new Error("Failed to fetch workers");
        const data = await res.json();
        setWorkers((data.workers ?? []).map(adaptWorker));
        setErrors("");
      } catch (error) {
        setErrors(error instanceof Error ? error.message : "Failed to fetch Workers");
      } finally {
        setLoading(false);
      }
    };
    fetchWorkers();
  }, []);

  useEffect(() => {
    getMe()
      .then((res) => setUser(res.user))
      .catch(() => {});
  }, []);

  async function handleRemove(workerId: string) {
    try {
      const res = await fetch(`/api/admin/workers?workerId=${workerId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Error while deleting the worker");
      setWorkers((prev) => prev.filter((w) => w.id !== workerId));
      setErrors("");
      toast.success("Worker removed");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error while deleting the worker";
      setErrors(message);
      toast.error(message);
    }
  }

  const handleWorkerAdded = (newWorker: any) => {
    const adapted = adaptWorker(newWorker);
    setWorkers((prev) => {
      const exists = prev.some((w) => w.id === adapted.id);
      return exists
        ? prev.map((w) => (w.id === adapted.id ? adapted : w))
        : [...prev, adapted];
    });
  };

  const busy = workers.filter((w) => w.status === "Busy").length;

  return (
    <div className={pageContainer}>
      <PageHeading
        eyebrow="Field resources"
        title="Workers"
        description="Who is available, what they are working on, and how quickly each crew closes assignments."
        action={
          isAdmin ? (
            <AddWorkers handleWorkerAdded={handleWorkerAdded} isEdit={null} />
          ) : undefined
        }
      />

      {errors && (
        <p role="alert" className="mb-4 text-sm font-medium text-destructive">{errors}</p>
      )}

      {loading ? (
        <PageLoading label="Loading workers…" />
      ) : (
      <SectionCard
        title="Crew availability"
        description={`${busy} of ${workers.length} workers are currently assigned to an active report.`}
      >
        {workers.length === 0 ? (
          <EmptyState
            title="No workers registered"
            description="Add your first crew member to start assigning reports."
            icon={<UsersIcon size={20} />}
          />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {workers.map((w) => (
              <article
                key={w.id}
                className="rounded-lg border border-border bg-background p-4"
              >
                <div className="flex items-start gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {w.initials}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-semibold">{w.name}</h3>
                    <p className="text-xs text-muted-foreground">{w.specialty}</p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      w.status === "Busy"
                        ? "bg-warning/10 text-warning"
                        : "bg-success/10 text-success"
                    }`}
                  >
                    {w.status}
                  </span>
                </div>

                <dl className="mt-4 grid grid-cols-2 gap-2 text-center">
                  <div className="rounded-lg bg-muted px-2 py-2">
                    <dt className="text-[10px] text-muted-foreground">Jobs</dt>
                    <dd className="text-sm font-semibold">{w.completedJobs}</dd>
                  </div>
                  <div className="rounded-lg bg-muted px-2 py-2">
                    <dt className="text-[10px] text-muted-foreground">Avg hrs</dt>
                    <dd className="text-sm font-semibold">
                      {w.avgResolutionHours}
                    </dd>
                  </div>
                </dl>

                {/* A button doesn't fit in a narrow 1/3 stat cell — its own full-width row instead */}
                <div className="mt-2 flex items-center justify-between gap-2 rounded-lg bg-muted px-3 py-2">
                  <span className="text-[10px] text-muted-foreground">Task</span>
                  {!w.currentReport && (
                    <span className="text-xs font-semibold text-muted-foreground">No task assigned</span>
                  )}
                  {w.currentReport && <ViewTasks currentReports={w.currentReport} />}
                </div>

                {isAdmin && (
                  <div className="mt-3 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingWorker(w);
                        setEditOpen(true);
                      }}
                      className="flex-1"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setRemoveTarget(w)}
                    >
                      Remove
                    </Button>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </SectionCard>
      )}

      <ConfirmDialog
        open={!!removeTarget}
        onOpenChange={(open) => {
          if (!open) setRemoveTarget(null);
        }}
        title="Remove this worker?"
        description={`${removeTarget?.name ?? "This worker"} will be deleted from the crew and any active assignment is released.`}
        confirmLabel="Remove worker"
        onConfirm={async () => {
          if (!removeTarget) return;
          await handleRemove(removeTarget.id);
          setRemoveTarget(null);
        }}
      />

      {isAdmin && editingWorker && (
        <AddWorkers
          handleWorkerAdded={handleWorkerAdded}
          isEdit={editingWorker}
          open={editOpen}
          onOpenChange={(v: boolean) => {
            setEditOpen(v);
            if (!v) setEditingWorker(null);
          }}
        />
      )}
    </div>
  );
};

export default WrokersAdmin;
