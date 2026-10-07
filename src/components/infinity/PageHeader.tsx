import { Wordmark } from "./Wordmark";

const LINKS: Array<[string, string]> = [
  ["Device", "/#device"],
  ["SpatialOS", "/#spatialos"],
  ["Openware", "/#openware"],
  ["MCP", "/#mcp-gateway"],
  ["Build", "/#build"],
];

/**
 * The header every route outside the index shares. The index keeps `SiteNav`,
 * which also carries the voice control and in-page anchors.
 */
export function PageHeader({
  cta = { label: "Join waitlist", href: "/waitlist" },
}: {
  cta?: { label: string; href: string };
}) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/85 backdrop-blur-xl">
      <div className="shell flex h-16 items-center justify-between gap-6">
        <a href="/" aria-label="InfinityID Labs — home">
          <Wordmark markClassName="h-4 w-8" />
        </a>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Primary">
          {LINKS.map(([label, href]) => (
            <a
              key={label}
              href={href}
              className="label-mono text-steel transition-colors hover:text-foreground"
            >
              {label}
            </a>
          ))}
        </nav>

        <a
          href={cta.href}
          className="gradient-fill px-4 py-2 text-xs font-semibold tracking-tight text-primary-foreground transition-opacity hover:opacity-90"
        >
          {cta.label}
        </a>
      </div>
    </header>
  );
}
