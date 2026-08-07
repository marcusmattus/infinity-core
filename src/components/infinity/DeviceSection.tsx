import deviceImage from "@/assets/infinity-1-device.jpg";

const callouts = [
  { label: "Spatial camera sensor", detail: "12 MP global shutter · 120° FOV depth pair" },
  { label: "Array microphones", detail: "4-mic beamforming · 5 m wake-word range" },
  { label: "Holographic ray projector", detail: "Laser-scanned volumetric field · 60 fps" },
  { label: "MCP server node", detail: "On-device runtime · mcp://device.local:8080" },
];

const specs = [
  ["Form factor", "Handheld cylindrical node · 148 × 32 mm"],
  ["Compute", "Neural SoC · 24 TOPS spatial pipeline"],
  ["Sensors", "Stereo depth, RGB, IMU, 4-mic array"],
  ["Projection", "Volumetric ray field · 0.3–2.4 m"],
  ["Connectivity", "Wi-Fi 7, UWB, BLE 5.4"],
  ["Protocol", "Native MCP server, OpenCV bridge"],
];

export function DeviceSection() {
  return (
    <section id="device" className="border-b border-border">
      <div className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6 sm:py-24">
        <p className="label-mono text-primary">Hero product</p>
        <h2 className="mt-4 font-display text-4xl font-bold tracking-[-0.03em] sm:text-6xl">
          The Infinity-1 Spatial Node
        </h2>
        <p className="mt-5 max-w-2xl leading-relaxed text-muted-foreground">
          An ultra-sleek, handheld spatial computing device designed for sensory input and
          holographic spatial interfaces.
        </p>

        <div className="mt-12 grid gap-px bg-border lg:grid-cols-[1.1fr_1fr]">
          <div className="relative bg-background">
            <img
              src={deviceImage}
              alt="Infinity-1 Spatial Node handheld device emitting a holographic light field"
              width={1024}
              height={1280}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </div>

          <ul className="grid bg-background">
            {callouts.map((callout, index) => (
              <li
                key={callout.label}
                className="flex items-start gap-4 border-b border-border p-6 last:border-b-0 sm:p-8"
              >
                <span className="label-mono mt-1 text-primary">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <p className="font-display text-lg font-semibold">{callout.label}</p>
                  <p className="mt-1 font-mono text-xs text-muted-foreground">{callout.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <dl className="mt-px grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">
          {specs.map(([term, value]) => (
            <div key={term} className="bg-background p-6">
              <dt className="label-mono text-muted-foreground">{term}</dt>
              <dd className="mt-2 font-mono text-sm">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
