const pillars = ["Voice", "Gesture", "Spatial language", "AI agents", "Environmental context"];

export function MetatronSection() {
  return (
    <section id="metatron" className="relative border-t border-border/60">
      <div className="mx-auto max-w-6xl px-5 py-24 sm:px-6 sm:py-32">
        <p className="mono-label text-muted-foreground">06 — Metatron</p>
        <h2 className="mt-5 max-w-2xl text-3xl font-semibold tracking-[-0.03em] sm:text-5xl">
          Computing beyond the screen.
        </h2>

        <div className="relative mt-14 overflow-hidden rounded-[2rem] border border-border bg-surface/30 p-6 sm:p-10">
          <div className="pointer-events-none absolute inset-0 atmos-glow opacity-40" aria-hidden />
          <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_minmax(0,1fr)]">
            <div className="relative mx-auto w-full max-w-[430px]">
              <div className="absolute inset-0 -z-10 translate-y-8 rounded-full gradient-fill opacity-20 blur-3xl" />
              <div className="relative h-[280px] rounded-[2rem] border border-border bg-background/70 sm:h-[340px]">
                <div className="absolute left-1/2 top-8 h-44 w-16 -translate-x-1/2 rounded-full border border-border bg-surface/60 sm:h-52 sm:w-20" />
                <div className="absolute left-8 top-14 rounded-xl border border-border bg-background/60 px-3 py-2 text-xs">
                  Voice · active
                </div>
                <div className="absolute right-8 top-24 rounded-xl border border-border bg-background/60 px-3 py-2 text-xs">
                  Gesture · tracking
                </div>
                <div className="absolute bottom-16 left-10 rounded-xl border border-border bg-background/60 px-3 py-2 text-xs">
                  Agent mesh · linked
                </div>
                <div className="absolute bottom-8 right-8 rounded-xl border border-border bg-background/60 px-3 py-2 text-xs">
                  Context · updated
                </div>
                <svg className="absolute inset-0 h-full w-full" viewBox="0 0 430 340" fill="none" aria-hidden>
                  <path
                    d="M34 126 C140 86 150 210 218 168 C276 132 314 188 395 144"
                    stroke="var(--color-primary)"
                    strokeWidth="1"
                    className="path-flow"
                  />
                  <path
                    d="M36 206 C130 248 196 120 246 182 C286 230 334 222 392 254"
                    stroke="var(--color-violet)"
                    strokeWidth="1"
                    className="path-flow"
                  />
                </svg>
              </div>
            </div>

            <div>
              <p className="max-w-xl text-base leading-relaxed text-muted-foreground">
                Metatron turns ambient signals into intelligent actions with floating spatial
                controls, depth-aware context, and secure agent execution.
              </p>
              <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                {pillars.map((item) => (
                  <li key={item} className="glass rounded-2xl px-4 py-3 text-sm">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
