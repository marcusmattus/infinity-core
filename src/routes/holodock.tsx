import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Wordmark } from "@/components/infinity/Wordmark";
import { SiteFooter } from "@/components/infinity/SiteFooter";
import { Reveal } from "@/components/infinity/Reveal";
import { HoloDockScrollScene } from "@/components/holodock/HoloDockScrollScene";
import { HoloDockExplorer } from "@/components/holodock/HoloDockExplorer";

const TITLE = "Explore the HoloDock from the inside — InfinityID Labs";
const DESCRIPTION =
  "An interactive teardown of the HoloDock: ten layers on one assembly axis, from the top cover through the optics, sensors and agent processor to the base — then SpatialOS comes up.";

export const Route = createFileRoute("/holodock")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HoloDockPage,
});

const systems = [
  {
    name: "SpatialOS",
    body: "The operating layer that claims the dock, composes the scene and renders every frame it projects.",
    href: "/#spatialos",
  },
  {
    name: "MCP Gateway",
    body: "Your own servers, exposed as tools the Agent Kernel can call — scoped, audited and revocable.",
    href: "/#mcp-gateway",
  },
  {
    name: "Openware",
    body: "A declared plugin model that gives an app you already ship a spatial surface on any paired dock.",
    href: "/#openware",
  },
];

const ctas = [
  { label: "Start building", href: "/#build", primary: true },
  { label: "Connect MCP server", href: "/#mcp-gateway", primary: false },
  { label: "Request dev kit", href: "/#access", primary: false },
  { label: "Join waitlist", href: "/#access", primary: false },
];

function HoloDockPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="shell flex h-16 items-center justify-between gap-6">
          <a href="/" aria-label="InfinityID Labs — home">
            <Wordmark markClassName="h-4 w-8" />
          </a>

          <nav className="hidden items-center gap-7 md:flex" aria-label="Primary">
            {[
              ["Device", "/#device"],
              ["SpatialOS", "/#spatialos"],
              ["Openware", "/#openware"],
              ["MCP", "/#mcp-gateway"],
              ["Build", "/#build"],
            ].map(([label, href]) => (
              <a
                key={label}
                href={href}
                className="label-mono text-steel transition-colors hover:text-foreground"
              >
                {label}
              </a>
            ))}
          </nav>

          <a
            href="/#access"
            className="gradient-fill px-4 py-2 text-xs font-semibold tracking-tight text-primary-foreground transition-opacity hover:opacity-90"
          >
            Join waitlist
          </a>
        </div>
      </header>

      <main>
        {/* Hero. */}
        <section className="relative overflow-hidden border-b border-border pt-16">
          <div
            className="blueprint-fade pointer-events-none absolute inset-0 opacity-50"
            aria-hidden
          />
          <div className="shell relative py-20 sm:py-28">
            <Reveal>
              <a
                href="/#device"
                className="label-mono inline-flex items-center gap-2 text-steel transition-colors hover:text-electric"
              >
                <ArrowLeft className="size-3.5" />
                HoloDock
              </a>

              <h1 className="display-tight mt-8 max-w-4xl text-[2.75rem] sm:text-[4rem] lg:text-[5.25rem]">
                Explore the <span className="gradient-text">HoloDock</span>
                <br />
                <span className="text-steel">from the inside.</span>
              </h1>

              <p className="mt-8 max-w-xl text-[0.95rem] leading-relaxed text-muted-foreground">
                HoloDock turns a phone into a spatial computer. Every layer inside it exists to put
                a holographic image in the room, track what is around it, and let an agent act on
                what it sees. Scroll to take the device apart, layer by layer.
              </p>

              <a
                href="#explorer"
                className="label-mono mt-8 inline-flex items-center gap-2 border border-border px-4 py-3 text-steel transition-colors hover:border-electric hover:text-electric"
              >
                Skip to the interactive explorer
                <span aria-hidden>→</span>
              </a>

              <dl className="mt-14 grid max-w-3xl gap-px bg-border sm:grid-cols-3">
                {[
                  ["10", "Addressable layers"],
                  ["12", "Precision components"],
                  ["52 × 14 mm", "Machined body"],
                ].map(([value, term]) => (
                  <div key={term} className="bg-background py-6 pr-6">
                    <dt className="font-display text-3xl font-semibold tracking-[-0.035em]">
                      {value}
                    </dt>
                    <dd className="label-mono mt-2 text-steel">{term}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>
        </section>

        <HoloDockScrollScene />
        <HoloDockExplorer />

        {/* Hardware hands off to software. */}
        <section className="border-b border-border">
          <div className="shell py-20 sm:py-28">
            <Reveal>
              <p className="label-mono text-electric">After assembly</p>
              <h2 className="display-tight mt-6 max-w-3xl text-[2.25rem] sm:text-[3.25rem]">
                The hardware is half of it.
              </h2>
              <p className="mt-6 max-w-xl text-sm leading-relaxed text-muted-foreground">
                Ten layers put light in the room. What decides what that light shows is the software
                stack on the phone — and the tools you connect to it.
              </p>
            </Reveal>

            <Reveal className="rule-grid mt-14 lg:grid-cols-3" delay={80}>
              {systems.map((system) => (
                <a key={system.name} href={system.href} className="group bg-background p-7 sm:p-10">
                  <h3 className="font-display text-2xl font-semibold tracking-[-0.03em]">
                    {system.name}
                  </h3>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                    {system.body}
                  </p>
                  <span className="label-mono mt-8 flex items-center gap-2 text-steel transition-colors group-hover:text-electric">
                    Open section <span aria-hidden>→</span>
                  </span>
                </a>
              ))}
            </Reveal>
          </div>
        </section>

        {/* CTA. */}
        <section className="border-b border-border">
          <div className="shell py-20 sm:py-28">
            <Reveal className="border border-border bg-surface p-7 sm:p-12">
              <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-end">
                <div>
                  <h2 className="display-tight text-[2.25rem] sm:text-[3rem]">
                    Build for <span className="gradient-text">HoloDock.</span>
                  </h2>
                  <p className="mt-6 max-w-xl text-sm leading-relaxed text-muted-foreground">
                    Connect your apps, agents and tools to InfinityID SpatialOS and start building
                    interfaces that move beyond the screen.
                  </p>
                </div>

                <div>
                  <div className="grid grid-cols-1 gap-px bg-border sm:grid-cols-2">
                    {ctas.map((cta) => (
                      <a
                        key={cta.label}
                        href={cta.href}
                        className={`px-5 py-3.5 text-sm font-semibold transition-colors ${
                          cta.primary
                            ? "gradient-fill text-primary-foreground hover:opacity-90"
                            : "bg-surface text-foreground hover:text-electric"
                        }`}
                      >
                        {cta.label}
                      </a>
                    ))}
                  </div>
                  <p className="label-mono mt-6 text-steel">
                    SDK access can begin before HoloDock hardware is available, using the SpatialOS
                    simulator.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <SiteFooter base="/" />
    </div>
  );
}
