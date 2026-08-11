// components/web/report-marker.tsx
"use client"
import { useState, useRef, useCallback, useEffect } from "react"
import { Marker, Popup } from "react-leaflet"
import { ExpandableCard } from "@/components/ui/expandable-card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { pusherClient,COMMENTS_CHANNEL,NEW_COMMENTS_EVENT } from "@/lib/pusher-client"
import {
  ArrowBigUp,
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
  details?: string
  location: string
  createdAt: string
  media?: { url: string; type: string }[]
  status: "open" | "in-progress" | "resolved"
  upvoteCount: number
  commentCount: number
}

interface Comment {
  _id: string
  author: string
  text: string
  time: string
}

const PLACEHOLDER_IMAGE = "/file.svg"

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

const statusStyles = {
  "open": "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  "in-progress": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  "resolved": "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
}

const DUMMY_COMMENTS: Comment[] = [
  { _id: "c1", author: "Amna R.", text: "Same issue on my street, been like this for a week. Really hope the authorities look into this soon.", time: "2 hours ago" },
  { _id: "c2", author: "Bilal K.", text: "Reported this to the ward office too. They said they'd send someone but nothing yet.", time: "5 hours ago" },
  { _id: "c3", author: "Sara M.", text: "This has been getting worse every day. Thanks for reporting it!", time: "1 day ago" },
]

export function ReportMarker({ report }: { report: Report }) {
  const [comments, setComments] = useState<Comment[]>([])
  const [errors, setErrors] = useState("")
  const [draft, setDraft] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [showInput, setShowInput] = useState(false)
  const markerRef = useRef<L.Marker>(null)
  const popupRef = useRef<HTMLDivElement>(null)
  const hoverTimeout = useRef<ReturnType<typeof setTimeout>>(null)
  const reportId=report._id

  const handleAddComment = async () => {
    const text = draft.trim()
    if (!text) return

    const payload = { comment: text, reportId }

    setSubmitting(true)
    try {
      const response = await fetch("/api/reports/comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        setErrors("Failed to post comment")
        return
      }

      setDraft("")
      setShowInput(false)
    } catch (error) {
      setErrors("Something went wrong")
    } finally {
      setSubmitting(false)
    }
  }

  useEffect(()=>{
      const getComments=async()=>{
          try{
            const res=await fetch(`/api/reports/comment?reportId=${report._id}`,{
              method : "GET",
            })

          const data=await res.json()
          console.log(data.data)
          setComments(data.data ?? [])

          }catch(error){
            setErrors(error)
          }
      }

      getComments()
  },[])

  useEffect(()=>{
      const channel=pusherClient.subscribe(COMMENTS_CHANNEL)
      channel.bind(NEW_COMMENTS_EVENT,(newComment:Comment & {reportId:string})=>{
      if(newComment.reportId!==report._id)return
        setComments((prev)=>{
          if(prev.some((r)=>r._id===newComment._id)) return prev
          return [...prev,newComment]
        })
      })

      return ()=>{
        channel.unbind(NEW_COMMENTS_EVENT)
        pusherClient.unsubscribe(COMMENTS_CHANNEL)
      }
  },[])

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
            details={report.details}
            date={formatDate(report.createdAt)}
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
                  {comments.length || 0} Comments
                </span>
              </div>
              <button className="flex items-center gap-1 text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200">
                Sort by
                <MoreHorizontal className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Comment Input */}
            {!showInput ? (
              <button
                onClick={() => setShowInput(true)}
                className="flex w-full items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
              >
                <Avatar className="h-6 w-6 shrink-0">
                  <AvatarFallback className="bg-emerald-100 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                    Y
                  </AvatarFallback>
                </Avatar>
                Add a comment...
              </button>
            ) : (
              <div className="flex w-full items-start gap-3">
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className="bg-emerald-100 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                    Y
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-1 flex-col gap-2">
                  <Input
                    autoFocus
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleAddComment()}
                    placeholder="Add a comment..."
                    className="h-9 border-0 border-b border-zinc-200 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 dark:border-zinc-800"
                  />
                  {draft.trim() && (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => { setDraft(""); setShowInput(false) }}
                        className="h-7 rounded-full px-3 text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-400"
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleAddComment}
                        disabled={submitting}
                        className="h-7 rounded-full bg-emerald-600 px-3 text-xs text-white hover:bg-emerald-700 disabled:opacity-50"
                      >
                        {submitting ? "Posting..." : "Comment"}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Comments List */}
            <div className="flex w-full flex-col gap-0 divide-y divide-zinc-100 dark:divide-zinc-800">
              {comments.length > 0 && comments.map((comment) => (
                <div key={comment._id} className="group flex gap-3 py-3">
                  <Avatar className="h-7 w-7 shrink-0">
                    <AvatarFallback className="bg-zinc-200 text-[10px] font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                      {comment.author.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-1 flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-zinc-900 dark:text-white">
                        {comment.author}
                      </span>
                      <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                        {comment.time}
                      </span>
                    </div>
                    <p className="text-[13px] leading-relaxed text-zinc-600 dark:text-zinc-300">
                      {comment.text}
                    </p>
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