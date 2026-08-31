import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Reveal } from "./Reveal";
import { SectionHeader } from "./SectionHeader";

const TABS = [
  {
    id: "camera",
    label: "camera_client.py",
    code: `# Bind an agent to the HoloDock's Camera MCP server.
import mcp.client as mcp


async def main():
    async with mcp.connect("mcp://dock.local:8080/camera") as dock:
        # Discover what this dock exposes.
        tools = await dock.list_tools()

        # Capture a depth frame for volumetric rendering.
        frame = await dock.call_tool(
            "quick_capture",
            {"mode": "holographic_depth", "device_index": 0},
        )
        print(frame.summary())


if __name__ == "__main__":
    import asyncio

    asyncio.run(main())`,
  },
  {
    id: "scene",
    label: "scene.ts",
    code: `import { connect, Anchor, Panel, Model } from "@infinityid/spatial";

// One dock, one scene, one render loop.
const dock = await connect({ transport: "usb" });

const scene = dock.scene({ units: "metres" });

scene.add(
  new Model({
    src: "/models/turbine.glb",
    anchor: Anchor.world({ x: 0, y: 1.1, z: -0.6 }),
    scale: 0.25,
  }),
);

scene.add(
  new Panel({
    id: "telemetry",
    anchor: Anchor.user.left({ distance: 0.45 }),
    render: () => <TelemetryPanel />,
  }),
);

await scene.present();`,
  },
] as const;

export function CodeSection() {
  const [active, setActive] = useState<(typeof TABS)[number]["id"]>("camera");
  const [copied, setCopied] = useState(false);

  const tab = TABS.find((t) => t.id === active) ?? TABS[0]!;

  async function copy() {
    try {
      await navigator.clipboard.writeText(tab.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* Clipboard permission refused — the code is selectable in place. */
    }
  }

  return (
    <section id="mcp" className="border-b border-border">
      <div className="shell py-20 sm:py-28">
        <Reveal>
          <SectionHeader
            index="11"
            eyebrow="Developers"
            title={
              <>
                A dock is
                <br />
                <span className="text-steel">an MCP server.</span>
              </>
            }
            standfirst="Every HoloDock exposes its sensors and its light field as Model Context Protocol tools. No driver glue, no bespoke bridge — agents discover the hardware the same way they discover anything else."
          />
        </Reveal>

        <Reveal className="mt-16 hairline bg-surface" delay={80}>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-2.5">
            <div className="flex gap-px bg-border">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setActive(t.id);
                    setCopied(false);
                  }}
                  aria-pressed={t.id === active}
                  className={`label-mono px-3 py-1.5 transition-colors ${
                    t.id === active
                      ? "bg-elevated text-foreground"
                      : "bg-surface text-steel hover:text-foreground"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={copy}
              className="flex items-center gap-2 border border-border px-2.5 py-1 transition-colors hover:border-electric hover:text-electric"
            >
              {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              <span className="label-mono">{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>

          <pre className="overflow-x-auto p-5 font-mono text-xs leading-relaxed text-foreground/85 sm:p-8 sm:text-[0.8125rem]">
            <code>{tab.code}</code>
          </pre>
        </Reveal>
      </div>
    </section>
  );
}
