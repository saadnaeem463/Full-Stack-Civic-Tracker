import { connectDB } from "@/lib/db";
import { Report } from "@/models/report";
import { pusherServer } from "@/lib/pusher";
import { NextRequest,NextResponse } from "next/server";
import { REPORTS_CHANNEL,NEW_REPORT_EVENT } from "@/lib/pusher-events";
import { getAdmin } from "@/lib/get-admin";

export async function POST(req:NextRequest){
    try {
    const admin=await getAdmin()
    const {reportId,note}=await req.json()

    if(!reportId || !note?.trim()){
        return NextResponse.json({error : "ReportID or note is mandatory"},{status : 400})
    }

    await connectDB()
    const report=await Report.findById(reportId)

    if(!report){
        return NextResponse.json({error : "Report doesn't exists"},{status : 404})
    }

    report.internalNotes.push({author : admin.email, text : note.trim()})
    await report.save()

    return NextResponse.json({note : report.internalNotes[report.internalNotes.length-1]})

    } catch (error) {
    console.error("Add note failed:", error)
    return NextResponse.json({ error: "Failed to add note" }, { status: 500 })
    }
}