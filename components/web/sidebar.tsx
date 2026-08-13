"use client"
import { useEffect, useState } from "react"
import {
  LayoutDashboardIcon,
  ClipboardListIcon,
  UsersIcon,
  WalletIcon,
  BarChart3Icon,
  SettingsIcon,
  MapIcon,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { getMe } from "@/lib/services/auth.services"
import type { User } from "@/types/user"
import { useRouter, usePathname } from "next/navigation"

const navItems = [
  { label: "Dashboard", Icon: LayoutDashboardIcon },
  { label: "Reports", Icon: ClipboardListIcon },
  { label: "Workers", Icon: UsersIcon },
  { label: "Budget", Icon: WalletIcon },
  { label: "Analytics", Icon: BarChart3Icon },
  { label: "Settings", Icon: SettingsIcon },
]

export function AppSidebar() {
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    getMe().then((res) => setUser(res.user)).catch(() => {})
  }, [])

  if (user?.role !== "admin") return null

  return (
    <Sidebar collapsible="offcanvas" className="border-r border-[#dfe5dc] bg-[#fbfcf9]">
      <SidebarHeader className="px-3 py-4">
        <div className="flex items-center gap-2.5 px-1">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#1e5b3e] text-white">
            <MapIcon size={18} strokeWidth={2.3} />
          </span>
          <span>
            <span className="block text-lg font-semibold leading-5 tracking-[-.03em] text-[#17211b]">
              CivicTrack
            </span>
            <span className="block text-[10px] font-bold uppercase tracking-[.14em] text-[#6d8a75]">
              Staff portal
            </span>
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map(({ label, Icon }) => {
                const slug = label.toLowerCase()
                const active = pathname === `/admin/${slug}`
                return (
                  <SidebarMenuItem key={label}>
                    <SidebarMenuButton
                      isActive={active}
                      onClick={() => router.push(`/admin/${slug}`)}
                      className={`gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                        active
                          ? "bg-[#1e5b3e] text-white hover:bg-[#1e5b3e] hover:text-white data-[active=true]:bg-[#1e5b3e] data-[active=true]:text-white"
                          : "text-[#44534a] hover:bg-[#eef3ed]"
                      }`}
                    >
                      <Icon size={17} aria-hidden="true" />
                      <span>{label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-3 pb-4">
        <div className="rounded-xl border border-[#dfe5dc] bg-[#e8f1e7] p-4">
          <p className="text-xs font-bold uppercase tracking-[.12em] text-[#1e5b3e]">
            SLA watch
          </p>
          <p className="mt-1.5 text-sm leading-5 text-[#3f5546]">
            2 open reports breach their response window today.
          </p>
          <button
            onClick={() => router.push("/admin/reports")}
            className="mt-3 w-full rounded-lg bg-[#1e5b3e] py-2 text-xs font-bold text-white hover:bg-[#174a32]"
          >
            Review queue
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}