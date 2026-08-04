import { connectDB } from "@/lib/db";
import { User } from "@/models/user";
import { Card,CardContent,CardDescription,CardHeader,CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle2,XCircle } from "lucide-react";


interface verifyEmailPageProps{
    searchParams : Promise<{token? : string}>

}

async function verifyToken(token : string | undefined){
    if(!token){
        return {sucess : false , message : "No verification token provided"}
    }

    await connectDB();

    const user=await User.findOne({verificationToken : token})

    if(!user){
        return {sucess : false , message : "This verification link is invalid or already used"}
    }

    if(user.verificationTokenExpiry && user.verificationTokenExpiry < new Date()){
        return {success : false, message : "This verification link has expired"}
    }

    user.isVerified=true
    user.verificationToken=undefined
      user.verificationTokenExpiry = undefined
  await user.save()

  return { success: true, message: "Your email has been verified successfully." }
}

export default async function verifyEmailPage({searchParams} : verifyEmailPageProps){
    const {token}=await searchParams
    const result=await verifyToken(token)

  return (
    <Card>
      <CardHeader className="items-center text-center">
        {result.success ? (
          <CheckCircle2 className="size-10 text-green-500" />
        ) : (
          <XCircle className="size-10 text-red-500" />
        )}
        <CardTitle>{result.success ? "Email Verified" : "Verification Failed"}</CardTitle>
        <CardDescription>{result.message}</CardDescription>
      </CardHeader>

      <CardContent className="flex justify-center">
        <Link href="/auth/login" className={buttonVariants()}>
          Go to Login
        </Link>
      </CardContent>
    </Card>
  )
}