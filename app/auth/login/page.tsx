
"use client"
import { LoginSchema } from '@/app/schemas/auth'
import { Alert, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import {z} from 'zod'
import { loginUser} from '@/lib/services/auth.services'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'

export default function Login(){
    const [error,setErrors]=useState("")
    const router= useRouter()
    const form=useForm({
        resolver : zodResolver(LoginSchema), //this line says whenever you need to validate, run the values through SignupSchema and report back errors
        defaultValues : {
            email:'',
            password:""
        }
    })

   async function onsubmit(data : z.infer<typeof LoginSchema>){
        try {
            const result=await loginUser(data)
            
            if(!result.user){
                setErrors('Invalid Email or password')
                return
            }
            
            // staff land on their portal, citizens on the map
            const role = result.user.role
            router.push(role === "admin" || role === "moderator" ? "/admin/dashboard" : "/")
            router.refresh()
        } catch (error) {
            console.error("Login failed : ",error)
            setErrors("Could not sign you in, please try again")
        }
    }

  return (
    <Card>
        <CardHeader>
            <CardTitle className="text-xl">Welcome back</CardTitle>
            <CardDescription>Sign in to report issues and follow their progress.</CardDescription>
        </CardHeader>

        <CardContent>
            <form onSubmit={form.handleSubmit(onsubmit)}>
                <FieldGroup className='gap-4'>
                    {error && error.length>0 &&
                        <Alert variant="destructive" className="flex items-center gap-2" role="alert">
                            <AlertTitle>{error}</AlertTitle>
                        </Alert>
                        }
                    <Controller name="email" control={form.control} //connects the input to the react hook form
                     render={({field,fieldState})=>(
                        <Field>
                            <FieldLabel htmlFor="login-email">Email</FieldLabel>
                            <Input id="login-email" aria-invalid={fieldState.invalid} placeholder='johndove123@gmail.com' type="email" autoComplete="email" {...field} />
                            {fieldState.invalid && (
                             <FieldError errors={[fieldState.error]} />   
                            )}
                        </Field>
                    )} />

                    <Controller name="password" control={form.control} //connects the input to the react hook form
                     render={({field,fieldState})=>(
                        <Field>
                            <FieldLabel htmlFor="login-password">Password</FieldLabel>
                            <Input id="login-password" aria-invalid={fieldState.invalid} placeholder='Type your password' type="password" autoComplete="current-password" {...field} />
                            {fieldState.invalid && (
                             <FieldError errors={[fieldState.error]} />   
                            )}
                        </Field>
                    )} />

                    <Button type='submit' disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? "Signing in…" : "Login"}
                    </Button>
                    <p className="text-center text-sm text-muted-foreground">
                        New to CivicTrack?{' '}
                        <Link href="/auth/sign-up" className="font-semibold text-primary hover:underline">Create an account</Link>
                    </p>
                </FieldGroup>
            </form>
        </CardContent>
    </Card>
  )
}

