import { useEffect, useState } from "react";
import { Menu, Mic, MicOff, X } from "lucide-react";
import { Wordmark } from "./Wordmark";

const links = [
  { href: "#device", label: "Device" },
  { href: "#spatialos", label: "SpatialOS" },
  { href: "#openware", label: "Openware" },
  { href: "#mcp-gateway", label: "MCP" },
  { href: "#build", label: "Build" },
];

export function SiteNav({
  listening,
  onToggleVoice,
}: {
  listening: boolean;
  onToggleVoice: () => void;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300 ${
        scrolled || menuOpen
          ? "border-border bg-background/88 backdrop-blur-xl"
          : "border-transparent bg-transparent"
      }`}
    >
      <div className="shell flex h-16 items-center justify-between gap-6">
        <a href="#top" aria-label="InfinityID Labs — back to top">
          <Wordmark markClassName="h-4 w-8" />
        </a>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="label-mono text-steel transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleVoice}
            aria-pressed={listening}
            aria-label={listening ? "Stop voice capture" : "Start voice capture"}
            className={`flex items-center gap-2 border px-3 py-2 transition-colors ${
              listening
                ? "listening-ring border-electric text-foreground"
                : "border-border text-steel hover:border-border-strong hover:text-foreground"
            }`}
          >
            {listening ? <Mic className="size-3.5" /> : <MicOff className="size-3.5" />}
            <span className="label-mono hidden sm:inline">
              {listening ? "Listening" : "Hey Infinity"}
            </span>
          </button>

          <a
            href="#access"
            className="gradient-fill hidden px-4 py-2 text-xs font-semibold tracking-tight text-primary-foreground transition-opacity hover:opacity-90 sm:inline-flex"
          >
            Request access
          </a>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="flex items-center justify-center border border-border p-2 text-foreground transition-colors hover:border-border-strong lg:hidden"
          >
            {menuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      <nav
        id="mobile-nav"
        aria-label="Primary, mobile"
        hidden={!menuOpen}
        className="border-t border-border bg-background lg:hidden"
      >
        <ul className="shell flex flex-col py-2">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="label-mono block border-b border-border py-4 text-steel transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            </li>
          ))}
          <li>
            <a
              href="#access"
              onClick={() => setMenuOpen(false)}
              className="label-mono block py-4 text-electric"
            >
              Request access
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
}
