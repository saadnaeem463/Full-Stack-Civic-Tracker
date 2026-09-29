import { NextRequest,NextResponse } from "next/server";
import { pusherServer } from "@/lib/pusher";
import { getUserFromRequest } from "@/lib/get-user";
import { USER_CHANNEL_PREFIX } from "@/lib/pusher-events";

export async function POST(req:NextRequest){
    try{
        const user=getUserFromRequest(req)
        if(!user){
            return NextResponse.json({error : "Not authenticated"},{status : 401})
        }

        const formData=await req.formData()
        const socketId=formData.get("socket_id") as string
        const channelName=formData.get("channel_name") as string

        if(!socketId || !channelName){
            return NextResponse.json({error : "socket_id and channel_name are required"},{status : 400})
        }

        // The user may ONLY subscribe to their own private channel — without this
        // check anyone logged in could listen to another user's notifications.
        if(channelName!==`${USER_CHANNEL_PREFIX}-${user.userId}`){
            return NextResponse.json({error : "Not authorized for this channel"},{status : 403})
        }

        const authResponse=pusherServer.authorizeChannel(socketId,channelName)
        return NextResponse.json(authResponse)
    }catch(err){
        console.log(err)
        return NextResponse.json({error : "Failed to authorize channel"},{status : 500})
    }
}
