import {z} from 'zod'
import { LoginSchema, SignupSchema } from '@/app/schemas/auth'

export async function signupUser(data : z.infer<typeof SignupSchema>){
            try {
            const response=await fetch("/api/auth/signup",{
                method : "POST",
                headers : {"Content-Type" : "application/json"},
                body : JSON.stringify(data)
            })

            const result=await response.json()
            
            if(!response.ok){
                throw new Error(result.error || "Sginup failed")
            }

            return result
        } catch (error) {
            return Response.json(
                {message  : "Something went wrong while signing up",errors : error},
                {status : 400}
            )
        }
}

export async function loginUser(data : z.infer<typeof LoginSchema>){
            try {
            const response=await fetch("/api/auth/login",{
                method : "POST",
                headers : {"Content-Type" : "application/json"},
                body : JSON.stringify(data)
            })

            const result=await response.json()
            
            if(!response.ok){
                return Response.json({error : "Invalid Email or password"},{status : 409})
            }

            return result
        } catch (error) {
            return Response.json(
                {message  : "Something went wrong while logging in",errors : error},
                {status : 400}
            )
        }
}

export async function getMe(){
    try {
        const response=await fetch("/api/auth/me",{
            method : "GET",
            headers : {"Content-Type" : "application/json"}
        })

        const result=await response.json()
        
        if(!response.ok){
            throw new Error(result.error || "Getting user failed")
        }

        return result
    } catch (error) {
        return Response.json(
            {message  : "Something went wrong while loading your account",errors : error},
            {status : 400}
        )
    }
}

export async function userLogout(){
        try {
        const response=await fetch("/api/auth/logout",{
            method : "POST",
            headers : {"Content-Type" : "application/json"}
        })

        const result=await response.json()
        
        if(!response.ok){
            throw new Error(result.error || "user logout failed")
        }

        return result
    } catch (error) {
        return Response.json(
            {message  : "Something went wrong while logging out",errors : error},
            {status : 400}
        )
    }
}