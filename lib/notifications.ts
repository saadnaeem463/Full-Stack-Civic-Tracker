import { Notification } from "@/models/notification";
import { safeTrigger } from "@/lib/pusher";
import { USER_CHANNEL_PREFIX,NEW_NOTIFICATION_EVENT } from "@/lib/pusher-events";

export async function notify({recipient,type,message,report,triggeredBy} : {
    recipient : string,
    type : "upvote" | "comment" | "status_change" | "new_report" | "note_added",
    message : string,
    report? : string,
    triggeredBy? : string
}){
    try{
        const notification=await Notification.create({recipient,type,message,report,triggeredBy})

        await safeTrigger(`${USER_CHANNEL_PREFIX}-${String(recipient)}`,NEW_NOTIFICATION_EVENT,notification)

        return notification
    }catch(err){
        console.log("Notification failed : ",err)
    }
}
