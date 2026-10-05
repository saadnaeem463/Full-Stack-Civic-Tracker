import { connectDB } from "@/lib/db";
import { Report } from "@/models/report";
import { safeTrigger } from "@/lib/pusher";
import { NextRequest, NextResponse } from "next/server";
import { REPORTS_CHANNEL, REPORT_DELETED_EVENT } from "@/lib/pusher-events";
import { getAdmin } from "@/lib/get-admin";

export async function DELETE(req: NextRequest) {
    try {
        const admin = await getAdmin()
        const { searchParams } = req.nextUrl
        const reportId = searchParams.get("reportId")

        if (!reportId) {
            return NextResponse.json({ error: "Report ID is required" }, { status: 400 })
        }

        await connectDB()
        const report = await Report.findById(reportId)

        if (!report) {
            return NextResponse.json({ error: "Report not found" }, { status: 404 })
        }

        await Report.findByIdAndDelete(reportId)

        await safeTrigger(REPORTS_CHANNEL, REPORT_DELETED_EVENT, { reportId })

        return NextResponse.json({ message: "Report deleted successfully" })
    } catch (error) {
        console.error("Delete report failed:", error)
        return NextResponse.json({ error: "Failed to delete report" }, { status: 500 })
    }
}