
import { connectDB } from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import { Report } from "@/models/report";
import { cookies } from "next/headers";
import { reportForm } from "@/app/schemas/auth";
import { pusherServer } from "@/lib/pusher";
import { REPORTS_CHANNEL,NEW_REPORT_EVENT } from "@/lib/pusher-events";
import { User } from "@/models/user";
import { notify } from "@/lib/notifications";

export async function POST(request:Request){
    const cookiesStore=await cookies()
    const token=cookiesStore.get("token")?.value

    if(!token){
        return Response.json({error : "Not authenticated"},{status : 401})
    }

    const payload=await request.json()
    const parsed=reportForm.safeParse(payload)
    
    if(!parsed.success){
        return Response.json(
            {error : "Invalid data",issues : parsed.error.issues},
            {status : 400}
        )
    }
    await connectDB()

    try{
        const user=verifyToken(token)
        const report=await Report.create({
        userId: user.userId,
        issueType: parsed.data.issueType,
        title: parsed.data.title,    
        details: parsed.data.details,
        lat: parsed.data.lat,
        lng: parsed.data.lng,
        media: parsed.data.media,
        accessibilityFlag: parsed.data.accessibilityFlag,
        location: parsed.data.location,
        neighborhood: parsed.data.neighborhood ?? null
        })

        pusherServer
        .trigger(REPORTS_CHANNEL,NEW_REPORT_EVENT,report)
        .catch((pusherErr) => console.error("Pusher trigger failed:", pusherErr));

        // Fan out to every staff member (admins AND moderators) at write time
        const reporter=await User.findById(user.userId)
        const staff=await User.find({role : {$in : ["admin","moderator"]}})
        for(const member of staff){
            // no point telling a staff member about a report they filed themselves
            if(member._id.toString()===String(user.userId)) continue
            await notify({
                recipient : member._id.toString(),
                type : "new_report",
                report : report._id.toString(),
                triggeredBy : user.userId,
                message : `New report "${report.title}" submitted by ${reporter?.name ?? "a citizen"}`
            })
        }

        return Response.json({report});
    }catch(err){
        console.error("Create report failed:", err);
        return Response.json({ error: "failed to submit on server" }, { status: 500 });
    }
}

export async function GET(){
    try{
        await connectDB()
        const reports=await Report.find().populate("userId", "name")
        if(!reports){
            return Response.json({error :"No reports found"},{status : 400})
        }

        return Response.json({reports},{status : 200})
    }catch(error){
        console.error("Error while fetching Reports : ",error)
        return Response.json({error :"Something went wrong when fething reports"},{status : 400})
    }
}