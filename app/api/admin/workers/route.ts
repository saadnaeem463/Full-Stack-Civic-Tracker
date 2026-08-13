import { connectDB } from "@/lib/db";
import { Workers } from "@/models/workers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req:NextRequest){
    try {
        await connectDB()
        const workers=await Workers.find({active : true}).sort({fullname : 1})
        return NextResponse.json({workers})
    } catch (err) {
        console.error("Fetch workers failed:", err)
    return NextResponse.json({ error: "Failed to fetch workers" }, { status: 500 })
    }
}