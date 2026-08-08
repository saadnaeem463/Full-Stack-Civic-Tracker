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
    }))

export { REPORTS_CHANNEL, NEW_REPORT_EVENT } from "./pusher-events"