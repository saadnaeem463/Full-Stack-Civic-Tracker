"use client"

import React, { useEffect, useState } from "react"
import { Reports } from "./Reports"
import { ReportDetailsDrawer } from "./ReportDetailsDrawer"
import { Report as UIReport, ReportStatus } from "@/data/adminData"
import { adaptReport, adaptWorker } from "@/lib/report-adapter"

export function ReportPanel() {
  const [reports, setReports] = useState<UIReport[]>([])
  const [workers, setWorkers] = useState<ReturnType<typeof adaptWorker>[]>([])
  const [search, setSearch] = useState("")
  const [openReportId, setOpenReportId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  async function loadReports() {
    const res = await fetch("/api/reports")
    const data = await res.json()
    setReports((data.reports ?? []).map(adaptReport))
  }

  async function loadWorkers() {
    const res = await fetch("/api/admin/workers")
    const data = await res.json()
    setWorkers((data.workers ?? []).map(adaptWorker))
  }

  useEffect(() => {
    let cancelled = false

    async function load() {
      const [reportsRes, workersRes] = await Promise.all([
        fetch("/api/reports"),
        fetch("/api/admin/workers"),
      ])
      const reportsData = await reportsRes.json()
      const workersData = await workersRes.json()
      if (cancelled) return
      setReports((reportsData.reports ?? []).map(adaptReport))
      setWorkers((workersData.workers ?? []).map(adaptWorker))
      setLoading(false)
    }

    load()
    return () => { cancelled = true }
  }, [])

  async function onStatusChange(id: string, status: ReportStatus) {
    await fetch("/api/admin/reports/status", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reportIds: [id], status }),
    })
    loadReports()
  }

  async function onBulkStatus(ids: string[], status: ReportStatus) {
    await fetch("/api/admin/reports/status", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reportIds: ids, status }),
    })
    loadReports()
  }

  async function onAssign(id: string, workerId: string | null) {
    await fetch("/api/admin/reports/assign", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reportId: id, workerId }),
    })
    loadReports()
    loadWorkers() // assigning also flips the worker's own status/currentReport
  }

  async function onAddNote(id: string, note: string) {
    await fetch("/api/admin/reports/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reportId: id, note }),
    })
    loadReports()
  }

  async function onFlag(id: string, reason: string) {
    await fetch("/api/admin/reports/flag", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reportId: id, reason }),
    })
    loadReports()
  }

  if (loading) return <p className="text-sm text-[#6d7a71]">Loading reports…</p>

  const openReport = reports.find((r) => r.id === openReportId) ?? null

  return (
    <>
      <Reports
        reports={reports}
        workers={workers}
        search={search}
        onSearch={setSearch}
        onOpenReport={(report) => setOpenReportId(report.id)}
        onStatusChange={onStatusChange}
        onAssign={onAssign}
        onBulkStatus={onBulkStatus}
      />
      {openReport && (
        <ReportDetailsDrawer
          report={openReport}
          workers={workers}
          onClose={() => setOpenReportId(null)}
          onStatusChange={onStatusChange}
          onAssign={onAssign}
          onAddNote={onAddNote}
          onFlag={onFlag}
        />
      )}
    </>
  )
}