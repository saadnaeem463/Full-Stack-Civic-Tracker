import { connectDB } from "@/lib/db";
import { Notification } from "@/models/notification";
import { NextRequest,NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/get-user";

export async function PATCH(req:NextRequest,{params} : {params : Promise<{id : string}>}){
    try{
        const user=getUserFromRequest(req)
        if(!user){
            return NextResponse.json({error : "Not authenticated"},{status : 401})
        }

        const {id}=await params

        await connectDB()
        // recipient is part of the filter on purpose — a valid id belonging to
        // someone else must come back as 404, not get marked as read.
        const notification=await Notification.findOneAndUpdate(
            {_id : id,recipient : user.userId},
            {read : true},
            {new : true}
        )

        if(!notification){
            return NextResponse.json({error : "Notification not found"},{status : 404})
        }

        return NextResponse.json({notification})
    }catch(err){
        console.log(err)
        return NextResponse.json({error : "Failed to mark notification as read"},{status : 500})
    }
}
