const agents = [
  {
    name: "Research Agent",
    status: "ACTIVE",
    task: "Researching spatial computing hardware…",
    progress: 82,
    steps: [
      ["Sources", "14 found"],
      ["Analysis", "Complete"],
      ["Result", "Ready"],
    ],
  },
  {
    name: "Personal Agent",
    status: "STANDBY",
    task: "Holding context from this morning’s briefing.",
    progress: 34,
    steps: [
      ["Calendar", "Synced"],
      ["Context", "Retained"],
      ["Result", "Waiting"],
    ],
  },
  {
    name: "Developer Agent",
    status: "ACTIVE",
    task: "Compiling spatial SDK bindings for HumanOS.",
    progress: 61,
    steps: [
      ["Repos", "3 linked"],
      ["Build", "Running"],
      ["Result", "Pending"],
    ],
  },
  {
    name: "Device Agent",
    status: "PAIRED",
    task: "Maintaining encrypted link with Metatron node.",
    progress: 100,
    steps: [
      ["Pairing", "Verified"],
      ["Channel", "Encrypted"],
      ["Result", "Stable"],
    ],
  },
];

export function AgentsSection() {
  return (
    <section id="agents" className="relative border-t border-border/60">
      <div className="mx-auto max-w-6xl px-5 py-24 sm:px-6 sm:py-32">
        <p className="mono-label text-muted-foreground">05 — AI Agents</p>
        <h2 className="mt-5 max-w-2xl text-3xl font-semibold tracking-[-0.03em] sm:text-5xl">
          Invisible intelligence. Human control.
        </h2>

        <div className="mt-14 grid gap-4 md:grid-cols-2">
          {agents.map((agent) => (
            <article key={agent.name} className="glass rounded-3xl p-7">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-medium">{agent.name}</h3>
                <span className="mono-label flex items-center gap-2 rounded-full border border-border px-2.5 py-1 text-primary">
                  <span className="size-1.5 rounded-full bg-primary soft-pulse" />
                  {agent.status}
                </span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{agent.task}</p>

              <div className="mt-6 flex items-center gap-4">
                <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full gradient-fill"
                    style={{ width: `${agent.progress}%` }}
                  />
                </div>
                <span className="font-mono text-sm">{agent.progress}%</span>
              </div>

              <dl className="mt-6 space-y-px">
                {agent.steps.map(([label, value]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between border-t border-border/70 py-2.5"
                  >
                    <dt className="mono-label text-muted-foreground">{label}</dt>
                    <dd className="font-mono text-xs">{value}</dd>
                  </div>
                ))}
              </dl>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
