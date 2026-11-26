/**
 * The InfinityID Labs identity, redrawn as vector so it stays crisp at every
 * size and takes its colours from the CSS tokens.
 *
 * `InfinityMark` is the lemniscate on its own — the recurring geometric motif
 * used as a bullet, a node and a divider throughout the page.
 * `Wordmark` is the full lockup: mark + "InfinityID" + the "LABS" descender.
 */

import { useId } from "react";

/*
 * Two loops that meet on a hard edge: gold on the left (the voice), blue on the
 * right (the action), and a white spark where they touch. Each loop carries its
 * own single-hue ramp — gold and blue never share a gradient.
 */
const LEFT_LOOP =
  "M42.5 24C36.2 13.8 30.9 6.6 23.2 6.6 14 6.6 6.5 14.4 6.5 24s7.5 17.4 16.7 17.4c7.7 0 13-7.2 19.3-17.4Z";
const RIGHT_LOOP =
  "M57.5 24c6.3-10.2 11.6-17.4 19.3-17.4 9.2 0 16.7 7.8 16.7 17.4s-7.5 17.4-16.7 17.4c-7.7 0-13-7.2-19.3-17.4Z";
const SPARK = "M50 11.5 53 21 62.5 24 53 27 50 36.5 47 27 37.5 24 47 21Z";

export function InfinityMark({
  className = "h-6 w-12",
  animated = false,
}: {
  className?: string;
  animated?: boolean;
}) {
  // useId keeps the gradient references stable across SSR and hydration. Its
  // colons are stripped so the value is safe inside url(#…).
  const id = `iid-mark-${useId().replace(/:/g, "")}`;

  return (
    <svg viewBox="0 0 100 48" fill="none" className={className} aria-hidden="true">
      <defs>
        <linearGradient
          id={`${id}-g`}
          x1="8"
          y1="10"
          x2="46"
          y2="40"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="var(--color-gold-light)" />
          <stop offset="1" stopColor="var(--color-gold)" />
        </linearGradient>
        <linearGradient
          id={`${id}-b`}
          x1="54"
          y1="40"
          x2="92"
          y2="10"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="var(--color-blue)" />
          <stop offset="1" stopColor="var(--color-blue-light)" />
        </linearGradient>
      </defs>
      <path d={LEFT_LOOP} stroke={`url(#${id}-g)`} strokeWidth="7" strokeLinejoin="round" />
      <path d={RIGHT_LOOP} stroke={`url(#${id}-b)`} strokeWidth="7" strokeLinejoin="round" />
      <path d={SPARK} fill="var(--color-white)" className={animated ? "soft-pulse" : undefined} />
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
      <span className="flex items-baseline gap-2.5 leading-none">
        <span className="font-display text-[0.95rem] font-bold tracking-[-0.03em] text-foreground">
          InfinityID
        </span>
        {showLabs && (
          <span className="label-mono text-[0.55rem] tracking-[0.42em] text-ash">Labs</span>
        )}
      </span>
    </span>
  );
}
