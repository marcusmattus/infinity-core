import { Mic, Radar, ShieldCheck } from "lucide-react";

const layers = [
  {
    icon: Mic,
    index: "L1",
    title: "HumanOS",
    subtitle: "Human Interface",
    items: ["Voice", "Intent", "Context", "Spatial Language"],
  },
  {
    icon: Radar,
    index: "L2",
    title: "Spatial Intelligence",
    subtitle: "Understand the environment",
    items: ["Devices", "Location", "Gestures", "Sensors"],
  },
  {
    icon: ShieldCheck,
    index: "L3",
    title: "Infrastructure",
    subtitle: "Secure everything",
    items: ["Identity", "Pairing", "Connectivity", "Encryption"],
  },
];

export function CoreLayers() {
  return (
    <section id="layers" className="relative border-t border-border/60">
      <div className="mx-auto max-w-6xl px-5 py-24 sm:px-6 sm:py-32">
        <p className="mono-label text-muted-foreground">03 — Three core layers</p>
        <h2 className="mt-5 max-w-2xl text-3xl font-semibold tracking-[-0.03em] sm:text-5xl">
          A system architecture, not a feature list.
        </h2>

        <div className="mt-14 grid gap-4 lg:grid-cols-3">
          {layers.map(({ icon: Icon, index, title, subtitle, items }) => (
            <article
              key={title}
              className="group relative overflow-hidden rounded-3xl border border-border bg-surface/40 p-8 transition-colors hover:border-primary/50"
            >
              <div
                className="pointer-events-none absolute -right-16 -top-16 size-40 rounded-full gradient-fill opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-30"
                aria-hidden
              />
              <div className="relative flex items-center justify-between">
                <Icon className="size-5 text-primary" />
                <span className="mono-label text-muted-foreground">{index}</span>
              </div>
              <h3 className="relative mt-8 text-2xl font-semibold tracking-tight">{title}</h3>
              <p className="relative mt-1.5 text-sm text-muted-foreground">{subtitle}</p>
              <ul className="relative mt-8 space-y-px border-t border-border/70">
                {items.map((item) => (
                  <li
                    key={item}
                    className="flex items-center justify-between border-b border-border/70 py-3 text-sm"
                  >
                    <span>{item}</span>
                    <span className="size-1 rounded-full bg-primary/70" />
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
