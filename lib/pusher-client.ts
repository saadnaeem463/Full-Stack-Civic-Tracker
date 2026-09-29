"use client"

import PusherClient from "pusher-js"

const NEXT_PUBLIC_PUSHER_KEY=process.env.NEXT_PUBLIC_PUSHER_KEY as string
const NEXT_PUBLIC_PUSHER_CLUSTER=process.env.NEXT_PUBLIC_PUSHER_CLUSTER as string


// Same trick as pusherServer, but using globalThis instead of global. In the browser, globalThis is basically window — the one object that persists across React re-renders/hot-reloads, so we stash the client there to avoid making a new one every time

let cached = (globalThis as any).pusherClient as PusherClient | undefined
 
export const pusherClient =
    cached ??
    ((globalThis as any).pusherClient = new PusherClient(NEXT_PUBLIC_PUSHER_KEY, {
        cluster: NEXT_PUBLIC_PUSHER_CLUSTER,
        // Required for private channels (private-user-{id}) — pusher-js POSTs
        // socket_id + channel_name here and the server decides if we may subscribe.
        authEndpoint: "/api/pusher/auth",
    }))

export { REPORTS_CHANNEL, NEW_REPORT_EVENT, COMMENTS_CHANNEL, NEW_COMMENTS_EVENT, UPVOTE_CHANNEL, NEW_UPVOTE_EVENT, BUDGET_CHANNEL, NEW_BUDGET_REQUEST_EVENT, BUDGET_REQUEST_RESOLVED_EVENT, USER_CHANNEL_PREFIX, NEW_NOTIFICATION_EVENT, REPORT_UPDATED_EVENT, REPORT_DELETED_EVENT } from "./pusher-events"