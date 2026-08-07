import { ArrowRight, Terminal } from "lucide-react";

const ticker = [
  "sensory input fusion",
  "spatial canvas",
  "holographic mesh",
  "camera mcp server",
  "depth vision",
  "array microphones",
];

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden border-b border-border pt-14">
      <div className="pointer-events-none absolute inset-0 blueprint-grid opacity-40" aria-hidden />
      <div className="relative mx-auto max-w-[1400px] px-4 pb-16 pt-16 sm:px-6 sm:pb-24 sm:pt-28">
        <p className="label-mono text-primary">Spatial computing · MCP native</p>
        <h1 className="mt-6 font-display text-[3.25rem] font-bold leading-[0.9] tracking-[-0.04em] sm:text-[6rem] lg:text-[8.5rem]">
          beyond the
          <br />
          interface
        </h1>
        <p className="mt-8 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          InfinityID Labs builds the handheld spatial node, the camera MCP servers, and the
          holographic SDKs that let AI agents see, hear, and render in real space.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-3">
          <a
            href="#onboarding"
            className="inline-flex items-center gap-2 bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Start onboarding <ArrowRight className="size-4" />
          </a>
          <a
            href="#mcp"
            className="inline-flex items-center gap-2 border border-border px-5 py-3 text-sm font-semibold transition-colors hover:border-primary hover:text-primary"
          >
            <Terminal className="size-4" /> Read the SDK
          </a>
        </div>
      </div>

      <div className="relative flex overflow-hidden border-t border-border py-3">
        <div className="marquee-track flex shrink-0 gap-8 pr-8">
          {[...ticker, ...ticker].map((item, index) => (
            <span key={`${item}-${index}`} className="label-mono whitespace-nowrap text-muted-foreground">
              {item} <span className="text-primary">·</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
