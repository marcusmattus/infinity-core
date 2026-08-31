import { useState } from "react";
import { ArrowRight, Check, Copy } from "lucide-react";
import { Reveal } from "./Reveal";
import { SectionHeader } from "./SectionHeader";

/** The whole journey, drawn once before it is broken into steps. */
const PIPELINE = [
  "Idea",
  "Create project",
  "Connect app",
  "Connect MCP",
  "Add agent",
  "Add spatial UI",
  "Simulate",
  "Device test",
  "Publish",
];

const CAPABILITIES = [
  ["Spatial rendering", "Scenes, anchors and holographic output"],
  ["Voice", "Wake word, dictation and spoken intent"],
  ["Gesture", "Hand and pointer targets in the light field"],
  ["Camera", "Stereo RGB frames and passthrough"],
  ["Depth", "LiDAR mesh and environment scanning"],
  ["Agent tools", "Planning, tool calling and memory"],
  ["MCP", "Your servers, exposed as callable tools"],
  ["Cloud AI", "Managed inference through the gateway"],
  ["Local AI", "On-device models, nothing leaves the phone"],
  ["Device control", "Calibration and capture commands"],
  ["Identity", "InfinityID sign-in and org directory"],
  ["Storage", "Assets, scenes and session state"],
  ["Notifications", "Wake the user back into a scene"],
] as const;

const SDKS = [
  { id: "react-native", label: "React Native", code: "npm install @infinityid/spatial" },
  { id: "ios", label: "iOS", code: "swift package add InfinityIDSpatial" },
  { id: "android", label: "Android", code: 'implementation("labs.infinityid:spatial-sdk")' },
  {
    id: "unity",
    label: "Unity",
    code: `# InfinityID Spatial SDK — Unity package
openupm add labs.infinityid.spatial`,
  },
] as const;

const STARTER = `import { InfinityID } from "@infinityid/spatial";

const client = await InfinityID.initialize({
  projectId: process.env.INFINITYID_PROJECT_ID,
});

await client.mcp.connect({
  server: process.env.MCP_SERVER_URL,
});

const device = await client.devices.connect();

await device.spatial.createScene({
  name: "My First Spatial App",
});`;

const PERMISSIONS = `{
  "camera": true,
  "microphone": true,
  "spatialMapping": true,
  "mcpTools": [
    "load_model",
    "save_scene"
  ],
  "deviceControl": false
}`;

const MANIFEST = `{
  "name": "Spatial Fitness Coach",
  "version": "1.0.0",
  "platform": [
    "ios",
    "android"
  ],
  "capabilities": [
    "camera",
    "pose",
    "voice",
    "spatial"
  ],
  "agents": [
    "fitness_coach"
  ],
  "mcpServers": [
    "fitness_backend"
  ],
  "spatialViews": [
    "coach",
    "rep_counter",
    "body_model"
  ]
}`;

type Step = {
  n: string;
  title: string;
  blurb: string;
  kind?: "capabilities" | "sdk";
  fields?: Array<[string, string]>;
  lists?: Array<{ title: string; items: string[] }>;
  code?: Array<{ label: string; code: string }>;
  flow?: string[];
  readout?: Array<[string, string]>;
  link?: { href: string; label: string };
};

