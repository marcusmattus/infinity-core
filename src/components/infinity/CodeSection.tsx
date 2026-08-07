import { useState } from "react";
import { Check, Copy } from "lucide-react";

const CODE = `# Connect your holographic app to the InfinityID Camera MCP Server
import mcp.client as mcp


async def main():
    async with mcp.connect("mcp://device.local:8080/camera") as mcp_client:
        # Discover sensory capabilities
        tools = await mcp_client.list_tools()

        # Trigger spatial depth frame capture
        frame = await mcp_client.call_tool(
            "quick_capture",
            {"mode": "holographic_depth", "device_index": 0}
        )
        print("Sensory frame captured for 3D holographic rendering.")


if __name__ == "__main__":
    import asyncio
    asyncio.run(main())`;

export function CodeSection() {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section id="mcp" className="border-b border-border">
      <div className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6 sm:py-20">
        <p className="label-mono text-primary">Developer example</p>
        <h2 className="mt-4 font-display text-3xl font-bold tracking-[-0.03em] sm:text-4xl">
          Connecting to the Camera MCP Server
        </h2>

        <div className="mt-8 hairline bg-surface">
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <span className="label-mono text-muted-foreground">camera_client.py</span>
            <button
              type="button"
              onClick={copy}
              className="flex items-center gap-2 border border-border px-2.5 py-1 transition-colors hover:border-primary hover:text-primary"
            >
              {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              <span className="label-mono">{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>
          <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-foreground/90 sm:p-6 sm:text-sm">
            <code>{CODE}</code>
          </pre>
        </div>
      </div>
    </section>
  );
}
