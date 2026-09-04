import { AuditLog } from "@/models/audit-log";
import { Report } from "@/models/report";
import { User } from "@/models/user";
import { NextRequest, NextResponse } from "next/server";


export async function GET(req:NextRequest){
    try {
        const users=await User.find()
        if(!users){
            return NextResponse.json({error : "No users found"},{status : 404})
        }

        const reports=await Report.find()
        if(!reports){
            return NextResponse.json({error : "No reports found"},{status : 404})
        }

        const auditLogs=await AuditLog.find()
        if(!auditLogs){
            return NextResponse.json({error : "No Audits found"},{status : 404})
        }

        return NextResponse.json({users,reports,auditLogs},{status : 202})

    } catch (error) {
        console.log("Error : ",error)
        return NextResponse.json({error : "Something went wrong"},{status : 500})
    }
}