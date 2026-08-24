import { Brain, Fingerprint, Cpu } from "lucide-react";
import { InfinityMark } from "./InfinityMark";

const pieces = [
  { icon: Brain, title: "AI", body: "Intelligence without context" },
  { icon: Fingerprint, title: "Identity", body: "Who you are" },
  { icon: Cpu, title: "Devices", body: "Where you are" },
];

export function ProblemSection() {
  return (
    <section id="problem" className="relative border-t border-border/60">
      <div className="mx-auto max-w-6xl px-5 py-24 sm:px-6 sm:py-32">
        <p className="mono-label text-muted-foreground">01 — The problem</p>
        <h2 className="mt-5 max-w-2xl text-3xl font-semibold tracking-[-0.03em] sm:text-5xl">
          AI is powerful. But it doesn’t know you.
        </h2>

        <div className="mt-14 grid gap-4 sm:grid-cols-3">
          {pieces.map(({ icon: Icon, title, body }) => (
            <article
              key={title}
              className="rounded-3xl border border-border bg-surface/40 p-7 transition-colors hover:border-primary/50"
            >
              <Icon className="size-5 text-primary" />
              <h3 className="mt-6 text-lg font-medium">{title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{body}</p>
              <div className="mt-8 h-px w-full bg-gradient-to-r from-border to-transparent" />
            </article>
          ))}
        </div>

        <div className="relative mt-4 overflow-hidden rounded-3xl border border-border bg-surface/30 px-6 py-10 text-center">
          <div className="pointer-events-none absolute inset-0 atmos-glow opacity-40" aria-hidden />
          <svg
            className="relative mx-auto hidden h-16 w-full max-w-3xl sm:block"
            viewBox="0 0 900 60"
            fill="none"
            aria-hidden
          >
            <path
              d="M150 0 C150 40 450 20 450 30 C450 20 750 40 750 0"
              stroke="var(--color-primary)"
              strokeWidth="1"
              className="path-flow"
            />
          </svg>
          <div className="relative mt-2 flex flex-col items-center gap-3">
            <InfinityMark className="w-14" animated />
            <p className="text-sm font-medium">
              Connected through the <span className="gradient-text">InfinityID Layer</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
