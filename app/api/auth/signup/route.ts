import { connectDB } from "@/lib/db";
import { User } from "@/models/user";
import { SignupSchema } from "@/app/schemas/auth";
import { hash} from "bcrypt-ts";
import { Resend } from "resend";
import verifyEmail from "@/emails/verify-email";
import { generateVerificationToken } from "@/lib/tokens";


const resend=new Resend(process.env.RESEND_API_KEY)

export async function POST(request:Request){
    try {
        const body=await request.json()

        //validate with same zod schema which my form already uses
        const parsed=SignupSchema.safeParse(body)

        if(!parsed.success){
            return Response.json(
                {error : "Invalid data",issues : parsed.error.issues},
                {status : 400}
            )
        }

        const {name,email,password}=parsed.data
        await connectDB()

        const existingUser= await User.findOne({email})
        if(existingUser){
            return Response.json(
                {error : "Email Already Exists"},
                {status : 409}
            )
        }

        const hashedPassword=await hash(password,10)
        const verificationToken=generateVerificationToken()
        const verificationTokenExpiry= new Date(Date.now()+1000*60*60*24); //24 hrs
        const newUser=await User.create(
            {name,email,password:hashedPassword,isVerified:false,verificationToken,verificationTokenExpiry}
        )

        const verifyUrl=`${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email?token=${verificationToken}`

        const {error}=await resend.emails.send({
            from : "onboarding@resend.dev",
            to : email,
            subject : "Verify your email",
            react : verifyEmail({verifyUrl,name})
        })

        if(error){
            console.error("Resend Error : ",error)
        }
        return Response.json(
            {message : 'User Created Sucessfully',userId : newUser._id},
            {status : 201}
        )
    } catch (error) {
        console.error(error)
        return Response.json(
            {error : "something went wrong while signup"},
            {status : 500}
        )
    }
}