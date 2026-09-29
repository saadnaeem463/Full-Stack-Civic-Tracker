import Link from "next/link"
import { ArrowLeftIcon, BellRingIcon, MapIcon, MapPinIcon, ShieldCheckIcon } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { Reveal } from "@/components/motion"
import { ThemeToggle } from "@/components/web/theme-toggle"

const highlights = [
  { Icon: MapPinIcon, title: "Report in seconds", body: "Pin an issue on the map with a photo and location." },
  { Icon: BellRingIcon, title: "Stay in the loop", body: "Get notified the moment your report changes status." },
  { Icon: ShieldCheckIcon, title: "Handled in the open", body: "Every update is tracked on a public timeline." },
]

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      {/* Brand panel — desktop only */}
      <aside className="relative hidden overflow-hidden bg-primary text-primary-foreground lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/10 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-black/20 blur-3xl"
        />
        <Link href="/" className="relative flex items-center gap-2.5 text-lg font-semibold tracking-tight">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-white/15 backdrop-blur">
            <MapIcon size={20} strokeWidth={2.3} />
          </span>
          CivicTrack
        </Link>

        <div className="relative max-w-md">
          <Reveal>
            <h2 className="text-4xl font-semibold leading-[1.1] tracking-tight">
              Small reports.
              <br />
              Real civic progress.
            </h2>
          </Reveal>
          <ul className="mt-10 space-y-6">
            {highlights.map(({ Icon, title, body }, index) => (
              <Reveal key={title} delay={0.15 + index * 0.1}>
                <li className="flex gap-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white/15">
                    <Icon size={19} aria-hidden="true" />
                  </span>
                  <div>
                    <p className="font-semibold">{title}</p>
                    <p className="mt-0.5 text-sm leading-6 text-primary-foreground/75">{body}</p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-primary-foreground/60">
          © {new Date().getFullYear()} CivicTrack. Built for the people who keep cities running.
        </p>
      </aside>

      {/* Form column */}
      <div className="relative flex min-h-screen flex-col px-4 py-6 sm:px-8">
        <div className="flex items-center justify-between">
          <Link href="/" className={buttonVariants({ variant: "ghost" })}>
            <ArrowLeftIcon className="size-4" aria-hidden="true" />
            Back to map
          </Link>
          <ThemeToggle />
        </div>
        <div className="flex flex-1 items-center justify-center py-8">
          <Reveal className="w-full max-w-md">{children}</Reveal>
        </div>
      </div>
    </div>
  )
}
