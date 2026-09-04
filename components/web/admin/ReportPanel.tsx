"use client"

import React, { useEffect, useState } from "react"
import { Reports } from "./Reports"
import { ReportDetailsDrawer } from "./ReportDetailsDrawer"
import { Report as UIReport, ReportStatus } from "@/data/adminData"
import { adaptReport, adaptWorker } from "@/lib/report-adapter"
import { getMe } from "@/lib/services/auth.services"

export interface ActorProps{
  _id : string,
  name : string,
  role : string
}

export function ReportPanel() {
  const [reports, setReports] = useState<UIReport[]>([])
  const [workers, setWorkers] = useState<ReturnType<typeof adaptWorker>[]>([])
  const [search, setSearch] = useState("")
  const [openReportId, setOpenReportId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [actor,setActor]=useState<ActorProps | {}>({})

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
    async function getUser(){
        try {
        const response=await getMe()
        setActor(response.user)
        console.log(response.user)
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

  async function onStatusChange(id: string, status: ReportStatus) {
    await fetch("/api/admin/reports/status", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reportIds: [id], status }),
    })

    const audit = {
      actorId : actor._id,
      actorRole : actor.role,
      actorName : actor.name,
      action : "status_changed",
      message : `Status of Report ${id} has been changed to ${status}  by ${actor.name}`
    }

    const res=await fetch(`/api/admin/audits`,{
      method : "POST",
      headers : {"Content-Type" : "application/json"},
      body : JSON.stringify(audit)
    })
    loadReports()
  }

  async function onBulkStatus(ids: string[], status: ReportStatus) {
    await fetch("/api/admin/reports/status", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reportIds: ids, status }),
    })

    const audit = {
      actorId : actor._id,
      actorRole : actor.role,
      actorName : actor.name,
      action : "status_changed",
      message : `Status of Reports ${ids} has been changed to ${status}  by ${actor.name}`
    }

    const res=await fetch(`/api/admin/audits`,{
      method : "POST",
      headers : {"Content-Type" : "application/json"},
      body : JSON.stringify(audit)
    })
    loadReports()
  }

  async function onAssign(id: string, workerId: string | null) {
    await fetch("/api/admin/reports/assign", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reportId: id, workerId }),
    })
    
    const audit = {
      actorId : actor._id,
      actorRole : actor.role,
      actorName : actor.name,
      action : "worker_assigned",
      message : `worker ${workerId} has been assigned to report ${id} by ${actor.name}`
    }

    const res=await fetch(`/api/admin/audits`,{
      method : "POST",
      headers : {"Content-Type" : "application/json"},
      body : JSON.stringify(audit)
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

    const audit = {
      actorId : actor._id,
      actorRole : actor.role,
      actorName : actor.name,
      action : "note_added",
      message : `${actor.name} posted a note on Report ${id}`
    }

    const res=await fetch(`/api/admin/audits`,{
      method : "POST",
      headers : {"Content-Type" : "application/json"},
      body : JSON.stringify(audit)
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