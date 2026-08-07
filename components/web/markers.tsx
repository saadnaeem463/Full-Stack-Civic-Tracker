// components/web/report-marker.tsx
"use client"
import { Marker, Popup } from "react-leaflet"
import { Badge } from "@/components/ui/badge"
import { ArrowBigUp, MessageCircle, MapPin } from "lucide-react"
import Link from "next/link"
import { buttonVariants } from "../ui/button"

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

const statusStyles = {
  "open": "bg-red-100 text-red-700",
  "in-progress": "bg-amber-100 text-amber-700",
  "resolved": "bg-green-100 text-green-700",
}

export function ReportMarker({ report }: { report: Report }) {

  console.log(report)
  return (
    
    <Marker position={[report.lat, report.lng]}>
      <Popup minWidth={240} maxWidth={260} className="report-popup">
        <div className="overflow-hidden rounded-2xl">
          {report.media && (
            <div className="relative">
              <img
                src={report.media[0].url}
                alt={report.title}
                className="h-32 w-full object-cover"
              />
              <Badge className={`absolute left-2 top-2 ${statusStyles[report.status]}`}>
                {report.status}
              </Badge>
            </div>
          )}

          <div className="flex flex-col gap-1.5 px-3 py-2.5">
            <h3 className="text-sm font-semibold leading-snug text-zinc-900">
              {report.title}
            </h3>

            <div className="flex items-center gap-1 text-xs text-zinc-500">
              <MapPin className="h-3 w-3" />
              <span>{report.location}</span>
            </div>
            <span className="text-xs text-zinc-400">{report.createdAt}</span>

            <div className="mt-1 flex items-center gap-4 border-t border-zinc-100 pt-2 text-xs text-zinc-600">
              <button className="flex items-center gap-1 hover:text-teal-700">
                <ArrowBigUp className="h-4 w-4" />
                {report.upvoteCount}
              </button>
              <button className="flex items-center gap-1 hover:text-teal-700">
                <MessageCircle className="h-3.5 w-3.5" />
                {report.commentCount}
              </button>

              <Link
                href={`/report/${report._id}`}
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                View
              </Link>
            </div>
          </div>
        </div>
      </Popup>
    </Marker>
  )
}