import { ArrowRight } from "lucide-react";
import { InfinityMark } from "./InfinityMark";

const nodes = [
  { label: "identity", x: "10%", y: "22%" },
  { label: "context", x: "82%", y: "18%" },
  { label: "agents", x: "6%", y: "72%" },
  { label: "devices", x: "86%", y: "74%" },
];

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 spatial-grid opacity-70" aria-hidden />
      <div className="pointer-events-none absolute inset-x-0 top-24 mx-auto h-[520px] max-w-4xl atmos-glow opacity-70" aria-hidden />

      <div className="relative mx-auto max-w-6xl px-5 pb-24 pt-36 sm:px-6 sm:pb-32 sm:pt-44">
        <p className="mono-label text-muted-foreground">Human interface layer · v1</p>
        <h1 className="mt-6 max-w-4xl text-4xl font-semibold leading-[1.05] tracking-[-0.035em] sm:text-6xl lg:text-7xl">
          The Human Interface Layer for the{" "}
          <span className="gradient-text">Next Computing Era.</span>
        </h1>
        <p className="mt-7 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          InfinityID connects human intelligence, identity, spatial context and AI agents into one
          secure, seamless computing layer.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <a
            href="#humanos"
            className="gradient-fill inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Explore HumanOS <ArrowRight className="size-4" />
          </a>
          <a
            href="#agents"
            className="glass inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-medium transition-colors hover:border-primary/60"
          >
            Build with InfinityID <ArrowRight className="size-4" />
          </a>
        </div>

        {/* Spatial hero visual */}
        <div className="relative mt-16 aspect-[4/3] w-full sm:mt-24 sm:aspect-[16/9]">
          <div className="absolute inset-0 rounded-[2rem] border border-border/70 bg-surface/30" />

          {/* orbit rings */}
          <div className="absolute left-1/2 top-1/2 aspect-square w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-border/80 orbit-slow">
            <span className="absolute -top-1 left-1/2 size-2 -translate-x-1/2 rounded-full bg-primary" />
          </div>
          <div className="absolute left-1/2 top-1/2 aspect-square w-[54%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-border orbit-rev">
            <span className="absolute -bottom-1 left-1/2 size-1.5 -translate-x-1/2 rounded-full bg-accent" />
          </div>

          {/* connection paths */}
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 800 450" fill="none" aria-hidden>
            <path
              d="M80 100 C260 150 300 200 400 225 C500 250 540 300 720 335"
              stroke="var(--color-border)"
              strokeWidth="1"
              className="path-flow"
            />
            <path
              d="M720 80 C540 140 500 200 400 225 C300 250 260 300 80 325"
              stroke="var(--color-border)"
              strokeWidth="1"
              className="path-flow"
            />
          </svg>

          {/* luminous orb + human silhouette */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="relative flex size-40 items-center justify-center sm:size-56">
              <span className="absolute inset-0 rounded-full gradient-fill opacity-25 blur-2xl soft-pulse" />
              <span className="absolute inset-6 rounded-full border border-primary/40" />
              <InfinityMark className="relative w-24 sm:w-32" animated />
            </div>
          </div>

          {/* silhouette hand / device outline */}
          <div className="absolute bottom-6 left-1/2 h-24 w-40 -translate-x-1/2 rounded-t-[5rem] border-x border-t border-border/80 bg-gradient-to-t from-primary/10 to-transparent sm:h-32 sm:w-56" />
          <div className="absolute bottom-6 right-8 hidden h-24 w-14 rounded-2xl border border-border/80 bg-surface/40 sm:block" />

          {nodes.map((node) => (
            <span
              key={node.label}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: node.x, top: node.y }}
            >
              <span className="glass mono-label flex items-center gap-2 rounded-full px-3 py-1.5 text-muted-foreground">
                <span className="size-1.5 rounded-full bg-primary soft-pulse" />
                {node.label}
              </span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
