import { connectDB } from "@/lib/db";
import { Report } from "@/models/report";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";

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

    findReport.comments.push({ comment: payload.comment, postUserId: decode.userId });
    await findReport.save();

    return NextResponse.json({ payload: payload });
  } catch (err) {
    console.error("Error ", err);
    return NextResponse.json({ error: "failed to post comment" }, { status: 401 });
  }
}