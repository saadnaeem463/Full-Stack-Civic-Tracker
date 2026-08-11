import { connectDB } from "@/lib/db";
import { Report } from "@/models/report";
import { UPVOTE_CHANNEL,NEW_UPVOTE_EVENT } from "@/lib/pusher-events";
import { pusherServer } from "@/lib/pusher";
import { cookies } from "next/headers";
import { NextRequest,NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";

export async function PUT(req:NextRequest){
    try{
        const cookieStore=await cookies()
        const token=cookieStore.get("token")?.value

        if(!token){
            return NextResponse.json({error : "User Not authenticated"},{status : 401})
        }

        const decoded=verifyToken(token)

        await connectDB()
        const {searchParams}=new URL(req.url)
        const id=searchParams.get("reportId")

        if(!id){
            return NextResponse.json({error : "reportId is required"},{status : 400})
        }

        const findReport=await Report.findById(id)
        if(!findReport){
            return NextResponse.json({error : "report doesn't exist"},{status : 400})
        }

        const alreadyUpVoted=findReport.upVotedBy.some((voterId)=>voterId.toString()===decoded.userId)
        if(alreadyUpVoted){
            findReport.upVotedBy = findReport.upVotedBy.filter((voterId)=>voterId.toString()!==decoded.userId)
        }else{
            findReport.upVotedBy.push(decoded.userId)
        }
        await findReport.save()

        const upVoteCount=findReport.upVotedBy.length

        pusherServer
        .trigger(UPVOTE_CHANNEL,NEW_UPVOTE_EVENT,{
            reportId: findReport._id,
            upVoteCount
        })

        return NextResponse.json({ upVoteCount, hasUpvoted: !alreadyUpVoted},{status : 202})
    }catch(err){
        console.log(err)
        return NextResponse.json({error : "Failed to upvote"},{status : 400})
    }
}

export async function GET(req:NextRequest){
    try{
        const cookieStore=await cookies()
        const token=cookieStore.get("token")?.value

    if (!token) {
      return NextResponse.json({ upVoteCount: 0, hasUpvoted: false })
    }

    const decoded=verifyToken(token)

    await connectDB()
    const {searchParams}=new URL(req.url)
    const id=searchParams.get("reportId")

    if(!id){
        return NextResponse.json({error : "ReportId is required"},{status : 402})
    }

    const findReport=await Report.findById(id)
    if (!findReport) return NextResponse.json({ error: "report doesn't exist" }, { status: 404 })

    const hasUpvoted=findReport.upVotedBy.some((voterId)=> voterId.toString()===decoded.userId.toString())

    return NextResponse.json({upVoteCount : findReport.upVotedBy.length,hasUpvoted})
    }catch(err){
    console.log(err)
    return NextResponse.json({ error: "Failed to fetch upvote status" }, { status: 500 })
    }
}