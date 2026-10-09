import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { PARTS } from "@/lib/holodock-parts";
import { offsetAt, useView } from "./explorer-store";

type Projected = { x: number; y: number; depth: number; visible: boolean };

/** Screen position of each group, written by the scene, read by the overlay. */
export const SCREEN: Projected[] = PARTS.map(() => ({ x: 0, y: 0, depth: 0, visible: false }));

/** Lives inside the canvas: projects each group to the viewport every frame. */
/** The optical chain — the only groups annotated in light-path mode. */
const OPTICAL = new Set(["optics", "combiner", "display"]);

export function CalloutProjector() {
  const { state, anim } = useView();
  const vector = useRef(new THREE.Vector3());

  useFrame((frame) => {
    const { width, height } = frame.size;
    const a = anim.current;
    const show = a.explode > 0.25 && a.spatial < 0.2;

    PARTS.forEach((part, index) => {
      const entry = SCREEN[index];
      if (!entry) return;
      if (!show) {
        entry.visible = false;
        return;
      }
      vector.current.copy(offsetAt(index)).project(frame.camera);
      entry.x = (vector.current.x * 0.5 + 0.5) * width;
      entry.y = (-vector.current.y * 0.5 + 0.5) * height;
      entry.depth = vector.current.z;
      entry.visible =
        vector.current.z < 1 &&
        (state.selected === null || state.selected === part.id) &&
        (a.optical < 0.5 || OPTICAL.has(part.id));
    });
  });

  return null;
}

/**
 * Annotation layer, drawn in SVG over the canvas.
 *
 * Leaders run from each group out to a column at the edge, the way an
 * engineering drawing numbers a part — which keeps the labels legible however
 * far the stack has separated, without any of them overlapping the device.
 */
export function CalloutOverlay() {
  const { state, select } = useView();
  const host = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const nodes = useRef<Array<SVGGElement | null>>([]);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const node = host.current;
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      setSize({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let frame = 0;
    const columnInset = 18;

    const MIN_GAP = 34;

    const tick = () => {
      frame = requestAnimationFrame(tick);
      const width = size.width;
      if (!width) return;
      const columnX = width - columnInset;

      // Labels share one column, so they are spread apart before they are
      // drawn — otherwise the tightly spaced lower layers stack on top of
      // each other and none of them can be read.
      const live = SCREEN.map((entry, index) => ({ entry, index }))
        .filter(({ entry }) => entry.visible && entry.x < columnX - 60)
        .sort((a, b) => a.entry.y - b.entry.y);

      const rows = new Map<number, number>();
      let cursor = -Infinity;
      live.forEach(({ entry, index }) => {
        const y = Math.max(cursor + MIN_GAP, entry.y);
        cursor = y;
        rows.set(index, y);
      });

      // If the column overran the viewport, slide the whole run back up.
      const overflow = cursor - (size.height - 20);
      if (overflow > 0) rows.forEach((value, key) => rows.set(key, value - overflow));

      nodes.current.forEach((group, index) => {
        if (!group) return;
        const entry = SCREEN[index];
        const row = rows.get(index);
        const on = entry !== undefined && row !== undefined;
        group.style.opacity = on ? "1" : "0";
        if (!entry || row === undefined) return;

        const y = Math.max(16, Math.min(size.height - 16, row));
        const leader = group.querySelector("polyline");
        const label = group.querySelector("g.label") as SVGGElement | null;
        const dot = group.querySelector("circle.anchor") as SVGCircleElement | null;
        const elbowX = Math.max(entry.x + 24, columnX - 170);

        if (leader) {
          leader.setAttribute(
            "points",
            `${entry.x.toFixed(1)},${entry.y.toFixed(1)} ${elbowX.toFixed(1)},${y.toFixed(1)} ${(columnX - 150).toFixed(1)},${y.toFixed(1)}`,
          );
        }
        if (dot) {
          dot.setAttribute("cx", entry.x.toFixed(1));
          dot.setAttribute("cy", entry.y.toFixed(1));
        }
        if (label) label.setAttribute("transform", `translate(${columnX - 146}, ${y})`);
      });
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [size]);

  return (
    <div ref={host} className="pointer-events-none absolute inset-0 hidden md:block">
      <svg ref={svg} className="h-full w-full overflow-visible">
        {PARTS.map((part, index) => (
          <g
            key={part.id}
            ref={(node) => {
              nodes.current[index] = node;
            }}
            style={{ opacity: 0, transition: "opacity 240ms ease" }}
          >
            <polyline
              points="0,0 0,0"
              fill="none"
              stroke="rgba(154,166,183,0.42)"
              strokeWidth="1"
              strokeDasharray="2 4"
            />
            <circle className="anchor" r="2.5" fill="#32C5FF" />
            <g className="label">
              <circle
                cx="11"
                cy="0"
                r="11"
                fill="rgba(8,13,23,0.9)"
                stroke={state.selected === part.id ? "#32C5FF" : "rgba(154,166,183,0.4)"}
                strokeWidth="1"
              />
              <text
                x="11"
                y="3.5"
                textAnchor="middle"
                fontSize="9.5"
                fontFamily="ui-monospace, monospace"
                fill="#9AA6B7"
              >
                {part.number}
              </text>
              <text
                x="30"
                y="-2"
                fontSize="12"
                fontWeight="600"
                fontFamily="ui-sans-serif, system-ui, sans-serif"
                fill="#F5F7FB"
                className="pointer-events-auto cursor-pointer"
                onClick={() => select(part.id)}
              >
                {part.name}
              </text>
              <text x="30" y="12" fontSize="10" fontFamily="ui-monospace, monospace" fill="#9AA6B7">
                {part.short}
              </text>
            </g>
          </g>
        ))}
      </svg>
    </div>
  );
}
