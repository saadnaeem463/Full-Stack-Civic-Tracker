import { connectDB } from "@/lib/db";
import { Report } from "@/models/report";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const reportId = searchParams.get("reportId");

        if (reportId) {
            const report = await Report.findById(reportId)
                .populate("assignedTo", "fullname email specialty status")
                .populate("userId", "name email");

            if (!report) {
                return NextResponse.json({ error: "Report not found" }, { status: 404 });
            }
            return NextResponse.json({ report });
        }

        const reports = await Report.find()
            .populate("assignedTo", "fullname email specialty status")
            .populate("userId", "name email")
            .sort({ createdAt: -1 });

        return NextResponse.json({ reports });
    } catch (error) {
        console.error("Failed to fetch reports:", error);
        return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
    }
}
