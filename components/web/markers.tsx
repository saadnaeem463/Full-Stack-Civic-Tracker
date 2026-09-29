// components/web/report-marker.tsx
"use client"
import { useState, useRef, useCallback, useEffect } from "react"
import { Marker, Popup } from "react-leaflet"
import { ExpandableCard } from "@/components/ui/expandable-card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { pusherClient,COMMENTS_CHANNEL,NEW_COMMENTS_EVENT,UPVOTE_CHANNEL,NEW_UPVOTE_EVENT } from "@/lib/pusher-client"
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
import { toast } from "sonner"
import type { MapReport } from "@/types/report"

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

const statusStyles: Record<string, string> = {
  "Reported": "bg-destructive/10 text-destructive",
  "Acknowledged": "bg-info/10 text-info",
  "In progress": "bg-warning/15 text-warning",
  "Resolved": "bg-success/10 text-success",
}


export function ReportMarker({ report }: { report: MapReport }) {
  const [comments, setComments] = useState<Comment[]>([])
  const setErrors = (message: string) => toast.error(message)
  const [draft, setDraft] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [showInput, setShowInput] = useState(false)
  const markerRef = useRef<L.Marker>(null)
  const popupRef = useRef<HTMLDivElement>(null)
  const hoverTimeout = useRef<ReturnType<typeof setTimeout>>(null)
  const [upVoteCount,setUpVoteCount]=useState(report.upVoteCount?? 0)
  const [hasVoted,setHasVoted]=useState(false)
  const reportId=report._id

  const handleUpVote=async()=>{

    try{
      const res=await fetch(`/api/reports/upvote?reportId=${reportId}`,{
        method : "PUT"
      })

      if (!res.ok){
       setErrors("Failed To Upvote")
       return
      }
        const data=await res.json()
        setHasVoted(data.hasUpvoted)
    }catch(error){
      setErrors("Could not register your upvote, please try again")
    }
  }

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
          setComments(data.data ?? [])

          }catch(error){
            setErrors("Something went wrong, please try again")
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

  useEffect(()=>{
    const getUpvotedStatus=async()=>{
      try{
        const res=await fetch(`/api/reports/upvote?reportId=${report._id}`,{
          method : "GET",
          headers : {"Content-Type": "application/json"}
        })

      const data=await res.json()
      setHasVoted(data.hasUpvoted)
      setUpVoteCount(data.upVoteCount)

      }catch(error){
        setErrors("Something went wrong, please try again")
      }

    }
    getUpvotedStatus()
  },[])

  useEffect(()=>{
    const channel=pusherClient.subscribe(UPVOTE_CHANNEL)
    channel.bind(NEW_UPVOTE_EVENT,(data : {reportId : string,upVoteCount :number})=>{
      if(data.reportId!==report._id) return
      setUpVoteCount(data.upVoteCount)
    })
    return()=>{
      channel.unbind(NEW_UPVOTE_EVENT)
      pusherClient.unsubscribe(UPVOTE_CHANNEL)
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
          description={report.location ?? ""}
          src={report.media?.[0]?.url ?? PLACEHOLDER_IMAGE}
          media={report.media}
          details={report.details}
          date={report.createdAt ? formatDate(report.createdAt) : ""}
          >
            {/* Status & Actions Bar */}
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", statusStyles[report.status ?? "Reported"])}>
                  {report.status ?? "Reported"}
                </Badge>
              </div>
              <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleUpVote}
                className={cn(
                  "flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                  hasVoted
                    ? "bg-primary/10 text-primary  "
                    : "text-muted-foreground hover:bg-muted  "
                )}
              >
                <ArrowBigUp className={cn("h-4 w-4", hasVoted && "fill-primary ")} />
                {upVoteCount}
              </button>
                <button className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted">
                  <Share2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="w-full border-t border-border" />

            {/* Comments Header */}
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-semibold text-foreground dark:text-white">
                  {comments.length || 0} Comments
                </span>
              </div>
              <button className="flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
                Sort by
                <MoreHorizontal className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Comment Input */}
            {!showInput ? (
              <button
                onClick={() => setShowInput(true)}
                className="flex w-full items-center gap-3 rounded-lg border border-border bg-muted px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Avatar className="h-6 w-6 shrink-0">
                  <AvatarFallback className="bg-primary/10 text-[10px] font-semibold text-primary">
                    Y
                  </AvatarFallback>
                </Avatar>
                Add a comment...
              </button>
            ) : (
              <div className="flex w-full items-start gap-3">
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
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
                    className="h-9 border-0 border-b border-border bg-transparent px-0 text-sm shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                  {draft.trim() && (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => { setDraft(""); setShowInput(false) }}
                        className="h-7 rounded-full px-3 text-xs text-muted-foreground hover:text-foreground"
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleAddComment}
                        disabled={submitting}
                        className="h-7 rounded-full bg-primary px-3 text-xs text-white hover:bg-primary/90 disabled:opacity-50"
                      >
                        {submitting ? "Posting..." : "Comment"}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Comments List */}
            <div className="flex w-full flex-col gap-0 divide-y divide-border">
              {comments.length > 0 && comments.map((comment) => (
                <div key={comment._id} className="group flex gap-3 py-3">
                  <Avatar className="h-7 w-7 shrink-0">
                    <AvatarFallback className="bg-muted text-[10px] font-semibold text-muted-foreground">
                      {comment.author?.charAt(0) ?? "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-1 flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-foreground dark:text-white">
                        {comment.author}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {comment.time}
                      </span>
                    </div>
                    <p className="text-[13px] leading-relaxed text-muted-foreground">
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