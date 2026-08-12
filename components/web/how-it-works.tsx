import React from "react";
import {
  ArrowRightIcon,
  CheckCircle2Icon,
  MapPinIcon,
  ShieldCheckIcon,
  XIcon,
} from "lucide-react";
import Link from "next/link";
type HowItWorksPageProps = {
  onClose: () => void;
  onReport: () => void;
};

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
];

export function HowItWorksPage({ onClose, onReport }: HowItWorksPageProps) {
  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-[#f7f8f4] text-[#17211b]"
      role="dialog"
      aria-modal="true"
      aria-label="How CivicTrack works"
    >
      <header className="sticky top-0 z-10 border-b border-[#dfe5dc] bg-[#fbfcf9]/95 backdrop-blur">
        <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-5 sm:px-8">
          <Link href={'/'}
            onClick={onClose}
            className="flex items-center gap-2 text-sm font-semibold text-[#415047] hover:text-[#1e5b3e]"
          >
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#e8efe7]">
              ←
            </span>{" "}
            Back to map
          </Link>
          <span className="hidden text-xs font-bold uppercase tracking-[.16em] text-[#63816b] sm:block">
            CivicTrack guide
          </span>
        </div>
      </header>
      <main>
        <section className="mx-auto max-w-6xl px-5 pb-16 pt-16 sm:px-8 sm:pb-24 sm:pt-24">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-[#4f805e]">
            A clearer way to care for a city
          </p>
          <div className="mt-5 grid gap-10 lg:grid-cols-[1.2fr_.8fr] lg:items-end">
            <div>
              <h1 className="max-w-3xl font-['Newsreader'] text-[51px] leading-[.97] tracking-[-.055em] sm:text-[76px]">
                Small reports.
                <br />
                Real civic progress.
              </h1>
              <p className="mt-7 max-w-xl text-lg leading-8 text-[#5d695f]">
                CivicTrack connects the people who notice everyday problems with
                the teams who can fix them—openly, respectfully, and in public
                view.
              </p>
            </div>
            <aside className="rounded-2xl border border-[#cfddcf] bg-[#e8f1e7] p-6">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#1e5b3e] text-white">
                <CheckCircle2Icon size={20} />
              </span>
              <h2 className="mt-4 text-lg font-bold">Built for everyone</h2>
              <p className="mt-2 text-sm leading-6 text-[#506152]">
                Maps are only one way in. You can search, browse reports as a
                list, and use every core action with a keyboard.
              </p>
            </aside>
          </div>
        </section>
        <section className="border-y border-[#dfe5dc] bg-white">
          <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
            <div className="mb-10 max-w-md">
              <p className="text-xs font-bold uppercase tracking-[.15em] text-[#63816b]">
                The process
              </p>
              <h2 className="mt-2 font-['Newsreader'] text-[39px] leading-none tracking-[-.04em]">
                From observation to outcome.
              </h2>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {steps.map((step) => {
                const Icon = step.icon;
                return (
                  <article
                    key={step.number}
                    className="border-t-2 border-[#b9d0b9] pt-5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-[#4e7b59]">
                        {step.number}
                      </span>
                      <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#eef5ed] text-[#286244]">
                        <Icon size={20} />
                      </span>
                    </div>
                    <h3 className="mt-7 text-xl font-bold tracking-[-.025em]">
                      {step.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-[#657067]">
                      {step.body}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
        <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
          <div className="grid overflow-hidden rounded-2xl bg-[#1d4f36] text-white lg:grid-cols-2">
            <div className="p-8 sm:p-12">
              <p className="text-xs font-bold uppercase tracking-[.16em] text-[#b9d7bd]">
                What happens after you report
              </p>
              <h2 className="mt-3 font-['Newsreader'] text-[42px] leading-[1.02] tracking-[-.04em]">
                No report disappears into a void.
              </h2>
              <p className="mt-5 max-w-md text-sm leading-6 text-[#d3e4d5]">
                Every issue starts with a public status. Officials update the
                timeline as work is scheduled, underway, and complete—so you
                always know what’s next.
              </p>
              <button
                onClick={onReport}
                className="mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-bold text-[#1e5b3e] hover:bg-[#edf5ec]"
              >
                Report an issue <ArrowRightIcon size={16} />
              </button>
            </div>
            <div className="flex items-center bg-[#285e41] p-8 sm:p-12">
              <div className="w-full space-y-3">
                {["Reported", "Acknowledged", "In progress", "Resolved"].map(
                  (status, index) => (
                    <div
                      key={status}
                      className={`flex items-center gap-3 rounded-lg px-4 py-3 ${index === 2 ? "bg-white text-[#1e5b3e] shadow-lg" : "bg-white/10 text-white"}`}
                    >
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${index === 3 ? "bg-emerald-300" : index === 2 ? "bg-blue-500" : "bg-[#b9d7bd]"}`}
                      />
                      <span className="text-sm font-semibold">{status}</span>
                      {index === 2 && (
                        <span className="ml-auto text-xs font-medium text-[#5c7865]">
                          Crew assigned
                        </span>
                      )}
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}