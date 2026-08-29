import { Reveal } from "./Reveal";
import { SectionHeader } from "./SectionHeader";

const pillars = [
  {
    id: "H",
    name: "Human",
    role: "Human interface layer",
    body: "The system reads people, not commands. Presence, attention and intent are first-class inputs — so the interface can be spoken to, pointed at, or simply stood in front of.",
    tags: ["Voice", "Gesture", "Vision", "Spatial position", "Attention", "Interaction"],
  },
  {
    id: "I",
    name: "Intelligence",
    role: "Agent layer",
    body: "Agents that reason over what the device can see and hear, running on the phone where latency matters and in the cloud where scale does.",
    tags: [
      "Assistants",
      "Agents",
      "Multimodal reasoning",
      "Local inference",
      "Knowledge graphs",
      "Tool calling",
    ],
  },
  {
    id: "S",
    name: "Security",
    role: "Trusted device layer",
    body: "A device that watches a room has to be accountable to the person holding it. Capabilities are declared, granted per plugin, and revocable — and sensor data stays under the user's control.",
    tags: [
      "Identity",
      "Permissions",
      "Encrypted transport",
      "Device pairing",
      "Capability scopes",
      "User-held data",
    ],
  },
];

export function PillarsSection() {
  return (
    <section id="pillars" className="relative overflow-hidden border-b border-border bg-surface">
      <div className="blueprint-grid pointer-events-none absolute inset-0 opacity-35" aria-hidden />

      <div className="shell relative py-20 sm:py-28">
        <Reveal>
          <SectionHeader
            index="05"
            eyebrow="Principles"
            title={
              <>
                Human. Intelligence.
                <br />
                <span className="gradient-text">Security.</span>
              </>
            }
            standfirst="Three commitments that shape every decision in the stack — and the order they are weighed in when they conflict."
          />
        </Reveal>

        <div className="mt-16 border-t border-border">
          {pillars.map((pillar, i) => (
            <Reveal
              key={pillar.name}
              className="grid gap-6 border-b border-border py-10 lg:grid-cols-[7rem_1fr_1.1fr] lg:gap-12 lg:py-14"
              delay={i * 70}
            >
              <span className="display-tight text-5xl text-border-strong lg:text-6xl">
                {pillar.id}
              </span>

              <div>
                <h3 className="font-display text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
                  {pillar.name}
                </h3>
                <p className="label-mono mt-3 text-steel">{pillar.role}</p>
              </div>

              <div>
                <p className="text-[0.95rem] leading-relaxed text-muted-foreground">
                  {pillar.body}
                </p>
                <ul className="mt-7 flex flex-wrap gap-2">
                  {pillar.tags.map((tag) => (
                    <li
                      key={tag}
                      className="label-mono border border-border px-3 py-1.5 text-steel"
                    >
                      {tag}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
