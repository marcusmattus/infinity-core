import deviceRender from "@/assets/infinity-1-device.jpg";
import { HoloEngine } from "./HoloEngine";
import { Reveal } from "./Reveal";
import { SectionHeader } from "./SectionHeader";

const anatomy = [
  {
    label: "Volumetric light engine",
    detail: "Micro-OLED stack + waveguide · 60 fps light field",
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
    label: "Foldable optical assembly",
    detail: "Collapses to 52 mm · pocket carry",
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
  ["Dimensions", "138 × 138 × 52 mm folded"],
  ["Mass", "214 g"],
  ["Optical engine", "Micro-OLED + waveguide · 60 fps"],
  ["Depth", "LiDAR + stereo pair · 0.2–4 m"],
  ["Compute", "On-module NPU · host GPU offload"],
  ["Power", "6800 mAh · USB-C PD passthrough"],
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

        {/* Concept render alongside the anatomy index. */}
        <Reveal className="rule-grid mt-16 lg:grid-cols-[1fr_1fr]" delay={80}>
          <figure className="relative overflow-hidden bg-background">
            <img
              src={deviceRender}
              alt="Concept render of the HoloDock optical engine projecting a light field"
              width={1024}
              height={1280}
              loading="lazy"
              className="h-full w-full object-cover"
              /* The render was lit in cyan; the rotation brings it onto the
                 electric-blue → violet brand axis. */
              style={{ filter: "hue-rotate(78deg) saturate(1.1)" }}
            />
            <div
              className="scan-sweep pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-transparent via-electric/12 to-transparent"
              aria-hidden
            />
            <figcaption className="label-mono absolute bottom-4 left-4 text-steel">
              Concept render — optical assembly deployed
            </figcaption>
          </figure>

          <ol className="grid bg-background">
            {anatomy.map((item, i) => (
              <li
                key={item.label}
                className="flex items-start gap-5 border-b border-border p-6 last:border-b-0 sm:p-8"
              >
                <span className="label-mono mt-1 shrink-0 text-electric">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <p className="font-display text-lg font-semibold tracking-[-0.02em]">
                    {item.label}
                  </p>
                  <p className="mt-1.5 font-mono text-xs text-muted-foreground">{item.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </Reveal>

        {/* Exploded module index beside the lattice drawing. */}
        <Reveal className="rule-grid mt-px lg:grid-cols-[1fr_1fr]" delay={120}>
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

        <Reveal className="rule-grid mt-px sm:grid-cols-2 lg:grid-cols-3" delay={160}>
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
