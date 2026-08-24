import { InfinityMark } from "./InfinityMark";

const states = [
  { name: "Idle", detail: "Soft blue / purple glow" },
  { name: "Listening", detail: "Expanding rings" },
  { name: "Thinking", detail: "Rotating infinity pattern" },
  { name: "Executing", detail: "Connected nodes" },
  { name: "Complete", detail: "Subtle pulse" },
];

export function HumanOSSection() {
  return (
    <section id="humanos" className="relative border-t border-border/60">
      <div className="mx-auto max-w-6xl px-5 py-24 sm:px-6 sm:py-32">
        <p className="mono-label text-muted-foreground">04 — HumanOS</p>
        <h2 className="mt-5 max-w-2xl text-3xl font-semibold tracking-[-0.03em] sm:text-5xl">
          Intelligence, grounded in you.
        </h2>

        <div className="mt-16 grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          {/* Device */}
          <div className="relative mx-auto w-full max-w-[320px]">
            <div className="pointer-events-none absolute -inset-10 atmos-glow opacity-60" aria-hidden />
            <div className="relative rounded-[2.5rem] border border-border bg-background p-3 shadow-[var(--shadow-lift)]">
              <div className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-surface/60 px-5 pb-8 pt-6">
                <div className="mx-auto h-1 w-16 rounded-full bg-border" />
                <div className="mt-8 flex items-center justify-between">
                  <span className="mono-label text-muted-foreground">HumanOS</span>
                  <span className="mono-label text-primary">connected</span>
                </div>

                <p className="mt-10 text-xl font-medium tracking-tight">Good morning, Marcus.</p>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  What would you like to accomplish?
                </p>

                <div className="relative mx-auto mt-12 flex size-40 items-center justify-center">
                  <span className="absolute inset-0 rounded-full border border-primary/40 ring-out" />
                  <span
                    className="absolute inset-0 rounded-full border border-accent/40 ring-out"
                    style={{ animationDelay: "1.2s" }}
                  />
                  <span className="absolute inset-4 rounded-full gradient-fill opacity-25 blur-xl soft-pulse" />
                  <InfinityMark className="relative w-20 orbit-slow" animated />
                </div>

                <div className="mt-12 flex items-center justify-between rounded-full border border-border bg-background/60 px-4 py-3">
                  <span className="text-sm text-muted-foreground">Speak or type…</span>
                  <span className="size-2 rounded-full bg-primary soft-pulse" />
                </div>
              </div>
            </div>
          </div>

          {/* Orb states */}
          <div>
            <p className="mono-label text-muted-foreground">Orb states</p>
            <ul className="mt-6 divide-y divide-border border-y border-border">
              {states.map((state, index) => (
                <li key={state.name} className="flex items-center gap-5 py-5">
                  <span className="relative flex size-10 shrink-0 items-center justify-center">
                    <span
                      className="absolute inset-0 rounded-full gradient-fill opacity-30 blur-md"
                      style={{ animationDelay: `${index * 0.4}s` }}
                    />
                    <span className="relative size-3 rounded-full gradient-fill soft-pulse" />
                  </span>
                  <div>
                    <p className="text-sm font-medium">{state.name}</p>
                    <p className="text-sm text-muted-foreground">{state.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-8 max-w-md text-sm leading-relaxed text-muted-foreground">
              Complexity happens underneath. Simplicity happens above — every orb state is a
              readable signal of what the system is doing on your behalf.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
