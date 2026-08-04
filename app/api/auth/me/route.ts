import { connectDB } from "@/lib/db";
import { User } from "@/models/user";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";

export async function GET(){
    const cookieStore= await cookies()
    const token=cookieStore.get("token")?.value

    if(!token){
        return Response.json({error : "Not authenticated"},{status : 401})
    }

    try{
        const decoded=verifyToken(token)
        await connectDB()
        const user=await User.findById(decoded.userId).select("-password")
        return Response.json({user})
    }catch {
    return Response.json({ error: "Invalid token" }, { status: 401 });
  }

}