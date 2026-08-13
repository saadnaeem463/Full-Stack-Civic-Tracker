import { connectDB } from "@/lib/db";
import { Report } from "@/models/report";
import { pusherServer } from "@/lib/pusher";
import { NextRequest,NextResponse } from "next/server";
import { REPORTS_CHANNEL,NEW_REPORT_EVENT } from "@/lib/pusher-events";
import { getAdmin } from "@/lib/get-admin";

const VALID_STATUSES = ["Reported", "Acknowledged", "In progress", "Resolved"]

export async function PATCH(request:NextRequest){
    try {
        const admin=await getAdmin()
        const {reportIds,status}=await request.json()

        if(!Array.isArray(reportIds) || reportIds.length==0){
            return NextResponse.json({error : "ReportId's Must be a non empty array"},{status : 400})
        }

        if(!VALID_STATUSES.includes(status)){
            return NextResponse.json({error : "Invalid Status"},{status : 400})
        }

        await connectDB()

        const reports=await Report.find({_id : {$in : reportIds}})
        if(reports.length==0){
            return NextResponse.json({error : "No match report found"},{status : 404})
        }

        for (const report in reports){
            report.status=status
            report.history.push({status,by : admin.email})
            await report.save()
        }

        pusherServer
        .trigger(REPORTS_CHANNEL,NEW_REPORT_EVENT,{reportIds,status})
        .catch((err)=>console.log("Pusher trigger failed : ",err))

        return NextResponse.json({updated: reports.length})
    } catch (error) {
        console.error("Status update failed:", error)
        return NextResponse.json({ error: "Failed to update status" }, { status: 500 })
    }
}