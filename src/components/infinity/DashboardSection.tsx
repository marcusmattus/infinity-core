import { useState } from "react";
import {
  Activity,
  Boxes,
  CircleDot,
  Cpu,
  FileText,
  KeyRound,
  Layers,
  LayoutDashboard,
  ScrollText,
  Server,
  ShieldCheck,
  Users,
  Wallet,
  Workflow,
  Wrench,
} from "lucide-react";
import { Reveal } from "./Reveal";
import { SectionHeader } from "./SectionHeader";

type ViewId =
  | "overview"
  | "projects"
  | "apps"
  | "agents"
  | "mcp"
  | "tools"
  | "devices"
  | "scenes"
  | "analytics"
  | "logs"
  | "security"
  | "keys"
  | "team"
  | "billing"
  | "docs";

type NavItem = {
  id: ViewId;
  label: string;
  icon: typeof Server;
  /** Panel copy for the pages that render as a summary rather than a built-out view. */
  summary?: string;
  rows?: Array<[string, string]>;
};

const NAV: NavItem[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  {
    id: "projects",
    label: "Projects",
    icon: Boxes,
    summary: "Every project in the organisation, with its environments and build status.",
    rows: [
      ["Spatial Fitness Coach", "Development · 3 environments"],
      ["Showroom CAD", "Production · 2 environments"],
      ["Field Service Assist", "Local · 1 environment"],
    ],
  },
  {
    id: "apps",
    label: "Apps",
    icon: Layers,
    summary: "Apps connected through the InfinityID App Bridge and the plugins they registered.",
    rows: [
      ["Fitness Spatial", "React Native · camera, pose, spatial, agent"],
      ["Showroom Viewer", "Unity · spatial, storage"],
      ["Service Notes", "iOS · voice, agent"],
    ],
  },
  { id: "agents", label: "Agents", icon: Workflow },
  { id: "mcp", label: "MCP Servers", icon: Server },
  {
    id: "tools",
    label: "Tools",
    icon: Wrench,
    summary: "Every tool discovered across your servers, with the grants that let agents call it.",
    rows: [
      ["load_model", "assets:read · spatial:render"],
      ["save_scene", "scenes:write"],
      ["send_device_command", "device:control · disabled by default"],
    ],
  },
  {
    id: "devices",
    label: "Devices",
    icon: Cpu,
    summary: "Paired docks and phones, their firmware and their developer-mode state.",
    rows: [
      ["HoloDock DEV-014", "Paired · firmware 0.9.4"],
      ["iPhone 16 Pro", "Developer mode on"],
      ["Simulator", "Always available"],
    ],
  },
  {
    id: "scenes",
    label: "Scenes",
    icon: Boxes,
    summary: "Saved scene graphs, their anchors and how often they are restored.",
    rows: [
      ["coach", "3 anchors · restored 212×"],
      ["rep_counter", "1 anchor · restored 188×"],
      ["body_model", "1 anchor · restored 174×"],
    ],
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: Activity,
    summary: "Sessions, tool calls, render time and where the frame budget goes.",
    rows: [
      ["Spatial sessions", "1,284 this week"],
      ["Tool calls", "9,417 this week"],
      ["Median frame time", "11.6 ms"],
    ],
  },
  {
    id: "logs",
    label: "Logs",
    icon: ScrollText,
    summary: "Agent, MCP and device logs in one stream, filterable by session.",
    rows: [
      ["agent", "plan → load_model → place"],
      ["mcp", "fitness_backend · 38 ms · 200"],
      ["device", "anchor drift corrected"],
    ],
  },
  {
    id: "security",
    label: "Security",
    icon: ShieldCheck,
    summary: "Policies, consent records and the audit trail for every executed tool call.",
    rows: [
      ["Consent records", "Retained per user, per tool"],
      ["Audit trail", "Caller, device, arguments, result"],
      ["Revocation", "Immediate, mid-session"],
    ],
  },
  {
    id: "keys",
    label: "API Keys",
    icon: KeyRound,
    summary: "Scoped keys per project and environment, with rotation and expiry.",
    rows: [
      ["inf_live_…9c2f", "Production · rotates in 21 days"],
      ["inf_dev_…41ab", "Development · rotates in 6 days"],
      ["inf_local_…77e0", "Local · never leaves your machine"],
    ],
  },
  {
    id: "team",
    label: "Team",
    icon: Users,
    summary: "Members, roles and which environments each role can deploy to.",
    rows: [
      ["Owner", "All environments"],
      ["Developer", "Local and development"],
      ["Reviewer", "Read-only, plus audit"],
    ],
  },
  {
    id: "billing",
    label: "Billing",
    icon: Wallet,
    summary: "Usage-based metering across inference, storage and gateway calls.",
    rows: [
      ["Gateway calls", "9,417 of 25,000"],
      ["Cloud inference", "42 GPU-minutes"],
      ["Storage", "18.4 GB"],
    ],
  },
  {
    id: "docs",
    label: "Documentation",
    icon: FileText,
    summary: "SDK reference, MCP guides and the spatial component catalogue.",
    rows: [
      ["Spatial Runtime API", "scene, anchor, object, input"],
      ["Agent Kernel API", "plan, tools, memory"],
      ["MCP integration", "transports, auth, policy"],
    ],
  },
];

