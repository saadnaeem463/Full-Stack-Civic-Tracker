"use client";

import React, { useEffect, useState } from "react";
import { XIcon } from "lucide-react";
import { animate, useReducedMotion } from "motion/react";
import { EASE, motion } from "@/components/motion";

/**
 * Staff portal design tokens (single source of truth).
 *
 * Type scale
 *   page title    text-2xl sm:text-3xl font-semibold tracking-tight
 *   section title text-sm font-semibold tracking-tight
 *   card body     text-sm
 *   caption       text-xs
 *   eyebrow       text-[11px] font-semibold uppercase tracking-[.14em]
 *
 * Surfaces
 *   every card/panel uses rounded-lg + border-border + bg-card + p-5 + shadow-xs
 *   so elevation comes from the off-white canvas / white card contrast.
 */

export const pageContainer = "mx-auto w-full max-w-6xl";

export const eyebrowClass =
  "text-[11px] font-semibold uppercase tracking-[.14em] text-muted-foreground";

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: EASE }}
      className={`rounded-lg border border-border bg-card p-5 shadow-xs ${className}`}
    >
      {children}
    </motion.div>
  );
}

export function PageHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div className="min-w-0">
        <p className={eyebrowClass}>{eyebrow}</p>
        <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </div>
      {action}
    </div>
  );
}

export function SectionCard({
  title,
  description,
  children,
  action,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, ease: EASE }}
      className="rounded-lg border border-border bg-card p-5 shadow-xs"
    >
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold tracking-tight text-foreground">{title}</h2>
          {description && (
            <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>
          )}
        </div>
        {action}
      </div>
      {children}
    </motion.section>
  );
}

/** Numbers count up once when they first appear (skipped for reduced motion). */
function CountUp({ value }: { value: number }) {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(reduce ? value : 0);
  useEffect(() => {
    if (reduce) {
      setShown(value);
      return;
    }
    const controls = animate(0, value, {
      duration: 0.9,
      ease: EASE,
      onUpdate: (latest) => setShown(Math.round(latest)),
    });
    return () => controls.stop();
  }, [value, reduce]);
  return <>{shown.toLocaleString()}</>;
}

/** Stat tiles — identical padding and alignment for every KPI on the dashboard. */
export function StatCard({
  label,
  value,
  note,
  accent = "text-foreground",
  index = 0,
}: {
  label: string;
  value: React.ReactNode;
  note?: string;
  accent?: string;
  /** position in its grid — drives the entrance stagger */
  index?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE, delay: 0.05 + index * 0.07 }}
      whileHover={{ y: -3 }}
      className="flex min-w-0 flex-col rounded-lg border border-border bg-card p-5 shadow-xs transition-shadow hover:shadow-md"
    >
      <p className={eyebrowClass}>{label}</p>
      <p className={`mt-2 truncate text-2xl font-semibold tabular-nums tracking-tight ${accent}`}>
        {typeof value === "number" ? <CountUp value={value} /> : value}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{note}</p>
    </motion.div>
  );
}

export function EmptyState({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: EASE }}
      className="rounded-lg border border-dashed border-border bg-card px-6 py-12 text-center"
    >
      <span className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-primary/10 text-primary">
        {icon ?? <XIcon size={20} />}
      </span>
      <h3 className="mt-4 text-sm font-semibold">{title}</h3>
      <p className="mx-auto mt-1.5 max-w-sm text-xs leading-5 text-muted-foreground">
        {description}
      </p>
    </motion.div>
  );
}

/** Loading placeholder used by every admin page while its data fetches. */
export function PageLoading({ label }: { label: string }) {
  return (
    <div className={`${pageContainer} space-y-4`} role="status" aria-live="polite">
      <span className="sr-only">{label}</span>
      <div className="h-7 w-48 animate-pulse rounded-md bg-muted" />
      <div className="h-4 w-80 max-w-full animate-pulse rounded-md bg-muted" />
      <div className="grid grid-cols-1 gap-4 pt-3 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-28 animate-pulse rounded-lg border border-border bg-card" />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-lg border border-border bg-card" />
    </div>
  );
}
