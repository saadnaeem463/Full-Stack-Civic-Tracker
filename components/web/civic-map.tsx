// components/civic-map.tsx
"use client"

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import { useEffect } from "react"
import L from "leaflet"
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png"
import markerIcon from "leaflet/dist/images/marker-icon.png"
import markerShadow from "leaflet/dist/images/marker-shadow.png"
import "leaflet/dist/leaflet.css"
import { ReportMarker } from "./markers"

// Leaflet's default marker icons break under bundlers like webpack/Next — fix once, here.
// Bundled locally via import instead of an external CDN, so ad-blockers / Brave Shields
// can't silently block the icon requests.
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: (markerIcon2x as any).src ?? markerIcon2x,
  iconUrl: (markerIcon as any).src ?? markerIcon,
  shadowUrl: (markerShadow as any).src ?? markerShadow,
})

// Example: scoping to one city — Karachi's rough bounding box
const CITY_CENTER: [number, number] = [24.8607, 67.0011]
const CITY_BOUNDS: [[number, number], [number, number]] = [
  [24.75, 66.85], // southwest corner
  [24.95, 67.20], // northeast corner
]

const PADDED_BOUNDS = L.latLngBounds(CITY_BOUNDS).pad(0.15)
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

function FitToReports({ reports }: { reports: Report[] }) {
  const map = useMap();

  // Leaflet measures its container's size once, at mount. If the surrounding layout
  // (navbar, flex/h-screen) hasn't fully settled yet, it caches a too-small size and
  // never re-measures — this forces a re-check one tick after mount.
  useEffect(() => {
    const timer = setTimeout(() => map.invalidateSize(), 100);
    return () => clearTimeout(timer);
  }, [map]);

  return null;
}

export function CivicMap({ reports }: { reports: Report[] }) {
  const safeReports = reports ?? [];

  return (
    <MapContainer
      center={CITY_CENTER}
      zoom={13}
      minZoom={11}
      maxBounds={PADDED_BOUNDS}
      maxBoundsViscosity={1.0}
      className="h-full w-full"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />
      <FitToReports reports={safeReports} />
      {safeReports.map((r) => (
        <ReportMarker key={r._id} report={r} />
      ))}
    </MapContainer>
  )
}