import { cookies } from "next/headers";
import { verifyToken } from "./jwt";

export async function getAdmin(){
    const cookieStore=await cookies()
    const token=cookieStore.get("token")?.value as string
    return verifyToken(token)
}