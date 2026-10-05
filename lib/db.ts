import mongoose from "mongoose"

// Register every model here. populate() looks models up by name, and on Vercel each route
// runs in its own isolated function, so a route that only imports Report would crash with
// "Schema hasn't been registered for model User" the moment it populates userId.
import "@/models/user"
import "@/models/report"
import "@/models/workers"
import "@/models/budget"
import "@/models/category-budget"
import "@/models/expense"
import "@/models/budget-request"
import "@/models/audit-log"
import "@/models/notification"

const MONGODB_URI=process.env.MONGODB_URI as string;

if(!MONGODB_URI){
    throw new Error("Please define the MONGODB_URI environment variable in .env")
}

type Cache = { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null }
const globalWithMongoose = global as typeof globalThis & { mongoose?: Cache }
const cached: Cache = globalWithMongoose.mongoose ?? (globalWithMongoose.mongoose = { conn: null, promise: null })

export async function connectDB(){
    if(cached.conn){
        return cached.conn
    }

    if(!cached.promise){
        cached.promise=mongoose.connect(MONGODB_URI,{
            // fail fast with a real error instead of hanging until the platform kills the request
            serverSelectionTimeoutMS: 8000,
        })
    }

    try{
        cached.conn=await cached.promise
    }catch(error){
        // a rejected promise must not be cached, or every later request on this instance fails too
        cached.promise=null
        throw error
    }
    return cached.conn
}
