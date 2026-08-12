import { connectDB } from "@/lib/db";
import { User } from "@/models/user";
import { LoginSchema } from "@/app/schemas/auth";
import { compare} from "bcrypt-ts";
import { signInToken } from "@/lib/jwt";
import { cookies } from "next/headers";

export async function POST(request:Request){
    try {
        
        const body=await request.json()

        const parsed=LoginSchema.safeParse(body)
        if(!parsed.success){
                return Response.json(
                {error : "Invalid data",issues : parsed.error.issues},
                {status : 400}
            )
        }

        const {email,password}=parsed.data
        await connectDB()
        const findUser=await User.findOne({email})
        if(!findUser){
                return Response.json(
                {error : "Invalid email or password"},
                {status : 409}
            )
        }

        const result = await compare(password, findUser.password)

        if(!result){
            return Response.json(
                {error : "Invalid email or passwordd"},
                {status : 409}
            )
        }

    const token = signInToken({ userId: findUser._id.toString(), email: findUser.email,role: findUser.role });

    const cookieStore = await cookies();
    cookieStore.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

        return Response.json(
                {message : "LoggedIn sucessfully",user : findUser},
                {status : 201}
            )
        
    } catch (error) {
        console.error(error)
        return Response.json(
            {error : "something went wrong while login"},
            {status : 500}
        )
    }
}