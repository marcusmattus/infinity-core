import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/infinity/PageHeader";
import { SiteFooter } from "@/components/infinity/SiteFooter";
import { Reveal } from "@/components/infinity/Reveal";
import { WaitlistForm } from "@/components/waitlist/WaitlistForm";

const TITLE = "Join the HoloDock waitlist — InfinityID Labs";
const DESCRIPTION =
  "Hear when the HoloDock dev kit, the SpatialOS SDK and the MCP Gateway open up. Double opt-in, no newsletter, unsubscribe in one click.";

export const Route = createFileRoute("/waitlist/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
    ],
  }),
  component: WaitlistPage,
});

const PROMISES: Array<[string, string]> = [
  ["Dev kit", "You hear before general availability, with the hardware timeline as it firms up."],
  ["SpatialOS SDK", "Simulator access first, so you can build before a dock reaches your desk."],
  ["MCP Gateway", "Connection details when the gateway opens to servers outside InfinityID."],
];

function WaitlistPage() {
  return (
    <div className="min-h-screen bg-background">
      <PageHeader cta={{ label: "Explore the device", href: "/holodock" }} />

      <main className="pt-16">
        <section className="relative overflow-hidden border-b border-border">
          <div
            className="blueprint-fade pointer-events-none absolute inset-0 opacity-50"
            aria-hidden
          />
          <div className="shell relative py-20 sm:py-28">
            <Reveal>
              <p className="label-mono text-electric">Waitlist</p>
              <h1 className="display-tight mt-8 max-w-3xl text-[2.75rem] sm:text-[4rem]">
                Hear it when
                <br />
                <span className="text-steel">it actually ships.</span>
              </h1>
              <p className="mt-8 max-w-xl text-[0.95rem] leading-relaxed text-muted-foreground">
                No drip sequence and no weekly newsletter. Three things get a mail: the dev kit, the
                SDK, and the MCP Gateway opening up.
              </p>
            </Reveal>

            <Reveal className="rule-grid mt-16 lg:grid-cols-[1.1fr_1fr]" delay={80}>
              <div className="bg-background p-7 sm:p-10">
                <p className="label-mono text-steel">What you will be sent</p>
                <ol className="mt-8 space-y-px bg-border">
                  {PROMISES.map(([name, detail], index) => (
                    <li key={name} className="flex items-start gap-4 bg-background py-5">
                      <span className="label-mono shrink-0 text-electric">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span>
                        <span className="block text-sm font-semibold">{name}</span>
                        <span className="mt-1.5 block text-sm leading-relaxed text-muted-foreground">
                          {detail}
                        </span>
                      </span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="bg-surface p-7 sm:p-10">
                <WaitlistForm source="waitlist" />
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <SiteFooter base="/" />
    </div>
  );
}
