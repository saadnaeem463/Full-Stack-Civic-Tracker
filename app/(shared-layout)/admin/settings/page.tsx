'use client'
import { useEffect, useState } from "react"

const ISSUE_CATEGORIES = ["Roads", "Lighting", "Cleanliness", "Parks"]

function initials(name: string) {
    return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()
}
function formatDateTime(iso: string) {
    return new Date(iso).toLocaleString("en-US", {
        month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
    })
}

export default function AdminSettings() {
    const [users, setUsers] = useState<any[]>([])
    const [reports, setReports] = useState<any[]>([])
    const [auditLogs, setAuditLogs] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    const fetchUsersAndReports = async () => {
        try {
            const response = await fetch('/api/admin/settings')
            const data = await response.json()
            setUsers(data.users ?? [])
            setReports(data.reports ?? [])
            setAuditLogs(data.auditLogs ?? [])
            console.log(data)
        } catch (error) {
            console.log(error)
            setError("Error while fetching data")
        }
    }

    useEffect(() => {
        Promise.all([fetchUsersAndReports()]).finally(() => {
            setLoading(false)
        })
    }, [])

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#F5F3EC]">
                <p className="text-sm text-neutral-400">Loading Content…</p>
            </div>
        )
    }

    const adminCount = users.filter((u) => u.role === "admin").length
    const moderatorCount = users.filter((u) => u.role === "moderator").length
    const sortedLogs = [...auditLogs].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    return (
        <div className="min-h-screen bg-[#F5F3EC] px-6 py-10 sm:px-10">
            <div className="mx-auto max-w-4xl">
                {/* Header */}
                <div className="mb-6">
                    <p className="text-xs font-semibold tracking-widest text-neutral-500">ADMINISTRATION</p>
                    <h1 className="mt-1 font-serif text-4xl text-neutral-900">Settings</h1>
                    <p className="mt-2 max-w-md text-sm text-neutral-500">
                        Portal configuration and the record of every status change made by staff.
                    </p>
                </div>

                {error.length > 0 && (
                    <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {/* Portal configuration */}
                <div className="mb-4 rounded-2xl border border-black/5 bg-white p-6">
                    <p className="font-medium text-neutral-900">Portal configuration</p>
                    <p className="mb-4 text-sm text-neutral-500">Shared settings for the reporting workflow.</p>

                    <div className="divide-y divide-neutral-100">
                        <div className="flex items-center justify-between py-4">
                            <div>
                                <p className="font-medium text-neutral-900">Issue categories</p>
                                <p className="text-sm text-neutral-500">{ISSUE_CATEGORIES.join(", ")}</p>
                            </div>
                            <button className="rounded-lg border border-neutral-200 px-4 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50">
                                Manage
                            </button>
                        </div>

                        <div className="flex items-center justify-between py-4">
                            <div>
                                <p className="font-medium text-neutral-900">Staff accounts</p>
                                <p className="text-sm text-neutral-500">
                                    {adminCount} admin{adminCount === 1 ? "" : "s"} · {moderatorCount} moderator{moderatorCount === 1 ? "" : "s"}
                                </p>
                            </div>
                            <button className="rounded-lg border border-neutral-200 px-4 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50">
                                Manage
                            </button>
                        </div>
                    </div>
                </div>

                {/* Audit log */}
                <div className="rounded-2xl border border-black/5 bg-white p-6">
                    <p className="font-medium text-neutral-900">Audit log</p>
                    <p className="mb-3 text-sm text-neutral-500">Who changed what, and when.</p>

                    <div className="divide-y divide-neutral-100">
                        {sortedLogs.length === 0 && (
                            <p className="py-4 text-sm text-neutral-400">No activity recorded yet.</p>
                        )}
                        {sortedLogs.map((log) => (
                            <div key={log._id} className="flex items-start gap-3 py-4">
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-800">
                                    {initials(log.actorName)}
                                </span>
                                <div className="min-w-0">
                                    <p className="font-medium text-neutral-900">{log.message}</p>
                                    <p className="text-xs text-neutral-500">
                                        {log.actorName} · {log.actorRole === "admin" ? "Admin" : "Moderator"} · {formatDateTime(log.createdAt)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}