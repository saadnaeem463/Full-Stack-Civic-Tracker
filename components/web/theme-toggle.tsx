"use client"

import * as React from "react"
import { Monitor, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { motion } from "@/components/motion"
import { cn } from "@/lib/utils"

const options = [
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
  { value: "system", label: "System", Icon: Monitor },
] as const

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme()
  // false on the server and during hydration, true afterwards (avoids a theme mismatch)
  const mounted = React.useSyncExternalStore(() => () => {}, () => true, () => false)
  const active = mounted ? theme : undefined

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className={cn("inline-flex items-center gap-0.5 rounded-full border border-border bg-muted/60 p-0.5", className)}
    >
      {options.map(({ value, label, Icon }) => {
        const selected = active === value
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={label}
            title={label}
            onClick={() => setTheme(value)}
            className={cn(
              "relative grid size-7 place-items-center rounded-full text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring",
              selected && "text-foreground"
            )}
          >
            {selected && (
              <motion.span
                layoutId="theme-pill"
                className="absolute inset-0 rounded-full bg-background shadow-sm ring-1 ring-border"
                transition={{ type: "spring", stiffness: 500, damping: 36 }}
              />
            )}
            <Icon className="relative size-3.5" aria-hidden="true" />
          </button>
        )
      })}
    </div>
  )
}
