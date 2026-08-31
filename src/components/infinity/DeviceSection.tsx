import { Boxes, Code2, Cpu, Gauge, Plug, Scan } from "lucide-react";
import holodockOverview from "@/assets/holodock-overview.webp";
import { HoloEngine } from "./HoloEngine";
import { Reveal } from "./Reveal";
import { SectionHeader } from "./SectionHeader";

/** Plug in. Launch. Project. — the whole interaction, in three moves. */
const steps = [
  {
    id: "01",
    name: "Connect",
    kicker: "Plug into your phone",
    body: "The dock takes the phone's USB-C port. One cable carries power and data at full speed — nothing to pair, nothing to charge, nothing to configure.",
  },
  {
    id: "02",
    name: "Launch",
    kicker: "Open the InfinityID app",
    body: "SpatialOS claims the dock, calibrates the projection against the room in front of it, and takes over the render loop.",
  },
  {
    id: "03",
    name: "Project",
    kicker: "Enjoy the holographic experience",
    body: "The display pyramid folds the phone's output into a true 3D image above the screen. Move around it and the parallax holds.",
  },
];

/** What you can see and touch from the outside. */
const callouts: Array<[string, string]> = [
  ["Indicator light", "Session state at a glance — idle, live, projecting"],
  ["Touch button", "One control: wake, capture, dismiss the scene"],
  ["USB-C port", "Power and data · high-speed interface"],
  ["52 × 14 mm", "Pocket-sized body, no case needed"],
];

const features = [
  {
    icon: Boxes,
    name: "Holographic projection",
    detail: "3D floating visuals",
  },
  { icon: Plug, name: "Plug & play", detail: "No pairing needed" },
  { icon: Scan, name: "Spatial tracking", detail: "IMU + depth sensing" },
  { icon: Code2, name: "App & SDK support", detail: "iOS + Android" },
  { icon: Gauge, name: "High performance", detail: "Low-latency rendering" },
  {
    icon: Cpu,
    name: "Developer ready",
    detail: "Plugins, APIs, tools",
    href: "#build",
  },
];

const anatomy = [
  {
    label: "Volumetric light engine",
    detail: "Micro-OLED stack + waveguide · 60 fps light field",
  },
  {
    label: "Holographic display pyramid",
    detail: "Reflections fold into a true 3D floating image",
  },
  {
    label: "Depth & LiDAR module",
    detail: "0.2–4 m reconstruction · 30 Hz environment mesh",
  },
  {
    label: "AI vision cameras",
    detail: "Stereo RGB · 120° FOV · passthrough capable",
  },
  {
    label: "Spatial audio array",
    detail: "4-mic beamforming · dual full-range drivers",
  },
  {
    label: "USB-C host link",
    detail: "Power, video and MCP transport on one cable",
  },
];

const modules = [
  "Holographic projection lens",
  "Light field engine",
  "Micro-LED array",
  "Beam shaping optics",
  "LiDAR & depth module",
  "AI vision cameras",
  "Sensor fusion board",
  "Spatial co-processor (NPU)",
  "Power management board",
  "Battery module",
  "Thermal management",
  "Core structure frame",
];

const specs: Array<[string, string]> = [
  ["Dimensions", "52 × 14 mm dock body"],
  ["Controls", "Single touch button · status indicator"],
  ["Optical engine", "Micro-OLED + waveguide · 60 fps"],
  ["Depth", "LiDAR + stereo pair · 0.2–4 m"],
  ["Compute", "On-module NPU · host GPU offload"],
  ["Power", "USB-C PD passthrough from the host"],
  ["Materials", "Aviation-grade aluminium · sapphire optics"],
  ["Host support", "iOS 17+ · Android 14+"],
  ["Protocol", "Native MCP server · OpenCV bridge"],
];

