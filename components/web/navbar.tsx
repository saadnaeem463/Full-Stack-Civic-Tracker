"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboardIcon, MapIcon, MenuIcon, XIcon } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { getMe, userLogout } from "@/lib/services/auth.services"
import type { User } from "@/types/user"
import { cn } from "@/lib/utils"
import { AnimatePresence, motion } from "@/components/motion"
import AddReport from "./add-report"
import { NotificationBell } from "./notification-bell"
import { ProfileMenu } from "./profile-menu"
import { ThemeToggle } from "./theme-toggle"

const links = [
  { href: "/", label: "Explore map" },
  { href: "/how-it-works", label: "How it works" },
]

export function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    getMe()
      .then((response) => setUser(response.user))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // close the mobile menu whenever the route changes
  useEffect(() => setMenuOpen(false), [pathname])

  async function handleLogout() {
    await userLogout()
    setUser(null)
    router.push("/auth/login")
    router.refresh()
  }

  // The staff portal renders its own chrome (sidebar + AdminShell header).
  if (pathname?.startsWith("/admin")) return null

  const isStaff = user?.role === "admin" || user?.role === "moderator"

  return (
    <header
      className={cn(
        "sticky top-0 z-30 border-b bg-background/80 backdrop-blur-xl transition-shadow duration-300",
        scrolled ? "border-border shadow-sm" : "border-transparent"
      )}
    >
      <div className="mx-auto flex h-[72px] max-w-[1540px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          {isStaff && <SidebarTrigger aria-label="Toggle sidebar" />}
          <Link href="/" className="group flex items-center gap-2.5 font-semibold" aria-label="CivicTrack home">
            <motion.span
              whileHover={{ rotate: -8, scale: 1.07 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm"
            >
              <MapIcon size={19} strokeWidth={2.4} />
            </motion.span>
            <span className="text-[19px] tracking-[-0.04em]">CivicTrack</span>
          </Link>
        </div>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary navigation">
          {links.map((link) => {
            const active = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {active && (
                  <motion.span
                    layoutId="navbar-active-pill"
                    className="absolute inset-0 rounded-lg bg-primary/10"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <span className="relative">{link.label}</span>
              </Link>
            )
          })}
          {isStaff && (
            <Link
              href="/admin/dashboard"
              className="ml-1 inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <LayoutDashboardIcon size={15} aria-hidden="true" />
              Staff portal
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {loading ? (
            <div className="h-8 w-24 animate-pulse rounded-lg bg-muted" aria-hidden="true" />
          ) : user ? (
            <>
              <NotificationBell />
              <span className="hidden sm:block">{user.role !== "admin" && <AddReport />}</span>
              <ProfileMenu user={user} onLogout={handleLogout} />
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className={cn(buttonVariants({ variant: "ghost" }), "hidden h-9 px-3.5 sm:inline-flex")}
              >
                Log in
              </Link>
              <Link href="/auth/sign-up" className={cn(buttonVariants(), "hidden h-9 px-3.5 sm:inline-flex")}>
                Sign up
              </Link>
            </>
          )}
          <ThemeToggle />
          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 md:hidden"
          >
            {menuOpen ? <XIcon size={21} /> : <MenuIcon size={21} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden border-t border-border bg-background md:hidden"
          >
            <div className="flex flex-col gap-1 px-4 py-3">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "rounded-lg px-3 py-2.5 text-sm font-medium",
                    pathname === link.href ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  {link.label}
                </Link>
              ))}
              {isStaff && (
                <Link href="/admin/dashboard" className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted">
                  Staff portal
                </Link>
              )}
              {!loading && user && user.role !== "admin" && (
                <div className="pt-2">
                  <AddReport />
                </div>
              )}
              {!loading && !user && (
                <div className="flex gap-2 pt-2">
                  <Link href="/auth/login" className={cn(buttonVariants({ variant: "outline" }), "h-9 flex-1")}>
                    Log in
                  </Link>
                  <Link href="/auth/sign-up" className={cn(buttonVariants(), "h-9 flex-1")}>
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
