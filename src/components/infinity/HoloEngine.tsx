import { useId } from "react";

/**
 * The InfinityID HoloDock, drawn as line art.
 *
 * The chassis is a Metatron-cube lattice — thirteen node centres (one core, an
 * inner hexagon, an outer hexagon) with every pair connected. Twelve luminous
 * pods sit on the hexagon vertices, a volumetric field is projected from the top
 * aperture, and a single USB-C run ties the whole thing to the host phone.
 *
 * All geometry is derived rather than hand-placed, so the drawing scales cleanly
 * and renders identically on the server and the client.
 */

const CX = 320;
const CY = 392;
const R_INNER = 68;
const R_OUTER = 136;

/** Half-width of the outer hexagon at its widest, used for the dimension line. */
const HALF_WIDTH = R_OUTER * Math.cos(Math.PI / 6);

/** Pointy-top hexagon vertices, in SVG coordinates (y grows downward). */
function hexagon(radius: number) {
  return [90, 150, 210, 270, 330, 30].map((deg) => {
    const rad = (deg * Math.PI) / 180;
    return { x: CX + radius * Math.cos(rad), y: CY - radius * Math.sin(rad) };
  });
}

const INNER = hexagon(R_INNER);
const OUTER = hexagon(R_OUTER);
const CENTRES = [{ x: CX, y: CY }, ...INNER, ...OUTER];

/** Metatron's cube: the complete graph over all thirteen centres. */
const LATTICE: Array<[{ x: number; y: number }, { x: number; y: number }]> = [];
for (let a = 0; a < CENTRES.length; a += 1) {
  for (let b = a + 1; b < CENTRES.length; b += 1) {
    LATTICE.push([CENTRES[a]!, CENTRES[b]!]);
  }
}

const toPoints = (points: Array<{ x: number; y: number }>) =>
  points.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ");

/** A flat plane floating in the projected field, seen at an angle. */
function Plane({
  x,
  y,
  width,
  depth,
  opacity,
}: {
  x: number;
  y: number;
  width: number;
  depth: number;
  opacity: number;
}) {
  return (
    <polygon
      points={toPoints([
        { x: x - width / 2, y },
        { x, y: y - depth / 2 },
        { x: x + width / 2, y },
        { x, y: y + depth / 2 },
      ])}
      fill="var(--color-electric)"
      fillOpacity={opacity * 0.12}
      stroke="var(--color-electric)"
      strokeOpacity={opacity}
      strokeWidth="1"
    />
  );
}

/** Deterministic scatter — a fixed LCG keeps SSR and hydration identical. */
function fieldMotes(count: number) {
  let seed = 20250829;
  const next = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
  return Array.from({ length: count }, (_, i) => {
    const t = next();
    const y = 56 + next() * 244;
    // The field is a cone: it widens as it rises away from the aperture.
    const spread = 52 + ((300 - y) / 244) * 196;
    return {
      key: i,
      x: CX + (t - 0.5) * 2 * spread,
      y,
      r: 1 + next() * 1.8,
      o: 0.25 + next() * 0.55,
    };
  });
}

const MOTES = fieldMotes(52);

