
"use client"
import { useState } from "react";
import { useRouter,usePathname } from "next/navigation";
import { AdminShell,AdminRoute } from "@/components/web/admin/AdminShell";

export default function AdminLaout({children} : {children : React.ReactNode}){
    const router=useRouter()
    const pathname=usePathname()
    const [search,setSearch]=useState("")

    const route=(pathname?.split("/")[2] ?? "dashboard") as AdminRoute

    function onNavigate(next:AdminRoute){
        router.push(`/admin/${next}`)
    }

    return (
      
    <AdminShell route={route} onNavigate={onNavigate} search={search} onSearch={setSearch}>
      {children}
    </AdminShell>
  )
}