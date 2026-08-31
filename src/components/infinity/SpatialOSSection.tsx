import { useState, type ReactNode } from "react";
import { Boxes, Brain, Cable, Cpu, Hand, Plug, Server, Cloud, Layers3 } from "lucide-react";
import { Reveal } from "./Reveal";
import { SectionHeader } from "./SectionHeader";

type NodeId =
  | "user"
  | "core"
  | "runtime"
  | "agent"
  | "bridge"
  | "gateway"
  | "mcp-servers"
  | "cloud-apis"
  | "device-apis"
  | "holodock";

type NodeSpec = {
  id: NodeId;
  /** Label drawn in the diagram. */
  name: string;
  /** Sub-label under the diagram node — the four words the block is made of. */
  legs?: string[];
  icon: typeof Cpu;
  index: string;
  role: string;
  body: string;
  items?: string[];
  api?: string;
  steps?: string[];
  platforms?: string[];
  link?: { href: string; label: string };
};

const NODES: NodeSpec[] = [
  {
    id: "user",
    name: "User",
    legs: ["Voice", "Touch", "Gesture"],
    icon: Hand,
    index: "00",
    role: "Input surface",
    body: "Three ways in, one intent model. Whatever the user says, taps or points at resolves to the same event stream before SpatialOS decides what to do with it.",
    items: [
      "Wake word and push-to-talk capture",
      "Phone touch and on-screen controls",
      "Hand and pointer gestures in the light field",
      "Gaze and head orientation from the dock",
    ],
  },
  {
    id: "core",
    name: "SpatialOS Core",
    icon: Layers3,
    index: "—",
    role: "The operating layer",
    body: "The scheduler between apps, agents, devices and space. Core owns session state, identity, permissions and the frame budget, then hands work to the three subsystems below it.",
    items: [
      "Session and scene lifecycle",
      "Identity and permission resolution",
      "Frame budget and device arbitration",
      "Event bus shared by every subsystem",
    ],
  },
  {
    id: "runtime",
    name: "Spatial Runtime",
    legs: ["Rendering", "Anchoring", "Tracking", "Scenes"],
    icon: Boxes,
    index: "01",
    role: "Rendering and positioning",
    body: "Everything to do with where things are and how they are drawn. The runtime turns a scene graph into a calibrated light field the dock can project, and keeps it anchored while the room and the phone move.",
    items: [
      "3D scene management",
      "Spatial anchors",
      "Object positioning",
      "Holographic rendering",
      "Depth mapping",
      "Gesture targets",
      "Persistent scenes",
      "Environment mapping",
      "Spatial UI components",
      "Projection calibration",
      "Device orientation",
      "Input mapping",
    ],
    api: `spatial.scene.create()
spatial.anchor.create()
spatial.object.place()
spatial.environment.scan()
spatial.input.onGesture()
spatial.device.calibrate()`,
  },
  {
    id: "agent",
    name: "Agent Kernel",
    legs: ["Reasoning", "Tool calling", "Memory", "Automation"],
    icon: Brain,
    index: "02",
    role: "The intelligence layer",
    body: "The kernel reads intent, plans the task, picks the tools and checks the permissions before anything executes. Models run locally or in the cloud; the decision is a policy, not a rewrite.",
    items: [
      "Intent understanding",
      "Task planning",
      "Tool selection",
      "App interaction",
      "Device commands",
      "Memory",
      "Local AI",
      "Cloud AI",
      "Workflow automation",
      "Permission checks",
      "MCP tool execution",
    ],
    steps: [
      "Voice — “Open my latest design and place it on the desk.”",
      "Agent Kernel resolves the intent and plans the task",
      "Locate the design app through the App Bridge",
      "Request the file, with the user's permission grant",
      "Detect the desk surface from the environment mesh",
      "Create a spatial anchor at the detected surface",
      "Render the object into the scene",
      "Display through HoloDock",
    ],
  },
  {
    id: "bridge",
    name: "App Bridge",
    legs: ["App plugins", "App actions", "Events", "Data"],
    icon: Plug,
    index: "03",
    role: "How existing apps connect",
    body: "The InfinityID App Bridge is how an app that already exists gains a spatial surface. It registers a plugin, declares capabilities, and receives events — no fork, no injection, no second codebase.",
    items: [
      "App intents",
      "Deep links",
      "Extension handling",
      "Plugin registration",
      "Event subscriptions",
      "Shared data",
      "App actions",
      "Authentication handoff",
      "UI extension",
      "Spatial capabilities",
    ],
    platforms: ["iOS", "Android", "React Native", "Web", "Unity", "Native apps"],
    api: `InfinityID.registerPlugin({
  name: "Fitness Spatial",
  capabilities: [
    "camera",
    "pose",
    "spatial",
    "agent",
  ],
})`,
  },
  {
    id: "gateway",
    name: "MCP Gateway",
    icon: Cable,
    index: "04",
    role: "Tools, agents and services",
    body: "SpatialOS ships with an MCP client and a gateway in front of it. Point it at a server you already run and its tools become things the Agent Kernel can call — scoped, audited and revocable.",
    items: [
      "Internal tools and local development servers",
      "AI agents and agent workflows",
      "Cloud APIs and app backends",
      "Databases and file systems",
      "Hardware and device services",
      "Productivity tools",
    ],
    link: { href: "#mcp-gateway", label: "Open the MCP Gateway" },
  },
  {
    id: "mcp-servers",
    name: "MCP Servers",
    icon: Server,
    index: "05",
    role: "Your tools",
    body: "Dev, app and device MCP servers sit behind the gateway. Each one is registered per environment, so a local stdio server during development and a production HTTPS endpoint are the same integration with different credentials.",
    items: [
      "Dev MCP server — stdio, local machine",
      "App MCP server — your product backend",
      "Device MCP server — dock sensors and output",
      "Cloud MCP server — shared org tooling",
    ],
  },
  {
    id: "cloud-apis",
    name: "Cloud APIs",
    icon: Cloud,
    index: "06",
    role: "Managed services",
    body: "Inference, storage, identity and analytics reached through the same policy layer as everything else. Scoped keys, rotation and audit logs are handled by the gateway rather than by each app.",
    items: [
      "Cloud AI inference",
      "Asset and model storage",
      "Identity and org directory",
      "Usage, metrics and audit",
    ],
  },
  {
    id: "device-apis",
    name: "Device APIs",
    icon: Cpu,
    index: "07",
    role: "Hardware surface",
    body: "The dock's own capabilities, exposed as tools. Cameras, depth, IMU, audio and the light field are addressable by an agent only when the project's permission manifest says so.",
    items: [
      "Camera and depth capture",
      "IMU and spatial tracking",
      "Microphone array and audio out",
      "Light field and projection control",
    ],
  },
  {
    id: "holodock",
    name: "HoloDock",
    icon: Cpu,
    index: "08",
    role: "Output",
    body: "The end of the path. Every decision above resolves into a calibrated frame on the optical engine — or into a simulator window, if the hardware is not on your desk yet.",
    items: [
      "Volumetric light engine output",
      "Depth-correct anchoring in the room",
      "USB-C power, video and MCP transport",
      "Simulator parity for development",
    ],
    link: { href: "#device", label: "See the device" },
  },
];

