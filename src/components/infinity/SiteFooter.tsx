import { InfinityMark, Wordmark } from "./Wordmark";

const columns: Array<{ title: string; items: Array<{ label: string; href: string }> }> = [
  {
    title: "Device",
    items: [
      { label: "HoloDock", href: "#device" },
      { label: "Interactive teardown", href: "/holodock" },
      { label: "Specifications", href: "#device" },
      { label: "Optical modules", href: "#device" },
    ],
  },
  {
    title: "Platform",
    items: [
      { label: "SpatialOS", href: "#stack" },
      { label: "Openware", href: "#openware" },
      { label: "Signal path", href: "#stack" },
    ],
  },
  {
    title: "Developers",
    items: [
      { label: "Camera MCP server", href: "#mcp" },
      { label: "Spatial SDK", href: "#mcp" },
      { label: "Request access", href: "#access" },
    ],
  },
  {
    title: "Company",
    items: [
      { label: "Principles", href: "#pillars" },
      { label: "The gap", href: "#thesis" },
      { label: "Voice interface", href: "#voice" },
    ],
  },
];

/**
 * `base` prefixes the in-page anchors so the footer also works from routes
 * other than the index — pass "/" there, leave it empty on the index itself so
 * the links stay same-page scrolls.
 */
export function SiteFooter({ base = "" }: { base?: string }) {
  return (
    <footer className="relative overflow-hidden">
      <div className="blueprint-grid pointer-events-none absolute inset-0 opacity-30" aria-hidden />

      <div className="shell relative py-20 sm:py-24">
        <div className="flex items-start gap-6">
          <InfinityMark className="h-10 w-20 shrink-0" animated />
          <h2 className="display-tight max-w-2xl text-[2rem] sm:text-[3rem]">
            Build the interface between people and intelligent machines.
          </h2>
        </div>

        <div className="mt-20 grid gap-10 border-t border-border pt-12 md:grid-cols-2 lg:grid-cols-5">
          <div>
            <Wordmark markClassName="h-5 w-10" />
            <p className="label-mono mt-6 max-w-[15rem] text-steel">
              Identity at the centre of computing
            </p>
          </div>

          {columns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h3 className="text-sm font-semibold tracking-tight text-foreground">
                {column.title}
              </h3>
              <ul className="mt-5 space-y-3">
                {column.items.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href.startsWith("/") ? item.href : `${base}${item.href}`}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="label-mono text-steel">© {new Date().getFullYear()} InfinityID Labs</p>
          <p className="label-mono text-steel">Human · Intelligence · Security</p>
        </div>
      </div>
    </footer>
  );
}
