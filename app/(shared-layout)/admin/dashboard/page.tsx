"use client"

import { useEffect, useState } from "react"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  StatCard,
  eyebrowClass,
  pageContainer,
} from "@/components/web/admin/primitives"

/* ------------------------------------------------------------------ */
/*  Types — mirror the shape returned by /api/admin/dashboard         */
/* ------------------------------------------------------------------ */

type StatusCount = { _id: string; count: number; flagged?: number }
type CategoryCount = { _id: string; count: number }
type WorkerStatusCount = { _id: string; count: number }
type BusyWorker = { _id: [string, string] } // [fullname, currentReport]

type RecentReport = {
  _id: string
  code?: string
  title: string
  address?: string
  area?: string
  status: string
  createdAt: string
}

type DashboardData = {
  reports: {
    reportsGen: StatusCount[]
    reportsByCat: CategoryCount[]
  }
  total: number
  suspicious: number
  workers: {
    groupByStatus: WorkerStatusCount[]
    busyWorkers: BusyWorker[]
  }
  totalSpend: { _id: null; spend: number; totalAllocated: number }[]
  recentReports: RecentReport[]
}

/* ------------------------------------------------------------------ */
/*  Semantic status tokens — same mapping as StatusBadge              */
/* ------------------------------------------------------------------ */

const STATUS_COLOR: Record<string, string> = {
  Reported: "var(--destructive)",
  Acknowledged: "var(--info)",
  "In progress": "var(--warning)",
  Resolved: "var(--success)",
}

const STATUS_BADGE: Record<string, string> = {
  Reported: "bg-destructive/10 text-destructive border-destructive/20",
  Acknowledged: "bg-info/10 text-info border-info/20",
  "In progress": "bg-warning/10 text-warning border-warning/20",
  Resolved: "bg-success/10 text-success border-success/20",
}

const currency = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n)

const dateShort = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  })

/* ------------------------------------------------------------------ */
/*  Small building blocks                                             */
/* ------------------------------------------------------------------ */

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className={eyebrowClass}>{children}</p>
}

