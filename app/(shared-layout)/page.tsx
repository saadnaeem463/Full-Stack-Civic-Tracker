"use client"

import dynamic from "next/dynamic"
import { useEffect, useState } from "react"

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

  return (
    <div className="pt-20 h-screen relative isolate">
      <CivicMap reports={reports} />
    </div>
  );
}