import { Wordmark } from "./Wordmark";

const LINKS: Array<[string, string]> = [
  ["Platform", "/#platform"],
  ["HoloDock", "/holodock"],
  ["Deep dive", "/platform"],
  ["Waitlist", "/waitlist"],
  ["Company", "/#company"],
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
    <header className="fixed inset-x-0 top-0 z-50 border-b border-graphite bg-void/85 backdrop-blur-xl">
      <div className="shell flex h-16 items-center justify-between gap-6">
        <a href="/" aria-label="InfinityID Labs — home">
          <Wordmark markClassName="h-5 w-10" />
        </a>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Primary">
          {LINKS.map(([label, href]) => (
            <a
              key={label}
              href={href}
              className="text-[0.8125rem] font-semibold text-white transition-colors hover:text-blue-light"
            >
              {label}
            </a>
          ))}
        </nav>

        <a
          href={cta.href}
          className="rounded-full bg-gold px-5 py-2.5 text-[0.8125rem] font-semibold text-void transition-colors hover:bg-gold-light"
        >
          {cta.label}
        </a>
      </div>
    </header>
  );
}
