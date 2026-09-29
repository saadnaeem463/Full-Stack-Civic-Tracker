/** Shape of a report as the public map needs it (single source of truth for page, map and marker). */
export type ReportStatus = "Reported" | "Acknowledged" | "In progress" | "Resolved"

export interface MapReport {
  _id: string
  lat: number
  lng: number
  title: string
  details?: string
  location?: string
  createdAt?: string
  media?: { url: string; type: string; poster?: string }[]
  status?: ReportStatus
  upVoteCount?: number
  commentCount?: number
}