const OVERVIEW: Array<[string, string, string]> = [
  ["Project status", "Healthy", "Development · build 128"],
  ["Connected apps", "3", "Fitness Spatial · Showroom · Service Notes"],
  ["Connected agents", "2", "fitness_coach · design_assistant"],
  ["MCP servers", "4", "1 local · 2 development · 1 production"],
  ["Devices", "2 docks · 5 phones", "1 dock in developer mode"],
  ["Spatial sessions", "1,284", "Last 7 days"],
  ["API usage", "9,417 calls", "38 ms median gateway latency"],
  ["Errors", "6", "All in development, none in production"],
  ["Recent deployments", "build 128", "12 minutes ago · development"],
];

const SERVERS = [
  {
    name: "fitness_backend",
    status: "Connected",
    environment: "Development",
    tools: "12 tools · 4 resources · 3 prompts",
    last: "Last request 4s ago",
    latency: "38 ms",
    auth: "OAuth 2.1",
    version: "v1.4.2",
  },
  {
    name: "asset_pipeline",
    status: "Connected",
    environment: "Production",
    tools: "6 tools · 9 resources",
    last: "Last request 21s ago",
    latency: "64 ms",
    auth: "mTLS",
    version: "v2.0.0",
  },
  {
    name: "local_dev",
    status: "Connected",
    environment: "Local",
    tools: "3 tools",
    last: "Last request 1s ago",
    latency: "4 ms",
    auth: "None · stdio",
    version: "dev",
  },
  {
    name: "org_tooling",
    status: "Degraded",
    environment: "Production",
    tools: "8 tools · 2 prompts",
    last: "Last request 3m ago",
    latency: "412 ms",
    auth: "Bearer token",
    version: "v1.1.7",
  },
];

const SERVER_ACTIONS = ["Open", "Test", "Disable", "Rotate credentials", "View logs"];

const BLOCKS = [
  "Input",
  "Agent",
  "MCP tool",
  "App action",
  "Device action",
  "Spatial action",
  "Condition",
  "Memory",
  "Output",
];

const WORKFLOW = [
  ["Input", "Voice input"],
  ["Agent", "InfinityID agent"],
  ["MCP tool", "Search files"],
  ["MCP tool", "Load 3D model"],
  ["Spatial action", "Detect surface"],
  ["Spatial action", "Place object"],
  ["Output", "HoloDock output"],
];

const CTA_BUTTONS = [
  { label: "Start building", href: "#access", primary: true },
  { label: "Connect MCP server", href: "#mcp-gateway", primary: false },
  { label: "View documentation", href: "#build", primary: false },
  { label: "Request HoloDock dev kit", href: "#access", primary: false },
];

