import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { RotateCcw, Layers, Shrink } from "lucide-react";
import { HOLODOCK_PARTS, type HoloDockPartId } from "@/lib/holodock-parts";
import { createSceneState } from "./scene";
import { useMaxDpr, useMounted, usePrefersReducedMotion, useWebGL } from "./hooks";
import { StageFallback } from "./StageFallback";

const HoloDockStage = lazy(() => import("./HoloDockStage"));

/**
 * The hands-on half: orbit the device, take it apart, and open any layer.
 * The scroll sequence tells the story once; this lets someone go back to the
 * part they care about.
 */
export function HoloDockExplorer() {
  const reducedMotion = usePrefersReducedMotion();
  const sceneRef = useRef(createSceneState("explorer", reducedMotion));
  const mounted = useMounted();
  const webgl = useWebGL();
  const maxDpr = useMaxDpr();

  const [activeId, setActiveId] = useState<HoloDockPartId | null>(null);
  const [exploded, setExploded] = useState(true);

  useEffect(() => {
    sceneRef.current.explosion = exploded ? 1 : 0;
    sceneRef.current.focus = activeId;
    sceneRef.current.reducedMotion = reducedMotion;
  }, [activeId, exploded, reducedMotion]);

  return (
    <section id="explorer" className="border-b border-border">
      <div className="rule-grid lg:grid-cols-[22rem_1fr_23rem]">
        {/* Copy and controls. */}
        <div className="flex flex-col justify-center bg-background p-7 sm:p-10">
          <p className="label-mono text-electric">HoloDock / device architecture</p>
          <h2 className="display-tight mt-6 text-[2.25rem] sm:text-[2.75rem]">
            Take it
            <br />
            <span className="text-steel">apart yourself.</span>
          </h2>
          <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
            Drag to rotate, scroll to zoom, and open any of the ten layers. Selecting a layer moves
            the camera to it and dims everything else.
          </p>

          <div className="mt-9 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setExploded((current) => !current)}
              className="flex items-center gap-2 border border-border px-4 py-3 text-sm font-semibold transition-colors hover:border-electric hover:text-electric"
            >
              {exploded ? <Shrink className="size-4" /> : <Layers className="size-4" />}
              {exploded ? "Assemble device" : "Explode device"}
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveId(null);
                setExploded(true);
              }}
              className="flex items-center gap-2 border border-border px-4 py-3 text-sm font-semibold text-steel transition-colors hover:border-electric hover:text-electric"
            >
              <RotateCcw className="size-4" />
              Reset
            </button>
          </div>

          <dl className="mt-10 grid grid-cols-2 gap-px bg-border">
            {[
              ["Addressable layers", "10"],
              ["Precision components", "12"],
              ["Body", "52 × 14 mm"],
              ["Interface", "USB-C"],
            ].map(([term, value]) => (
              <div key={term} className="bg-background px-4 py-5 first:pl-0">
                <dt className="label-mono text-steel">{term}</dt>
                <dd className="mt-2 font-mono text-sm">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* The device. */}
        <div className="relative min-h-[32rem] bg-surface lg:min-h-[48rem]">
          <div
            className="blueprint-grid pointer-events-none absolute inset-0 opacity-25"
            aria-hidden
          />
          <div className="absolute inset-0">
            {mounted && webgl !== false ? (
              <Suspense fallback={<StageFallback />}>
                <HoloDockStage
                  sceneRef={sceneRef}
                  activeId={activeId}
                  mode="explorer"
                  reducedMotion={reducedMotion}
                  maxDpr={maxDpr}
                />
              </Suspense>
            ) : (
              <StageFallback unsupported={webgl === false} />
            )}
          </div>
          <p className="label-mono pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2 border border-border bg-background/70 px-4 py-2 text-steel backdrop-blur-sm">
            Drag to rotate · scroll to zoom
          </p>
        </div>

        {/* Layer navigator. */}
        <div className="bg-background p-5 sm:p-7">
          <div className="flex items-baseline justify-between gap-4">
            <h3 className="text-sm font-semibold">Device parts</h3>
            <p className="label-mono text-steel">Click to focus</p>
          </div>

          <ul className="mt-6 grid gap-px bg-border">
            {HOLODOCK_PARTS.map((part) => {
              const on = activeId === part.id;
              return (
                <li key={part.id}>
                  <button
                    type="button"
                    onClick={() => setActiveId(on ? null : part.id)}
                    aria-pressed={on}
                    className={`w-full px-4 py-3.5 text-left transition-colors ${
                      on ? "bg-elevated" : "bg-background hover:bg-surface"
                    }`}
                  >
                    <span className="flex items-baseline gap-3">
                      <span className={`label-mono ${on ? "text-electric" : "text-steel"}`}>
                        {part.number}
                      </span>
                      <span className="flex-1">
                        <span className="block text-sm font-semibold">{part.name}</span>
                        <span className="label-mono mt-1 block text-steel">{part.short}</span>
                      </span>
                    </span>

                    {on && (
                      <span className="mt-4 block border-t border-border pt-4">
                        <span className="block text-xs leading-relaxed text-muted-foreground">
                          {part.description}
                        </span>
                        <span className="mt-3 flex flex-wrap gap-1.5">
                          {part.capabilities.map((capability) => (
                            <span
                              key={capability}
                              className="label-mono border border-border px-2 py-1 text-steel"
                            >
                              {capability}
                            </span>
                          ))}
                        </span>
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>

          <a
            href="/#device"
            className="label-mono mt-6 flex items-center justify-between border border-border px-4 py-3 text-steel transition-colors hover:border-electric hover:text-electric"
          >
            See all specifications
            <span aria-hidden>→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
