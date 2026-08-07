import { Infinity as InfinityIcon } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center border border-primary text-primary">
            <InfinityIcon className="size-4" />
          </span>
          <span className="font-display text-sm font-bold tracking-tight">InfinityID Labs</span>
        </div>
        <nav className="flex flex-wrap gap-6" aria-label="Footer">
          <a href="#why" className="label-mono text-muted-foreground hover:text-primary">
            Why Us
          </a>
          <a href="#device" className="label-mono text-muted-foreground hover:text-primary">
            Device
          </a>
          <a href="#mcp" className="label-mono text-muted-foreground hover:text-primary">
            MCP SDK
          </a>
          <a href="#onboarding" className="label-mono text-muted-foreground hover:text-primary">
            App
          </a>
        </nav>
        <p className="label-mono text-muted-foreground">
          © {new Date().getFullYear()} InfinityID Labs
        </p>
      </div>
    </footer>
  );
}
