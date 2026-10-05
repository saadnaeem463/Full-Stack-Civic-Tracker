import { connectDB } from "@/lib/db";
import { Report } from "@/models/report";
import { safeTrigger } from "@/lib/pusher";
import { NextRequest, NextResponse } from "next/server";
import { REPORTS_CHANNEL, REPORT_UPDATED_EVENT } from "@/lib/pusher-events";
import { getAdmin } from "@/lib/get-admin";
import { notify } from "@/lib/notifications";
import { User } from "@/models/user";

const VALID_STATUSES = ["Reported", "Acknowledged", "In progress", "Resolved"]

export async function PATCH(request: NextRequest) {
    try {
        const admin = await getAdmin()
        const { reportIds, status } = await request.json()

        if (!Array.isArray(reportIds) || reportIds.length === 0) {
            return NextResponse.json({ error: "ReportIds must be a non-empty array" }, { status: 400 })
        }

        if (!VALID_STATUSES.includes(status)) {
            return NextResponse.json({ error: "Invalid Status" }, { status: 400 })
        }

        await connectDB()

        const reports = await Report.find({ _id: { $in: reportIds } })
            .populate("assignedTo", "fullname email specialty status")
            .populate("userId", "name email")

        if (reports.length === 0) {
            return NextResponse.json({ error: "No matching reports found" }, { status: 404 })
        }

        const actor = await User.findById(admin.userId)
        const admins = await User.find({ role: "admin" })

        const updatedReports = []

        for (const report of reports) {
            report.status = status
            report.history.push({ status, by: admin.email })
            await report.save()

            const populatedReport = await Report.findById(report._id)
                .populate("assignedTo", "fullname email specialty status")
                .populate("userId", "name email")

            updatedReports.push(populatedReport)

            // `userId` is populated above, so it is a user document — read the id off it
            const owner = report.userId as unknown as { _id?: { toString(): string } } | null
            const ownerId = owner?._id?.toString()

            // The reporting citizen hears about their own report (unless they changed it themselves)...
            if (ownerId && ownerId !== String(admin.userId)) await notify({
                recipient: ownerId,
                type: "status_change",
                report: report._id,
                triggeredBy: admin.userId,
                message: `Your report "${report.title}" is now ${status}`
            })

            // ...and admins get the staff-facing variant for visibility
            for (const adminUser of admins) {
                // the admin who made the change already knows about it
                if (adminUser._id.toString() === String(admin.userId)) continue
                await notify({
                    recipient: adminUser._id.toString(),
                    type: "status_change",
                    report: report._id,
                    triggeredBy: admin.userId,
                    message: `Report '${report.title}' status changed to ${status} by ${actor?.name ?? admin.email}`
                })
            }
        }

        // Trigger real-time update with full report data (awaited, in parallel — see safeTrigger)
        await Promise.all(
            updatedReports.map((report) => safeTrigger(REPORTS_CHANNEL, REPORT_UPDATED_EVENT, { report }))
        )

        return NextResponse.json({ updated: reports.length, reports: updatedReports })
    } catch (error) {
        console.error("Status update failed:", error)
        return NextResponse.json({ error: "Failed to update status" }, { status: 500 })
    }
}