"use client"

import dynamic from "next/dynamic"
import { useEffect, useState } from "react"
import { pusherClient,REPORTS_CHANNEL,NEW_REPORT_EVENT } from "@/lib/pusher-client"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/web/admin/primitives"
import type { MapReport } from "@/types/report"

const CivicMap = dynamic(() => import("@/components/web/civic-map").then(m => m.CivicMap), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-muted" />,
})

export default function Home() {
  const [reports, setReports] = useState<MapReport[]>([]); // always an array, never null
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await fetch("/api/reports", { method: "GET" });
        if (!res.ok) throw new Error("Failed to fetch reports");
        const data = await res.json();
        setReports(data.reports ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch reports");
      } finally {
        setLoading(false)
      }
    };
    fetchReports();
  }, []);

    // Live updates: anyone's /api/reports POST triggers this event, so every open tab
  // (including the submitter's own, once the request round-trips) appends it here —
  // no polling, no manual refresh.

  useEffect(()=>{
    const channel=pusherClient.subscribe(REPORTS_CHANNEL)
    channel.bind(NEW_REPORT_EVENT,(newReport: MapReport)=>{
      setReports((prev)=>{
              
        // Guard against double-adding: the submitter's own initial fetch/response could
        // race with this event landing, and Strict Mode can re-run effects in dev
      if(prev.some((r)=>r._id===newReport._id)) return prev
      return [...prev,newReport]
      })
    })

    return()=>{
      channel.unbind(NEW_REPORT_EVENT)
      pusherClient.unsubscribe(REPORTS_CHANNEL)
    }
  },[])

  return (
    <div className="relative isolate h-[calc(100dvh-72px)]">
      <CivicMap reports={reports} />
      {loading && reports.length === 0 && !error && (
        <div className="absolute inset-0 z-10 grid place-items-center bg-background/70">
          <p className="text-sm text-muted-foreground">Loading reports…</p>
        </div>
      )}
      {!loading && error && (
        <div className="absolute inset-0 z-10 grid place-items-center bg-background/70 px-4">
          <div className="w-full max-w-sm">
            <EmptyState title="We could not load reports" description={error} />
            <div className="mt-4 flex justify-center">
              <Button type="button" variant="outline" onClick={() => window.location.reload()}>
                Try again
              </Button>
            </div>
          </div>
        </div>
      )}
      {!loading && !error && reports.length === 0 && (
        <div className="absolute inset-x-0 bottom-6 z-10 flex justify-center px-4">
          <div className="max-w-sm">
            <EmptyState
              title="No reports yet"
              description="Nothing has been reported nearby. Spot an issue? Add the first report."
            />
          </div>
        </div>
      )}
    </div>
  );
}