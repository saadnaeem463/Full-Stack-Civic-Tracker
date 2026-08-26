import { NextRequest, NextResponse } from "next/server"

const KARACHI_VIEWBOX = "66.85,25.05,67.50,24.70"

export async function GET(req: NextRequest) {

  const lat=req.nextUrl.searchParams.get('lat')
  const lng=req.nextUrl.searchParams.get('lng')

  if(lat && lng){
      const reverseUrl=new URL('https://nominatim.openstreetmap.org/reverse')
      reverseUrl.searchParams.set("lat",lat)
      reverseUrl.searchParams.set("lon",lng)
      reverseUrl.searchParams.set("format","json")
      reverseUrl.searchParams.set("accept-language","en")
      reverseUrl.searchParams.set("zoom","18")
      reverseUrl.searchParams.set("addressdetails","1")

      const res = await fetch(reverseUrl.toString(), {
      headers: {
        "User-Agent": "CivicTrack/1.0 (contact: saadhamza8265@gmail.com)",
      },
    })

    if (!res.ok) return NextResponse.json({ label: null }, { status: 502 })

    const data = await res.json()
    if (data.error) return NextResponse.json({ label: null })

    // display_name is verbose ("Shop 4, Block 2, ... Karachi, Sindh, 75500, Pakistan").
    // Trim it down to the first few segments so it reads like a normal address.
    const label = (data.display_name as string)?.split(",").slice(0, 4).join(",").trim()

    return NextResponse.json({ label: label ?? null })

  }

  
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