const byId = (id: NodeId) => NODES.find((node) => node.id === id)!;

/** A vertical hairline between diagram rows. */
function Stem() {
  return <div aria-hidden className="mx-auto h-8 w-px bg-border-strong" />;
}

/** A bracket that splits one row into three, or gathers three back into one. */
function Fan({ direction }: { direction: "out" | "in" }) {
  const legs = ["left-[16.667%]", "left-1/2 -translate-x-1/2", "right-[16.667%]"];
  return (
    <div aria-hidden className="relative hidden h-14 md:block">
      <div
        className={`absolute left-1/2 h-6 w-px -translate-x-1/2 bg-border-strong ${
          direction === "out" ? "top-0" : "bottom-0"
        }`}
      />
      <div className="absolute inset-x-[16.667%] top-1/2 h-px bg-border-strong" />
      {legs.map((leg) => (
        <div
          key={leg}
          className={`absolute h-7 w-px bg-border-strong ${leg} ${
            direction === "out" ? "bottom-0" : "top-0"
          }`}
        />
      ))}
    </div>
  );
}

function DiagramNode({
  node,
  active,
  onSelect,
  wide = false,
}: {
  node: NodeSpec;
  active: boolean;
  onSelect: () => void;
  wide?: boolean;
}) {
  const Icon = node.icon;
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className={`group flex w-full flex-col gap-3 border px-5 py-4 text-left transition-colors ${
        active
          ? "border-electric bg-elevated"
          : "border-border bg-background hover:border-border-strong"
      } ${wide ? "md:mx-auto md:max-w-md" : ""}`}
    >
      <span className="flex items-center justify-between gap-4">
        <span
          className={`label-mono transition-colors ${active ? "text-electric" : "text-foreground"}`}
        >
          {node.name}
        </span>
        <Icon
          className={`size-4 shrink-0 transition-colors ${
            active ? "text-electric" : "text-steel group-hover:text-foreground"
          }`}
        />
      </span>

      {node.legs && (
        <span className="flex flex-wrap gap-x-3 gap-y-1 font-mono text-[0.6875rem] text-muted-foreground">
          {node.legs.map((leg) => (
            <span key={leg}>{leg}</span>
          ))}
        </span>
      )}
    </button>
  );
}

function DetailBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="border-t border-border pt-7">
      <p className="label-mono text-steel">{title}</p>
      {children}
    </div>
  );
}

export function SpatialOSSection() {
  const [selected, setSelected] = useState<NodeId>("runtime");
  const node = byId(selected);

  const row = (ids: NodeId[]) => (
    <div className="grid gap-px bg-border md:grid-cols-3">
      {ids.map((id) => {
        const item = byId(id);
        return (
          <DiagramNode
            key={id}
            node={item}
            active={selected === id}
            onSelect={() => setSelected(id)}
          />
        );
      })}
    </div>
  );

  return (
    <section id="spatialos" className="border-b border-border">
      <div className="shell py-20 sm:py-28">
        <Reveal>
          <SectionHeader
            index="04"
            eyebrow="SpatialOS"
            title={
              <>
                One runtime.
                <br />
                <span className="text-steel">Every surface.</span>
              </>
            }
            standfirst="HoloDock is the hardware half. SpatialOS is the other one: phone apps, spatial interfaces, AI agents, MCP servers, developer plugins, cloud services, identity and permissions, all addressed through a single runtime."
          />
        </Reveal>

        <Reveal className="rule-grid mt-16 lg:grid-cols-[1.05fr_1fr]" delay={80}>
          {/* The system diagram — every node opens its own detail panel. */}
          <div className="bg-background p-7 sm:p-10">
            <p className="label-mono text-steel">System architecture — select any node</p>

            <div className="mt-8">
              <DiagramNode
                node={byId("user")}
                active={selected === "user"}
                onSelect={() => setSelected("user")}
                wide
              />
              <Stem />
              <DiagramNode
                node={byId("core")}
                active={selected === "core"}
                onSelect={() => setSelected("core")}
                wide
              />
              <Fan direction="out" />
              <div className="md:hidden">
                <Stem />
              </div>
              {row(["runtime", "agent", "bridge"])}
              <Fan direction="in" />
              <div className="md:hidden">
                <Stem />
              </div>
              <DiagramNode
                node={byId("gateway")}
                active={selected === "gateway"}
                onSelect={() => setSelected("gateway")}
                wide
              />
              <Fan direction="out" />
              <div className="md:hidden">
                <Stem />
              </div>
              {row(["mcp-servers", "cloud-apis", "device-apis"])}
              <Fan direction="in" />
              <div className="md:hidden">
                <Stem />
              </div>
              <DiagramNode
                node={byId("holodock")}
                active={selected === "holodock"}
                onSelect={() => setSelected("holodock")}
                wide
              />
            </div>
          </div>

          {/* Detail for the selected node. */}
          <div className="bg-surface p-7 sm:p-10">
            <div className="flex items-baseline gap-4">
              <span className="label-mono text-electric">{node.index}</span>
              <span className="label-mono text-steel">{node.role}</span>
            </div>

            <h3 className="mt-6 font-display text-3xl font-semibold tracking-[-0.035em]">
              {node.name}
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{node.body}</p>

            <div className="mt-8 space-y-7">
              {node.items && (
                <DetailBlock title="Capabilities">
                  <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
                    {node.items.map((item) => (
                      <li key={item} className="flex items-start gap-3 text-sm">
                        <span className="gradient-fill mt-2 h-1 w-1 shrink-0" />
                        <span className="text-foreground/90">{item}</span>
                      </li>
                    ))}
                  </ul>
                </DetailBlock>
              )}

              {node.platforms && (
                <DetailBlock title="Supported platforms">
                  <ul className="mt-5 flex flex-wrap gap-2">
                    {node.platforms.map((platform) => (
                      <li
                        key={platform}
                        className="label-mono border border-border px-3 py-2 text-foreground/90"
                      >
                        {platform}
                      </li>
                    ))}
                  </ul>
                </DetailBlock>
              )}

              {node.api && (
                <DetailBlock title="Developer API">
                  <pre className="mt-5 overflow-x-auto border border-border bg-background p-5 font-mono text-xs leading-relaxed text-foreground/85">
                    <code>{node.api}</code>
                  </pre>
                </DetailBlock>
              )}

              {node.steps && (
                <DetailBlock title="Worked example — one spoken sentence">
                  <ol className="mt-5 space-y-3">
                    {node.steps.map((step, i) => (
                      <li key={step} className="flex items-start gap-4">
                        <span className="label-mono mt-0.5 shrink-0 text-electric">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="text-sm leading-relaxed text-foreground/90">{step}</span>
                      </li>
                    ))}
                  </ol>
                </DetailBlock>
              )}

              {node.link && (
                <a
                  href={node.link.href}
                  className="label-mono inline-flex border border-border px-4 py-2.5 text-steel transition-colors hover:border-electric hover:text-electric"
                >
                  {node.link.label}
                </a>
              )}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
