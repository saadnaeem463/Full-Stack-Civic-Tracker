import { connectDB } from "@/lib/db";
import { Budget, SINGLETON_ID } from "@/models/budget";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req:NextRequest){
    try {
        await connectDB()
        const budget=await Budget.findById(SINGLETON_ID)
        return NextResponse.json({budget},{status : 202})
    } catch (error) {
        console.error("admin/budget failed:", error)
        return NextResponse.json({error : "failed to fetch budget"},{status : 500})
    }
}

export async function POST(req:NextRequest){
    try {
        await connectDB()
        const amount=await req.json()
        const budget = await Budget.findByIdAndUpdate(
            SINGLETON_ID,
            { $inc: { Amount: Number(amount) } },
            { new: true, upsert: true }
        )
        return NextResponse.json({budget},{status : 202})
    } catch (error) {
        console.error("admin/budget failed:", error)
        return NextResponse.json({error : "failed to post budget"},{status : 500})
    }
}