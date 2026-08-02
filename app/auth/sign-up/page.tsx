
"use client"
import { SignupSchema } from '@/app/schemas/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'

export default function SignUp(){

    const form=useForm({
        resolver : zodResolver(SignupSchema), //this line says whenever you need to validate, run the values through SignupSchema and report back errors
        defaultValues : {
            name :"",
            email:'',
            password:""
        }
    })

    function onsubmit(){
        console.log("Yooo Nigga")
    }

  return (
    <Card>
        <CardHeader>
            <CardTitle>Sign up </CardTitle>
            <CardDescription>Register Your Fking account here :D </CardDescription>
        </CardHeader>

        <CardContent>
            <form onSubmit={form.handleSubmit(onsubmit)}>
                <FieldGroup className='gap-4'>
                    <Controller name="name" control={form.control} //connects the input to the react hook form
                     render={({field,fieldState})=>(
                        <Field>
                            <FieldLabel>Full Name</FieldLabel>
                            <Input aria-invalid={fieldState.invalid} placeholder='John Dove' type="text" {...field} />
                            {fieldState.invalid && (
                             <FieldError errors={[fieldState.error]} />   
                            )}
                        </Field>
                    )} />
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

                    <Button type='submit'>Signup </Button>
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