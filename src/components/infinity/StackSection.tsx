import { Cpu, Layers, Puzzle } from "lucide-react";
import { Reveal } from "./Reveal";
import { SectionHeader } from "./SectionHeader";

const layers = [
  {
    id: "01",
    icon: Cpu,
    name: "HoloDock",
    role: "Hardware",
    body: "The optical engine. It carries projection, depth sensing and spatial anchoring — and no user data. One USB-C cable is the whole integration surface.",
    items: [
      "Micro-OLED light engine",
      "LiDAR + stereo depth",
      "IMU and spatial anchors",
      "Foldable optical assembly",
    ],
  },
  {
    id: "02",
    icon: Layers,
    name: "SpatialOS",
    role: "Phone runtime",
    body: "The control centre that runs on the phone. It composes the scene, drives calibration, and renders every frame the dock projects.",
    items: [
      "Hologram Studio",
      "Device manager & calibration",
      "Spatial app builder",
      "AI-assisted scene generation",
    ],
  },
  {
    id: "03",
    icon: Puzzle,
    name: "Openware",
    role: "Extension platform",
    body: "A sanctioned plugin model, not injection into other people's apps. Developers adopt the SDK and declare the capabilities they need.",
    items: [
      "Plugin manifest",
      "Capability permissions",
      "Android + iOS SDK",
      "InfinityID plugin store",
    ],
  },
];

/** The signal path, from an agent's intent to light in the room. */
const chain = [
  "Agent services",
  "Openware API",
  "Platform SDK",
  "InfinityID app",
  "Spatial runtime",
  "HoloDock SDK",
  "Optical engine",
  "Spatial output",
];

export function StackSection() {
  return (
    <section id="stack" className="border-b border-border">
      <div className="shell py-20 sm:py-28">
        <Reveal>
          <SectionHeader
            index="03"
            eyebrow="The platform"
            title={
              <>
                Three layers.
                <br />
                <span className="text-steel">One interface.</span>
              </>
            }
            standfirst="Complexity happens underneath: optics, sensor fusion, permissions, transport. Above the line, a developer positions an object in space and it appears."
          />
        </Reveal>

        <Reveal className="rule-grid mt-16 lg:grid-cols-3" delay={80}>
          {layers.map(({ id, icon: Icon, name, role, body, items }) => (
            <article key={name} className="group bg-background p-7 sm:p-10">
              <div className="flex items-start justify-between">
                <span className="label-mono text-electric">{id}</span>
                <Icon className="size-5 text-steel transition-colors group-hover:text-electric" />
              </div>

              <h3 className="mt-12 font-display text-3xl font-semibold tracking-[-0.035em]">
                {name}
              </h3>
              <p className="label-mono mt-2 text-steel">{role}</p>
              <p className="mt-5 text-sm leading-relaxed text-muted-foreground">{body}</p>

              <ul className="mt-8 space-y-3 border-t border-border pt-7">
                {items.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm">
                    <span className="gradient-fill h-1 w-1 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </Reveal>

        <Reveal className="mt-px border border-border bg-surface p-7 sm:p-10" delay={140}>
          <p className="label-mono text-steel">Signal path — intent to light</p>
          <ol className="mt-8 flex flex-wrap items-stretch gap-px bg-border">
            {chain.map((node, i) => (
              <li
                key={node}
                className="flex min-w-[9.5rem] flex-1 flex-col justify-between gap-6 bg-surface px-4 py-5"
              >
                <span className="label-mono text-electric">{String(i + 1).padStart(2, "0")}</span>
                <span className="font-mono text-xs leading-snug text-foreground/90">{node}</span>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}
