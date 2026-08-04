

"use client"
import { getMe } from "@/lib/services/auth.services";
import { useEffect, useState } from "react";
import {User} from "@/types/user"
export default function Dashboard() {

  const [user,setUser]=useState<User>()

  useEffect(()=>{
      const getUser=async()=>{
        const response=await getMe()
        setUser(response.user)
      }

      getUser()
  },[])
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-muted-foreground">You made it {user?.name}— you're logged in.</p>
    </div>
  );
}