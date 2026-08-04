"use client"
import Link from "next/link"
import { Button, buttonVariants } from "../ui/button"
import { ThemeToggle } from "./theme-toggle"
import { getMe,userLogout } from "@/lib/services/auth.services"
import { useEffect, useState } from "react"
import type {  User } from "@/types/user"
import { useRouter } from "next/navigation"


export function Navbar() {

    const [user,setUser]=useState<User | null>(null)
    const [loading,setLoading]=useState(true)
    const router=useRouter()

  useEffect(()=>{
    try {
        const getUser=async()=>{
          const response=await getMe()
          setUser(response.user)
        }
  
        getUser()
    } catch (error) {
        console.log(error)
    } finally {
      setLoading(false);
    }
  },[])

  async function handleLogout(){
        await userLogout()
        setUser(null)
        router.push('/auth/login')
  }
  
    return(
        <nav className="w-full py-5 flex items-center justify-between">
            <div className="flex items-center gap-8">
                <Link href="/">
                    <h1 className="text-3xl font-bold">
                        Next<span className="text-blue-500">Pro</span>
                    </h1>
                </Link>
            </div>

            <div className="flex items-center gap-2">
                <Link className={buttonVariants({variant : "ghost"})} href='/'>Home</Link>
                <Link className={buttonVariants({variant : "ghost"})} href='/blog'>Blog</Link>
                <Link className={buttonVariants({variant : "ghost"})} href='/create'>Create</Link>
            </div>

            <div className="flex items-center gap-2">
                {loading ? null : user ? (
                    <>
                        <span>Hi , {user?.name}</span>
                        <Button onClick={handleLogout}>Logout</Button>
                    </>
                ):(
                    <>
                        <Link className={buttonVariants()} href='/auth/sign-up'>Sign up</Link>
                        <Link className={buttonVariants({variant : "secondary"})} href='/auth/login'>Login</Link>
                        <ThemeToggle />
                    </>
                )}
            </div>
        </nav>
    )
}