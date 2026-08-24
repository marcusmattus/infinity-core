export function InfinityMark({
  className = "",
  animated = false,
}: {
  className?: string;
  animated?: boolean;
}) {
  return (
    <svg viewBox="0 0 100 48" fill="none" className={className} aria-hidden>
      <defs>
        <linearGradient id="iid-mark" x1="0" y1="0" x2="100" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--color-primary)" />
          <stop offset="1" stopColor="var(--color-violet)" />
        </linearGradient>
      </defs>
      <path
        d="M50 24c-7-11-13-17-22-17S12 14 12 24s7 17 16 17 15-6 22-17c7-11 13-17 22-17s16 7 16 17-7 17-16 17-15-6-22-17Z"
        stroke="url(#iid-mark)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {animated && (
        <path
          d="M50 24c-7-11-13-17-22-17S12 14 12 24s7 17 16 17 15-6 22-17c7-11 13-17 22-17s16 7 16 17-7 17-16 17-15-6-22-17Z"
          stroke="var(--color-foreground)"
          strokeWidth="1.5"
          strokeLinecap="round"
          className="path-flow opacity-60"
        />
      )}
    </svg>
  );
}
