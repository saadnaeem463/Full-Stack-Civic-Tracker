"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, motion } from "motion/react"

import { cn } from "@/lib/utils"

interface ExpandableCardProps {
  title: string
  src: string
  description: string
  children?: React.ReactNode
  className?: string
  classNameExpanded?: string
  [key: string]: any
}

export function ExpandableCard({
  title,
  src,
  description,
  children,
  className,
  classNameExpanded,
  ...props
}: ExpandableCardProps) {
  const [active, setActive] = React.useState(false)
  const cardRef = React.useRef<HTMLDivElement>(null)
  const id = React.useId()

  // document.body doesn't exist during SSR, and createPortal needs a real DOM node —
  // this flips to true only after the client has mounted, avoiding a hydration mismatch.
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  // Without this, the page behind the modal stays scrollable too — since the modal's
  // own scroll region wasn't working, arrow keys were reaching the background page
  // instead (whatever had focus), which is what looked like "scrolling with keys."
  React.useEffect(() => {
    document.body.style.overflow = active ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [active])

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
      {mounted &&
        createPortal(
          <>
            {/* Backdrop and expanded card render via a portal directly under <body>.
                Required because this card can be used inside Leaflet popups, and Leaflet
                positions popup panes with CSS transform — which changes what `position:
                fixed` measures against for any descendant. Without the portal, "fixed
                inset-0" would fill the small transformed popup pane instead of the real
                viewport, clipping the expanded view into a corner. */}
            <AnimatePresence>
              {active && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-10 h-full w-full bg-white/50 backdrop-blur-md dark:bg-black/50"
                />
              )}
            </AnimatePresence>
            <AnimatePresence>
              {active && (
                <div
                  className={cn(
                    "fixed inset-0 z-[100] flex justify-center overflow-y-auto px-4 py-8 sm:py-16"
                  )}
                >
                  <motion.div
                    layoutId={`card-${title}-${id}`}
                    ref={cardRef}
                    className={cn(
                      "relative flex h-fit w-full max-w-[850px] flex-col self-start overflow-visible rounded-2xl bg-zinc-50 shadow-sm dark:bg-zinc-950 dark:shadow-none",
                      classNameExpanded
                    )}
                    {...props}
                  >
                    <motion.div layoutId={`image-${title}-${id}`}>
                      <div className="relative before:absolute before:inset-x-0 before:bottom-[-1px] before:z-50 before:h-[70px] before:bg-gradient-to-t before:from-zinc-50 dark:before:from-zinc-950">
                        <img
                          src={src}
                          alt={title}
                          className="h-80 w-full rounded-t-2xl object-cover object-center"
                        />
                      </div>
                    </motion.div>
                    <div className="relative">
                      <div className="flex h-auto items-start justify-between p-8">
                        <div>
                          <motion.p
                            layoutId={`description-${description}-${id}`}
                            className="text-lg text-zinc-500 dark:text-zinc-400"
                          >
                            {description}
                          </motion.p>
                          <motion.h3
                            layoutId={`title-${title}-${id}`}
                            className="mt-0.5 text-4xl font-semibold text-black sm:text-4xl dark:text-white"
                          >
                            {title}
                          </motion.h3>
                        </div>
                        <motion.button
                          aria-label="Close card"
                          layoutId={`button-${title}-${id}`}
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-200/90 bg-zinc-50 text-neutral-700 transition-colors duration-300 hover:border-gray-300/90 hover:bg-neutral-50 hover:text-black focus:outline-none dark:border-zinc-900 dark:bg-zinc-950 dark:text-white/70 dark:hover:border-zinc-800 dark:hover:bg-neutral-950 dark:hover:text-white"
                          onClick={() => setActive(false)}
                        >
                          <motion.div
                            animate={{ rotate: active ? 45 : 0 }}
                            transition={{ duration: 0.4 }}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M5 12h14" />
                              <path d="M12 5v14" />
                            </svg>
                          </motion.div>
                        </motion.button>
                      </div>
                      <div className="relative px-6 pb-8 sm:px-8">
                        <motion.div
                          layout
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex flex-col items-start gap-4 text-base text-zinc-500 dark:text-zinc-400"
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

      <motion.div
        role="dialog"
        aria-labelledby={`card-title-${id}`}
        aria-modal="true"
        layoutId={`card-${title}-${id}`}
        onClick={() => setActive(true)}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-between rounded-2xl border border-gray-200/70 bg-zinc-50 p-3 shadow-sm dark:border-zinc-900 dark:bg-zinc-950 dark:shadow-none",
          className
        )}
      >
        <div className="flex flex-col gap-4">
          <motion.div layoutId={`image-${title}-${id}`}>
            <img
              src={src}
              alt={title}
              className="h-56 w-64 rounded-lg object-cover object-center"
            />
          </motion.div>
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <motion.p
                layoutId={`description-${description}-${id}`}
                className="text-sm font-medium text-zinc-500 md:text-left dark:text-zinc-400"
              >
                {description}
              </motion.p>
              <motion.h3
                layoutId={`title-${title}-${id}`}
                className="font-semibold text-black md:text-left dark:text-white"
              >
                {title}
              </motion.h3>
            </div>
            <motion.button
              aria-label="Open card"
              layoutId={`button-${title}-${id}`}
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gray-200/90 bg-zinc-50 text-neutral-700 transition-colors duration-300 hover:border-gray-300/90 hover:bg-neutral-50 hover:text-black focus:outline-none dark:border-zinc-900 dark:bg-zinc-950 dark:text-white/70 dark:hover:border-zinc-800 dark:hover:bg-neutral-950 dark:hover:text-white",
                className
              )}
            >
              <motion.div
                animate={{ rotate: active ? 45 : 0 }}
                transition={{ duration: 0.4 }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14" />
                  <path d="M12 5v14" />
                </svg>
              </motion.div>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </>
  )
}