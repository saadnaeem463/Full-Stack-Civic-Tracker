'use client'
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { PageHeading, PageLoading, pageContainer, SectionCard } from "@/components/web/admin/primitives"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { toast } from "sonner"
import { Trash2Icon, UserIcon, FileTextIcon, SearchIcon } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"

const ISSUE_CATEGORIES = ["Roads", "Lighting", "Cleanliness", "Parks"]

function initials(name: string) {
    return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()
}
function formatDateTime(iso: string) {
    return new Date(iso).toLocaleString("en-US", {
        month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
    })
}
function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", {
        month: "short", day: "numeric", year: "numeric"
    })
}

export default function AdminSettings() {
    const [users, setUsers] = useState<any[]>([])
    const [reports, setReports] = useState<any[]>([])
    const [auditLogs, setAuditLogs] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    // Dialog states
    const [showUsersDialog, setShowUsersDialog] = useState(false)
    const [showReportsDialog, setShowReportsDialog] = useState(false)
    const [deleteUserId, setDeleteUserId] = useState<string | null>(null)
    const [deleteReportId, setDeleteReportId] = useState<string | null>(null)
    const [deleting, setDeleting] = useState(false)
    const [userSearch, setUserSearch] = useState("")
    const [reportSearch, setReportSearch] = useState("")

    const fetchUsersAndReports = async () => {
        try {
            const response = await fetch('/api/admin/settings')
            const data = await response.json()
            setUsers(data.users ?? [])
            setReports(data.reports ?? [])
            setAuditLogs(data.auditLogs ?? [])
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

    const handleDeleteUser = async (userId: string) => {
        setDeleting(true)
        try {
            const res = await fetch(`/api/admin/users/delete?userId=${userId}`, { method: "DELETE" })
            if (!res.ok) throw new Error("Failed to delete user")
            setUsers(prev => prev.filter(u => u._id !== userId))
            setDeleteUserId(null)
            toast.success("User deleted successfully")
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to delete user")
        } finally {
            setDeleting(false)
        }
    }

    const handleDeleteReport = async (reportId: string) => {
        setDeleting(true)
        try {
            const res = await fetch(`/api/admin/reports/delete?reportId=${reportId}`, { method: "DELETE" })
            if (!res.ok) throw new Error("Failed to delete report")
            setReports(prev => prev.filter(r => r._id !== reportId))
            setDeleteReportId(null)
            toast.success("Report deleted successfully")
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to delete report")
        } finally {
            setDeleting(false)
        }
    }

    const filteredUsers = users.filter(u => 
        (u.name ?? "").toLowerCase().includes(userSearch.toLowerCase()) ||
        (u.email ?? "").toLowerCase().includes(userSearch.toLowerCase()) ||
        (u.role ?? "").toLowerCase().includes(userSearch.toLowerCase())
    )

    const filteredReports = reports.filter(r => 
        (r.title ?? "").toLowerCase().includes(reportSearch.toLowerCase()) ||
        (r._id ?? "").toLowerCase().includes(reportSearch.toLowerCase()) ||
        (r.status ?? "").toLowerCase().includes(reportSearch.toLowerCase())
    )

    if (loading) {
        return <PageLoading label="Loading content…" />
    }

    const adminCount = users.filter((u) => u.role === "admin").length
    const moderatorCount = users.filter((u) => u.role === "moderator").length
    const citizenCount = users.filter((u) => u.role === "citizen").length
    const sortedLogs = [...auditLogs].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    return (
        <div className={pageContainer}>
            <PageHeading
                eyebrow="Administration"
                title="Settings"
                description="Portal configuration, user management, and audit trail."
            />

            {error.length > 0 && (
                <div className="mb-4 rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
                    {error}
                </div>
            )}

            {/* Portal configuration */}
            <SectionCard title="Portal configuration" description="Shared settings for the reporting workflow.">
                <div className="divide-y divide-border">
                    <div className="flex flex-wrap items-center justify-between gap-3 py-4">
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground">Issue categories</p>
                            <p className="mt-0.5 text-xs text-muted-foreground">{ISSUE_CATEGORIES.join(", ")}</p>
                        </div>
                        <Button variant="outline" size="sm" disabled>
                            Manage
                        </Button>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 py-4">
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground">Staff accounts</p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                                {adminCount} admin{adminCount === 1 ? "" : "s"} · {moderatorCount} moderator{moderatorCount === 1 ? "" : "s"}
                            </p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setShowUsersDialog(true)}>
                            Manage
                        </Button>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 py-4">
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground">All reports</p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                                {reports.length} total · {reports.filter(r => r.status !== "Resolved").length} open
                            </p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setShowReportsDialog(true)}>
                            Manage
                        </Button>
                    </div>
                </div>
            </SectionCard>

            {/* Audit log */}
            <SectionCard title="Audit log" description="Who changed what, and when.">
                <div className="divide-y divide-border">
                    {sortedLogs.length === 0 && (
                        <p className="py-4 text-sm text-muted-foreground">No activity recorded yet.</p>
                    )}
                    {sortedLogs.map((log) => (
                        <div key={log._id} className="flex items-start gap-3 py-4">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                                {initials(log.actorName)}
                            </span>
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-foreground">{log.message}</p>
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                    {log.actorName} · {log.actorRole === "admin" ? "Admin" : "Moderator"} · {formatDateTime(log.createdAt)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </SectionCard>

            {/* Users Management Dialog */}
            <Dialog open={showUsersDialog} onOpenChange={setShowUsersDialog}>
                <DialogContent className="max-w-3xl max-h-[80vh]">
                    <DialogHeader>
                        <DialogTitle>Manage Users</DialogTitle>
                        <DialogDescription>
                            View and manage all registered users. Admins cannot be deleted.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-4 mt-4">
                        <div className="relative">
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                            <Input
                                placeholder="Search users..."
                                value={userSearch}
                                onChange={(e) => setUserSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Joined</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredUsers.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                                No users found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredUsers.map((user) => (
                                            <TableRow key={user._id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                                                            {initials(user.name)}
                                                        </div>
                                                        <span className="font-medium">{user.name}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{user.email}</TableCell>
                                                <TableCell>
                                                    <Badge variant={
                                                        user.role === "admin" ? "default" :
                                                        user.role === "moderator" ? "secondary" : "outline"
                                                    }>
                                                        {user.role}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{formatDate(user.createdAt)}</TableCell>
                                                <TableCell className="text-right">
                                                    {user.role !== "admin" && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-destructive hover:bg-destructive/10"
                                                            onClick={() => setDeleteUserId(user._id)}
                                                            disabled={deleting}
                                                        >
                                                            <Trash2Icon size={14} className="mr-1" /> Delete
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Reports Management Dialog */}
            <Dialog open={showReportsDialog} onOpenChange={setShowReportsDialog}>
                <DialogContent className="max-w-4xl max-h-[80vh]">
                    <DialogHeader>
                        <DialogTitle>Manage Reports</DialogTitle>
                        <DialogDescription>
                            View and delete all reports. Deleted reports cannot be recovered.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-4 mt-4">
                        <div className="relative">
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                            <Input
                                placeholder="Search reports..."
                                value={reportSearch}
                                onChange={(e) => setReportSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Report ID</TableHead>
                                        <TableHead>Title</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Reporter</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredReports.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                                No reports found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredReports.map((report) => (
                                            <TableRow key={report._id}>
                                                <TableCell className="font-mono text-sm">{report._id}</TableCell>
                                                <TableCell className="max-w-[200px] truncate">{report.title}</TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary">{report.issueType}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={
                                                        report.status === "Resolved" ? "default" :
                                                        report.status === "In progress" ? "secondary" :
                                                        report.status === "Acknowledged" ? "outline" : "outline"
                                                    }>
                                                        {report.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{report.userId?.name ?? "Unknown"}</TableCell>
                                                <TableCell>{formatDate(report.createdAt)}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-destructive hover:bg-destructive/10"
                                                        onClick={() => setDeleteReportId(report._id)}
                                                        disabled={deleting}
                                                    >
                                                        <Trash2Icon size={14} className="mr-1" /> Delete
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete User Confirmation */}
            <ConfirmDialog
                open={!!deleteUserId}
                onOpenChange={(open) => { if (!open) setDeleteUserId(null) }}
                title="Delete user?"
                description="This action cannot be undone. The user will be permanently removed from the system."
                confirmLabel="Delete user"
                onConfirm={() => {
                    if (deleteUserId) handleDeleteUser(deleteUserId)
                }}
            />

            {/* Delete Report Confirmation */}
            <ConfirmDialog
                open={!!deleteReportId}
                onOpenChange={(open) => { if (!open) setDeleteReportId(null) }}
                title="Delete report?"
                description="This action cannot be undone. The report and all its data will be permanently removed."
                confirmLabel="Delete report"
                onConfirm={() => {
                    if (deleteReportId) handleDeleteReport(deleteReportId)
                }}
            />
        </div>
    )
}
