"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, motion } from "motion/react"
import { X, MapPin, ChevronRight, MessageSquare, Plus, Calendar, Play } from "lucide-react"
// add near other imports
import { MediaCarousel, type MediaItem } from "@/components/ui/media-carousel"

import { cn } from "@/lib/utils"

interface ExpandableCardProps {
  title: string
  src: string          // still used for the compact hover-card thumbnail
  media?: MediaItem[]  // new — used for the expanded carousel
  description: string
  details?: string
  date?: string
  children?: React.ReactNode
  className?: string
  classNameExpanded?: string
  [key: string]: any
}

export function ExpandableCard({
  title,
  src,
  media,
  description,
  details,
  date,
  children,
  className,
  classNameExpanded,
  ...props
}: ExpandableCardProps) {
  const [active, setActive] = React.useState(false)
  const cardRef = React.useRef<HTMLDivElement>(null)
  const id = React.useId()

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActive(false)
      }
    }

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        setActive(false)
      }
    }

    window.addEventListener("keydown", onKeyDown)
    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("touchstart", handleClickOutside)

    return () => {
      window.removeEventListener("keydown", onKeyDown)
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("touchstart", handleClickOutside)
    }
  }, [])

  return (
    <>
      {createPortal(
        <>
          <AnimatePresence>
            {active && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-10 bg-black/40 backdrop-blur-md"
              />
            )}
          </AnimatePresence>
          <AnimatePresence>
            {active && (
              <div className="fixed inset-0 z-[100] flex justify-center overflow-hidden pt-[88px] pb-4">
                <motion.div
                  layoutId={`card-${title}-${id}`}
                  ref={cardRef}
                  style={{ maxHeight: "calc(100vh - 92px)" }}
                  className={cn(
                    "relative flex min-h-0 w-full max-w-[850px] flex-col overflow-y-auto bg-white shadow-2xl sm:rounded-2xl dark:bg-zinc-950 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
                    classNameExpanded
                  )}
                  {...props}
                >
                  {/* Image Section */}
                  <div className="relative shrink-0">
                    <motion.div layoutId={`image-${title}-${id}`}>
                      {media && media.length > 0 ? (
                        <MediaCarousel
                          media={media}
                          alt={title}
                          className="h-72 sm:h-80"
                        />
                      ) : (
                        <img
                          src={src}
                          alt={title}
                          className="h-72 w-full object-cover object-center sm:h-80"
                        />
                      )}
                    </motion.div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

                    {/* Close Button */}
                    <motion.button
                      aria-label="Close card"
                      layoutId={`button-${title}-${id}`}
                      onClick={() => setActive(false)}
                      className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-all duration-200 hover:bg-black/70 hover:scale-105"
                    >
                      <X className="h-4 w-4" />
                    </motion.button>

                    {/* Title Overlay on Image */}
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <motion.div
                        layoutId={`description-${description}-${id}`}
                        className="mb-2 flex items-center gap-1.5 text-xs font-medium text-white/90"
                      >
                        <MapPin className="h-3.5 w-3.5" />
                        {description}
                      </motion.div>
                      <motion.h3
                        layoutId={`title-${title}-${id}`}
                        className="text-2xl font-bold leading-tight text-white sm:text-3xl"
                      >
                        {title}
                      </motion.h3>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="flex flex-1 min-h-0 flex-col bg-white dark:bg-zinc-950">
                    <div className="flex-1 overflow-y-auto px-6 py-5 sm:px-8">
                      {/* Title, Description & Date */}
                      <div className="mb-5 flex flex-col gap-2 border-b border-zinc-100 pb-5 dark:border-zinc-800">
                        <div className="flex items-center gap-2 text-xs text-zinc-400 dark:text-zinc-500">
                          <Calendar className="h-3.5 w-3.5" />
                          {date}
                        </div>
                        <h2 className="text-xl font-bold text-zinc-900 dark:text-white sm:text-2xl">
                          {title}
                        </h2>
                        {details && (
                          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                            {details}
                          </p>
                        )}
                      </div>

                      <motion.div
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="flex flex-col items-start gap-5"
                      >
                        {children}
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </>,
        document.body
      )}

      {/* Compact Card (Hover Popup) */}
      <motion.div
        role="dialog"
        aria-labelledby={`card-title-${id}`}
        aria-modal="true"
        layoutId={`card-${title}-${id}`}
        onClick={() => setActive(true)}
        className={cn(
          "group relative flex w-full cursor-pointer flex-col overflow-hidden rounded-xl border border-zinc-200/80 bg-white shadow-md transition-shadow duration-300 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-950",
          className
        )}
      >
        <div className="relative overflow-hidden">
          <motion.div layoutId={`image-${title}-${id}`}>
            {media && media.length > 0 && media[0].type.startsWith("video") ? (
              <div className="relative h-44 w-full">
                <img
                  src={media[0].poster || src}
                  alt={title}
                  className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm">
                    <Play className="h-4 w-4 ml-0.5" fill="white" />
                  </div>
                </div>
              </div>
            ) : (
              <img
                src={src}
                alt={title}
                className="h-44 w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
              />
            )}
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          <motion.button
            aria-label="Open card"
            layoutId={`button-${title}-${id}`}
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-zinc-700 shadow-sm backdrop-blur-sm transition-all duration-300 hover:bg-white hover:text-black hover:shadow-md"
          >
            <Plus className="h-4 w-4" />
          </motion.button>
        </div>
        <div className="flex flex-col gap-1.5 p-4">
          <motion.p
            layoutId={`description-${description}-${id}`}
            className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-emerald-600 dark:text-emerald-400"
          >
            <MapPin className="h-3 w-3" />
            {description}
          </motion.p>
          <motion.h3
            layoutId={`title-${title}-${id}`}
            className="text-base font-semibold leading-snug text-zinc-900 dark:text-white"
          >
            {title}
          </motion.h3>
        </div>
        <div className="flex items-center border-t border-zinc-100 px-4 py-2.5 dark:border-zinc-800">
          <span className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
            <MessageSquare className="h-3 w-3" />
            View details
          </span>
          <ChevronRight className="ml-auto h-3.5 w-3.5 text-zinc-400 transition-transform duration-300 group-hover:translate-x-0.5 dark:text-zinc-500" />
        </div>
      </motion.div>
    </>
  )
}