function StatusBadge({ status }: { status: string }) {
  const cls =
    STATUS_BADGE[status] ?? "bg-muted text-muted-foreground border-border"
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium ${cls}`}
    >
      {status}
    </span>
  )
}

function StatusDonut({ data }: { data: StatusCount[] }) {
  const total = data.reduce((s, d) => s + d.count, 0) || 1
  let acc = 0
  const stops = data
    .map((d) => {
      const color = STATUS_COLOR[d._id] ?? "var(--muted-foreground)"
      const start = (acc / total) * 360
      acc += d.count
      const end = (acc / total) * 360
      return `${color} ${start}deg ${end}deg`
    })
    .join(", ")

  return (
    <div className="flex flex-wrap items-center gap-8">
      <div
        className="relative flex h-32 w-32 shrink-0 items-center justify-center rounded-full"
        style={{ background: `conic-gradient(${stops})` }}
      >
        <div className="flex h-20 w-20 flex-col items-center justify-center rounded-full bg-card">
          <span className="text-2xl font-semibold tabular-nums text-foreground">
            {total}
          </span>
          <span className="text-[11px] text-muted-foreground">reports</span>
        </div>
      </div>

      <ul className="flex-1 space-y-2.5">
        {data.map((d) => (
          <li key={d._id} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-foreground">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: STATUS_COLOR[d._id] ?? "var(--muted-foreground)" }}
              />
              {d._id}
            </span>
            <span className="font-medium tabular-nums text-foreground">{d.count}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function CategoryBars({ data }: { data: CategoryCount[] }) {
  const max = Math.max(...data.map((d) => d.count), 1)
  return (
    <div className="space-y-4">
      {data.map((d) => (
        <div key={d._id} className="flex items-center gap-4">
          <span className="w-24 shrink-0 text-sm">{d._id}</span>
          <div className="h-3 flex-1 rounded-full bg-muted">
            <div
              className="h-3 rounded-full bg-primary"
              style={{ width: `${(d.count / max) * 100}%` }}
            />
          </div>
          <span className="w-6 text-right text-sm font-medium tabular-nums">
            {d.count}
          </span>
        </div>
      ))}
    </div>
  )
}

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

/* ------------------------------------------------------------------ */
/*  Loading skeleton                                                  */
/* ------------------------------------------------------------------ */

function DashboardSkeleton() {
  return (
    <div className={`${pageContainer} animate-pulse space-y-6`}>
      <div className="h-24 w-full rounded-lg bg-muted" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-lg bg-muted" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="h-56 rounded-lg bg-muted" />
        <div className="h-56 rounded-lg bg-muted" />
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main component                                                    */
/* ------------------------------------------------------------------ */

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchReports = async () => {
    try {
      setError(null)
      const res = await fetch("/api/admin/dashboard")
      if (!res.ok) throw new Error("Failed to load dashboard")
      const json = await res.json()
      setData(json)
    } catch (err) {
      console.error("Error: ", err)
      setError("Couldn't load the dashboard. Try refreshing.")
    }
  }

  useEffect(() => {
    fetchReports()
  }, [])

  if (error) {
    return (
      <div className={pageContainer}>
        <Card>
          <p className="text-sm text-destructive">{error}</p>
          <Button size="sm" className="mt-3" onClick={fetchReports}>
            Retry
          </Button>
        </Card>
      </div>
    )
  }

  if (!data) return <DashboardSkeleton />

  const { reports, total, workers, totalSpend, recentReports } = data

  const resolved =
    reports.reportsGen.find((r) => r._id === "Resolved")?.count ?? 0
  const openReports = total - resolved
  const flagged = data.suspicious ?? 0

  const busyCount =
    workers.groupByStatus.find((w) => w._id === "Busy")?.count ?? 0
  const freeCount =
    workers.groupByStatus.find((w) => w._id === "Free")?.count ?? 0
  const totalWorkers = busyCount + freeCount
  const busyPct = totalWorkers ? (busyCount / totalWorkers) * 100 : 0

  const spend = totalSpend?.[0]?.spend ?? 0
  const allocated = totalSpend?.[0]?.totalAllocated ?? 0
  const budgetLeft = allocated - spend

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  })

  return (
    <div className={`${pageContainer} space-y-6`}>
      {/* Header */}
      <Card className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Eyebrow>{today.toUpperCase()}</Eyebrow>
          <h1 className="mt-1.5 text-2xl font-semibold tracking-tight sm:text-3xl">
            Operations overview
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            Where the city&apos;s open work stands right now — the urgent
            queue, who is available, and how the maintenance budget is
            holding up.
          </p>
        </div>
        <a
          href="/admin/reports"
          className={buttonVariants({ size: "lg" })}
        >
          Open report queue
        </a>
      </Card>

      {/* Needs attention */}
      <Card>
        <Eyebrow>Needs attention</Eyebrow>
        <div className="mt-3 flex flex-wrap items-center gap-x-8 gap-y-4">
          <div>
            <span className="text-4xl font-semibold tabular-nums text-foreground sm:text-5xl">
              {openReports}
            </span>
            <p className="mt-1 text-sm text-muted-foreground">Open reports</p>
          </div>
          <div className="hidden h-12 w-px bg-border sm:block" />
          <div>
            <span className="text-2xl font-semibold tabular-nums text-foreground">
              {total}
            </span>
            <p className="mt-1 text-xs text-muted-foreground">Total reports</p>
          </div>
          <div>
            <span className="text-2xl font-semibold tabular-nums text-destructive">
              {flagged}
            </span>
            <p className="mt-1 text-xs text-muted-foreground">Flagged</p>
          </div>
        </div>
      </Card>

      {/* Resource stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard index={0} label="Resources" value={totalWorkers} note="Field workers" />
        <StatCard index={1} label="Busy" value={busyCount} note="Currently allocated" />
        <StatCard index={2} label="Free" value={freeCount} note="Available now" />
        <StatCard
          index={3}
          label="Budget left"
          value={currency(budgetLeft)}
          note={`of ${currency(allocated)}`}
        />
      </div>

      {/* Recent reports */}
      <Card>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold tracking-tight">
              Recent reports
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Newest submissions from residents across the city.
            </p>
          </div>
          <a
            href="/admin/reports"
            className="shrink-0 text-sm font-medium text-primary hover:underline"
          >
            View all
          </a>
        </div>

        <ul className="mt-4 divide-y divide-border">
          {recentReports.map((r) => (
            <li
              key={r._id}
              className="flex items-center justify-between gap-4 py-4"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground">{r.title}</p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {[r.code, r.createdAt ? dateShort(r.createdAt) : ""].filter(Boolean).join(" · ")}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <StatusBadge status={r.status} />
                <a
                  href="/admin/reports"
                  className={buttonVariants({ variant: "outline", size: "xs" })}
                >
                  View
                </a>
              </div>
            </li>
          ))}
          {recentReports.length === 0 && (
            <li className="py-6 text-sm text-muted-foreground">
              No reports submitted yet.
            </li>
          )}
        </ul>
      </Card>

      {/* Status + worker allocation */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <h2 className="text-sm font-semibold tracking-tight">
            Reports by status
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Distribution of the full report set.
          </p>
          <div className="mt-5">
            <StatusDonut data={reports.reportsGen} />
          </div>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold tracking-tight">
            Worker allocation
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {Math.round(busyPct)}% of the crew is currently assigned.
          </p>
          <div className="mt-5 h-3 rounded-full bg-muted">
            <div
              className="h-3 rounded-full bg-primary"
              style={{ width: `${busyPct}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span>{busyCount} busy</span>
            <span>{freeCount} free</span>
          </div>

          <ul className="mt-5 space-y-2">
            {workers.busyWorkers.map((w, i) => {
              const [fullname, currentReport] = w._id
              return (
                <li
                  key={i}
                  className="flex items-center justify-between gap-3 rounded-lg bg-muted px-4 py-2.5"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {initials(fullname)}
                    </span>
                    <span className="truncate text-sm font-medium text-foreground">
                      {fullname}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {currentReport}
                  </span>
                </li>
              )
            })}
          </ul>
        </Card>
      </div>

      {/* Category breakdown */}
      <Card>
        <h2 className="text-sm font-semibold tracking-tight">
          Reports by category
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Where maintenance demand is concentrated.
        </p>
        <div className="mt-5">
          <CategoryBars data={reports.reportsByCat} />
        </div>
      </Card>
    </div>
  )
}
