"use client"
import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import {
  BellIcon,
  BellOffIcon,
  CheckCheckIcon,
  FilePlusIcon,
  MessageCircleIcon,
  RefreshCwIcon,
  StickyNoteIcon,
  ThumbsUpIcon,
} from "lucide-react"
import { toast } from "sonner"
import { getMe } from "@/lib/services/auth.services"
import { pusherClient, USER_CHANNEL_PREFIX, NEW_NOTIFICATION_EVENT } from "@/lib/pusher-client"
import { AnimatePresence, PopPanel, motion } from "@/components/motion"

type NotificationItem = {
  _id: string
  type?: "upvote" | "comment" | "status_change" | "new_report" | "note_added"
  message: string
  read: boolean
  createdAt: string
}

const typeIcon = {
  upvote: ThumbsUpIcon,
  comment: MessageCircleIcon,
  status_change: RefreshCwIcon,
  new_report: FilePlusIcon,
  note_added: StickyNoteIcon,
} as const

function timeAgo(iso: string) {
  const seconds = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000))
  if (seconds < 60) return "Just now"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export function NotificationBell() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [isStaff, setIsStaff] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    Promise.all([fetch("/api/notifications").then((res) => (res.ok ? res.json() : null)), getMe()])
      .then(([data, me]) => {
        if (!me?.user?._id) return
        setUserId(me.user._id)
        setIsStaff(me.user.role === "admin" || me.user.role === "moderator")
        setNotifications(data?.notifications ?? [])
        setUnreadCount(data?.unreadCount ?? 0)
        if (!data) setError("Could not load your notifications")
      })
      .catch(() => setError("Could not load your notifications"))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!userId) return
    const channelName = `${USER_CHANNEL_PREFIX}-${userId}`
    const channel = pusherClient.subscribe(channelName)

    channel.bind(NEW_NOTIFICATION_EVENT, (notification: NotificationItem) => {
      setNotifications((prev) => {
        if (prev.some((n) => n._id === notification._id)) return prev
        return [notification, ...prev]
      })
      setUnreadCount((prev) => prev + 1)
      toast(notification.message, { duration: 4000 })
    })

    return () => {
      channel.unbind(NEW_NOTIFICATION_EVENT)
      pusherClient.unsubscribe(channelName)
    }
  }, [userId])

  // close on outside click / Escape
  const close = useCallback(() => setOpen(false), [])
  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) close()
    }
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && close()
    document.addEventListener("pointerdown", onPointerDown)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("pointerdown", onPointerDown)
      document.removeEventListener("keydown", onKey)
    }
  }, [open, close])

  async function markRead(notification: NotificationItem) {
    if (!notification.read) {
      const response = await fetch(`/api/notifications/${notification._id}`, { method: "PATCH" })
      if (!response.ok) {
        toast.error("Could not mark that notification as read")
        return
      }
      setNotifications((prev) => prev.map((n) => (n._id === notification._id ? { ...n, read: true } : n)))
      setUnreadCount((prev) => Math.max(prev - 1, 0))
    }
    // staff jump straight to the queue for report activity
    if (isStaff && (notification.type === "new_report" || notification.type === "status_change")) {
      close()
      router.push("/admin/reports")
    }
  }

  async function markAllRead() {
    const response = await fetch("/api/notifications/read-all", { method: "PATCH" })
    if (!response.ok) {
      toast.error("Could not mark all notifications as read")
      return
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  return (
    <div className="relative" ref={rootRef}>
      <motion.button
        type="button"
        whileTap={{ scale: 0.92 }}
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={`Notifications, ${unreadCount} unread`}
        className="relative grid h-9 w-9 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
      >
        <BellIcon size={19} aria-hidden="true" />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              key="badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 22 }}
              className="absolute right-0.5 top-0.5 grid min-w-4 place-items-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-4 text-white"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {open && (
          <PopPanel
            role="dialog"
            aria-label="Notifications"
            className="absolute right-0 top-11 z-40 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-border bg-popover shadow-lg"
          >
            <div className="flex items-center justify-between border-b border-border px-3.5 py-2.5">
              <p className="text-[11px] font-semibold uppercase tracking-[.12em] text-muted-foreground">
                Notifications
              </p>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-semibold text-primary hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
                >
                  <CheckCheckIcon size={13} aria-hidden="true" />
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-[min(26rem,70vh)] overflow-y-auto p-1.5">
              {loading && (
                <div className="space-y-2 p-2" role="status" aria-live="polite">
                  <span className="sr-only">Loading notifications…</span>
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />
                  ))}
                </div>
              )}
              {!loading && error && (
                <p role="alert" className="px-3 py-4 text-xs text-destructive">
                  {error}
                </p>
              )}
              {!loading && !error && notifications.length === 0 && (
                <div className="flex flex-col items-center gap-1.5 px-4 py-8 text-center">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary">
                    <BellOffIcon size={18} aria-hidden="true" />
                  </span>
                  <p className="text-sm font-semibold">You&apos;re all caught up</p>
                  <p className="max-w-[220px] text-xs leading-5 text-muted-foreground">
                    No notifications yet. Updates about reports will show up here.
                  </p>
                </div>
              )}
              {notifications.map((notification, index) => {
                const Icon = typeIcon[notification.type ?? "status_change"] ?? RefreshCwIcon
                return (
                  <motion.button
                    key={notification._id}
                    type="button"
                    layout="position"
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: Math.min(index, 8) * 0.03 }}
                    onClick={() => markRead(notification)}
                    className={`flex w-full items-start gap-3 rounded-lg px-2.5 py-2.5 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 ${
                      notification.read ? "" : "bg-primary/5"
                    }`}
                  >
                    <span
                      className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full ${
                        notification.read ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"
                      }`}
                    >
                      <Icon size={15} aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className={`block text-[13px] leading-5 ${
                          notification.read ? "text-muted-foreground" : "font-medium text-foreground"
                        }`}
                      >
                        {notification.message}
                      </span>
                      <span className="mt-0.5 block text-[11px] text-muted-foreground">
                        {timeAgo(notification.createdAt)}
                      </span>
                    </span>
                    {!notification.read && (
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" aria-label="Unread" />
                    )}
                  </motion.button>
                )
              })}
            </div>
          </PopPanel>
        )}
      </AnimatePresence>
    </div>
  )
}
