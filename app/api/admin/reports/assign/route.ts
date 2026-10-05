import { connectDB } from "@/lib/db";
import { Report } from "@/models/report";
import { Workers } from "@/models/workers";
import { pusherServer } from "@/lib/pusher";
import { NextRequest, NextResponse } from "next/server";
import { REPORTS_CHANNEL, REPORT_UPDATED_EVENT } from "@/lib/pusher-events";
import { getAdmin } from "@/lib/get-admin";

export async function PATCH(req: NextRequest) {
    try {
        const admin = await getAdmin()
        const { reportId, workerId } = await req.json()

        if (!reportId) {
            return NextResponse.json({ error: "reportId is required" }, { status: 400 })
        }

        await connectDB()
        const report = await Report.findById(reportId)

        if (!report) {
            return NextResponse.json({ error: "Report doesn't exist" }, { status: 404 })
        }

        if (report.assignedTo) {
            await Workers.findByIdAndUpdate(report.assignedTo, {
                currentReport: null,
                status: "Free"
            })
        }

        if (!workerId) {
            await Workers.findByIdAndUpdate(report.assignedTo, {
                currentReport: null,
                status: "Free"
            })

            report.assignedTo = null
            await report.save()
        } else {
            const worker = await Workers.findById(workerId)
            if (!worker) {
                return NextResponse.json({ error: "Worker doesn't exist" }, { status: 404 })
            }

            worker.currentReport = report._id
            worker.status = "Busy"
            await worker.save()

            report.assignedTo = workerId
            await report.save()
        }

        const updatedReport = await Report.findById(reportId)
            .populate("assignedTo", "fullname email specialty status")
            .populate("userId", "name email")

        pusherServer
            .trigger(REPORTS_CHANNEL, REPORT_UPDATED_EVENT, { report: updatedReport })
            .catch((err) => console.log("Pusher Trigger Failed:", err))

        return NextResponse.json({ message: "Worker assigned successfully", report: updatedReport }, { status: 200 })
    } catch (error) {
        console.error("Worker update failed:", error)
        return NextResponse.json({ error: "Failed to update Workers" }, { status: 500 })
    }
}