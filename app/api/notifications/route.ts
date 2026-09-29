import { connectDB } from "@/lib/db";
import { Notification } from "@/models/notification";
import { NextRequest,NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/get-user";

export async function GET(req:NextRequest){
    try{
        const user=getUserFromRequest(req)
        if(!user){
            return NextResponse.json({error : "Not authenticated"},{status : 401})
        }

        await connectDB()
        const [notifications,unreadCount]=await Promise.all([
            Notification.find({recipient : user.userId}).sort({createdAt : -1}).limit(30),
            Notification.countDocuments({recipient : user.userId,read : false})
        ])

        return NextResponse.json({notifications,unreadCount})
    }catch(err){
        console.log(err)
        return NextResponse.json({error : "Failed to fetch notifications"},{status : 500})
    }
}
