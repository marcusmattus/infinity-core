import type { ReactNode } from "react";

/**
 * The page's one heading pattern: a mono index in the left rail, an eyebrow,
 * an oversized tight-tracked title, and an optional standfirst.
 */
export function SectionHeader({
  index,
  eyebrow,
  title,
  standfirst,
  aside,
}: {
  index: string;
  eyebrow: string;
  title: ReactNode;
  standfirst?: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <div className="grid gap-8 lg:grid-cols-[7rem_1fr] lg:gap-12">
      <div className="flex items-baseline gap-4 lg:flex-col lg:gap-3">
        <span className="label-mono text-electric">{index}</span>
        <span className="label-mono text-steel">{eyebrow}</span>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.35fr_1fr] lg:items-end lg:gap-16">
        <h2 className="display-tight text-[2.5rem] sm:text-[3.5rem] lg:text-[4.25rem]">{title}</h2>
        {standfirst && (
          <p className="max-w-md text-[0.95rem] leading-relaxed text-muted-foreground">
            {standfirst}
          </p>
        )}
        {aside}
      </div>
    </div>
  );
}
