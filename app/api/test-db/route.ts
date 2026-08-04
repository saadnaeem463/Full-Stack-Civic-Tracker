import { connectDB } from "@/lib/db";

export async function GET(){
    await connectDB()
    return Response.json({message : "Connect to Local Mongodb sucessfully"})
}