export function DeviceSection() {
  return (
    <section id="device" className="border-b border-border">
      <div className="shell py-20 sm:py-28">
        <Reveal>
          <SectionHeader
            index="02"
            eyebrow="The device"
            title={
              <>
                Holo<span className="gradient-text">Dock</span>
              </>
            }
            standfirst="A handheld optical engine, not another computer. Twelve nodes on a Metatron lattice carry the projection, sensing and anchoring hardware; the phone on the other end of the cable does the thinking."
          />
        </Reveal>

        {/* Product overview — the whole device on one sheet. */}
        <Reveal className="hairline mt-16 bg-surface" delay={80}>
          <figure>
            {/* Dense sheet: below `sm` it pans inside its own scroller rather
                than shrinking the callout type past legibility. */}
            <div className="relative overflow-x-auto">
              <img
                src={holodockOverview}
                alt="HoloDock product overview: the dock plugged into a phone projecting a holographic display pyramid, with top and side views, core features, the three-step how-it-works flow, and an exploded view of the internal modules"
                width={1536}
                height={1024}
                loading="lazy"
                className="w-full max-w-none min-w-[860px] sm:min-w-0"
              />
              <div
                className="scan-sweep pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-transparent via-electric/12 to-transparent"
                aria-hidden
              />
            </div>
            <figcaption className="label-mono border-t border-border px-5 py-4 text-steel">
              HoloDock — product overview · turn any phone into a holographic projector
              <span className="sm:hidden"> · scroll the sheet sideways</span>
            </figcaption>
          </figure>
        </Reveal>

        {/* Plug in. Launch. Project. */}
        <Reveal className="mt-px border border-border bg-background p-7 sm:p-10" delay={120}>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <h3 className="font-display text-2xl font-semibold tracking-[-0.03em]">How it works</h3>
            <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
              Three moves, and none of them are setup. The dock is a display and a sensor package —
              the phone stays the computer, and SpatialOS does the rest.
            </p>
          </div>

          <a
            href="/holodock"
            className="label-mono mt-8 inline-flex items-center gap-2 border border-border px-4 py-3 text-steel transition-colors hover:border-electric hover:text-electric"
          >
            Explore the device from the inside
            <span aria-hidden>→</span>
          </a>

          <ol className="mt-9 grid gap-px bg-border lg:grid-cols-3">
            {steps.map((step) => (
              <li key={step.id} className="bg-background p-6 sm:p-8">
                <div className="flex items-baseline justify-between gap-4">
                  <span className="label-mono text-electric">{step.id}</span>
                  <span className="label-mono text-steel">{step.kicker}</span>
                </div>
                <h4 className="mt-8 font-display text-2xl font-semibold tracking-[-0.03em]">
                  {step.name}
                </h4>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
              </li>
            ))}
          </ol>
        </Reveal>

        {/* What you can see and touch from the outside. */}
        <Reveal className="rule-grid mt-px sm:grid-cols-2 lg:grid-cols-4" delay={130}>
          {callouts.map(([term, detail]) => (
            <div key={term} className="bg-background p-6 sm:p-7">
              <p className="text-sm font-semibold">{term}</p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{detail}</p>
            </div>
          ))}
        </Reveal>

        {/* Core features. */}
        <Reveal className="rule-grid mt-px sm:grid-cols-2 lg:grid-cols-3" delay={140}>
          {features.map(({ icon: Icon, name, detail, href }) => {
            const body = (
              <>
                <Icon className="size-5 text-steel transition-colors group-hover:text-electric" />
                <span className="mt-6 block text-sm font-semibold">{name}</span>
                <span className="label-mono mt-2 block text-steel">{detail}</span>
              </>
            );
            return (
              <div key={name} className="group bg-background p-6 sm:p-7">
                {href ? (
                  <a href={href} className="block">
                    {body}
                  </a>
                ) : (
                  body
                )}
              </div>
            );
          })}
        </Reveal>

        {/* Anatomy index. */}
        <Reveal className="rule-grid mt-px sm:grid-cols-2 lg:grid-cols-3" delay={160}>
          {anatomy.map((item, i) => (
            <div key={item.label} className="flex items-start gap-5 bg-background p-6 sm:p-8">
              <span className="label-mono mt-1 shrink-0 text-electric">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <p className="font-display text-lg font-semibold tracking-[-0.02em]">
                  {item.label}
                </p>
                <p className="mt-1.5 font-mono text-xs text-muted-foreground">{item.detail}</p>
              </div>
            </div>
          ))}
        </Reveal>

        {/* Exploded module index beside the lattice drawing. */}
        <Reveal className="rule-grid mt-px lg:grid-cols-[1fr_1fr]" delay={180}>
          <div className="flex flex-col bg-background p-7 sm:p-10">
            <p className="label-mono text-steel">Exploded view — 12 structural modules</p>
            <ol className="mt-8 grid flex-1 auto-rows-fr gap-px bg-border sm:grid-cols-2">
              {modules.map((module, i) => (
                <li key={module} className="flex items-baseline gap-3 bg-background py-3.5 pr-3">
                  <span className="label-mono text-electric">{String(i + 1).padStart(2, "0")}</span>
                  <span className="text-sm text-foreground/90">{module}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="relative flex items-center justify-center overflow-hidden bg-surface p-6">
            <div
              className="blueprint-grid pointer-events-none absolute inset-0 opacity-40"
              aria-hidden
            />
            <HoloEngine className="relative w-full max-w-[380px]" />
          </div>
        </Reveal>

        <Reveal className="rule-grid mt-px sm:grid-cols-2 lg:grid-cols-3" delay={200}>
          {specs.map(([term, value]) => (
            <div key={term} className="bg-background p-6 sm:p-7">
              <p className="label-mono text-steel">{term}</p>
              <p className="mt-2.5 font-mono text-sm">{value}</p>
            </div>
          ))}
        </Reveal>

        <p className="label-mono mt-8 text-steel">
          Specifications describe the current engineering target and are subject to change before
          production.
        </p>
      </div>
    </section>
  );
}
