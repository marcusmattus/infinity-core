import type { PartId } from "@/lib/holodock-parts";

const STROKE = "#9AA6B7";
const ACCENT = "#32C5FF";
const VIOLET = "#8B45FF";

/**
 * Schematic side elevations, one per group.
 *
 * A rendered thumbnail of each part would mean twelve more canvases; a drawn
 * elevation says the same thing about what the part *is* and costs nothing.
 */
const GLYPHS: Record<PartId, React.ReactNode> = {
  top: (
    <>
      <rect x="6" y="14" width="36" height="12" rx="4" fill="#1b212b" stroke={STROKE} />
      <path d="M18 20c0-2.2 2-2.2 3 0s3 2.2 3 0-2-2.2-3 0-3 2.2-3 0Z" stroke={ACCENT} fill="none" />
      <rect x="29" y="18.6" width="6" height="2.8" rx="1.4" fill={ACCENT} opacity="0.7" />
    </>
  ),
  optics: (
    <>
      <rect x="6" y="17" width="36" height="7" rx="2" fill="#161b24" stroke={STROKE} />
      <ellipse cx="24" cy="17" rx="9" ry="3.4" fill="none" stroke={ACCENT} />
      <ellipse cx="24" cy="15" rx="6" ry="2.4" fill="none" stroke={ACCENT} opacity="0.7" />
      <ellipse cx="24" cy="13.4" rx="3.4" ry="1.6" fill="none" stroke={ACCENT} opacity="0.5" />
    </>
  ),
  combiner: (
    <>
      <rect x="7" y="18" width="34" height="6" rx="2" fill="#161b24" stroke={STROKE} />
      <circle cx="24" cy="18" r="6" fill="none" stroke={VIOLET} strokeWidth="1.6" />
      <circle cx="24" cy="18" r="2.4" fill={ACCENT} opacity="0.85" />
      <path d="M13 21l4-4M35 21l-4-4" stroke={STROKE} />
    </>
  ),
  display: (
    <>
      <rect x="8" y="16" width="32" height="10" rx="2" fill="#11161e" stroke={STROKE} />
      <rect x="12" y="18" width="24" height="6" rx="1" fill={ACCENT} opacity="0.75" />
      <path
        d="M14 18v6M18 18v6M22 18v6M26 18v6M30 18v6M34 18v6"
        stroke="#0a0f18"
        strokeWidth="0.6"
      />
    </>
  ),
  sensors: (
    <>
      <rect x="6" y="19" width="36" height="6" rx="2" fill="#0d1a19" stroke={STROKE} />
      <circle cx="16" cy="17" r="3.4" fill="none" stroke={ACCENT} />
      <circle cx="32" cy="17" r="3.4" fill="none" stroke={ACCENT} />
      <circle cx="24" cy="17.6" r="2" fill={ACCENT} opacity="0.7" />
    </>
  ),
  camera: (
    <>
      <rect x="6" y="20" width="36" height="6" rx="2" fill="#0c1620" stroke={STROKE} />
      <circle cx="15" cy="16.5" r="4.4" fill="#11161e" stroke={STROKE} />
      <circle cx="15" cy="16.5" r="1.8" fill={ACCENT} />
      <circle cx="30" cy="16.5" r="4.4" fill="#11161e" stroke={STROKE} />
      <circle cx="30" cy="16.5" r="1.8" fill={ACCENT} />
      <circle cx="39" cy="18" r="2.4" fill="#11161e" stroke={STROKE} />
    </>
  ),
  processor: (
    <>
      <rect x="6" y="20" width="36" height="6" rx="2" fill="#0b1420" stroke={STROKE} />
      <rect x="16" y="12" width="16" height="9" rx="1.5" fill="#182134" stroke={ACCENT} />
      <rect x="19" y="14.6" width="10" height="4" rx="0.8" fill={ACCENT} opacity="0.55" />
      <path d="M10 20v-3M13 20v-3M35 20v-3M38 20v-3" stroke={STROKE} />
    </>
  ),
  thermal: (
    <>
      <rect x="7" y="21" width="34" height="4" rx="1.5" fill="#2a1a10" stroke="#B3762F" />
      <path
        d="M11 20v-7M15 20v-7M19 20v-7M23 20v-7M27 20v-7M31 20v-7M35 20v-7"
        stroke={STROKE}
        strokeWidth="1.2"
      />
    </>
  ),
  power: (
    <>
      <rect x="6" y="20" width="36" height="6" rx="2" fill="#191410" stroke={STROKE} />
      <rect x="11" y="13" width="5" height="7" rx="1" fill="#11161e" stroke={STROKE} />
      <rect x="19" y="13" width="5" height="7" rx="1" fill="#11161e" stroke={STROKE} />
      <rect x="28" y="14.5" width="7" height="5.5" rx="1" fill="#1d1711" stroke="#B3762F" />
      <rect x="37" y="19" width="5" height="4" rx="1.6" fill="#2a3038" stroke={ACCENT} />
    </>
  ),
  mainpcb: (
    <>
      <rect x="5" y="19" width="38" height="5" rx="1.5" fill="#07151a" stroke="#2E8F7A" />
      <path d="M9 19v-2.5h6v2.5M33 19v-2.5h6v2.5" stroke={STROKE} fill="none" />
      <path d="M12 24v2M18 24v2M24 24v2M30 24v2M36 24v2" stroke="#B3762F" />
      <path d="M8 21.5h32" stroke="#2E8F7A" strokeDasharray="2 3" />
    </>
  ),
  frame: (
    <>
      <rect
        x="6"
        y="15"
        width="36"
        height="12"
        rx="3"
        fill="none"
        stroke={STROKE}
        strokeWidth="1.6"
      />
      <rect x="13" y="18" width="22" height="6" rx="2" fill="none" stroke={STROKE} opacity="0.5" />
      <circle cx="10" cy="18.5" r="1.4" fill={ACCENT} opacity="0.8" />
      <circle cx="38" cy="18.5" r="1.4" fill={ACCENT} opacity="0.8" />
      <circle cx="10" cy="23.5" r="1.4" fill={ACCENT} opacity="0.8" />
      <circle cx="38" cy="23.5" r="1.4" fill={ACCENT} opacity="0.8" />
    </>
  ),
  bottom: (
    <>
      <rect x="6" y="15" width="36" height="12" rx="4" fill="#1b212b" stroke={STROKE} />
      <rect x="12" y="25.5" width="24" height="2" rx="1" fill="#0a0d12" />
      <path d="M9 19h3M9 21.5h3M36 19h3M36 21.5h3" stroke={STROKE} opacity="0.7" />
      <rect x="20" y="18.5" width="8" height="3" rx="1.5" fill="#2a3038" stroke={ACCENT} />
    </>
  ),
};

export function PartThumb({ id, active }: { id: PartId; active: boolean }) {
  return (
    <svg
      viewBox="0 0 48 40"
      className="h-10 w-12 shrink-0 rounded-[3px]"
      style={{
        background: active ? "rgba(50,197,255,0.08)" : "rgba(255,255,255,0.025)",
        outline: active ? "1px solid rgba(50,197,255,0.35)" : "1px solid rgba(255,255,255,0.05)",
      }}
      fill="none"
      strokeWidth="1"
      strokeLinecap="round"
    >
      {GLYPHS[id]}
    </svg>
  );
}
