import { Budget, SINGLETON_ID } from "@/models/budget";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req:NextRequest){
    try {
        const budget=await Budget.findById(SINGLETON_ID)
        return NextResponse.json({budget},{status : 202})
    } catch (error) {
        return NextResponse.json({error : "failed to fetch budget"},{status : 404})
    }
}

export async function POST(req:NextRequest){
    try {
        const amount=await req.json()
        const budget = await Budget.findByIdAndUpdate(
            SINGLETON_ID,
            { $inc: { Amount: Number(amount) } },
            { new: true, upsert: true }
        )
        return NextResponse.json({budget},{status : 202})
    } catch (error) {
        return NextResponse.json({error : "failed to post budget"},{status : 404})
    }
}