export function DashboardSection() {
  const [view, setView] = useState<ViewId>("overview");
  const item = NAV.find((entry) => entry.id === view) ?? NAV[0]!;

  return (
    <section id="dashboard" className="border-b border-border">
      <div className="shell py-20 sm:py-28">
        <Reveal>
          <SectionHeader
            index="08"
            eyebrow="Openware dashboard"
            title={
              <>
                One console.
                <br />
                <span className="text-steel">Every moving part.</span>
              </>
            }
            standfirst="Projects, MCP servers, discovered tools, paired devices, saved scenes, keys and audit logs — the whole spatial deployment in one place, per environment."
          />
        </Reveal>

        <Reveal className="rule-grid mt-16 lg:grid-cols-[16rem_1fr]" delay={80}>
          <nav className="bg-background p-3" aria-label="Developer dashboard">
            <ul>
              {NAV.map((entry) => {
                const Icon = entry.icon;
                const on = entry.id === view;
                return (
                  <li key={entry.id}>
                    <button
                      type="button"
                      onClick={() => setView(entry.id)}
                      aria-pressed={on}
                      className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                        on
                          ? "bg-elevated font-semibold text-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Icon
                        className={`size-4 shrink-0 ${on ? "text-electric" : "text-steel"}`}
                        aria-hidden
                      />
                      {entry.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="bg-surface">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4 sm:px-8">
              <p className="font-display text-lg font-semibold tracking-[-0.02em]">{item.label}</p>
              <p className="label-mono text-steel">Spatial Fitness Coach · development</p>
            </div>

            {view === "overview" && (
              <dl className="flex flex-wrap gap-px bg-border">
                {OVERVIEW.map(([term, value, note]) => (
                  <div key={term} className="min-w-[16rem] flex-1 bg-surface px-5 py-6 sm:px-8">
                    <dt className="label-mono text-steel">{term}</dt>
                    <dd className="mt-3 font-display text-2xl font-semibold tracking-[-0.03em]">
                      {value}
                    </dd>
                    <p className="label-mono mt-2 text-steel">{note}</p>
                  </div>
                ))}
              </dl>
            )}

            {view === "mcp" && (
              <ul className="grid gap-px bg-border sm:grid-cols-2">
                {SERVERS.map((server) => (
                  <li key={server.name} className="bg-surface p-5 sm:p-8">
                    <div className="flex items-center justify-between gap-4">
                      <p className="font-mono text-sm text-foreground">{server.name}</p>
                      <span
                        className={`label-mono flex items-center gap-2 ${
                          server.status === "Connected" ? "text-electric" : "text-muted-foreground"
                        }`}
                      >
                        <CircleDot className="size-3" aria-hidden />
                        {server.status}
                      </span>
                    </div>

                    <dl className="mt-6 grid gap-x-6 gap-y-3 sm:grid-cols-2">
                      {[
                        ["Environment", server.environment],
                        ["Version", server.version],
                        ["Discovered", server.tools],
                        ["Latency", server.latency],
                        ["Authentication", server.auth],
                        ["Activity", server.last],
                      ].map(([term, value]) => (
                        <div key={term}>
                          <dt className="label-mono text-steel">{term}</dt>
                          <dd className="mt-1 font-mono text-xs text-foreground/85">{value}</dd>
                        </div>
                      ))}
                    </dl>

                    <ul className="mt-7 flex flex-wrap gap-2">
                      {SERVER_ACTIONS.map((action) => (
                        <li
                          key={action}
                          className="label-mono border border-border px-3 py-2 text-steel transition-colors hover:border-border-strong hover:text-foreground"
                        >
                          {action}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            )}

            {view === "agents" && (
              <div className="grid gap-px bg-border lg:grid-cols-[1fr_1.2fr]">
                <div className="bg-surface p-5 sm:p-8">
                  <p className="label-mono text-steel">Blocks</p>
                  <ul className="mt-6 grid grid-cols-2 gap-px bg-border sm:grid-cols-3">
                    {BLOCKS.map((block) => (
                      <li key={block} className="label-mono bg-surface px-3 py-2.5 text-foreground">
                        {block}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-8 text-sm leading-relaxed text-muted-foreground">
                    Drag a block onto the canvas, wire it to the next one, and the workflow becomes
                    callable as a tool — by an agent, by an app action, or by a spoken phrase.
                  </p>
                </div>

                <div className="bg-surface p-5 sm:p-8">
                  <p className="label-mono text-steel">Example workflow</p>
                  <ol className="mt-6 grid gap-px bg-border">
                    {WORKFLOW.map(([kind, label], i) => (
                      <li
                        key={`${kind}-${label}`}
                        className="flex items-center gap-4 bg-surface px-4 py-3.5"
                      >
                        <span className="label-mono w-8 shrink-0 text-electric">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="flex-1 text-sm text-foreground/90">{label}</span>
                        <span className="label-mono text-steel">{kind}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            )}

            {item.summary && (
              <div className="p-5 sm:p-8">
                <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  {item.summary}
                </p>
                <ul className="mt-7 flex flex-wrap gap-px bg-border">
                  {item.rows?.map(([term, value]) => (
                    <li key={term} className="min-w-[15rem] flex-1 bg-surface px-4 py-4">
                      <p className="font-mono text-xs text-foreground">{term}</p>
                      <p className="label-mono mt-2 text-steel">{value}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Reveal>

        {/* Developer CTA. */}
        <Reveal className="mt-px border border-border bg-surface p-7 sm:p-12" delay={140}>
          <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-end">
            <div>
              <h3 className="display-tight text-[2.25rem] sm:text-[3rem]">
                Build for the <span className="gradient-text">spatial web.</span>
              </h3>
              <p className="mt-6 max-w-xl text-sm leading-relaxed text-muted-foreground">
                Connect your apps, agents and tools to InfinityID SpatialOS and start building
                interfaces that move beyond the screen.
              </p>
            </div>

            <div>
              <div className="grid grid-cols-1 gap-px bg-border sm:grid-cols-2">
                {CTA_BUTTONS.map((button) => (
                  <a
                    key={button.label}
                    href={button.href}
                    className={`px-5 py-3.5 text-sm font-semibold transition-colors ${
                      button.primary
                        ? "gradient-fill text-primary-foreground hover:opacity-90"
                        : "bg-surface text-foreground hover:text-electric"
                    }`}
                  >
                    {button.label}
                  </a>
                ))}
              </div>
              <p className="label-mono mt-6 text-steel">
                SDK access can begin before HoloDock hardware is available, using the SpatialOS
                simulator.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
