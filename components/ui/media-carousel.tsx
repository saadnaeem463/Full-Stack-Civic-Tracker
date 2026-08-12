"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react"
import { cn } from "@/lib/utils"

export interface MediaItem {
  url: string
  type: string // "image/*" or "video/*"
  poster?: string // thumbnail for videos
}

interface MediaCarouselProps {
  media: MediaItem[]
  alt?: string
  className?: string
}

export function MediaCarousel({ media, alt = "", className }: MediaCarouselProps) {
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState<Record<number, boolean>>({})
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])

  // Pause every video except the one currently in view
  useEffect(() => {
    videoRefs.current.forEach((video, i) => {
      if (!video) return
      if (i !== index) {
        video.pause()
        setPlaying((prev) => ({ ...prev, [i]: false }))
      }
    })
  }, [index])

  const togglePlay = useCallback((e: React.MouseEvent, i: number) => {
    e.stopPropagation()
    const video = videoRefs.current[i]
    if (!video) return
    if (video.paused) {
      video.play()
      setPlaying((prev) => ({ ...prev, [i]: true }))
    } else {
      video.pause()
      setPlaying((prev) => ({ ...prev, [i]: false }))
    }
  }, [])

  if (!media || media.length === 0) return null

  const goPrev = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIndex((i) => (i === 0 ? media.length - 1 : i - 1))
  }
  const goNext = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIndex((i) => (i === media.length - 1 ? 0 : i + 1))
  }

  return (
    <div className={cn("relative h-full w-full overflow-hidden", className)}>
      <div
        className="flex h-full transition-transform duration-300 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {media.map((item, i) => (
          <div key={item.url} className="h-full w-full shrink-0">
            {item.type.startsWith("video") ? (
              <div className="relative h-full w-full bg-black">
                <video
                  ref={(el) => { videoRefs.current[i] = el }}
                  src={item.url}
                  poster={item.poster}
                  preload="metadata"
                  playsInline
                  onClick={(e) => togglePlay(e, i)}
                  className="h-full w-full cursor-pointer object-contain"
                />
                {/* Play/Pause overlay */}
                {!playing[i] && (
                  <button
                    type="button"
                    onClick={(e) => togglePlay(e, i)}
                    aria-label="Play video"
                    className="absolute inset-0 flex items-center justify-center bg-black/20 transition hover:bg-black/30"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition hover:scale-110 hover:bg-black/70">
                      <Play className="h-6 w-6 ml-0.5" fill="white" />
                    </div>
                  </button>
                )}
              </div>
            ) : (
              <img src={item.url} alt={alt} className="h-full w-full object-cover" />
            )}
          </div>
        ))}
      </div>

      {media.length > 1 && (
        <>
          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous media"
            className="absolute left-2 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition hover:bg-black/70"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label="Next media"
            className="absolute right-2 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition hover:bg-black/70"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          <div className="absolute top-3 left-1/2 z-20 flex -translate-x-1/2 gap-1.5">
            {media.map((item, i) => (
              <button
                key={item.url}
                type="button"
                onClick={(e) => { e.stopPropagation(); setIndex(i) }}
                aria-label={`Go to slide ${i + 1}`}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === index ? "w-4 bg-white" : "w-1.5 bg-white/50"
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}