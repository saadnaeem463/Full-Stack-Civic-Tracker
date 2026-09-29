import { Resend } from "resend";
import verifyEmail from "@/emails/verify-email";

/**
 * Best effort verification mail. Never throws — a mail provider hiccup must not
 * fail the request that triggered it (the token is already stored on the user).
 */
export async function sendVerificationEmail({
    email,
    name,
    verifyUrl
} : {
    email : string,
    name : string,
    verifyUrl : string
}){
    try{
        const apiKey=process.env.RESEND_API_KEY
        if(!apiKey){
            console.error("Verification mail skipped : RESEND_API_KEY is missing")
            return false
        }

        const resend=new Resend(apiKey)
        const {error}=await resend.emails.send({
            from : "onboarding@resend.dev",
            to : email,
            subject : "Verify your email",
            react : verifyEmail({verifyUrl,name})
        })

        if(error){
            console.error("Verification mail failed : ",error)
            return false
        }

        return true
    }catch(error){
        console.error("Verification mail failed : ",error)
        return false
    }
}
