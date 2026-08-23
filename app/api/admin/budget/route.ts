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
        console.log(amount)

        const budget=await Budget.create({_id  :SINGLETON_ID,Amount:amount})
        return NextResponse.json({budget},{status : 202})
    } catch (error) {
        return NextResponse.json({error : "failed to post your fking budget"},{status : 404})
    }
}