
import { connectDB } from "@/lib/db";
import { AuditLog } from "@/models/audit-log";
import { NextRequest, NextResponse } from "next/server";


export async function GET(req:NextRequest){
    try {
        await connectDB()
        const audits=await AuditLog.find()
        if(!audits){
            return NextResponse.json({error  :"No audits found"},{status : 404})
        }
        return NextResponse.json({audits},{status : 404})
    } catch (error) {
        console.log(error)
        return NextResponse.json({error  :"Error while fetching audits"},{status : 500})
    }
}

export async function POST(req:NextRequest){
    try {
        const payload=await req.json()
        if(!payload){
            return NextResponse.json({error : "Not payload provided"},{status : 404})
        }
        const {actorId,actorName,actorRole,action,message}=payload
        await connectDB()

        const audit=await AuditLog.create({
            actorId,
            actorRole,
            actorName,
            action,
            message
        })

        return NextResponse.json({message : "Audit Added sucessfully",audit},{status : 202})

    }catch(error) {
        console.log(error)
    }
}