"use client"

/**
 * CivicTrack motion kit — one place for every animation so the whole app
 * moves with the same rhythm. Built on Motion (`motion/react`).
 *
 * - <MotionProvider> honours the OS "reduce motion" setting for every animation below.
 * - Durations stay short (150–400ms) and use one shared easing curve.
 */
import * as React from "react"
import { usePathname } from "next/navigation"
import {
  AnimatePresence,
  MotionConfig,
  motion,
  type HTMLMotionProps,
  type Variants,
} from "motion/react"

export const EASE = [0.22, 1, 0.36, 1] as const

export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user" transition={{ duration: 0.3, ease: EASE }}>
      {children}
    </MotionConfig>
  )
}

/** Fades + lifts page content each time the route changes. */
export function PageTransition({ children, className }: { children: React.ReactNode; className?: string }) {
  const pathname = usePathname()
  return (
    <motion.div
      key={pathname}
      className={className}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: EASE }}
    >
      {children}
    </motion.div>
  )
}

/** Fade-up entrance. `inView` waits until the block scrolls into view. */
export function Reveal({
  children,
  delay = 0,
  y = 14,
  inView = false,
  className,
  ...rest
}: {
  children: React.ReactNode
  delay?: number
  y?: number
  inView?: boolean
} & Omit<HTMLMotionProps<"div">, "children" | "initial" | "animate" | "whileInView">) {
  const target = { opacity: 1, y: 0 }
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      {...(inView
        ? { whileInView: target, viewport: { once: true, margin: "-60px" } }
        : { animate: target })}
      transition={{ duration: 0.4, ease: EASE, delay }}
      {...rest}
    >
      {children}
    </motion.div>
  )
}

const staggerParent: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
}
const staggerChild: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.38, ease: EASE } },
}

/** Wrap a grid/list in <Stagger> and each child in <StaggerItem>. */
export function Stagger({
  children,
  className,
  inView = false,
}: {
  children: React.ReactNode
  className?: string
  inView?: boolean
}) {
  return (
    <motion.div
      className={className}
      variants={staggerParent}
      initial="hidden"
      {...(inView
        ? { whileInView: "show", viewport: { once: true, margin: "-60px" } }
        : { animate: "show" })}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({
  children,
  className,
  ...rest
}: { children: React.ReactNode; className?: string } & Omit<HTMLMotionProps<"div">, "children" | "variants">) {
  return (
    <motion.div className={className} variants={staggerChild} {...rest}>
      {children}
    </motion.div>
  )
}

/** Card that lifts slightly on hover and presses on tap. */
export function HoverLift({
  children,
  className,
  ...rest
}: { children: React.ReactNode; className?: string } & Omit<HTMLMotionProps<"div">, "children">) {
  return (
    <motion.div
      className={className}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: "spring", stiffness: 380, damping: 26 }}
      {...rest}
    >
      {children}
    </motion.div>
  )
}

/** Animated popover panel (notification list, budget requests…). Render inside <AnimatePresence>. */
export function PopPanel({
  children,
  className,
  ...rest
}: { children: React.ReactNode; className?: string } & Omit<HTMLMotionProps<"div">, "children">) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: -6, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.97 }}
      transition={{ duration: 0.16, ease: EASE }}
      style={{ transformOrigin: "top right" }}
      {...rest}
    >
      {children}
    </motion.div>
  )
}

export { AnimatePresence, motion }
