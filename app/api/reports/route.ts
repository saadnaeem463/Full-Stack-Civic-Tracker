
import { connectDB } from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import { Report } from "@/models/report";
import { cookies } from "next/headers";
import { reportForm } from "@/app/schemas/auth";
import { pusherServer } from "@/lib/pusher";
import { REPORTS_CHANNEL,NEW_REPORT_EVENT } from "@/lib/pusher-events";

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