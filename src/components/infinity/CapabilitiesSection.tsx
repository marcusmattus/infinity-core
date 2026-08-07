import { Camera, Boxes, Waves } from "lucide-react";

const capabilities = [
  {
    icon: Camera,
    title: "Camera Access MCP Server",
    body: "Direct hardware abstraction via standard Model Context Protocol servers. Connects live OpenCV video feeds and spatial cameras straight to AI agents without custom driver glue.",
  },
  {
    icon: Boxes,
    title: "Holographic Software Tools",
    body: "SDKs for rendering 3D spatial UI overlays, anchored volumetric panels, and interactive mobile sensory controls.",
  },
  {
    icon: Waves,
    title: "Sensory Input Fusion",
    body: "Real-time multi-modal processing merging depth vision, voice input, and spatial orientation tracking into one agent-readable stream.",
  },
];

export function CapabilitiesSection() {
  return (
    <section id="capabilities" className="border-b border-border">
      <div className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6 sm:py-20">
        <p className="label-mono text-primary">Core capabilities</p>
        <div className="mt-8 grid gap-px bg-border lg:grid-cols-3">
          {capabilities.map(({ icon: Icon, title, body }) => (
            <article key={title} className="bg-background p-6 sm:p-10">
              <Icon className="size-6 text-primary" />
              <h3 className="mt-6 font-display text-xl font-semibold tracking-tight">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
