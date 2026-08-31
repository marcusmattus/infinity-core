import { useEffect, useRef, useState, type ReactNode } from "react";
import { CheckCircle2, Loader2, ShieldCheck, Wrench } from "lucide-react";
import { Reveal } from "./Reveal";
import { SectionHeader } from "./SectionHeader";

/** What sits behind the gateway, in the order the request travels. */
const chain = [
  { name: "SpatialOS", note: "Session, identity, scene" },
  { name: "Agent Kernel", note: "Intent, plan, tool choice" },
  { name: "MCP Client", note: "Built into the runtime" },
  { name: "InfinityID MCP Gateway", note: "Policy, audit, rotation" },
];

const fanout = [
  { name: "Dev MCP Server", note: "stdio · your laptop" },
  { name: "App MCP Server", note: "HTTPS · your backend" },
  { name: "Device MCP Server", note: "USB-C · the dock" },
  { name: "Cloud MCP Server", note: "SSE · shared org tooling" },
];

const TRANSPORTS = ["HTTP", "SSE", "WebSocket", "stdio"] as const;
const ENVIRONMENTS = ["Local", "Development", "Production"] as const;
const AUTH_METHODS = ["OAuth 2.1", "Bearer token", "mTLS", "None (local)"] as const;

type Transport = (typeof TRANSPORTS)[number];
type Environment = (typeof ENVIRONMENTS)[number];
type AuthMethod = (typeof AUTH_METHODS)[number];
type Status = "idle" | "testing" | "connected";

type Tool = {
  name: string;
  description: string;
  schema: string;
  permissions: string[];
  agents: string;
  devices: string;
};

const TOOLS: Tool[] = [
  {
    name: "open_project",
    description: "Open a project workspace and return its scene index.",
    schema: `{ "projectId": "string", "readOnly": "boolean?" }`,
    permissions: ["projects:read"],
    agents: "Any agent in this project",
    devices: "Phone · HoloDock",
  },
  {
    name: "load_model",
    description: "Fetch a 3D asset and stream it into the spatial runtime.",
    schema: `{ "assetId": "string", "lod": "0 | 1 | 2" }`,
    permissions: ["assets:read", "spatial:render"],
    agents: "Any agent in this project",
    devices: "HoloDock only",
  },
  {
    name: "save_scene",
    description: "Persist the current scene graph, anchors included.",
    schema: `{ "sceneId": "string", "anchors": "Anchor[]" }`,
    permissions: ["scenes:write"],
    agents: "fitness_coach · design_assistant",
    devices: "Phone · HoloDock",
  },
  {
    name: "get_user_files",
    description: "List files the user has explicitly shared with this project.",
    schema: `{ "query": "string?", "limit": "number?" }`,
    permissions: ["files:read", "user:consent"],
    agents: "Requires per-call user approval",
    devices: "Phone",
  },
  {
    name: "send_device_command",
    description: "Issue a calibration or capture command to a paired dock.",
    schema: `{ "deviceId": "string", "command": "string" }`,
    permissions: ["device:control"],
    agents: "Disabled by default",
    devices: "HoloDock only",
  },
  {
    name: "generate_spatial_ui",
    description: "Compose a spatial panel from a component description.",
    schema: `{ "intent": "string", "anchor": "AnchorSpec" }`,
    permissions: ["spatial:render"],
    agents: "Any agent in this project",
    devices: "HoloDock · simulator",
  },
  {
    name: "run_agent_workflow",
    description: "Execute a saved workflow from the agent builder.",
    schema: `{ "workflowId": "string", "input": "object" }`,
    permissions: ["agents:execute"],
    agents: "Owner-approved workflows only",
    devices: "Phone · HoloDock · simulator",
  },
];

/** Every call crosses these gates, in this order, before anything runs. */
const policyChain = [
  "App",
  "Identity",
  "Permission manifest",
  "Agent policy",
  "MCP policy",
  "Device policy",
  "Execute",
];

const guarantees: Array<[string, string]> = [
  ["Tool-level permissions", "Each tool is granted, not the server as a whole."],
  ["User approval", "Consent-scoped tools prompt the person, per call."],
  ["Device permissions", "A tool can be allowed on the dock and denied on the phone."],
  ["Agent permissions", "Named agents, not every agent in the org."],
  ["Scoped API keys", "One key per project, environment and capability set."],
  ["Token rotation", "Rotate from the dashboard without redeploying the app."],
  ["Audit logs", "Every call recorded with caller, device, arguments and result."],
  ["Revocation", "Kill a server, a tool or a key and calls stop mid-session."],
  ["Environment separation", "Local, development and production never share credentials."],
];

