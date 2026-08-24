const flow = [
  { step: "Human", detail: "Voice · intent · presence" },
  { step: "Context", detail: "Space · devices · identity" },
  { step: "Intelligence", detail: "Agents · reasoning · memory" },
  { step: "Action", detail: "Execution · feedback · trust" },
];

export function LayerSection() {
  return (
    <section id="layer" className="relative border-t border-border/60">
      <div className="mx-auto max-w-6xl px-5 py-24 sm:px-6 sm:py-32">
        <p className="mono-label text-muted-foreground">02 — InfinityID Layer</p>
        <h2 className="mt-5 max-w-3xl text-3xl font-semibold tracking-[-0.03em] sm:text-5xl">
          One interface connecting people, agents and devices.
        </h2>

        <div className="relative mt-16">
          <svg
            className="pointer-events-none absolute inset-x-0 top-1/2 hidden h-40 w-full -translate-y-1/2 md:block"
            viewBox="0 0 1200 160"
            fill="none"
            aria-hidden
          >
            <path
              d="M60 80 C240 -20 360 180 600 80 C840 -20 960 180 1140 80"
              stroke="var(--color-primary)"
              strokeWidth="1.2"
              className="path-flow opacity-70"
            />
          </svg>

          <ol className="relative grid gap-4 md:grid-cols-4">
            {flow.map((item, index) => (
              <li
                key={item.step}
                className="glass rounded-3xl p-6"
                style={{ marginTop: index % 2 === 1 ? "2rem" : undefined }}
              >
                <span className="mono-label text-primary">0{index + 1}</span>
                <h3 className="mt-4 text-lg font-medium">{item.step}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{item.detail}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
