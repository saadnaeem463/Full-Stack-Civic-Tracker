import { connectDB } from "@/lib/db";
import { Report } from "@/models/report";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import { User } from "@/models/user";
import {COMMENTS_CHANNEL,NEW_COMMENTS_EVENT} from "@/lib/pusher-events"
import { pusherServer } from "@/lib/pusher";

interface PayloadProps {
  comment: string;
  reportId: string;
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await connectDB();
    const decode = verifyToken(token);
    const payload: PayloadProps = await req.json();

    const findReport = await Report.findOne({ _id: payload.reportId });
    if (!findReport) {
      return NextResponse.json({ error: "Report Doesn't Exist" }, { status: 404 });
    }

    const user=await User.findById(decode.userId)
    if(!user){
      return NextResponse.json({ error: "User doesn't exists" }, { status: 404 });
    }

    findReport.comments.push({ text: payload.comment, author:user.name  });
    findReport.commentCount++
    await findReport.save();

    const newComment=findReport.comments[findReport.comments.length-1]
    pusherServer
    .trigger(COMMENTS_CHANNEL,NEW_COMMENTS_EVENT,{
        _id : newComment._id,
        author:newComment.author,
        text:newComment.text,
        createdAt:newComment.createdAt,
        reportId: findReport._id
    })

    return NextResponse.json({ payload: payload });
  } catch (err) {
    console.error("Error ", err);
    return NextResponse.json({ error: "failed to post comment" }, { status: 401 });
  }
}

export async function GET(req:NextRequest){
  try{
      const { searchParams } = new URL(req.url)
      const id = searchParams.get("reportId")
      if(!id){
        return NextResponse.json({error : "reportId is required"},{status : 400})
      }

      await connectDB()
      const report=await Report.findById(id)
      if(!report){
        return NextResponse.json({error : "Report doesn't exist"},{status : 404})
      }

      return NextResponse.json({data : report.comments})
  }catch(err){
    console.error(err)
    return NextResponse.json({error : "Error while fetching comments"},{status : 500})
  }
}