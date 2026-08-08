// components/web/report-marker.tsx
"use client"
import { useState, useRef, useCallback } from "react"
import { Marker, Popup } from "react-leaflet"
import { ExpandableCard } from "@/components/ui/expandable-card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  ArrowBigUp,
  ArrowBigDown,
  MessageCircle,
  Share2,
  MoreHorizontal,
  ThumbsUp,
  Reply,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type L from "leaflet"

interface Report {
  _id: string
  lat: number
  lng: number
  title: string
  location: string
  createdAt: string
  media?: { url: string; type: string }[]
  status: "open" | "in-progress" | "resolved"
  upvoteCount: number
  commentCount: number
}

interface Comment {
  id: string
  author: string
  text: string
  time: string
  likes: number
}

const PLACEHOLDER_IMAGE = "/file.svg"

const statusStyles = {
  "open": "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  "in-progress": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  "resolved": "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
}

const DUMMY_COMMENTS: Comment[] = [
  { id: "c1", author: "Amna R.", text: "Same issue on my street, been like this for a week. Really hope the authorities look into this soon.", time: "2 hours ago", likes: 4 },
  { id: "c2", author: "Bilal K.", text: "Reported this to the ward office too. They said they'd send someone but nothing yet.", time: "5 hours ago", likes: 2 },
  { id: "c3", author: "Sara M.", text: "This has been getting worse every day. Thanks for reporting it!", time: "1 day ago", likes: 8 },
]

export function ReportMarker({ report }: { report: Report }) {
  const [comments, setComments] = useState<Comment[]>(DUMMY_COMMENTS)
  const [draft, setDraft] = useState("")
  const markerRef = useRef<L.Marker>(null)
  const popupRef = useRef<HTMLDivElement>(null)
  const hoverTimeout = useRef<ReturnType<typeof setTimeout>>(null)

  const handleAddComment = () => {
    const text = draft.trim()
    if (!text) return
    setComments((prev) => [
      ...prev,
      { id: crypto.randomUUID(), author: "You", text, time: "Just now", likes: 0 },
    ])
    setDraft("")
  }

  const openPopup = useCallback(() => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current)
    markerRef.current?.openPopup()
  }, [])

  const closePopup = useCallback(() => {
    hoverTimeout.current = setTimeout(() => {
      markerRef.current?.closePopup()
    }, 200)
  }, [])

  const cancelClose = useCallback(() => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current)
  }, [])

  return (
    <Marker
      ref={markerRef}
      position={[report.lat, report.lng]}
      eventHandlers={{
        mouseover: openPopup,
        mouseout: closePopup,
      }}
    >
      <Popup
        minWidth={280}
        maxWidth={300}
        className="report-popup"
        closeButton={false}
        closeOnEscapeKey={false}
        closeOnClick={false}
        autoPan={false}
      >
        <div
          ref={popupRef}
          onMouseEnter={cancelClose}
          onMouseLeave={closePopup}
        >
          <ExpandableCard
            title={report.title}
            description={report.location}
            src={report.media?.[0]?.url ?? PLACEHOLDER_IMAGE}
          >
            {/* Status & Actions Bar */}
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", statusStyles[report.status])}>
                  {report.status}
                </Badge>
              </div>
              <div className="flex items-center gap-1">
                <button className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800">
                  <ArrowBigUp className="h-4 w-4" />
                  {report.upvoteCount}
                </button>
                <button className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800">
                  <ArrowBigDown className="h-4 w-4" />
                </button>
                <button className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800">
                  <Share2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="w-full border-t border-zinc-200 dark:border-zinc-800" />

            {/* Comments Header */}
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                <span className="text-sm font-semibold text-zinc-900 dark:text-white">
                  {comments.length} Comments
                </span>
              </div>
              <button className="flex items-center gap-1 text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200">
                Sort by
                <MoreHorizontal className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Comment Input */}
            <div className="flex w-full items-start gap-3">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="bg-emerald-100 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                  Y
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-1 flex-col gap-2">
                <Input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                  placeholder="Add a comment..."
                  className="border-0 border-b border-zinc-200 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 dark:border-zinc-800"
                />
                {draft.trim() && (
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setDraft("")}
                      className="h-7 rounded-full px-3 text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-400"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleAddComment}
                      className="h-7 rounded-full bg-emerald-600 px-3 text-xs text-white hover:bg-emerald-700"
                    >
                      Comment
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Comments List */}
            <div className="flex w-full flex-col gap-1">
              {comments.map((comment) => (
                <div key={comment.id} className="group flex gap-3 rounded-lg py-3">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="bg-zinc-200 text-xs font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                      {comment.author.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-1 flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-zinc-900 dark:text-white">
                        {comment.author}
                      </span>
                      <span className="text-xs text-zinc-400 dark:text-zinc-500">
                        {comment.time}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                      {comment.text}
                    </p>
                    <div className="mt-1 flex items-center gap-1">
                      <button className="flex items-center gap-1 rounded-full px-2 py-0.5 text-xs text-zinc-500 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800">
                        <ThumbsUp className="h-3 w-3" />
                        {comment.likes > 0 && comment.likes}
                      </button>
                      <button className="flex items-center gap-1 rounded-full px-2 py-0.5 text-xs text-zinc-500 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800">
                        <ArrowBigDown className="h-3 w-3" />
                      </button>
                      <button className="flex items-center gap-1 rounded-full px-2 py-0.5 text-xs text-zinc-500 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800">
                        <Reply className="h-3 w-3" />
                        Reply
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ExpandableCard>
        </div>
      </Popup>
    </Marker>
  )
}