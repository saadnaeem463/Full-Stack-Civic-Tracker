"use client";
import { useState, useEffect } from "react";
import { PlusIcon } from "lucide-react";
import AddWorkers from "@/components/web/add-workers";
import { adaptWorker } from "@/lib/report-adapter";

const WrokersAdmin = () => {
  const [workers, setWorkers] = useState<ReturnType<typeof adaptWorker>[]>([]);
  const [errors, setErrors] = useState("");
  const [editingWorker, setEditingWorker] = useState<ReturnType<typeof adaptWorker> | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const res = await fetch("/api/admin/workers");
        const data = await res.json();
        setWorkers((data.workers ?? []).map(adaptWorker));
      } catch (error) {
        setErrors("Failed to fetch Workers");
      }
    };
    fetchWorkers();
  }, []);

  async function handleRemove(workerId: string) {
    const res = await fetch(`/api/admin/workers?workerId=${workerId}`, { method: "DELETE" });
    if (!res.ok) {
      setErrors("Error while deleting the worker");
      return;
    }
    setWorkers((prev) => prev.filter((w) => w.id !== workerId));
  }

  const handleWorkerAdded = (newWorker: any) => {
    const adapted = adaptWorker(newWorker);
    setWorkers((prev) => {
      const exists = prev.some((w) => w.id === adapted.id);
      return exists ? prev.map((w) => (w.id === adapted.id ? adapted : w)) : [...prev, adapted];
    });
  };

  const busy = workers.filter((w) => w.status === "Busy").length;

  return (
    <div className="min-h-screen bg-[#f7f8f4] px-4 py-7 text-[#17211b] sm:px-6 sm:py-9">
      {/* Page heading */}
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[.15em] text-[#5c8069]">
            Field resources
          </p>
          <h1 className="font-display mt-1.5 text-[34px] leading-none tracking-[-.04em] sm:text-[40px]">
            Workers
          </h1>
          <p className="mt-2.5 max-w-xl text-sm leading-6 text-[#637068]">
            Who is available, what they are working on, and how quickly each crew closes assignments.
          </p>
        </div>
        <AddWorkers handleWorkerAdded={handleWorkerAdded} isEdit={null} />
      </div>

      {errors && <p className="mb-4 text-sm font-medium text-[#a4544f]">{errors}</p>}

      {/* Section card */}
      <section className="rounded-2xl border border-[#dfe5dc] bg-[#fbfcf9] p-5">
        <div className="mb-5">
          <h2 className="text-base font-bold tracking-[-.02em]">Crew availability</h2>
          <p className="mt-1 text-xs text-[#6d7a71]">
            {busy} of {workers.length} workers are currently assigned to an active report.
          </p>
        </div>

        {workers.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#cbd6c9] bg-white px-6 py-12 text-center">
            <h3 className="text-sm font-bold">No workers registered</h3>
            <p className="mx-auto mt-1.5 max-w-sm text-xs leading-5 text-[#6d7a71]">
              Add your first crew member to start assigning reports.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {workers.map((w) => (
              <article key={w.id} className="rounded-xl border border-[#dfe5dc] bg-white p-4">
                <div className="flex items-start gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#e8f1e7] text-xs font-bold text-[#1e5b3e]">
                    {w.initials}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-bold">{w.name}</h3>
                    <p className="text-xs text-[#6d7a71]">{w.specialty}</p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      w.status === "Busy"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {w.status}
                  </span>
                </div>

                <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-[#f4f7f3] px-2 py-2">
                    <dt className="text-[10px] text-[#6d7a71]">Jobs</dt>
                    <dd className="text-sm font-bold">{w.completedJobs}</dd>
                  </div>
                  <div className="rounded-lg bg-[#f4f7f3] px-2 py-2">
                    <dt className="text-[10px] text-[#6d7a71]">Avg hrs</dt>
                    <dd className="text-sm font-bold">{w.avgResolutionHours}</dd>
                  </div>
                  <div className="rounded-lg bg-[#f4f7f3] px-2 py-2">
                    <dt className="text-[10px] text-[#6d7a71]">Task</dt>
                    <dd className="text-sm font-bold">{w.currentReport ?? "—"}</dd>
                  </div>
                </dl>

                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => {
                      setEditingWorker(w);
                      setEditOpen(true);
                    }}
                    className="flex-1 rounded-lg border border-[#dfe5dc] py-2 text-xs font-bold text-[#25603f] hover:bg-[#eef4ed]"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleRemove(w.id)}
                    className="rounded-lg border border-[#e8d3d1] px-3 py-2 text-xs font-bold text-[#a4544f] hover:bg-[#fbf1f0]"
                  >
                    Remove
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {editingWorker && (
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