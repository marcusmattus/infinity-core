import type { ReactNode } from "react";
import { Reveal } from "@/components/infinity/Reveal";

/** The shared body of the confirm / unsubscribe landing pages. */
export function WaitlistOutcome({
  eyebrow,
  title,
  body,
  actions = [],
  children,
}: {
  eyebrow: string;
  title: string;
  body: string;
  actions?: Array<{ label: string; href: string; primary?: boolean }>;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="blueprint-fade pointer-events-none absolute inset-0 opacity-50" aria-hidden />
      <div className="shell relative py-24 sm:py-32">
        <Reveal className="max-w-2xl">
          <p className="label-mono text-electric">{eyebrow}</p>
          <h1 className="display-tight mt-8 text-[2.5rem] sm:text-[3.5rem]">{title}</h1>
          <p className="mt-8 text-[0.95rem] leading-relaxed text-muted-foreground">{body}</p>

          <div className="mt-10">
            {children}
            {actions.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {actions.map((action) => (
                  <a
                    key={action.label}
                    href={action.href}
                    className={`px-5 py-3.5 text-sm font-semibold transition-colors ${
                      action.primary
                        ? "gradient-fill text-primary-foreground hover:opacity-90"
                        : "border border-border text-foreground hover:border-electric hover:text-electric"
                    }`}
                  >
                    {action.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
