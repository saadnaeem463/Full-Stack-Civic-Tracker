import z from 'zod'

export const SignupSchema=z.object({
    name : z.string("Can have only letters").min(3,"Min length must be 3").max(30,"Max length exceeded"),
    email: z.email("Invalid Email"),
    password : z.string().min(8,"Min length must be 8").max(30,"Max length exceeded")
})

// app/schemas/auth.ts
export const LoginSchema = z.object({
    email: z.email("Invalid Email"),
    password: z.string().min(8, "Min length must be 8").max(30, "Max length exceeded")
})