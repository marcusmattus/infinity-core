import { ArrowDownRight, ArrowRight } from "lucide-react";
import { HoloEngine } from "./HoloEngine";

const rail: Array<[string, string]> = [
  ["Form factor", "138 × 52 mm"],
  ["Optical nodes", "12 · Metatron lattice"],
  ["Connection", "Single USB-C"],
  ["Host", "iOS · Android"],
];

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden border-b border-border">
      <div className="blueprint-fade pointer-events-none absolute inset-0 opacity-70" aria-hidden />
      <div
        className="atmos-glow pointer-events-none absolute inset-x-0 top-[-10%] h-[78%] opacity-45"
        aria-hidden
      />

      <div className="shell relative pt-28 pb-0 sm:pt-36">
        <div className="grid gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-10">
          <div>
            <p className="label-mono flex items-center gap-3 text-steel">
              <span className="h-px w-8 bg-electric" />
              InfinityID Labs — human interface layer
            </p>

            <h1 className="display-tight mt-8 text-[3.25rem] sm:text-[5.5rem] lg:text-[6.75rem]">
              The interface
              <br />
              leaves the
              <br />
              <span className="gradient-text">screen.</span>
            </h1>

            <p className="mt-9 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
              HoloDock is a pocket-sized optical engine that turns an ordinary phone into a spatial
              computer. The phone keeps the compute, storage and apps. HoloDock adds the light
              field, the depth sensing and the space to put things in.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              <a
                href="#device"
                className="gradient-fill inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                See the device <ArrowRight className="size-4" />
              </a>
              <a
                href="#access"
                className="inline-flex items-center gap-2 border border-border-strong px-6 py-3.5 text-sm font-semibold transition-colors hover:border-electric hover:text-electric"
              >
                Request developer access <ArrowDownRight className="size-4" />
              </a>
            </div>
          </div>

          <div className="relative">
            <HoloEngine className="mx-auto w-full max-w-[560px]" />
          </div>
        </div>

        {/* Structured data rail — the first hard facts, before any prose. */}
        <dl className="rule-grid mt-16 grid-cols-2 border-t border-border lg:grid-cols-4">
          {rail.map(([term, value]) => (
            <div key={term} className="bg-background px-4 py-6 sm:px-6">
              <dt className="label-mono text-steel">{term}</dt>
              <dd className="mt-2.5 font-mono text-sm text-foreground">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
