import { ArrowRight } from "lucide-react";
import { InfinityMark } from "./InfinityMark";

const links = [
  { href: "#humanos", label: "Product" },
  { href: "#layer", label: "Platform" },
  { href: "#agents", label: "Developers" },
  { href: "#metatron", label: "Metatron" },
  { href: "#company", label: "Company" },
];

export function SiteNav() {
  return (
    <div className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6 sm:pt-5">
      <header className="glass mx-auto flex h-14 max-w-6xl items-center justify-between rounded-full pl-4 pr-2 sm:pl-6 sm:pr-3">
        <a href="#top" className="flex items-center gap-2.5">
          <InfinityMark className="h-4 w-8 float-slow" animated />
          <span className="text-sm font-semibold tracking-tight">
            InfinityID <span className="text-muted-foreground">LABS</span>
          </span>
        </a>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <a
          href="#humanos"
          className="gradient-fill inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          <span className="hidden sm:inline">Enter HumanOS</span>
          <span className="sm:hidden">HumanOS</span>
          <ArrowRight className="size-3.5" />
        </a>
      </header>
    </div>
  );
}
