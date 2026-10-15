import { ArrowUpRight } from "lucide-react";
import { Reveal } from "./Reveal";

/** The HoloDock product site — explorer, waitlist and presale — lives on its own subdomain. */
export const HOLODOCK_URL = "https://holodock.infinityidlabs.xyz";

const routes = [
  {
    id: "A",
    name: "Join the waitlist",
    body: "Free. Hear first when units ship and when the next batch opens.",
    href: `${HOLODOCK_URL}/#waitlist`,
  },
  {
    id: "B",
    name: "Reserve a unit",
    body: "Hold a place in the first production run with a refundable deposit.",
    href: `${HOLODOCK_URL}/#reserve`,
  },
  {
    id: "C",
    name: "Open the explorer",
    body: "Turn the device around, take it apart and see what each module does.",
    href: `${HOLODOCK_URL}/#explore`,
  },
];

/**
 * Hand-off band between the device story on this page and the HoloDock
 * product site, where the waitlist and presale actually run.
 */
export function HoloDockLaunchSection() {
  return (
    <section id="holodock" className="relative overflow-hidden border-b border-border">
      <div className="blueprint-fade pointer-events-none absolute inset-0 opacity-40" aria-hidden />

      <div className="shell relative py-20 sm:py-24">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-8">
            <div className="max-w-2xl">
              <p className="label-mono text-electric">HoloDock · presale open</p>
              <h2 className="display-tight mt-6 text-[2.25rem] sm:text-[3.25rem]">
                Get a <span className="gradient-text">HoloDock</span>
                <span className="text-steel"> of your own.</span>
              </h2>
              <p className="mt-6 max-w-xl text-[0.95rem] leading-relaxed text-muted-foreground">
                The waitlist, reservations and the full device explorer run on the HoloDock site.
              </p>
            </div>

            <a
              href={HOLODOCK_URL}
              className="gradient-fill inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold tracking-tight text-primary-foreground transition-opacity hover:opacity-90"
            >
              Visit holodock.infinityidlabs.xyz
              <ArrowUpRight className="size-4" aria-hidden />
            </a>
          </div>
        </Reveal>

        <Reveal className="mt-12 grid gap-px bg-border lg:grid-cols-3" delay={80}>
          {routes.map((route) => (
            <a
              key={route.id}
              href={route.href}
              className="group bg-background p-6 transition-colors hover:bg-surface sm:p-8"
            >
              <div className="flex items-baseline justify-between gap-4">
                <span className="label-mono text-electric">{route.id}</span>
                <ArrowUpRight
                  className="size-4 text-steel transition-colors group-hover:text-electric"
                  aria-hidden
                />
              </div>
              <h3 className="mt-8 font-display text-2xl font-semibold tracking-[-0.03em]">
                {route.name}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{route.body}</p>
            </a>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
