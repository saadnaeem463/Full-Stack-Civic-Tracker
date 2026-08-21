
"use client"
import { LoginSchema } from '@/app/schemas/auth'
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
            
            router.push("/")
        } catch (error) {
            console.error("Login failed : ",error)
        }
    }

  return (
    <Card>
        {error && error.length>0 && 
            <p>{error}</p>
            }
        <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>Welcome back! Sign in to your account.</CardDescription>
        </CardHeader>

        <CardContent>
            <form onSubmit={form.handleSubmit(onsubmit)}>
                <FieldGroup className='gap-4'>
                    <Controller name="email" control={form.control} //connects the input to the react hook form
                     render={({field,fieldState})=>(
                        <Field>
                            <FieldLabel>Email</FieldLabel>
                            <Input aria-invalid={fieldState.invalid} placeholder='johndove123@gmail.com' type="email" {...field} />
                            {fieldState.invalid && (
                             <FieldError errors={[fieldState.error]} />   
                            )}
                        </Field>
                    )} />

                    <Controller name="password" control={form.control} //connects the input to the react hook form
                     render={({field,fieldState})=>(
                        <Field>
                            <FieldLabel>Passowrd</FieldLabel>
                            <Input aria-invalid={fieldState.invalid} placeholder='Type your password' type="password" {...field} />
                            {fieldState.invalid && (
                             <FieldError errors={[fieldState.error]} />   
                            )}
                        </Field>
                    )} />

                    <Button type='submit'>Login </Button>
                </FieldGroup>
            </form>
        </CardContent>
    </Card>
  )
}

