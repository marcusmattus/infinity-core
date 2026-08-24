import { ArrowRight } from "lucide-react";
import { InfinityMark } from "./InfinityMark";

const links = [
  { href: "#humanos", label: "HumanOS" },
  { href: "#layer", label: "Platform" },
  { href: "#agents", label: "Developers" },
  { href: "#metatron", label: "Metatron" },
  { href: "#company", label: "Company" },
];

export function FinalSection() {
  return (
    <section id="company" className="relative border-t border-border/60">
      <div className="mx-auto max-w-6xl px-5 py-24 sm:px-6 sm:py-32">
        <div className="relative overflow-hidden rounded-[2rem] border border-border bg-surface/35 px-6 py-14 text-center sm:px-10">
          <div className="pointer-events-none absolute inset-0 atmos-glow opacity-30" aria-hidden />
          <h2 className="relative mx-auto max-w-4xl text-3xl font-semibold tracking-[-0.03em] sm:text-5xl">
            The next computer won’t just understand commands.
            <br className="hidden sm:block" /> It will understand you.
          </h2>
          <div className="relative mt-10 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#humanos"
              className="gradient-fill inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Enter HumanOS <ArrowRight className="size-4" />
            </a>
            <a
              href="#agents"
              className="glass inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-medium transition-colors hover:border-primary/60"
            >
              Build with InfinityID <ArrowRight className="size-4" />
            </a>
          </div>
        </div>

        <footer className="mt-14 border-t border-border/70 pt-10">
          <div className="flex flex-col gap-7 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <InfinityMark className="h-5 w-10" animated />
                <span className="text-sm font-semibold tracking-tight">
                  InfinityID <span className="text-muted-foreground">LABS</span>
                </span>
              </div>
              <p className="mt-4 max-w-md text-sm text-muted-foreground">
                The Human Interface Layer for the Next Computing Era.
              </p>
            </div>
            <nav className="flex flex-wrap gap-x-6 gap-y-3" aria-label="Footer">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="mono-label text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>
        </footer>
      </div>
    </section>
  );
}
