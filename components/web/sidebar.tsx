"use client"
import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboardIcon,
  ClipboardListIcon,
  UsersIcon,
  WalletIcon,
  BarChart3Icon,
  SettingsIcon,
  MapIcon,
  InboxIcon,
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
  useSidebar,
} from "@/components/ui/sidebar"
import { buttonVariants } from "@/components/ui/button"
import { getMe } from "@/lib/services/auth.services"
import { pusherClient, REPORTS_CHANNEL, NEW_REPORT_EVENT, REPORT_UPDATED_EVENT, REPORT_DELETED_EVENT } from "@/lib/pusher-client"
import type { User } from "@/types/user"
import { motion } from "@/components/motion"
import { cn } from "@/lib/utils"

const navItems = [
  { label: "Dashboard", Icon: LayoutDashboardIcon },
  { label: "Reports", Icon: ClipboardListIcon },
  { label: "Workers", Icon: UsersIcon },
  { label: "Budget", Icon: WalletIcon, adminOnly: true },
  { label: "Analytics", Icon: BarChart3Icon },
  { label: "Settings", Icon: SettingsIcon, adminOnly: true },
]

/**
 * One sidebar for every staff role. Admins and moderators share the same collapsible
 * layout; `adminOnly` items are simply filtered out for moderators.
 */
export function AppSidebar() {
  const [user, setUser] = useState<User | null>(null)
  const [awaiting, setAwaiting] = useState(0)
  const pathname = usePathname()
  const { setOpenMobile } = useSidebar()
  const isStaff = user?.role === "admin" || user?.role === "moderator"

  useEffect(() => {
    getMe().then((res) => setUser(res.user)).catch(() => {})
  }, [])

  // real number of reports nobody has picked up yet (kept live over Pusher)
  const loadAwaiting = useCallback(() => {
    fetch("/api/reports")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return
        const list: { status?: string }[] = data.reports ?? []
        setAwaiting(list.filter((r) => (r.status ?? "Reported") === "Reported").length)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!isStaff) return
    loadAwaiting()
    const channel = pusherClient.subscribe(REPORTS_CHANNEL)
    channel.bind(NEW_REPORT_EVENT, loadAwaiting)
    channel.bind(REPORT_UPDATED_EVENT, loadAwaiting)
    channel.bind(REPORT_DELETED_EVENT, loadAwaiting)
    return () => {
      channel.unbind(NEW_REPORT_EVENT, loadAwaiting)
      channel.unbind(REPORT_UPDATED_EVENT, loadAwaiting)
      channel.unbind(REPORT_DELETED_EVENT, loadAwaiting)
      pusherClient.unsubscribe(REPORTS_CHANNEL)
    }
  }, [isStaff, loadAwaiting])

  if (!isStaff) return null

  const visibleItems = navItems.filter((item) => !item.adminOnly || user?.role === "admin")

  return (
    <Sidebar collapsible="icon" className="border-r border-border bg-sidebar">
      <SidebarHeader className="overflow-hidden px-3 py-3.5 group-data-[collapsible=icon]:px-1">
        <Link href="/" className="flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60" aria-label="CivicTrack home">
          <motion.span
            whileHover={{ rotate: -8, scale: 1.06 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8"
          >
            <MapIcon size={18} strokeWidth={2.3} />
          </motion.span>
          <span className="min-w-0 group-data-[collapsible=icon]:hidden">
            <span className="block text-base font-semibold leading-5 tracking-[-.03em] text-foreground">CivicTrack</span>
            <span className="block text-[10px] font-semibold uppercase tracking-[.14em] text-muted-foreground">
              {user?.role === "admin" ? "Admin portal" : "Moderator portal"}
            </span>
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-3 group-data-[collapsible=icon]:px-1">
        <SidebarGroup className="group-data-[collapsible=icon]:p-1">
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleItems.map(({ label, Icon }, index) => {
                const href = `/admin/${label.toLowerCase()}`
                const active = pathname === href || pathname?.startsWith(`${href}/`)
                return (
                  <SidebarMenuItem key={label}>
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 + index * 0.05 }}
                    >
                      <SidebarMenuButton
                        isActive={active}
                        tooltip={label}
                        render={<Link href={href} onClick={() => setOpenMobile(false)} aria-current={active ? "page" : undefined} />}
                        className={cn(
                          "relative gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors",
                          active
                            ? "bg-transparent text-primary hover:bg-transparent hover:text-primary data-[active=true]:bg-transparent data-[active=true]:text-primary"
                            : "text-muted-foreground hover:bg-accent hover:text-foreground"
                        )}
                      >
                        {active && (
                          <motion.span
                            layoutId="sidebar-active-pill"
                            className="absolute inset-0 rounded-lg bg-primary/12 ring-1 ring-primary/25"
                            transition={{ type: "spring", stiffness: 420, damping: 34 }}
                          >
                            <span className="absolute left-0 top-2 bottom-2 w-1 rounded-full bg-primary" />
                          </motion.span>
                        )}
                        <Icon size={17} aria-hidden="true" className="relative z-10 shrink-0" />
                        <span className="relative z-10">{label}</span>
                      </SidebarMenuButton>
                    </motion.div>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {awaiting > 0 && (
        <SidebarFooter className="px-3 pb-4 group-data-[collapsible=icon]:hidden">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border border-primary/20 bg-primary/10 p-4"
          >
            <p className="flex items-center gap-2 text-xs font-semibold text-foreground">
              <InboxIcon size={14} className="text-primary" aria-hidden="true" />
              {awaiting} {awaiting === 1 ? "report is" : "reports are"} waiting
            </p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Nobody has acknowledged {awaiting === 1 ? "it" : "them"} yet.
            </p>
            <Link
              href="/admin/reports"
              onClick={() => setOpenMobile(false)}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-3 w-full")}
            >
              Review queue
            </Link>
          </motion.div>
        </SidebarFooter>
      )}
    </Sidebar>
  )
}
