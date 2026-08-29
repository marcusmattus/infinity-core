import { InfinityMark } from "./Wordmark";
import { Reveal } from "./Reveal";
import { SectionHeader } from "./SectionHeader";

const gaps = [
  {
    id: "Flat",
    title: "The phone has no depth",
    body: "Every capable computer already lives in a pocket — compute, storage, connectivity, apps. What it cannot do is put anything in the room with you.",
  },
  {
    id: "Heavy",
    title: "Headsets ask for too much",
    body: "Standalone spatial hardware duplicates the phone, then asks people to wear it. The compute problem was solved a decade ago; the interface problem was not.",
  },
  {
    id: "Closed",
    title: "Apps have nowhere to go",
    body: "Developers have no sanctioned route from an existing mobile app to a spatial surface — so spatial computing stays a separate platform instead of a new output.",
  },
];

export function ThesisSection() {
  return (
    <section id="thesis" className="border-b border-border">
      <div className="shell py-20 sm:py-28">
        <Reveal>
          <SectionHeader
            index="01"
            eyebrow="The gap"
            title={
              <>
                Compute is solved.
                <br />
                <span className="text-steel">The interface is not.</span>
              </>
            }
            standfirst="Spatial computing does not need another computer. It needs a hardware interface layer that the computer people already carry can plug into."
          />
        </Reveal>

        <Reveal className="rule-grid mt-16 lg:grid-cols-3" delay={80}>
          {gaps.map((gap, i) => (
            <article key={gap.title} className="bg-background p-7 sm:p-10">
              <div className="flex items-center justify-between">
                <span className="label-mono text-steel">
                  {String(i + 1).padStart(2, "0")} — {gap.id}
                </span>
                <span className="h-1.5 w-1.5 bg-border-strong" />
              </div>
              <h3 className="mt-10 font-display text-2xl font-semibold tracking-[-0.03em]">
                {gap.title}
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{gap.body}</p>
            </article>
          ))}
        </Reveal>

        <Reveal
          className="mt-px flex flex-col gap-5 border border-border bg-surface p-7 sm:flex-row sm:items-center sm:gap-8 sm:p-10"
          delay={160}
        >
          <InfinityMark className="h-7 w-14 shrink-0" animated />
          <p className="font-display text-lg font-medium tracking-[-0.02em] sm:text-xl">
            InfinityID builds the layer between them — one identity, one spatial context, one
            interface, across the phone you own and the space you are standing in.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
