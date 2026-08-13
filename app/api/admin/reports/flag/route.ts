import { connectDB } from "@/lib/db";
import { Report } from "@/models/report";
import { pusherServer } from "@/lib/pusher";
import { NextRequest,NextResponse } from "next/server";
import { REPORTS_CHANNEL,NEW_REPORT_EVENT } from "@/lib/pusher-events";
import { getAdmin } from "@/lib/get-admin";

export async function PATCH(req:NextRequest){
    try {
        const admin=await getAdmin()
        const {reportId,reason}=await req.json()

        if(!reportId || !reason?.trim()){
            return NextResponse.json({error : "ReportID or Reason is mandatory"},{status : 400})
        }

        await connectDB()
        const report=await Report.findById(reportId)
        if(report){
            return NextResponse.json({error : "Report doesn't exists"},{status : 404})
        }

        report.suspicious=!report.suspicious
        report.internalNotes.push({
            author : admin.email,
            text: `${report.suspicious ? "Flagged" : "Unflagged"} as fake report: ${reason.trim()}`
        })

        await report.save()
        pusherServer
        .trigger(REPORTS_CHANNEL,NEW_REPORT_EVENT,{reportId,suspicious: report.suspicious})
        .catch((err)=>console.log("Pusher Trigger failed : ",err))

        return NextResponse.json({ suspicious: report.suspicious })
  } catch (err) {
    console.error("Flag failed:", err)
    return NextResponse.json({ error: "Failed to flag report" }, { status: 500 })
  }
}