export function HoloEngine({ className = "" }: { className?: string }) {
  const uid = useId().replace(/:/g, "");
  const beam = `holo-beam-${uid}`;
  const pod = `holo-pod-${uid}`;
  const shell = `holo-shell-${uid}`;
  const core = `holo-core-${uid}`;

  return (
    <svg
      viewBox="0 0 640 720"
      fill="none"
      className={className}
      role="img"
      aria-label="The InfinityID HoloDock: a handheld Metatron-cube optical engine projecting a volumetric field, tethered to a host phone by a single USB-C cable."
    >
      <defs>
        <linearGradient id={beam} x1="320" y1="34" x2="320" y2="300" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--color-violet)" stopOpacity="0" />
          <stop offset="0.55" stopColor="var(--color-electric)" stopOpacity="0.16" />
          <stop offset="1" stopColor="var(--color-electric)" stopOpacity="0.42" />
        </linearGradient>
        <linearGradient
          id={shell}
          x1={CX - R_OUTER}
          y1={CY - R_OUTER}
          x2={CX + R_OUTER}
          y2={CY + R_OUTER}
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="var(--color-electric)" />
          <stop offset="1" stopColor="var(--color-violet)" />
        </linearGradient>
        <radialGradient id={pod}>
          <stop stopColor="var(--color-foreground)" />
          <stop offset="0.35" stopColor="var(--color-electric)" />
          <stop offset="1" stopColor="var(--color-violet)" stopOpacity="0.1" />
        </radialGradient>
        <radialGradient id={core}>
          <stop stopColor="var(--color-foreground)" stopOpacity="0.9" />
          <stop offset="0.4" stopColor="var(--color-electric)" stopOpacity="0.55" />
          <stop offset="1" stopColor="var(--color-violet)" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* ------------------------------------------- projected volumetric field */}
      <g>
        <polygon
          points={toPoints([
            { x: CX - 262, y: 34 },
            { x: CX + 262, y: 34 },
            { x: CX + 52, y: 300 },
            { x: CX - 52, y: 300 },
          ])}
          fill={`url(#${beam})`}
        />

        <g className="float-slow">
          <Plane x={CX} y={172} width={332} depth={108} opacity={0.5} />
          <Plane x={CX - 124} y={110} width={156} depth={52} opacity={0.34} />
          <Plane x={CX + 132} y={234} width={138} depth={46} opacity={0.34} />

          {/* Anchored data panels — the spatial UI the engine renders. */}
          <g stroke="var(--color-violet)" strokeOpacity="0.55" strokeWidth="1">
            <rect
              x={CX - 248}
              y={162}
              width="90"
              height="56"
              fill="var(--color-violet)"
              fillOpacity="0.08"
            />
            <line x1={CX - 236} y1={179} x2={CX - 186} y2={179} />
            <line x1={CX - 236} y1={191} x2={CX - 203} y2={191} />
            <line x1={CX - 236} y1={203} x2={CX - 212} y2={203} />
          </g>
          <g stroke="var(--color-electric)" strokeOpacity="0.55" strokeWidth="1">
            <rect
              x={CX + 158}
              y={96}
              width="90"
              height="56"
              fill="var(--color-electric)"
              fillOpacity="0.08"
            />
            <line x1={CX + 170} y1={113} x2={CX + 220} y2={113} />
            <line x1={CX + 170} y1={125} x2={CX + 203} y2={125} />
            <line x1={CX + 170} y1={137} x2={CX + 229} y2={137} />
          </g>
        </g>

        {MOTES.map((m) => (
          <circle
            key={m.key}
            cx={m.x}
            cy={m.y}
            r={m.r}
            fill="var(--color-foreground)"
            fillOpacity={m.o}
            className="soft-pulse"
            style={{ animationDelay: `${(m.key % 9) * 0.4}s` }}
          />
        ))}
      </g>

      {/* -------------------------------------------------- orbiting anchor rings */}
      <g transform={`translate(${CX} ${CY})`}>
        <g className="orbit-slow">
          <ellipse
            rx="232"
            ry="72"
            stroke="var(--color-border-strong)"
            strokeWidth="1"
            className="path-flow"
          />
        </g>
        <g className="orbit-rev">
          <ellipse
            rx="182"
            ry="182"
            stroke="var(--color-electric)"
            strokeOpacity="0.28"
            strokeWidth="1"
            strokeDasharray="3 12"
          />
        </g>
      </g>

      {/* ------------------------------------------------------- chassis lattice */}
      <g>
        {LATTICE.map(([a, b], i) => (
          <line
            key={i}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke="var(--color-electric)"
            strokeOpacity="0.22"
            strokeWidth="0.75"
          />
        ))}

        <polygon
          points={toPoints(OUTER)}
          fill="var(--color-background)"
          fillOpacity="0.72"
          stroke={`url(#${shell})`}
          strokeWidth="2"
        />
        <polygon
          points={toPoints(INNER)}
          stroke="var(--color-violet)"
          strokeOpacity="0.75"
          strokeWidth="1.25"
        />

        {/* Core aperture — the light-field engine itself. */}
        <circle cx={CX} cy={CY} r="60" fill={`url(#${core})`} />
        <circle
          cx={CX}
          cy={CY}
          r="38"
          stroke="var(--color-foreground)"
          strokeOpacity="0.5"
          strokeWidth="1"
        />
        <circle cx={CX} cy={CY} r="8" fill="var(--color-foreground)" className="soft-pulse" />

        {/* Twelve luminous pods on the hexagon vertices. */}
        {[...INNER, ...OUTER].map((p, i) => (
          <g key={`pod-${i}`}>
            <circle
              cx={p.x}
              cy={p.y}
              r={i < 6 ? 9 : 14}
              fill={`url(#${pod})`}
              className="soft-pulse"
              style={{ animationDelay: `${i * 0.28}s` }}
            />
            <circle
              cx={p.x}
              cy={p.y}
              r={i < 6 ? 9 : 14}
              stroke="var(--color-foreground)"
              strokeOpacity="0.28"
              strokeWidth="1"
            />
          </g>
        ))}
      </g>

      {/* ------------------------------------------------------- dimension line */}
      <g stroke="var(--color-border-strong)" strokeWidth="1">
        <line x1={CX - HALF_WIDTH} y1="560" x2={CX + HALF_WIDTH} y2="560" />
        <line x1={CX - HALF_WIDTH} y1="553" x2={CX - HALF_WIDTH} y2="567" />
        <line x1={CX + HALF_WIDTH} y1="553" x2={CX + HALF_WIDTH} y2="567" />
      </g>
      <text
        x={CX - 62}
        y="551"
        textAnchor="middle"
        className="label-mono"
        fill="var(--color-muted-foreground)"
      >
        138 mm
      </text>

      {/* --------------------------------------------- USB-C run to the host phone */}
      <line
        x1={CX}
        y1={CY + R_OUTER}
        x2={CX}
        y2="596"
        stroke="var(--color-electric)"
        strokeOpacity="0.7"
        strokeWidth="1.5"
        className="path-flow"
      />

      <g>
        <rect
          x={CX - 46}
          y="596"
          width="92"
          height="124"
          rx="10"
          fill="var(--color-surface)"
          stroke="var(--color-border-strong)"
          strokeWidth="1"
        />
        <rect
          x={CX - 36}
          y="610"
          width="72"
          height="110"
          fill="var(--color-background)"
          stroke="var(--color-border)"
          strokeWidth="1"
        />
        {/* The host app, rendering the same lattice on a flat screen. */}
        <polygon
          points={toPoints(
            [90, 150, 210, 270, 330, 30].map((deg) => {
              const rad = (deg * Math.PI) / 180;
              return { x: CX + 20 * Math.cos(rad), y: 660 - 20 * Math.sin(rad) };
            }),
          )}
          stroke="var(--color-electric)"
          strokeOpacity="0.8"
          strokeWidth="1"
        />
        <circle cx={CX} cy="660" r="3" fill="var(--color-electric)" className="soft-pulse" />
      </g>

      <text x={CX + 60} y="632" className="label-mono" fill="var(--color-muted-foreground)">
        Host phone
      </text>
      <text x={CX + 60} y="652" className="label-mono" fill="var(--color-electric)">
        USB-C
      </text>
    </svg>
  );
}