const STEPS: Step[] = [
  {
    n: "01",
    title: "Create a developer account",
    blurb:
      "Sign in with an identity you already have. The account carries your organisation, your projects and the environments they deploy to.",
    lists: [
      { title: "Sign in with", items: ["GitHub", "Google", "Email", "Apple"] },
      {
        title: "Created for you",
        items: ["Developer profile", "Organization", "First project", "Default environment"],
      },
    ],
  },
  {
    n: "02",
    title: "Create a project",
    blurb:
      "A project is the unit everything else hangs off: keys, permissions, MCP servers, agents and builds.",
    fields: [
      ["Project name", "Spatial Fitness Coach"],
      ["App type", "Consumer app"],
      ["Platform", "iOS · Android · React Native · Web · Unity · Native"],
      ["Target device", "HoloDock · phone-only fallback"],
      ["Spatial features", "Anchors · depth · gesture"],
      ["Agent features", "Planning · tool calling · memory"],
      ["MCP required", "Yes — fitness_backend"],
    ],
  },
  {
    n: "03",
    title: "Select capabilities",
    blurb:
      "Pick what the app is allowed to reach. Selections become the permission manifest in step 09 — nothing is granted implicitly.",
    kind: "capabilities",
  },
  {
    n: "04",
    title: "Connect an MCP server",
    blurb:
      "Give SpatialOS the URL, the authentication method and the environment. It handshakes, scans the server and lists what it found.",
    fields: [
      ["Server URL", "https://your-mcp-server.example.com"],
      ["Authentication", "OAuth 2.1"],
      ["Environment", "Development"],
    ],
    readout: [
      ["Status", "MCP server connected"],
      ["Tools discovered", "12"],
      ["Resources discovered", "4"],
      ["Prompts discovered", "3"],
    ],
    link: { href: "#mcp-gateway", label: "See the connection screen" },
  },
  {
    n: "05",
    title: "Install the SDK",
    blurb: "One package per platform, generated against your project id and environment.",
    kind: "sdk",
  },
  {
    n: "06",
    title: "Connect your app",
    blurb:
      "Initialise the client, attach your MCP server, claim a device and open a scene. Nine lines to a running spatial session.",
    code: [{ label: "app.ts", code: STARTER }],
  },
  {
    n: "07",
    title: "Test in the simulator",
    blurb:
      "The full runtime without the hardware. Build, debug and demo before a dock reaches your desk.",
    lists: [
      {
        title: "Simulator surfaces",
        items: [
          "Phone simulator",
          "HoloDock simulator",
          "Spatial preview window",
          "Agent console",
          "MCP logs",
          "Device logs",
          "Permissions panel",
          "Event stream",
        ],
      },
    ],
  },
  {
    n: "08",
    title: "Test on device",
    blurb: "When hardware arrives, the same project pairs to it — no separate build target.",
    flow: [
      "Connect phone",
      "Connect HoloDock",
      "Enable developer mode",
      "Scan development QR code",
      "Pair project",
      "Run live spatial session",
    ],
    readout: [
      ["Device", "Connected"],
      ["Phone", "Connected"],
      ["MCP", "Connected"],
      ["Agent", "Online"],
      ["Scene", "Running"],
    ],
  },
  {
    n: "09",
    title: "Declare permissions",
    blurb:
      "Every project ships a permission manifest, and the user sees it in plain language before anything runs.",
    code: [{ label: "permissions.json", code: PERMISSIONS }],
    lists: [
      {
        title: "What the user reads",
        items: [
          "Camera — to see your form while you train",
          "Microphone — to hear coaching commands",
          "Spatial mapping — to place the coach in your room",
          "Two tools on fitness_backend — load a model, save a scene",
          "Device control — not requested",
        ],
      },
    ],
  },
  {
    n: "10",
    title: "Publish",
    blurb: "Choose who gets it. The build artefacts are generated from the project you configured.",
    lists: [
      {
        title: "Distribution",
        items: [
          "Private app",
          "Organization app",
          "InfinityID Openware marketplace",
          "iOS / Android companion app",
          "Internal enterprise deployment",
        ],
      },
      {
        title: "Generated",
        items: [
          "Plugin manifest",
          "App metadata",
          "Permission manifest",
          "SDK configuration",
          "MCP configuration",
          "Signing configuration",
          "Release build",
        ],
      },
    ],
  },
];

