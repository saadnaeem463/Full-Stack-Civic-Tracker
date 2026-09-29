"use client"
import React, { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import {
    Button,
} from '@/components/ui/button'
import {
    EmptyState,
    PageHeading,
    PageLoading,
    pageContainer,
} from '@/components/web/admin/primitives'

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
    const [error, setError] = useState("")

    const fetchAnalyticsData = async () => {
        try {
            const res = await fetch(`/api/admin/analytics`)
            if (!res.ok) throw new Error("Failed to load analytics")
            const json = await res.json()
            setData(json)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load analytics")
        } finally {
            setIsLoading(false)
        }
    }

    const retry = () => {
        setIsLoading(true)
        setError("")
        fetchAnalyticsData()
    }

    useEffect(() => {
        fetchAnalyticsData()
    }, [])

    if (isLoading) {
        return <PageLoading label="Loading analytics…" />
    }

    if (error || !data) {
        return (
            <div className={pageContainer}>
                <PageHeading
                    eyebrow="Service performance"
                    title="Analytics"
                    description="Response trends, demand by area, and the unresolved issues residents care about most."
                />
                <EmptyState
                    title="We could not load analytics"
                    description={error || "Something went wrong while gathering the numbers."}
                />
                <div className="mt-4 flex justify-center">
                    <Button type="button" variant="outline" onClick={retry}>
                        Try again
                    </Button>
                </div>
            </div>
        )
    }

    const maxNeighborhoodCount = Math.max(...data.reportsByNeighborhood.map((n) => n.count), 1)

    return (
        <div className={pageContainer}>
            <PageHeading
                eyebrow="Service performance"
                title="Analytics"
                description="Response trends, demand by area, and the unresolved issues residents care about most."
            />

                {/* Average time to resolve */}
                <div className="mb-4 rounded-lg border border-border bg-card p-5 shadow-xs">
                    <p className="text-sm font-semibold tracking-tight text-foreground">Average time to resolve</p>
                    <p className="mb-4 mt-1 text-xs text-muted-foreground">Hours from report to resolution, last six months.</p>

                    {data.resolutionTrend.length === 0 ? (
                        <p className="py-8 text-center text-sm text-muted-foreground">Not enough resolved reports yet.</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={220}>
                            <LineChart data={data.resolutionTrend} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                                <XAxis
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                    stroke="var(--muted-foreground)"
                                    fontSize={12}
                                />
                                <YAxis hide domain={["dataMin - 5", "dataMax + 5"]} />
                                <Tooltip
                                    formatter={(value) => [`${value}h`, "Avg resolution"]}
                                    labelFormatter={(label) => label}
                                    contentStyle={{
                                        borderRadius: 10,
                                        border: "1px solid var(--border)",
                                        background: "var(--popover)",
                                        color: "var(--popover-foreground)",
                                        fontSize: 12,
                                        boxShadow: "0 8px 24px -12px rgba(0,0,0,0.35)",
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="avgHours"
                                    stroke="var(--chart-1)"
                                    strokeWidth={2}
                                    dot={false}
                                    activeDot={{ r: 4 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Reports by neighborhood */}
                <div className="mb-4 rounded-lg border border-border bg-card p-5 shadow-xs">
                    <p className="text-sm font-semibold tracking-tight text-foreground">Reports by neighborhood</p>
                    <p className="mb-5 mt-1 text-xs text-muted-foreground">Where demand concentrates.</p>

                    <div className="space-y-4">
                        {data.reportsByNeighborhood.length === 0 && (
                            <p className="py-4 text-sm text-muted-foreground">No neighborhood data yet.</p>
                        )}
                        {data.reportsByNeighborhood.map((n) => {
                            const pct = (n.count / maxNeighborhoodCount) * 100
                            return (
                                <div key={n._id} className="flex items-center gap-4">
                                    <p className="w-32 shrink-0 text-sm text-foreground">{n._id}</p>
                                    <div className="h-6 flex-1 overflow-hidden rounded-full bg-muted">
                                        <div
                                            className="h-full rounded-full bg-primary/20 transition-all"
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                    <p className="w-8 shrink-0 text-right text-sm font-semibold text-foreground">
                                        {n.count}
                                    </p>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Most upvoted unresolved issues */}
                <div className="rounded-lg border border-border bg-card p-5 shadow-xs">
                    <p className="text-sm font-semibold tracking-tight text-foreground">Most upvoted unresolved issues</p>
                    <p className="mb-3 mt-1 text-xs text-muted-foreground">Community priority signals.</p>

                    <div className="divide-y divide-border">
                        {data.topUnresolved.length === 0 && (
                            <p className="py-4 text-sm text-muted-foreground">No unresolved issues right now.</p>
                        )}
                        {data.topUnresolved.map((issue) => (
                            <div key={issue._id} className="flex items-center justify-between py-3">
                                <div>
                                    <p className="font-medium text-foreground">{issue.title}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {issue.neighborhood ?? "Unknown area"} · {issue.status}
                                    </p>
                                </div>
                                <p className="font-medium text-foreground">{issue.upvoteCount}</p>
                            </div>
                        ))}
                    </div>
                </div>
        </div>
    )
}

export default AnalyticsPage