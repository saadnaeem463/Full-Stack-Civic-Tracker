"use client"
import React, { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

interface ResolutionTrendPoint {
    month: string
    avgHours: number
    count: number
}
interface NeighborhoodCount {
    _id: string
    count: number
}
interface UnresolvedIssue {
    _id: string
    title: string
    neighborhood: string | null
    status: string
    upvoteCount: number
}
interface AnalyticsData {
    resolutionTrend: ResolutionTrendPoint[]
    avgResolutionHours: number
    resolvedCount: number
    topUnresolved: UnresolvedIssue[]
    reportsByNeighborhood: NeighborhoodCount[]
}

const AnalyticsPage = () => {
    const [data, setData] = useState<AnalyticsData | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    const fetchAnalyticsData = async () => {
        const res = await fetch(`/api/admin/analytics`)
        const json = await res.json()
        setData(json)
    }

    useEffect(() => {
        fetchAnalyticsData().finally(() => setIsLoading(false))
    }, [])

    if (isLoading || !data) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#F5F3EC]">
                <p className="text-sm text-neutral-400">Loading analytics…</p>
            </div>
        )
    }

    const maxNeighborhoodCount = Math.max(...data.reportsByNeighborhood.map((n) => n.count), 1)

    return (
        <div className="min-h-screen bg-[#F5F3EC] px-6 py-10 sm:px-10">
            <div className="mx-auto max-w-4xl">
                {/* Header */}
                <div className="mb-6">
                    <p className="text-xs font-semibold tracking-widest text-neutral-500">
                        SERVICE PERFORMANCE
                    </p>
                    <h1 className="mt-1 font-serif text-4xl text-neutral-900">Analytics</h1>
                    <p className="mt-2 max-w-md text-sm text-neutral-500">
                        Response trends, demand by area, and the unresolved issues residents care about most.
                    </p>
                </div>

                {/* Average time to resolve */}
                <div className="mb-4 rounded-2xl border border-black/5 bg-white p-6">
                    <p className="font-medium text-neutral-900">Average time to resolve</p>
                    <p className="mb-4 text-sm text-neutral-500">Hours from report to resolution, last six months.</p>

                    {data.resolutionTrend.length === 0 ? (
                        <p className="py-8 text-center text-sm text-neutral-400">Not enough resolved reports yet.</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={220}>
                            <LineChart data={data.resolutionTrend} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                                <XAxis
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                    stroke="#a3a3a3"
                                    fontSize={12}
                                />
                                <YAxis hide domain={["dataMin - 5", "dataMax + 5"]} />
                                <Tooltip
                                    formatter={(value: number) => [`${value}h`, "Avg resolution"]}
                                    labelFormatter={(label) => label}
                                    contentStyle={{ borderRadius: 8, border: "1px solid #e5e5e5", fontSize: 12 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="avgHours"
                                    stroke="#2F5233"
                                    strokeWidth={2}
                                    dot={false}
                                    activeDot={{ r: 4 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Reports by neighborhood */}
                <div className="mb-4 rounded-2xl border border-black/5 bg-white p-6">
                    <p className="font-medium text-neutral-900">Reports by neighborhood</p>
                    <p className="mb-5 text-sm text-neutral-500">Where demand concentrates.</p>

                    <div className="space-y-4">
                        {data.reportsByNeighborhood.length === 0 && (
                            <p className="py-4 text-sm text-neutral-400">No neighborhood data yet.</p>
                        )}
                        {data.reportsByNeighborhood.map((n) => {
                            const pct = (n.count / maxNeighborhoodCount) * 100
                            return (
                                <div key={n._id} className="flex items-center gap-4">
                                    <p className="w-32 shrink-0 text-sm text-neutral-700">{n._id}</p>
                                    <div className="h-6 flex-1 overflow-hidden rounded-full bg-neutral-100">
                                        <div
                                            className="h-full rounded-full bg-[#A9C1AC] transition-all"
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                    <p className="w-8 shrink-0 text-right text-sm font-semibold text-neutral-900">
                                        {n.count}
                                    </p>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Most upvoted unresolved issues */}
                <div className="rounded-2xl border border-black/5 bg-white p-6">
                    <p className="font-medium text-neutral-900">Most upvoted unresolved issues</p>
                    <p className="mb-3 text-sm text-neutral-500">Community priority signals.</p>

                    <div className="divide-y divide-neutral-100">
                        {data.topUnresolved.length === 0 && (
                            <p className="py-4 text-sm text-neutral-400">No unresolved issues right now.</p>
                        )}
                        {data.topUnresolved.map((issue) => (
                            <div key={issue._id} className="flex items-center justify-between py-3">
                                <div>
                                    <p className="font-medium text-neutral-900">{issue.title}</p>
                                    <p className="text-xs text-neutral-500">
                                        {issue.neighborhood ?? "Unknown area"} · {issue.status}
                                    </p>
                                </div>
                                <p className="font-medium text-neutral-900">{issue.upvoteCount}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AnalyticsPage