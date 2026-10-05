import PusherServer from "pusher"

const PUSHER_APP_ID=process.env.PUSHER_APP_ID as string
const PUSHER_KEY=process.env.PUSHER_KEY as string
const PUSHER_SECRET=process.env.PUSHER_SECRET as string
const PUSHER_CLUSTER=process.env.PUSHER_CLUSTER as string

if(!PUSHER_APP_ID || !PUSHER_KEY || !PUSHER_SECRET || !PUSHER_CLUSTER){
    throw new Error("Please define the PUSHER_* environment variables in .env")
}

// One instance reused across requests (same pattern as connectDB's cached connection) —
// avoids re-creating the client on every hot-reload in dev.


let cached=(global as any).pusherServer as PusherServer | undefined

export const pusherServer=
    cached ?? 
    ((global as any).pusherServer=new PusherServer({
        appId : PUSHER_APP_ID,
        key: PUSHER_KEY,
        secret: PUSHER_SECRET,
        cluster: PUSHER_CLUSTER,
        useTLS: true,
    }))

/**
 * Trigger a Pusher event and WAIT for it. On Vercel the function is frozen as soon as the
 * response is sent, so an un-awaited trigger is often never delivered (that is why changes only
 * showed up after a hard reload). Failures are logged and swallowed so realtime can never break a save.
 */
export async function safeTrigger(channel: string, event: string, data: unknown) {
    try {
        await pusherServer.trigger(channel, event, data)
    } catch (err) {
        console.error(`Pusher trigger failed (${channel}/${event}):`, err)
    }
}
