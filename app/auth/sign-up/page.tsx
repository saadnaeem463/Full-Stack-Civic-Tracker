
"use client"
import { SignupSchema } from '@/app/schemas/auth'
import { Alert, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import {z} from 'zod'
import { toast } from 'sonner'
import { signupUser } from '@/lib/services/auth.services'
import Link from 'next/link'
import { CheckCircle2Icon } from 'lucide-react'
import { motion } from '@/components/motion'

export default function SignUp(){

    const router=useRouter()
    const [success,setSuccess]=useState(false)
    const [error,setError]=useState("")

    const form=useForm({
        resolver : zodResolver(SignupSchema), //this line says whenever you need to validate, run the values through SignupSchema and report back errors
        defaultValues : {
            name :"",
            email:'',
            password:""
        }
    })

   async function onsubmit(data : z.infer<typeof SignupSchema>){
        try {
            const result=await signupUser(data)

            if(result?.userId){
                setError("")
                setSuccess(true)
                toast.success("Account created successfully, redirecting to login…")
                setTimeout(()=>router.push("/auth/login"),1800)
            }else{
                setSuccess(false)
                setError("Could not create your account, please try again")
            }
        } catch (error) {
            console.error("Signup failed : ",error)
            setSuccess(false)
            setError("Could not create your account, please try again")
        }
    }

  if (success) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center" role="status" aria-live="polite">
          <motion.span
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 16 }}
            className="grid h-14 w-14 place-items-center rounded-full bg-success/10 text-success"
          >
            <CheckCircle2Icon size={30} aria-hidden="true" />
          </motion.span>
          <h2 className="text-lg font-semibold">Account created successfully</h2>
          <p className="max-w-xs text-sm text-muted-foreground">
            Taking you to the login page… If nothing happens,{" "}
            <Link href="/auth/login" className="font-semibold text-primary hover:underline">sign in here</Link>.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
        <CardHeader>
            <CardTitle className="text-xl">Create your account</CardTitle>
            <CardDescription>Join CivicTrack to report issues and follow their progress.</CardDescription>
        </CardHeader>

        <CardContent>
            <form onSubmit={form.handleSubmit(onsubmit)}>
                <FieldGroup className='gap-4'>
                    {error && (
                        <Alert variant="destructive" className="flex items-center gap-2">
                            <AlertTitle>{error}</AlertTitle>
                        </Alert>
                    )}
                    <Controller name="name" control={form.control} //connects the input to the react hook form
                     render={({field,fieldState})=>(
                        <Field>
                            <FieldLabel htmlFor="signup-name">Full Name</FieldLabel>
                            <Input id="signup-name" aria-invalid={fieldState.invalid} placeholder='John Dove' type="text" autoComplete="name" {...field} />
                            {fieldState.invalid && (
                             <FieldError errors={[fieldState.error]} />   
                            )}
                        </Field>
                    )} />
                    <Controller name="email" control={form.control} //connects the input to the react hook form
                     render={({field,fieldState})=>(
                        <Field>
                            <FieldLabel htmlFor="signup-email">Email</FieldLabel>
                            <Input id="signup-email" aria-invalid={fieldState.invalid} placeholder='johndove123@gmail.com' type="email" autoComplete="email" {...field} />
                            {fieldState.invalid && (
                             <FieldError errors={[fieldState.error]} />   
                            )}
                        </Field>
                    )} />

                    <Controller name="password" control={form.control} //connects the input to the react hook form
                     render={({field,fieldState})=>(
                        <Field>
                            <FieldLabel htmlFor="signup-password">Password</FieldLabel>
                            <Input id="signup-password" aria-invalid={fieldState.invalid} placeholder='Type your password' type="password" autoComplete="new-password" {...field} />
                            {fieldState.invalid && (
                             <FieldError errors={[fieldState.error]} />   
                            )}
                        </Field>
                    )} />

                    <Button type='submit' disabled={success || form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? "Creating account…" : "Signup"}
                    </Button>
                    <p className="text-center text-sm text-muted-foreground">
                        Already have an account?{' '}
                        <Link href="/auth/login" className="font-semibold text-primary hover:underline">Sign in</Link>
                    </p>
                </FieldGroup>
            </form>
        </CardContent>
    </Card>
  )
}


// libraries use
//React Hook Form for validation -->validates the rules and gives error if found
//hookform/resolvers zod  --> acts as a bridge between React Hook Form and Zod  
//Zod for creating schema --> makes the rules