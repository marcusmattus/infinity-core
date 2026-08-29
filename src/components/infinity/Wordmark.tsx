/**
 * The InfinityID Labs identity, redrawn as vector so it stays crisp at every
 * size and inherits the brand gradient from CSS tokens.
 *
 * `InfinityMark` is the lemniscate on its own — the recurring geometric motif
 * used as a bullet, a node and a divider throughout the page.
 * `Wordmark` is the full lockup: mark + "InfinityID" + the "LABS" descender.
 */

import { useId } from "react";

export function InfinityMark({
  className = "h-6 w-12",
  animated = false,
}: {
  className?: string;
  animated?: boolean;
}) {
  // useId keeps the gradient reference stable across SSR and hydration. Its
  // colons are stripped so the value is safe inside url(#…).
  const id = `iid-mark-${useId().replace(/:/g, "")}`;
  const path =
    "M50 24c-7.4-11.6-13.6-17.4-22.6-17.4C18.4 6.6 11 14.4 11 24s7.4 17.4 16.4 17.4c9 0 15.2-5.8 22.6-17.4 7.4-11.6 13.6-17.4 22.6-17.4C81.6 6.6 89 14.4 89 24s-7.4 17.4-16.4 17.4c-9 0-15.2-5.8-22.6-17.4Z";

  return (
    <svg viewBox="0 0 100 48" fill="none" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="8" y1="6" x2="92" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--color-electric)" />
          <stop offset="1" stopColor="var(--color-violet)" />
        </linearGradient>
      </defs>
      <path d={path} stroke={`url(#${id})`} strokeWidth="5.5" strokeLinecap="round" />
      {animated && (
        <path
          d={path}
          stroke="var(--color-foreground)"
          strokeWidth="1.25"
          strokeLinecap="round"
          className="path-flow opacity-70"
        />
      )}
    </svg>
  );
}

export function Wordmark({
  className = "",
  markClassName = "h-4 w-8",
  showLabs = true,
}: {
  className?: string;
  markClassName?: string;
  showLabs?: boolean;
}) {
  return (
    <span className={`flex items-center gap-2.5 ${className}`}>
      <InfinityMark className={markClassName} />
      <span className="flex flex-col leading-none">
        <span className="font-display text-sm font-semibold tracking-[-0.03em] text-foreground">
          Infinity<span className="gradient-text">ID</span>
        </span>
        {showLabs && (
          <span className="label-mono mt-1 text-[0.5rem] tracking-[0.42em] text-steel">Labs</span>
        )}
      </span>
    </span>
  );
}
