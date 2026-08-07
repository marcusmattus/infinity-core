import { Mic, MicOff, Infinity as InfinityIcon } from "lucide-react";

const links = [
  { href: "#why", label: "Why Us" },
  { href: "#device", label: "Device" },
  { href: "#mcp", label: "MCP SDK" },
  { href: "#onboarding", label: "App" },
];

export function SiteNav({
  listening,
  onToggleVoice,
}: {
  listening: boolean;
  onToggleVoice: () => void;
}) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between px-4 sm:px-6">
        <a href="#top" className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center border border-primary text-primary">
            <InfinityIcon className="size-4" />
          </span>
          <span className="font-display text-sm font-bold tracking-tight">InfinityID Labs</span>
        </a>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Primary">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="label-mono text-muted-foreground transition-colors hover:text-primary"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <button
          type="button"
          onClick={onToggleVoice}
          aria-pressed={listening}
          aria-label={listening ? "Stop voice capture" : "Start voice capture"}
          className={`flex items-center gap-2 border px-3 py-1.5 transition-colors ${
            listening
              ? "listening-ring border-primary bg-primary text-primary-foreground"
              : "border-border text-foreground hover:border-primary hover:text-primary"
          }`}
        >
          {listening ? <MicOff className="size-3.5" /> : <Mic className="size-3.5" />}
          <span className="label-mono">{listening ? "Listening" : "Hey Infinity"}</span>
        </button>
      </div>
    </header>
  );
}
