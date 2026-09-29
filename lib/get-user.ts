import { NextRequest } from "next/server";
import { verifyToken } from "./jwt";

export function getUserFromRequest(req:NextRequest){
    const token=req.cookies.get("token")?.value

    if(!token){
        return null
    }

    try{
        return verifyToken(token)
    }catch(err){
        console.log("Token verification failed : ",err)
        return null
    }
}
