import type React from "react";
import { Box, Code2, Crosshair, Smartphone, type LucideIcon } from "lucide-react";
import { InfinityMark } from "@/components/infinity/Wordmark";
import { Reveal } from "@/components/infinity/Reveal";
import { CONTACT_MAILTO, SITE } from "@/lib/site";

/* Section eyebrow: "01 — PLATFORM". Gold for the voice, blue for the device. */
function Eyebrow({
  index,
  label,
  tone = "gold",
}: {
  index: string;
  label: string;
  tone?: "gold" | "blue";
}) {
  return (
    <p className={`label-mono ${tone === "gold" ? "text-gold" : "text-blue-light"}`}>
      {index} — {label}
    </p>
  );
}

/* ------------------------------------------------------------------- hero */

export function BrandHero() {
  return (
    <section id="top" className="relative overflow-hidden pt-28 pb-24 sm:pt-32 sm:pb-32">
      <div className="shell-brand relative flex flex-col items-center text-center">
        <div className="relative w-full max-w-[420px]">
          {/* Blue halo only: the stage light behind the mark, never mixed with gold. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-[-18%_-12%] rounded-[50%] bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--color-blue-deep)_42%,transparent),transparent)] blur-2xl"
          />
          <InfinityMark className="relative h-auto w-full" animated />
        </div>

        <p className="label-mono mt-8 rounded-full border border-graphite px-3.5 py-1.5 text-[0.625rem] text-ash">
          The human interface layer
        </p>

        <h1 className="display-tight mt-7 max-w-4xl text-[3rem] sm:text-[4.5rem] lg:text-[5.25rem]">
          The interface <span className="text-gold">leaves the screen.</span>
        </h1>

        <p className="mt-7 max-w-xl text-base leading-relaxed text-ash sm:text-[1.0625rem]">
          InfinityID Labs connects people, AI agents and the spaces around them — from your phone,
          to HoloDock, to the city.
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <a
            href="#holodock"
            className="rounded-full bg-gold px-6 py-3.5 text-sm font-semibold text-void transition-colors hover:bg-gold-light"
          >
            Meet HoloDock
          </a>
          <a
            href={CONTACT_MAILTO}
            className="rounded-full border border-graphite px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:border-ash"
          >
            Talk to the team
          </a>
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- platform */

const LAYERS: Array<{ name: string; body: string; icon: LucideIcon; tile: string }> = [
  {
    name: "HumanOS",
    body: "The grounding layer on your phone: your identity, your permissions, your agents.",
    icon: Smartphone,
    tile: "bg-gold text-void",
  },
  {
    name: "SpatialOS",
    body: "Space, sensors and devices — the room becomes part of the interface.",
    icon: Box,
    tile: "bg-gold-light text-void",
  },
  {
    name: "Openware",
    body: "MCP Gateway and Agent Kernel: agents reach software, sensors and devices safely.",
    icon: Code2,
    tile: "bg-blue text-white",
  },
  {
    name: "Quantum Infra",
    body: "The secure compute and identity backbone every agent action is signed against.",
    icon: Crosshair,
    tile: "bg-white text-void",
  },
];

export function PlatformSection() {
  return (
    <section id="platform" className="py-20 sm:py-24">
      <div className="shell-brand">
        <Reveal className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-end">
          <div>
            <Eyebrow index="01" label="Platform" />
            <h2 className="display-tight mt-5 text-[2.25rem] sm:text-[2.75rem]">
              One loop. You at the centre.
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-ash lg:justify-self-end">
            The physical world on one side, the digital on the other. The spark where they meet is a
            verified human — every agent action traces back to one.
          </p>
        </Reveal>

        <Reveal className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" delay={80}>
          {LAYERS.map(({ name, body, icon: Icon, tile }) => (
            <article
              key={name}
              className="rounded-[22px] border border-graphite bg-carbon p-6 sm:min-h-[11rem]"
            >
              <span className={`flex size-8 items-center justify-center rounded-[8px] ${tile}`}>
                <Icon className="size-4" />
              </span>
              <h3 className="mt-5 text-base font-bold tracking-tight">{name}</h3>
              <p className="mt-2 text-[0.8125rem] leading-relaxed text-ash">{body}</p>
            </article>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- holodock */

const SPECS: Array<[string, string]> = [
  ["Form factor", "138 × 52 mm"],
  ["Optical nodes", "12"],
  ["Connects", "USB-C"],
];

/** Phone + dock line drawing. The dock carries the two-loop mark; the light is blue. */
function DockIllustration() {
  const nodes = [
    [140, 92],
    [140, 128],
    [140, 164],
    [180, 82],
    [300, 82],
    [366, 92],
    [366, 128],
    [366, 164],
    [210, 176],
    [300, 176],
  ];
  return (
    <svg
      viewBox="0 0 400 260"
      className="h-auto w-full"
      role="img"
      aria-label="A phone connected to HoloDock by a USB-C cable"
    >
      <defs>
        <radialGradient id="dock-halo" cx="0.62" cy="0.5" r="0.5">
          <stop offset="0" stopColor="var(--color-blue-deep)" stopOpacity="0.55" />
          <stop offset="1" stopColor="var(--color-blue-deep)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x="60" y="0" width="340" height="260" fill="url(#dock-halo)" />

      {/* light lines rising from the dock */}
      {[
        [228, 70, 200, 10],
        [253, 70, 253, 0],
        [278, 70, 306, 10],
      ].map(([x1, y1, x2, y2]) => (
        <line
          key={x1}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="var(--color-blue-light)"
          strokeOpacity="0.7"
          strokeWidth="1.2"
        />
      ))}

      {/* phone */}
      <rect
        x="6"
        y="54"
        width="64"
        height="134"
        rx="12"
        fill="var(--color-void)"
        stroke="var(--color-graphite)"
        strokeWidth="2"
      />
      <rect x="28" y="62" width="20" height="4" rx="2" fill="var(--color-graphite)" />
      <path
        d="M38 188c0 18 20 26 44 22s26-20 30-30"
        fill="none"
        stroke="var(--color-ash)"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* dock */}
      <rect
        x="118"
        y="70"
        width="270"
        height="116"
        rx="40"
        fill="var(--color-void)"
        stroke="var(--color-graphite)"
        strokeWidth="2"
      />
      {nodes.map(([cx, cy], index) => (
        <circle
          key={`${cx}-${cy}`}
          cx={cx}
          cy={cy}
          r="2.6"
          fill={index % 3 === 0 ? "var(--color-gold)" : "var(--color-blue-light)"}
        />
      ))}
      <g transform="translate(168 88) scale(1.7)">
        <InfinityMarkPaths />
      </g>
    </svg>
  );
}

/** The mark's raw paths, for embedding inside another SVG. */
function InfinityMarkPaths() {
  return (
    <>
      <path
        d="M42.5 24C36.2 13.8 30.9 6.6 23.2 6.6 14 6.6 6.5 14.4 6.5 24s7.5 17.4 16.7 17.4c7.7 0 13-7.2 19.3-17.4Z"
        fill="none"
        stroke="var(--color-gold)"
        strokeWidth="7"
        strokeLinejoin="round"
      />
      <path
        d="M57.5 24c6.3-10.2 11.6-17.4 19.3-17.4 9.2 0 16.7 7.8 16.7 17.4s-7.5 17.4-16.7 17.4c-7.7 0-13-7.2-19.3-17.4Z"
        fill="none"
        stroke="var(--color-blue)"
        strokeWidth="7"
        strokeLinejoin="round"
      />
      <path
        d="M50 11.5 53 21 62.5 24 53 27 50 36.5 47 27 37.5 24 47 21Z"
        fill="var(--color-white)"
      />
    </>
  );
}

export function HoloDockPanel() {
  return (
    <section id="holodock" className="py-12 sm:py-16">
      <div className="shell-brand">
        <Reveal className="grid items-center gap-10 rounded-[22px] border border-graphite bg-carbon p-7 sm:p-12 lg:grid-cols-[1fr_1fr]">
          <div>
            <Eyebrow index="02" label="HoloDock" tone="blue" />
            <h2 className="display-tight mt-5 text-[2.25rem] sm:text-[2.75rem]">
              Your phone, now a spatial computer.
            </h2>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-ash">
              The phone keeps the compute, storage and apps. HoloDock adds the light field, the
              depth sensing and the space to put things in. InfinityOS on iPhone runs it.
            </p>

            <dl className="mt-8 grid max-w-md grid-cols-3 gap-4 border-t border-graphite pt-5">
              {SPECS.map(([term, value]) => (
                <div key={term}>
                  <dt className="label-mono text-[0.5625rem] text-ash">{term}</dt>
                  <dd className="mt-2 font-mono text-[0.8125rem] text-white">{value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#waitlist"
                className="rounded-full bg-gold px-5 py-3 text-sm font-semibold text-void transition-colors hover:bg-gold-light"
              >
                Reserve yours
              </a>
              <a
                href="/holodock"
                className="rounded-full border border-graphite px-5 py-3 text-sm font-semibold text-blue-light transition-colors hover:border-blue-light"
              >
                Explore the teardown
              </a>
            </div>
          </div>

          <DockIllustration />
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- pillars */

const PILLARS: Array<{
  numeral: string;
  name: string;
  body: string;
  tone: "gold" | "neutral" | "blue";
}> = [
  {
    numeral: "I",
    name: "HoloDock",
    body: "USB-C spatial hardware that extends the phone you already own.",
    tone: "gold",
  },
  {
    numeral: "II",
    name: "City Mobility & Grid",
    body: "The interface for smart city and fleet operations — people, vehicles and infrastructure on one layer.",
    tone: "neutral",
  },
  {
    numeral: "III",
    name: "Healthcare Distribution",
    body: "Getting wellbeing products to the people who need them, tracked end to end.",
    tone: "blue",
  },
];

const PILLAR_TONE = {
  gold: "bg-[linear-gradient(160deg,color-mix(in_oklab,var(--color-gold-deep)_14%,var(--color-carbon)),var(--color-carbon)_60%)]",
  neutral: "bg-carbon",
  blue: "bg-[linear-gradient(160deg,color-mix(in_oklab,var(--color-blue-deep)_22%,var(--color-carbon)),var(--color-carbon)_60%)]",
} as const;

export function PillarsBand() {
  return (
    <section id="pillars" className="py-20 sm:py-24">
      <div className="shell-brand">
        <Reveal>
          <Eyebrow index="03" label="Three pillars" tone="blue" />
          <h2 className="display-tight mt-5 text-[2.25rem] sm:text-[2.75rem]">
            From your hand to the whole city.
          </h2>
        </Reveal>

        <Reveal className="mt-10 grid gap-3 md:grid-cols-3" delay={80}>
          {PILLARS.map((pillar) => (
            <article
              key={pillar.name}
              className={`rounded-[22px] border border-graphite p-6 sm:min-h-[9.5rem] ${PILLAR_TONE[pillar.tone]}`}
            >
              <p
                className={`font-mono text-xs ${pillar.tone === "gold" ? "text-gold" : "text-blue-light"}`}
              >
                {pillar.numeral}
              </p>
              <h3 className="mt-4 text-lg font-bold tracking-tight">{pillar.name}</h3>
              <p className="mt-2 text-[0.8125rem] leading-relaxed text-ash">{pillar.body}</p>
            </article>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

/* -------------------------------------------------------- contact + footer */

export function ContactBand() {
  return (
    <section id="company" className="py-16 sm:py-20">
      <div className="shell-brand">
        <Reveal className="flex flex-col gap-8 rounded-[22px] bg-gold p-8 text-void sm:p-12 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="display-tight text-[2.25rem] sm:text-[2.75rem]">
              Build the next
              <br />
              interface with us.
            </h2>
            <p className="mt-4 text-sm font-medium">
              Partners, pilots and investors — we’d love to hear from you.
            </p>
          </div>
          <a
            href={CONTACT_MAILTO}
            className="self-start rounded-full bg-void px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-carbon lg:self-auto"
          >
            {SITE.contactEmail}
          </a>
        </Reveal>
      </div>
    </section>
  );
}

export function BrandFooter() {
  return (
    <footer className="border-t border-graphite">
      <div className="shell-brand flex flex-col gap-3 py-7 text-[0.6875rem] text-ash sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-3">
          <InfinityMark className="h-4 w-8" />
          {SITE.legalName} · Company no. {SITE.companyNumber} · {SITE.jurisdiction}
        </p>
        <p className="flex flex-wrap gap-x-4 gap-y-1">
          <a href={CONTACT_MAILTO} className="text-blue-light hover:underline">
            {SITE.contactEmail}
          </a>
          <span>{SITE.address}</span>
        </p>
      </div>
    </footer>
  );
}

/* --------------------------------------------------------------- waitlist */

const STEPS: Array<[string, string]> = [
  [
    "Join the list",
    "Your email, and what you'd build. We send one confirmation link — no newsletter.",
  ],
  [
    "Hold a unit",
    "Optional: a refundable deposit reserves a HoloDock from the first production run.",
  ],
  ["Hear first", "Dev kit timing, the SpatialOS SDK and the MCP Gateway — before anyone else."],
];

export function WaitlistBand({ form }: { form: React.ReactNode }) {
  return (
    <section id="waitlist" className="py-20 sm:py-24">
      <div className="shell-brand grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <Reveal>
          <Eyebrow index="04" label="Waitlist" />
          <h2 className="display-tight mt-5 text-[2.25rem] sm:text-[2.75rem]">
            Be first to hold <span className="text-gold">the light.</span>
          </h2>
          <ol className="mt-8 space-y-5">
            {STEPS.map(([name, body], index) => (
              <li key={name} className="flex gap-4">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-graphite font-mono text-[0.6875rem] text-gold">
                  {index + 1}
                </span>
                <span>
                  <span className="block text-sm font-bold">{name}</span>
                  <span className="mt-1 block text-[0.8125rem] leading-relaxed text-ash">
                    {body}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </Reveal>
        <Reveal delay={80}>{form}</Reveal>
      </div>
    </section>
  );
}
