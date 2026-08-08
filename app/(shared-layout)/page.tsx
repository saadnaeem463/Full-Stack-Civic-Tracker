"use client"

import dynamic from "next/dynamic"
import { useEffect, useState } from "react"
import { pusherClient,REPORTS_CHANNEL,NEW_REPORT_EVENT } from "@/lib/pusher-client"

const CivicMap = dynamic(() => import("@/components/web/civic-map").then(m => m.CivicMap), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-muted" />,
})

interface Report {
  _id: string
  lat: number
  lng: number
  title: string
}

export default function Home() {
  const [reports, setReports] = useState<Report[]>([]); // always an array, never null

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await fetch("/api/reports", { method: "GET" });
        if (!res.ok) throw new Error("Failed to fetch reports");
        const data = await res.json();
        setReports(data.reports);
      } catch (error) {
        console.error("Error:", error);
      }
    };
    fetchReports();
  }, []);

    // Live updates: anyone's /api/reports POST triggers this event, so every open tab
  // (including the submitter's own, once the request round-trips) appends it here —
  // no polling, no manual refresh.

  useEffect(()=>{
    const channel=pusherClient.subscribe(REPORTS_CHANNEL)
    channel.bind(NEW_REPORT_EVENT,(newReport:Report)=>{
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
    <div className="pt-20 h-screen relative isolate">
      <CivicMap reports={reports} />
    </div>
  );
}