"use client"

import React, { useEffect, useState, useCallback } from "react"
import { toast } from "sonner"
import { InboxIcon } from "lucide-react"
import { Reports } from "./Reports"
import { ReportDetailsDrawer } from "./ReportDetailsDrawer"
import { Report as UIReport, ReportStatus } from "@/data/adminData"
import { adaptReport, adaptWorker } from "@/lib/report-adapter"
import { getMe } from "@/lib/services/auth.services"
import { useAdminSearch } from "./AdminShell"
import { Button } from "@/components/ui/button"
import { EmptyState, PageLoading } from "./primitives"
import { pusherClient, REPORTS_CHANNEL, REPORT_UPDATED_EVENT, REPORT_DELETED_EVENT } from "@/lib/pusher-client"

export interface ActorProps{
  _id : string,
  name : string,
  role : string
}

export function ReportPanel() {
  const [reports, setReports] = useState<UIReport[]>([])
  const [workers, setWorkers] = useState<ReturnType<typeof adaptWorker>[]>([])
  const search = useAdminSearch()
  const [openReportId, setOpenReportId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState("")
  const [actor, setActor] = useState<ActorProps>({ _id: "", name: "", role: "" })

  const updateReportInState = useCallback((updatedReport: UIReport) => {
    setReports((prev) => {
      const index = prev.findIndex((r) => r.id === updatedReport.id)
      if (index === -1) {
        return [...prev, updatedReport]
      }
      const newReports = [...prev]
      newReports[index] = updatedReport
      return newReports
    })
  }, [])

  const removeReportFromState = useCallback((reportId: string) => {
    setReports((prev) => prev.filter((r) => r.id !== reportId))
    if (openReportId === reportId) {
      setOpenReportId(null)
    }
  }, [openReportId])

  async function loadReports() {
    try {
      const res = await fetch("/api/reports")
      if (!res.ok) throw new Error("Failed to fetch reports")
      const data = await res.json()
      setReports((data.reports ?? []).map(adaptReport))
      setLoadError("")
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Failed to fetch reports")
    }
  }

  async function loadWorkers() {
    try {
      const res = await fetch("/api/admin/workers")
      if (!res.ok) throw new Error("Failed to fetch workers")
      const data = await res.json()
      setWorkers((data.workers ?? []).map(adaptWorker))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to fetch workers")
    }
  }

  /** every mutation gets the same failure feedback instead of failing silently */
  async function request(url: string, init: RequestInit, failureMessage: string) {
    try {
      const res = await fetch(url, init)
      if (!res.ok) throw new Error(failureMessage)
      return true
    } catch (error) {
      toast.error(error instanceof Error ? error.message : failureMessage)
      return false
    }
  }

  
  useEffect(() => {
    let cancelled = false
    
    async function load() {
      try {
        const [reportsRes, workersRes] = await Promise.all([
          fetch("/api/reports"),
          fetch("/api/admin/workers"),
        ])
        if ([reportsRes, workersRes].some((r) => r.status === 401)) {
          window.location.assign("/auth/login")
          return
        }
        if (!reportsRes.ok || !workersRes.ok) throw new Error("Failed to load reports")
        const reportsData = await reportsRes.json()
        const workersData = await workersRes.json()
        if (cancelled) return
        setReports((reportsData.reports ?? []).map(adaptReport))
        setWorkers((workersData.workers ?? []).map(adaptWorker))
        setLoadError("")
      } catch (error) {
        if (cancelled) return
        setLoadError(error instanceof Error ? error.message : "Failed to load reports")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    async function getUser(){
        try {
        const response = await getMe()
        if (response.user) setActor(response.user)
      } catch (error) {
        console.log(error)
      } finally {
        setLoading(false);
      }
    }

    load()
    getUser()
    return () => { cancelled = true }
  }, [])

  // Real-time Pusher event listeners
  useEffect(() => {
    const channel = pusherClient.subscribe(REPORTS_CHANNEL)

    // The server pushes the raw Mongo document over Pusher, not the UI shape —
    // adapt it the same way the initial fetch does, or `id` comes through as
    // undefined and every update appends a duplicate row instead of patching one.
    const handleReportUpdated = (data: { report: Parameters<typeof adaptReport>[0] }) => {
      if (data?.report) {
        updateReportInState(adaptReport(data.report))
      }
    }

    const handleReportDeleted = (data: { reportId: string }) => {
      if (data?.reportId) {
        removeReportFromState(data.reportId)
      }
    }

    channel.bind(REPORT_UPDATED_EVENT, handleReportUpdated)
    channel.bind(REPORT_DELETED_EVENT, handleReportDeleted)

    return () => {
      channel.unbind(REPORT_UPDATED_EVENT, handleReportUpdated)
      channel.unbind(REPORT_DELETED_EVENT, handleReportDeleted)
      pusherClient.unsubscribe(REPORTS_CHANNEL)
    }
  }, [updateReportInState, removeReportFromState])

  async function onStatusChange(id: string, status: ReportStatus) {
    const updated = await request("/api/admin/reports/status", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reportIds: [id], status }),
    }, "Could not change the report status")
    if (!updated) return

    const audit = {
      actorId: actor._id,
      actorRole: actor.role,
      actorName: actor.name,
      action: "status_changed",
      message: `Status of Report ${id} has been changed to ${status} by ${actor.name}`
    }

    await request(`/api/admin/audits`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(audit)
    }, "Could not record the audit entry")
  }

  async function onBulkStatus(ids: string[], status: ReportStatus) {
    const updated = await request("/api/admin/reports/status", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reportIds: ids, status }),
    }, "Could not change the report statuses")
    if (!updated) return

    const audit = {
      actorId: actor._id,
      actorRole: actor.role,
      actorName: actor.name,
      action: "status_changed",
      message: `Status of Reports ${ids} has been changed to ${status} by ${actor.name}`
    }

    await request(`/api/admin/audits`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(audit)
    }, "Could not record the audit entry")
  }

  async function onAssign(id: string, workerId: string | null) {
    const assigned = await request("/api/admin/reports/assign", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reportId: id, workerId }),
    }, "Could not update the assignment")
    if (!assigned) return
    
    const audit = {
      actorId: actor._id,
      actorRole: actor.role,
      actorName: actor.name,
      action: "worker_assigned",
      message: `Worker ${workerId} has been assigned to report ${id} by ${actor.name}`
    }

    await request(`/api/admin/audits`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(audit)
    }, "Could not record the audit entry")
  }

  async function onAddNote(id: string, note: string) {
    const added = await request("/api/admin/reports/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reportId: id, note }),
    }, "Could not post the note")
    if (!added) return

    const audit = {
      actorId: actor._id,
      actorRole: actor.role,
      actorName: actor.name,
      action: "note_added",
      message: `${actor.name} posted a note on Report ${id}`
    }

    await request(`/api/admin/audits`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(audit)
    }, "Could not record the audit entry")
  }

  async function onFlag(id: string, reason: string) {
    await request("/api/admin/reports/flag", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reportId: id, reason }),
    }, "Could not flag the report")
  }

  if (loading) return <PageLoading label="Loading reports…" />

  if (loadError && reports.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4">
        <EmptyState
          title="We could not load the reports"
          description={loadError}
          icon={<InboxIcon size={20} />}
        />
        <Button type="button" variant="outline" onClick={() => { setLoading(true); loadReports().finally(() => setLoading(false)) }}>
          Try again
        </Button>
      </div>
    )
  }

  const openReport = reports.find((r) => r.id === openReportId) ?? null

  return (
    <>
      <Reports
        reports={reports}
        workers={workers}
        search={search}
        onOpenReport={(report) => setOpenReportId(report.id)}
        onStatusChange={onStatusChange}
        onAssign={onAssign}
        onBulkStatus={onBulkStatus}
      />
      {openReport && (
        <ReportDetailsDrawer
          actor={actor}
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