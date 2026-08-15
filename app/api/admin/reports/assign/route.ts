import { connectDB } from "@/lib/db";
import { Report } from "@/models/report";
import { Workers } from "@/models/workers";
import { pusherServer } from "@/lib/pusher";
import { NextRequest,NextResponse } from "next/server";
import { REPORTS_CHANNEL,NEW_REPORT_EVENT } from "@/lib/pusher-events";
import { getAdmin } from "@/lib/get-admin";

export async function PATCH(req:NextRequest){
    try{
        const admin=await getAdmin()
        const {reportId,workerId}=await req.json()

        if(!reportId){
            return NextResponse.json({error : "reportId is required"},{status : 400})
        }

        await connectDB()
        const report=await Report.findById(reportId)

        if(!report){
            return NextResponse.json({error : "report doesn't exists"},{status : 404})
        }

        if(report.assignedTo){
            await Workers.findByIdAndUpdate(report.assignedTo,{
                currentReport :null,
                status : "Free"
            })
        }

        if(!workerId){
            return NextResponse.json({error : "workerID is required"},{status : 404})
        }
        const worker=await Workers.findById(workerId)
        if(!worker){
            return NextResponse.json({error : "worker doesn't exists"},{status : 404})
        }

        worker.currentReport=report._id
        worker.status="Busy"
        await worker.save()

        report.assignedTo=workerId || null
        await report.save()

        pusherServer
        .trigger(REPORTS_CHANNEL,NEW_REPORT_EVENT,{reportId,workerId})
        .catch((err)=>console.log("Pusher Trigger Failed : ",err))
    }catch(error){
        console.error("Worker update failed:", error)
        return NextResponse.json({ error: "Failed to update Workers" }, { status: 500 })
    }
}