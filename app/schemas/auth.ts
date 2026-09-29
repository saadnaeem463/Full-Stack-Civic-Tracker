import z, { number } from 'zod'

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

// profile details (PATCH /api/profile) — password is intentionally NOT part of this schema
export const UpdateProfileSchema = z.object({
    name : z.string("Can have only letters").min(3,"Min length must be 3").max(30,"Max length exceeded"),
    email: z.email("Invalid Email"),
    avatar: z.url("Invalid image URL").or(z.literal("")).optional()
})

// client side change-password form (includes confirmation field)
export const ChangePasswordSchema = z.object({
    currentPassword : z.string().min(8,"Min length must be 8").max(30,"Max length exceeded"),
    newPassword : z.string().min(8,"Min length must be 8").max(30,"Max length exceeded"),
    confirmNewPassword : z.string().min(8,"Min length must be 8").max(30,"Max length exceeded")
}).refine((values)=>values.newPassword===values.confirmNewPassword,{
    message : "Passwords do not match",
    path : ["confirmNewPassword"]
})

// server side change-password payload (PATCH /api/profile/password)
export const ChangePasswordInputSchema = z.object({
    currentPassword : z.string().min(8,"Min length must be 8").max(30,"Max length exceeded"),
    newPassword : z.string().min(8,"Min length must be 8").max(30,"Max length exceeded")
})

export const reportForm = z.object({
  issueType: z.string("Describe using letters"),
  title: z.string("Enter a title"),
  details: z.string("Enter details"),
  lat: z.number(),
  lng: z.number(),
  media: z.array(
    z.object({
      url: z.string(),
      type: z.string(),
      poster: z.string().optional(),
    })
  ),
  accessibilityFlag: z.boolean(),
  location : z.string(),
  neighborhood: z.string().nullable().optional(),
});