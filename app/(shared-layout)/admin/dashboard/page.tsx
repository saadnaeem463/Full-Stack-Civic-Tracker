"use client"

import { useEffect, useState } from "react"

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
/*  Design tokens — matches the existing CivicTrack ops screens       */
/* ------------------------------------------------------------------ */

const STATUS_COLOR: Record<string, string> = {
  Reported: "#C23B33",
  Acknowledged: "#D98A2B",
  "In progress": "#B5651D",
  Resolved: "#1F6E3D",
}

const STATUS_BADGE: Record<string, string> = {
  Reported: "bg-red-50 text-red-700 border-red-200",
  Acknowledged: "bg-amber-50 text-amber-700 border-amber-200",
  "In progress": "bg-orange-50 text-orange-800 border-orange-200",
  Resolved: "bg-green-50 text-green-700 border-green-200",
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

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={`rounded-2xl border border-black/5 bg-white p-6 shadow-sm ${className}`}
    >
      {children}
    </div>
  )
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold tracking-wide text-[#5B6B5E] uppercase">
      {children}
    </p>
  )
}

function StatusBadge({ status }: { status: string }) {
  const cls =
    STATUS_BADGE[status] ?? "bg-stone-50 text-stone-700 border-stone-200"
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
      const color = STATUS_COLOR[d._id] ?? "#9AA79C"
      const start = (acc / total) * 360
      acc += d.count
      const end = (acc / total) * 360
      return `${color} ${start}deg ${end}deg`
    })
    .join(", ")

  return (
    <div className="flex items-center gap-8">
      <div
        className="relative flex h-32 w-32 shrink-0 items-center justify-center rounded-full"
        style={{ background: `conic-gradient(${stops})` }}
      >
        <div className="flex h-20 w-20 flex-col items-center justify-center rounded-full bg-white">
          <span className="text-2xl font-semibold text-[#1F2A22]">
            {total}
          </span>
          <span className="text-[11px] text-[#7A867C]">reports</span>
        </div>
      </div>

      <ul className="flex-1 space-y-2.5">
        {data.map((d) => (
          <li key={d._id} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-[#2C362E]">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: STATUS_COLOR[d._id] ?? "#9AA79C" }}
              />
              {d._id}
            </span>
            <span className="font-medium text-[#1F2A22]">{d.count}</span>
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
          <span className="w-24 shrink-0 text-sm text-[#2C362E]">{d._id}</span>
          <div className="h-3 flex-1 rounded-full bg-[#EFEDE4]">
            <div
              className="h-3 rounded-full bg-[#A9C3A4]"
              style={{ width: `${(d.count / max) * 100}%` }}
            />
          </div>
          <span className="w-6 text-right text-sm font-medium text-[#1F2A22]">
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
    <div className="mx-auto max-w-6xl animate-pulse space-y-6 p-8">
      <div className="h-24 w-full rounded-2xl bg-[#EFEDE4]" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-2xl bg-[#EFEDE4]" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="h-56 rounded-2xl bg-[#EFEDE4]" />
        <div className="h-56 rounded-2xl bg-[#EFEDE4]" />
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
      <div className="mx-auto max-w-6xl p-8">
        <Card>
          <p className="text-sm text-red-700">{error}</p>
          <button
            onClick={fetchReports}
            className="mt-3 rounded-lg bg-[#1F4030] px-4 py-2 text-sm font-medium text-white"
          >
            Retry
          </button>
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
  console.log("Allocated : ",allocated)
  console.log("Spend : ",spend)

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="min-h-screen bg-[#F6F4EE]">
      <div className="mx-auto max-w-6xl space-y-6 p-8">
        {/* Header */}
        <Card className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <Eyebrow>{today.toUpperCase()}</Eyebrow>
            <h1 className="mt-1 font-serif text-4xl text-[#1F2A22]">
              Operations overview
            </h1>
            <p className="mt-2 max-w-xl text-sm text-[#5B6B5E]">
              Where the city&apos;s open work stands right now — the urgent
              queue, who is available, and how the maintenance budget is
              holding up.
            </p>
          </div>
          <a
            href="/admin/reports"
            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-[#1F4030] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#183526]"
          >
            Open report queue ↗
          </a>
        </Card>

        {/* Needs attention */}
        <Card>
          <Eyebrow>Needs attention</Eyebrow>
          <div className="mt-3 flex flex-wrap items-center gap-8">
            <div>
              <span className="font-serif text-5xl text-[#1F6E3D]">
                {openReports}
              </span>
              <p className="mt-1 text-sm text-[#5B6B5E]">Open reports</p>
            </div>
            <div className="h-12 w-px bg-black/10" />
            <div>
              <span className="text-2xl font-semibold text-[#1F2A22]">
                {total}
              </span>
              <p className="mt-1 text-xs text-[#5B6B5E]">Total reports</p>
            </div>
            <div>
              <span className="text-2xl font-semibold text-[#1F2A22]">
                {flagged}
              </span>
              <p className="mt-1 text-xs text-[#5B6B5E]">Flagged</p>
            </div>
          </div>
        </Card>

        {/* Resource stats */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Card>
            <Eyebrow>Resources</Eyebrow>
            <p className="mt-2 text-3xl font-semibold text-[#1F2A22]">
              {totalWorkers}
            </p>
            <p className="mt-1 text-xs text-[#5B6B5E]">Field workers</p>
          </Card>
          <Card>
            <Eyebrow>Busy</Eyebrow>
            <p className="mt-2 text-3xl font-semibold text-[#1F2A22]">
              {busyCount}
            </p>
            <p className="mt-1 text-xs text-[#5B6B5E]">Currently allocated</p>
          </Card>
          <Card>
            <Eyebrow>Free</Eyebrow>
            <p className="mt-2 text-3xl font-semibold text-[#1F2A22]">
              {freeCount}
            </p>
            <p className="mt-1 text-xs text-[#5B6B5E]">Available now</p>
          </Card>
          <Card>
            <Eyebrow>Budget left</Eyebrow>
            <p className="mt-2 text-3xl font-semibold text-[#1F2A22]">
              {currency(budgetLeft)}
            </p>
            <p className="mt-1 text-xs text-[#5B6B5E]">of {currency(allocated)}</p>
          </Card>
        </div>

        {/* Recent reports */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-[#1F2A22]">
                Recent reports
              </h2>
              <p className="mt-1 text-sm text-[#5B6B5E]">
                Newest submissions from residents across the city.
              </p>
            </div>
            <a
              href="/admin/reports"
              className="text-sm font-medium text-[#1F4030] hover:underline"
            >
              View all
            </a>
          </div>

          <ul className="mt-4 divide-y divide-black/5">
            {recentReports.map((r) => (
              <li
                key={r._id}
                className="flex items-center justify-between gap-4 py-4"
              >
                <div>
                  <p className="font-medium text-[#1F2A22]">{r.title}</p>
                  <p className="mt-0.5 text-xs text-[#7A867C]">
                    {[r.code, r.address, r.area].filter(Boolean).join(" · ")}
                    {r.createdAt ? ` · ${dateShort(r.createdAt)}` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <StatusBadge status={r.status} />
                  <a
                    href={`/admin/reports/${r._id}`}
                    className="rounded-lg border border-black/10 px-3 py-1.5 text-sm font-medium text-[#1F2A22] hover:bg-[#F6F4EE]"
                  >
                    View
                  </a>
                </div>
              </li>
            ))}
            {recentReports.length === 0 && (
              <li className="py-6 text-sm text-[#7A867C]">
                No reports submitted yet.
              </li>
            )}
          </ul>
        </Card>

        {/* Status + worker allocation */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card>
            <h2 className="text-base font-semibold text-[#1F2A22]">
              Reports by status
            </h2>
            <p className="mt-1 text-sm text-[#5B6B5E]">
              Distribution of the full report set.
            </p>
            <div className="mt-5">
              <StatusDonut data={reports.reportsGen} />
            </div>
          </Card>

          <Card>
            <h2 className="text-base font-semibold text-[#1F2A22]">
              Worker allocation
            </h2>
            <p className="mt-1 text-sm text-[#5B6B5E]">
              {Math.round(busyPct)}% of the crew is currently assigned.
            </p>
            <div className="mt-5 h-3 rounded-full bg-[#EFEDE4]">
              <div
                className="h-3 rounded-full bg-[#1F4030]"
                style={{ width: `${busyPct}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between text-xs text-[#5B6B5E]">
              <span>{busyCount} busy</span>
              <span>{freeCount} free</span>
            </div>

            <ul className="mt-5 space-y-2">
              {workers.busyWorkers.map((w, i) => {
                const [fullname, currentReport] = w._id
                return (
                  <li
                    key={i}
                    className="flex items-center justify-between rounded-xl bg-[#F6F4EE] px-4 py-2.5"
                  >
                    <span className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#D9E4D3] text-xs font-semibold text-[#1F4030]">
                        {initials(fullname)}
                      </span>
                      <span className="text-sm font-medium text-[#1F2A22]">
                        {fullname}
                      </span>
                    </span>
                    <span className="text-xs text-[#7A867C]">
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
          <h2 className="text-base font-semibold text-[#1F2A22]">
            Reports by category
          </h2>
          <p className="mt-1 text-sm text-[#5B6B5E]">
            Where maintenance demand is concentrated.
          </p>
          <div className="mt-5">
            <CategoryBars data={reports.reportsByCat} />
          </div>
        </Card>
      </div>
    </div>
  )
}