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





























// Normally, when Node loads a file like lib/db.ts, it caches the whole module. So a top-level variable like:

// ts
// let cached = { conn: null }

// only runs once — every other file that imports db.ts gets the same cached object, because Node reuses the cached module instead of re-running the file.

// The problem: Next.js's dev server does hot-reloading — when you save a file, it re-runs (re-imports fresh) some of your modules so your changes show up without a full restart. If lib/db.ts gets re-run, that let cached = { conn: null } line executes again, wiping out your old connection and creating a brand new one. Do this a few times while coding and you can end up with dozens of open Mongo connections, since the old ones never got cleaned up.

// Why global fixes it: global isn't part of any module — it's one single object that belongs to the whole running Node process itself, not to any file. Even if lib/db.ts gets re-imported and re-run ten times, there's still only one global object underneath, unaffected by module reloading. So storing the connection as global.mongoose instead of a plain let variable means it survives those reloads — the tenth re-run checks global.mongoose, sees it's already there, and reuses it instead of creating a new one.

// In production this trick barely matters (files aren't hot-reloading), but it's cheap insurance and it's a very common pattern in Next.js projects for exactly this dev-mode reason