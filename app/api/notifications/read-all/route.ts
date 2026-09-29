import { connectDB } from "@/lib/db";
import { Notification } from "@/models/notification";
import { NextRequest,NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/get-user";

export async function PATCH(req:NextRequest){
    try{
        const user=getUserFromRequest(req)
        if(!user){
            return NextResponse.json({error : "Not authenticated"},{status : 401})
        }

        await connectDB()
        const result=await Notification.updateMany(
            {recipient : user.userId,read : false},
            {read : true}
        )

        return NextResponse.json({updated : result.modifiedCount})
    }catch(err){
        console.log(err)
        return NextResponse.json({error : "Failed to mark notifications as read"},{status : 500})
    }
}
