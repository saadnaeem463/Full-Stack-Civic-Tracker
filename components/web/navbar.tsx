"use client"
import Link from "next/link"
import { Button, buttonVariants } from "../ui/button"
import { ThemeToggle } from "./theme-toggle"
import { getMe,userLogout } from "@/lib/services/auth.services"
import { useEffect, useState } from "react"
import type {  User } from "@/types/user"
import { useRouter } from "next/navigation"
import { BellIcon, MapIcon, MenuIcon, PlusIcon } from "lucide-react"
import { Avatar } from "@base-ui/react"
import AddReport from "./add-report"
import { SidebarTrigger } from "@/components/ui/sidebar"



export function Navbar() {

    const [user,setUser]=useState<User | null>(null)
    const [loading,setLoading]=useState(true)
    const router=useRouter()

  useEffect(()=>{
    try {
        const getUser=async()=>{
          const response=await getMe()
          setUser(response.user)
          console.log(response.user)
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

  const isAdmin = user?.role === 'admin'
  
    return(
      <header className="absolute inset-x-0 top-0 z-30 border-b border-[#dfe4dc] bg-[#fbfcf9]/95 backdrop-blur">
        <div className="mx-auto flex h-[72px] max-w-[1540px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            {isAdmin && <SidebarTrigger />}
            <a className="flex items-center gap-3 font-semibold" href="#map" aria-label="CivicTrack home">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#1e5b3e] text-white"><MapIcon size={19} strokeWidth={2.4} /></span>
              <span className="text-[19px] tracking-[-0.04em]">CivicTrack</span>
              <span className="hidden rounded-full bg-[#e4eee5] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[.12em] text-[#31734b] sm:inline">Your city, in view</span>
            </a>
          </div>
          <nav className="hidden items-center gap-1 md:flex" aria-label="Primary navigation">
            {loading ? null : user?.role!=='admin' ? (
              <>
              <a className="rounded-lg bg-[#e9f0e9] px-3 py-2 text-sm font-semibold text-[#1e5b3e]" href="#map">Explore map</a>
              <button className="rounded-lg px-3 py-2 text-sm font-medium text-[#425047] hover:bg-[#f0f3ee]">Report an issue</button>
              <Link href={'/how-it-works'} className="rounded-lg px-3 py-2 text-sm font-medium text-[#425047] hover:bg-[#f0f3ee]">How it works</Link>
              </>
            ):(<>
            </>
          )}
          </nav>
          <div className="flex items-center gap-2">
            {loading ? null : user ? (
                <>
                <button aria-label="Notifications" className="grid h-9 w-9 place-items-center rounded-lg text-[#415046] hover:bg-[#eef2ed]"><BellIcon size={19} /></button>
                <button onClick={handleLogout} className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-[#1e5b3e] sm:block">Logout</button>
                <Avatar.Root>
                    <Avatar.Image src="..." />
                    <Avatar.Fallback>{user.name.charAt(0)}</Avatar.Fallback>
                </Avatar.Root>
                {!isAdmin && <AddReport />}
                </>
            ):(
                <>
                <Link href='/auth/login' className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-[#1e5b3e] sm:block">Login</Link>
                <Link href='/auth/sign-up' className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-[#1e5b3e] sm:block">Signup</Link>
                </>
            )}
            <button aria-label="Open menu" className="grid h-9 w-9 place-items-center rounded-lg md:hidden"><MenuIcon size={21} /></button>
          </div>
        </div>
      </header>
    )
}