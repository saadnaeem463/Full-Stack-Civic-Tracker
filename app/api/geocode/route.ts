import { NextRequest, NextResponse } from "next/server"

const KARACHI_VIEWBOX = "66.85,25.05,67.50,24.70"

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q")
  if (!query || query.trim().length < 3) {
    return NextResponse.json({ results: [] })
  }

  const url = new URL("https://nominatim.openstreetmap.org/search")
  url.searchParams.set("q", query)
  url.searchParams.set("format", "json")
  url.searchParams.set("viewbox", KARACHI_VIEWBOX)
  url.searchParams.set("bounded", "1")
  url.searchParams.set("countrycodes", "pk")
  url.searchParams.set("limit", "5")
  url.searchParams.set("accept-language", "en")

  const res = await fetch(url.toString(), {
    headers: {
      "User-Agent": "CivicTrack/1.0 (contact: saadhamza8265@gmail.com)",
    },
  })

  if (!res.ok) return NextResponse.json({ results: [] }, { status: 502 })

  const data = await res.json()
  const results = data.map((item: any) => ({
    label: item.display_name,
    lat: parseFloat(item.lat),
    lng: parseFloat(item.lon),
  }))

  return NextResponse.json({ results })
}