export function DevOnboardingSection() {
  const [active, setActive] = useState("03");
  const [chosen, setChosen] = useState<string[]>([
    "Spatial rendering",
    "Voice",
    "Camera",
    "Agent tools",
    "MCP",
  ]);
  const [sdk, setSdk] = useState<(typeof SDKS)[number]["id"]>("react-native");
  const [copied, setCopied] = useState<string | null>(null);

  const step = STEPS.find((item) => item.n === active) ?? STEPS[0]!;
  const sdkEntry = SDKS.find((item) => item.id === sdk) ?? SDKS[0];

  function toggle(name: string) {
    setChosen((current) =>
      current.includes(name) ? current.filter((item) => item !== name) : [...current, name],
    );
  }

  async function copy(key: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      /* Clipboard permission refused — the snippet is selectable in place. */
    }
  }

  return (
    <section id="build" className="border-b border-border">
      <div className="shell py-20 sm:py-28">
        <Reveal>
          <SectionHeader
            index="07"
            eyebrow="Developer onboarding"
            title={
              <>
                Build your first
                <br />
                <span className="text-steel">spatial app.</span>
              </>
            }
            standfirst="Connect your app, your agent or your MCP server to SpatialOS in minutes. The simulator means you can finish the whole loop before a HoloDock exists on your desk."
          />
        </Reveal>

        {/* From idea to spatial app. */}
        <Reveal className="mt-16 border border-border bg-surface p-7 sm:p-10" delay={80}>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <h3 className="font-display text-2xl font-semibold tracking-[-0.03em]">
              From idea to spatial app
            </h3>
            <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
              InfinityID removes the need to build separate systems for hardware control, spatial
              rendering, agents and external tools. Developers connect them through one platform.
            </p>
          </div>

          <ol className="mt-9 flex flex-wrap items-stretch gap-px bg-border">
            {PIPELINE.map((stage, i) => (
              <li
                key={stage}
                className="flex min-w-[8.5rem] flex-1 flex-col justify-between gap-5 bg-surface px-4 py-5"
              >
                <span className="label-mono text-electric">{String(i + 1).padStart(2, "0")}</span>
                <span className="font-mono text-xs leading-snug text-foreground/90">{stage}</span>
              </li>
            ))}
          </ol>
        </Reveal>

        {/* The ten steps. */}
        <Reveal className="rule-grid mt-px lg:grid-cols-[20rem_1fr]" delay={120}>
          <ol className="bg-background">
            {STEPS.map((item) => {
              const on = item.n === active;
              return (
                <li key={item.n}>
                  <button
                    type="button"
                    onClick={() => setActive(item.n)}
                    aria-pressed={on}
                    className={`flex w-full items-center gap-4 border-b border-border px-5 py-4 text-left transition-colors last:border-b-0 sm:px-7 ${
                      on ? "bg-elevated" : "hover:bg-surface"
                    }`}
                  >
                    <span className={`label-mono shrink-0 ${on ? "text-electric" : "text-steel"}`}>
                      {item.n}
                    </span>
                    <span className="flex-1 text-sm font-semibold">{item.title}</span>
                    <ArrowRight
                      className={`size-3.5 shrink-0 transition-opacity ${
                        on ? "text-electric opacity-100" : "opacity-0"
                      }`}
                      aria-hidden
                    />
                  </button>
                </li>
              );
            })}
          </ol>

          <div className="bg-surface p-7 sm:p-10">
            <p className="label-mono text-electric">Step {step.n}</p>
            <h3 className="mt-5 font-display text-3xl font-semibold tracking-[-0.035em]">
              {step.title}
            </h3>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {step.blurb}
            </p>

            <div className="mt-9 space-y-px bg-border">
              {step.fields && (
                <dl className="flex flex-wrap gap-px bg-border">
                  {step.fields.map(([term, value]) => (
                    <div key={term} className="min-w-[16rem] flex-1 bg-surface px-5 py-4">
                      <dt className="label-mono text-steel">{term}</dt>
                      <dd className="mt-2 font-mono text-sm text-foreground/90">{value}</dd>
                    </div>
                  ))}
                </dl>
              )}

              {step.kind === "capabilities" && (
                <div className="bg-surface pt-px">
                  <ul className="flex flex-wrap gap-px bg-border">
                    {CAPABILITIES.map(([name, detail]) => {
                      const on = chosen.includes(name);
                      return (
                        <li key={name} className="min-w-[15rem] flex-1">
                          <button
                            type="button"
                            onClick={() => toggle(name)}
                            aria-pressed={on}
                            className={`flex h-full w-full flex-col gap-2 px-5 py-5 text-left transition-colors ${
                              on
                                ? "bg-elevated"
                                : "bg-surface text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            <span className="flex items-center justify-between gap-3">
                              <span className="text-sm font-semibold text-foreground">{name}</span>
                              <span
                                className={`flex size-4 shrink-0 items-center justify-center border ${
                                  on ? "gradient-fill border-transparent" : "border-border-strong"
                                }`}
                                aria-hidden
                              >
                                {on && <Check className="size-3 text-primary-foreground" />}
                              </span>
                            </span>
                            <span className="text-xs leading-relaxed">{detail}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                  <p className="label-mono px-5 py-4 text-steel">
                    {chosen.length} selected · written into the permission manifest
                  </p>
                </div>
              )}

              {step.kind === "sdk" && (
                <div className="bg-surface pt-px">
                  <div className="flex w-fit flex-wrap gap-px bg-border">
                    {SDKS.map((entry) => (
                      <button
                        key={entry.id}
                        type="button"
                        onClick={() => setSdk(entry.id)}
                        aria-pressed={entry.id === sdk}
                        className={`label-mono px-4 py-2.5 transition-colors ${
                          entry.id === sdk
                            ? "bg-elevated text-foreground"
                            : "bg-surface text-steel hover:text-foreground"
                        }`}
                      >
                        {entry.label}
                      </button>
                    ))}
                  </div>
                  <div className="mt-px flex items-start justify-between gap-4 border border-border bg-background p-5">
                    <pre className="overflow-x-auto font-mono text-xs leading-relaxed text-foreground/85">
                      <code>{sdkEntry.code}</code>
                    </pre>
                    <button
                      type="button"
                      onClick={() => copy(sdkEntry.id, sdkEntry.code)}
                      className="flex shrink-0 items-center gap-2 border border-border px-2.5 py-1 transition-colors hover:border-electric hover:text-electric"
                    >
                      {copied === sdkEntry.id ? (
                        <Check className="size-3.5" />
                      ) : (
                        <Copy className="size-3.5" />
                      )}
                      <span className="label-mono">
                        {copied === sdkEntry.id ? "Copied" : "Copy"}
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {step.code?.map((block) => (
                <div key={block.label} className="bg-background">
                  <div className="flex items-center justify-between border-b border-border px-5 py-3">
                    <span className="label-mono text-steel">{block.label}</span>
                    <button
                      type="button"
                      onClick={() => copy(block.label, block.code)}
                      className="flex items-center gap-2 border border-border px-2.5 py-1 transition-colors hover:border-electric hover:text-electric"
                    >
                      {copied === block.label ? (
                        <Check className="size-3.5" />
                      ) : (
                        <Copy className="size-3.5" />
                      )}
                      <span className="label-mono">
                        {copied === block.label ? "Copied" : "Copy"}
                      </span>
                    </button>
                  </div>
                  <pre className="overflow-x-auto p-5 font-mono text-xs leading-relaxed text-foreground/85 sm:p-7">
                    <code>{block.code}</code>
                  </pre>
                </div>
              ))}

              {step.flow && (
                <ol className="flex flex-wrap gap-px bg-border">
                  {step.flow.map((stage, i) => (
                    <li
                      key={stage}
                      className="flex min-w-[15rem] flex-1 items-baseline gap-3 bg-surface px-5 py-4"
                    >
                      <span className="label-mono text-electric">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-sm text-foreground/90">{stage}</span>
                    </li>
                  ))}
                </ol>
              )}

              {step.lists?.map((list) => (
                <div key={list.title} className="bg-surface px-5 py-5">
                  <p className="label-mono text-steel">{list.title}</p>
                  <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
                    {list.items.map((item) => (
                      <li key={item} className="flex items-start gap-3 text-sm">
                        <span className="gradient-fill mt-2 h-1 w-1 shrink-0" />
                        <span className="text-foreground/90">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              {step.readout && (
                <dl className="flex flex-wrap gap-px bg-border">
                  {step.readout.map(([term, value]) => (
                    <div key={term} className="min-w-[12rem] flex-1 bg-elevated px-5 py-4">
                      <dt className="label-mono text-steel">{term}</dt>
                      <dd className="mt-2 flex items-center gap-2 font-mono text-sm text-electric">
                        <span className="soft-pulse gradient-fill h-1.5 w-1.5" aria-hidden />
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>
              )}

              {step.link && (
                <div className="bg-surface pt-5">
                  <a
                    href={step.link.href}
                    className="label-mono inline-flex border border-border px-4 py-2.5 text-steel transition-colors hover:border-electric hover:text-electric"
                  >
                    {step.link.label}
                  </a>
                </div>
              )}
            </div>
          </div>
        </Reveal>

        {/* The manifest that ties a project together. */}
        <Reveal className="rule-grid mt-px lg:grid-cols-[1fr_1fr]" delay={160}>
          <div className="bg-background">
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <span className="label-mono text-steel">infinityid.app.json</span>
              <button
                type="button"
                onClick={() => copy("manifest", MANIFEST)}
                className="flex items-center gap-2 border border-border px-2.5 py-1 transition-colors hover:border-electric hover:text-electric"
              >
                {copied === "manifest" ? (
                  <Check className="size-3.5" />
                ) : (
                  <Copy className="size-3.5" />
                )}
                <span className="label-mono">{copied === "manifest" ? "Copied" : "Copy"}</span>
              </button>
            </div>
            <pre className="overflow-x-auto p-5 font-mono text-xs leading-relaxed text-foreground/85 sm:p-7">
              <code>{MANIFEST}</code>
            </pre>
          </div>

          <div className="bg-surface p-7 sm:p-10">
            <p className="label-mono text-steel">Spatial app manifest</p>
            <h3 className="mt-6 font-display text-2xl font-semibold tracking-[-0.03em]">
              One file describes the whole app.
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Platforms, capabilities, agents, MCP servers and spatial views in a single
              declaration. The dashboard reads it, the runtime enforces it, and the store shows the
              user what it asks for before they install.
            </p>
            <ul className="mt-8 space-y-3 border-t border-border pt-7">
              {[
                "platform — where the app runs",
                "capabilities — what hardware it may reach",
                "agents — which agents may act on its behalf",
                "mcpServers — which tool servers it depends on",
                "spatialViews — the surfaces it projects",
              ].map((line) => (
                <li key={line} className="flex items-start gap-3 text-sm">
                  <span className="gradient-fill mt-2 h-1 w-1 shrink-0" />
                  <span className="font-mono text-xs leading-relaxed text-foreground/90">
                    {line}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
