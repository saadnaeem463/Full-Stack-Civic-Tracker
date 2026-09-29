
"use client"
import { useState } from "react";
import { AdminShell } from "@/components/web/admin/AdminShell";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [search, setSearch] = useState("")

    return (
        <AdminShell search={search} onSearch={setSearch}>
            {children}
        </AdminShell>
    )
}
