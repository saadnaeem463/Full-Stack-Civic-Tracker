"use client"

import Link from "next/link"
import {
  ArrowRightIcon,
  CheckCircle2Icon,
  MapPinIcon,
  ShieldCheckIcon,
} from "lucide-react"
import { Reveal, Stagger, StaggerItem, HoverLift, motion } from "@/components/motion"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const steps = [
  {
    number: "01",
    title: "Point out what needs care",
    body: "Find an issue on the map or add a new report with a photo and location. You can browse without an account; signing in lets you contribute.",
    icon: MapPinIcon,
  },
  {
    number: "02",
    title: "Your city takes it from there",
    body: "The right city team reviews the report, shares progress, and keeps the public timeline up to date.",
    icon: ShieldCheckIcon,
  },
  {
    number: "03",
    title: "Watch the change happen",
    body: "Follow the reports that matter to you and get updates as an issue is acknowledged, assigned, and resolved.",
    icon: CheckCircle2Icon,
  },
]

const timeline = ["Reported", "Acknowledged", "In progress", "Resolved"]
const timelineDot = ["bg-destructive", "bg-info", "bg-warning", "bg-success"]

export function HowItWorksPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_20%_0%,color-mix(in_oklch,var(--primary)_14%,transparent),transparent_70%)]"
        />
        <div className="mx-auto max-w-6xl px-5 pb-16 pt-14 sm:px-8 sm:pb-24 sm:pt-20">
          <Reveal>
            <p className="text-[11px] font-semibold uppercase tracking-[.16em] text-primary">
              A clearer way to care for a city
            </p>
          </Reveal>
          <div className="mt-5 grid gap-10 lg:grid-cols-[1.2fr_.8fr] lg:items-end">
            <div>
              <Reveal delay={0.05}>
                <h1 className="max-w-3xl text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
                  Small reports.
                  <br />
                  <span className="text-primary">Real civic progress.</span>
                </h1>
              </Reveal>
              <Reveal delay={0.12}>
                <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
                  CivicTrack connects the people who notice everyday problems with the teams who
                  can fix them — openly, respectfully, and in public view.
                </p>
              </Reveal>
              <Reveal delay={0.18}>
                <Link href="/" className={cn(buttonVariants({ size: "lg" }), "mt-8 h-10 gap-2 px-4")}>
                  Open the map <ArrowRightIcon size={16} aria-hidden="true" />
                </Link>
              </Reveal>
            </div>
            <Reveal delay={0.2}>
              <aside className="rounded-xl border border-border bg-card p-6 shadow-xs">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-primary-foreground">
                  <CheckCircle2Icon size={20} aria-hidden="true" />
                </span>
                <h2 className="mt-4 text-lg font-semibold">Built for everyone</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Maps are only one way in. You can search, browse reports as a list, and use every
                  core action with a keyboard.
                </p>
              </aside>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
          <Reveal inView className="mb-10 max-w-md">
            <p className="text-[11px] font-semibold uppercase tracking-[.16em] text-muted-foreground">
              The process
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">From observation to outcome.</h2>
          </Reveal>
          <Stagger inView className="grid gap-8 md:grid-cols-3">
            {steps.map((step) => {
              const Icon = step.icon
              return (
                <StaggerItem key={step.number}>
                  <HoverLift className="h-full rounded-xl border border-border bg-background p-6">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-semibold text-primary">{step.number}</span>
                      <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                        <Icon size={20} aria-hidden="true" />
                      </span>
                    </div>
                    <h3 className="mt-6 text-lg font-semibold tracking-tight">{step.title}</h3>
                    <p className="mt-2.5 text-sm leading-6 text-muted-foreground">{step.body}</p>
                  </HoverLift>
                </StaggerItem>
              )
            })}
          </Stagger>
        </div>
      </section>

      {/* After you report */}
      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
        <Reveal inView>
          <div className="grid overflow-hidden rounded-2xl border border-border bg-card lg:grid-cols-2">
            <div className="p-8 sm:p-12">
              <p className="text-[11px] font-semibold uppercase tracking-[.16em] text-primary">
                What happens after you report
              </p>
              <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
                No report disappears into a void.
              </h2>
              <p className="mt-5 max-w-md text-sm leading-6 text-muted-foreground">
                Every issue starts with a public status. Officials update the timeline as work is
                scheduled, underway, and complete — so you always know what&apos;s next.
              </p>
              <Link href="/" className={cn(buttonVariants({ size: "lg" }), "mt-8 h-10 gap-2 px-4")}>
                Report an issue <ArrowRightIcon size={16} aria-hidden="true" />
              </Link>
            </div>
            <div className="flex items-center bg-muted/60 p-8 sm:p-12">
              <ol className="w-full space-y-3">
                {timeline.map((status, index) => (
                  <motion.li
                    key={status}
                    initial={{ opacity: 0, x: 16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 + index * 0.1, duration: 0.35 }}
                    className={cn(
                      "flex items-center gap-3 rounded-lg border px-4 py-3",
                      index === 2
                        ? "border-primary/30 bg-card shadow-sm"
                        : "border-border bg-card/60"
                    )}
                  >
                    <span className={cn("h-2.5 w-2.5 rounded-full", timelineDot[index])} />
                    <span className="text-sm font-semibold">{status}</span>
                    {index === 2 && (
                      <span className="ml-auto text-xs font-medium text-muted-foreground">Crew assigned</span>
                    )}
                  </motion.li>
                ))}
              </ol>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  )
}