export function McpGatewaySection() {
  const [name, setName] = useState("fitness_backend");
  const [url, setUrl] = useState("https://your-mcp-server.example.com");
  const [transport, setTransport] = useState<Transport>("HTTP");
  const [auth, setAuth] = useState<AuthMethod>("OAuth 2.1");
  const [environment, setEnvironment] = useState<Environment>("Development");
  const [status, setStatus] = useState<Status>("idle");
  const [openTool, setOpenTool] = useState<string | null>(TOOLS[0]!.name);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const pending = timer;
    return () => {
      if (pending.current) clearTimeout(pending.current);
    };
  }, []);

  /** A scripted handshake — the panel demonstrates the flow, it does not dial out. */
  function connect() {
    if (timer.current) clearTimeout(timer.current);
    setStatus("testing");
    timer.current = setTimeout(() => setStatus("connected"), 1100);
  }

  function reset() {
    if (timer.current) clearTimeout(timer.current);
    setStatus("idle");
  }

  return (
    <section id="mcp-gateway" className="border-b border-border">
      <div className="shell py-20 sm:py-28">
        <Reveal>
          <SectionHeader
            index="06"
            eyebrow="MCP Gateway"
            title={
              <>
                Keep your backend.
                <br />
                <span className="text-steel">Connect it once.</span>
              </>
            }
            standfirst="You do not rebuild your services to go spatial. Register the MCP server you already run, choose which tools SpatialOS may call, and the Agent Kernel can use them the moment the scene needs them."
          />
        </Reveal>

        {/* Where the gateway sits. */}
        <Reveal className="rule-grid mt-16 lg:grid-cols-[1fr_1.1fr]" delay={80}>
          <div className="bg-background p-7 sm:p-10">
            <p className="label-mono text-steel">Path of a tool call</p>
            <ol className="mt-8 space-y-px bg-border">
              {chain.map((step, i) => (
                <li key={step.name} className="flex items-baseline gap-4 bg-background py-4">
                  <span className="label-mono shrink-0 text-electric">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="flex-1">
                    <span className="block text-sm font-semibold">{step.name}</span>
                    <span className="label-mono mt-1 block text-steel">{step.note}</span>
                  </span>
                </li>
              ))}
            </ol>

            <div aria-hidden className="mx-auto mt-6 mb-6 h-6 w-px bg-border-strong" />

            <ul className="grid gap-px bg-border sm:grid-cols-2">
              {fanout.map((server) => (
                <li key={server.name} className="bg-background p-5">
                  <p className="text-sm font-semibold">{server.name}</p>
                  <p className="label-mono mt-1.5 text-steel">{server.note}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* The dashboard screen, in miniature. */}
          <div className="bg-surface p-7 sm:p-10">
            <div className="flex items-center justify-between gap-4">
              <p className="label-mono text-steel">InfinityID dashboard — connect MCP server</p>
              <span
                className={`label-mono ${status === "connected" ? "text-electric" : "text-steel"}`}
              >
                {status === "connected" ? "Connected" : "Not connected"}
              </span>
            </div>

            <div className="mt-8 space-y-6">
              <Field label="Server name">
                <input
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value);
                    reset();
                  }}
                  className="h-11 w-full border border-input bg-background px-4 font-mono text-sm outline-none focus:border-electric"
                />
              </Field>

              <Field label="Server URL">
                <input
                  value={url}
                  onChange={(event) => {
                    setUrl(event.target.value);
                    reset();
                  }}
                  spellCheck={false}
                  className="h-11 w-full border border-input bg-background px-4 font-mono text-sm outline-none focus:border-electric"
                />
              </Field>

              <Field label="Transport">
                <Choices
                  options={TRANSPORTS}
                  value={transport}
                  onChange={(next) => {
                    setTransport(next);
                    reset();
                  }}
                />
                <p className="label-mono mt-2 text-steel">
                  stdio is for local development against a server on your own machine.
                </p>
              </Field>

              <Field label="Authentication">
                <Choices
                  options={AUTH_METHODS}
                  value={auth}
                  onChange={(next) => {
                    setAuth(next);
                    reset();
                  }}
                />
              </Field>

              <Field label="Environment">
                <Choices
                  options={ENVIRONMENTS}
                  value={environment}
                  onChange={(next) => {
                    setEnvironment(next);
                    reset();
                  }}
                />
              </Field>
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={connect}
                disabled={status === "testing"}
                className="gradient-fill flex items-center gap-2 px-5 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {status === "testing" && <Loader2 className="size-4 animate-spin" />}
                {status === "connected" ? "Reconnect server" : "Test connection"}
              </button>
              {["Connect server", "View tools", "Generate integration"].map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={connect}
                  className="border border-border px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:border-electric hover:text-electric"
                >
                  {label}
                </button>
              ))}
            </div>

            {status === "connected" && (
              <dl className="mt-6 flex flex-wrap gap-px bg-border">
                {[
                  ["Status", "Connected"],
                  ["Latency", "38 ms"],
                  ["Tools discovered", "12"],
                  ["Resources discovered", "4"],
                  ["Prompts discovered", "3"],
                  ["Authentication", auth === "None (local)" ? "Local, unauthenticated" : auth],
                  ["Environment", environment],
                  ["Transport", transport],
                  ["Server", name],
                ].map(([term, value]) => (
                  <div key={term} className="min-w-[11rem] flex-1 bg-surface px-4 py-3.5">
                    <dt className="label-mono text-steel">{term}</dt>
                    <dd className="mt-1.5 font-mono text-sm text-foreground/90">{value}</dd>
                  </div>
                ))}
              </dl>
            )}

            <p className="label-mono mt-6 flex items-center gap-2 text-steel">
              <CheckCircle2 className="size-3.5 text-electric" />
              Interface preview — no request leaves this page.
            </p>
          </div>
        </Reveal>

        {/* Discovered tools. */}
        <Reveal className="mt-px border border-border bg-background" delay={120}>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-3.5 sm:px-7">
            <p className="label-mono text-steel">
              Connected MCP server — {name} · {environment}
            </p>
            <p className="label-mono text-steel">12 tools discovered · 7 shown</p>
          </div>

          <ul className="divide-y divide-border">
            {TOOLS.map((tool) => {
              const open = openTool === tool.name;
              return (
                <li key={tool.name}>
                  <button
                    type="button"
                    onClick={() => setOpenTool(open ? null : tool.name)}
                    aria-expanded={open}
                    className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-surface sm:px-7"
                  >
                    <Wrench
                      className={`size-4 shrink-0 ${open ? "text-electric" : "text-steel"}`}
                      aria-hidden
                    />
                    <span className="w-52 shrink-0 font-mono text-sm text-foreground">
                      {tool.name}
                    </span>
                    <span className="hidden flex-1 text-sm text-muted-foreground sm:block">
                      {tool.description}
                    </span>
                  </button>

                  {open && (
                    <dl className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">
                      {[
                        ["Input schema", tool.schema],
                        ["Permissions", tool.permissions.join(" · ")],
                        ["Allowed agents", tool.agents],
                        ["Allowed devices", tool.devices],
                      ].map(([term, value]) => (
                        <div key={term} className="bg-surface px-5 py-4 sm:px-7">
                          <dt className="label-mono text-steel">{term}</dt>
                          <dd className="mt-2 font-mono text-xs leading-relaxed break-words text-foreground/85">
                            {value}
                          </dd>
                        </div>
                      ))}
                      <div className="flex items-center bg-surface px-5 py-4 sm:col-span-2 sm:px-7 lg:col-span-4">
                        <span className="label-mono border border-border px-3 py-2 text-steel">
                          Test tool
                        </span>
                      </div>
                    </dl>
                  )}
                </li>
              );
            })}
          </ul>
        </Reveal>

        {/* Security. */}
        <Reveal className="rule-grid mt-px lg:grid-cols-[1fr_1.35fr]" delay={160}>
          <div className="bg-surface p-7 sm:p-10">
            <p className="label-mono flex items-center gap-2 text-steel">
              <ShieldCheck className="size-3.5 text-electric" />
              Security layer
            </p>
            <h3 className="mt-6 font-display text-2xl font-semibold tracking-[-0.03em]">
              Nothing executes before the policy chain agrees.
            </h3>
            <ol className="mt-8 space-y-px bg-border">
              {policyChain.map((gate, i) => (
                <li key={gate} className="flex items-center gap-4 bg-surface py-3.5">
                  <span className="label-mono w-8 shrink-0 text-electric">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm text-foreground/90">{gate}</span>
                </li>
              ))}
            </ol>
          </div>

          <ul className="rule-grid sm:grid-cols-3">
            {guarantees.map(([term, detail]) => (
              <li key={term} className="bg-background p-6 sm:p-7">
                <p className="text-sm font-semibold">{term}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{detail}</p>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="label-mono text-steel">{label}</span>
      <span className="mt-3 block">{children}</span>
    </label>
  );
}

function Choices<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly T[];
  value: T;
  onChange: (next: T) => void;
}) {
  return (
    <span className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          aria-pressed={option === value}
          className={`border px-3.5 py-2 font-mono text-xs transition-colors ${
            option === value
              ? "gradient-fill border-transparent text-primary-foreground"
              : "border-border text-muted-foreground hover:border-border-strong hover:text-foreground"
          }`}
        >
          {option}
        </button>
      ))}
    </span>
  );
}
