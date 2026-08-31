import { Suspense, lazy, useCallback, useRef, useState } from "react";
import { HOLODOCK_PARTS } from "@/lib/holodock-parts";
import { createSceneState } from "./scene";
import { partIndexAt, phaseAt, type Phase } from "./sequence";
import {
  useMaxDpr,
  useMounted,
  usePrefersReducedMotion,
  useScrollProgress,
  useWebGL,
} from "./hooks";
import { StageFallback } from "./StageFallback";

const HoloDockStage = lazy(() => import("./HoloDockStage"));

const PHASE_COPY: Record<
  Exclude<Phase, "exploding">,
  { label: string; title: string; body: string }
> = {
  assembled: {
    label: "Assembled",
    title: "One object, ten layers.",
    body: "52 × 14 mm of machined aluminium with an optical engine, a sensor package and an NPU inside. Keep scrolling and it comes apart along its assembly axis, one layer at a time.",
  },
  apart: {
    label: "Fully apart",
    title: "Every layer on one axis.",
    body: "Optics on top, compute in the middle, power and structure at the base. Nothing is glued to anything it does not need to touch — which is what makes the dock serviceable and the thermal path short.",
  },
  reassembling: {
    label: "Reassembling",
    title: "Back together.",
    body: "The same ten layers, closing along the axis they opened on.",
  },
  activating: {
    label: "SpatialOS",
    title: "The software half comes up.",
    body: "The dock is a display and a sensor package. SpatialOS claims it, calibrates the projection, and hands the scene to the Agent Kernel — which is where your apps, agents and MCP tools reach it.",
  },
};

export function HoloDockScrollScene() {
  const sectionRef = useRef<HTMLElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const sceneRef = useRef(createSceneState("scroll", reducedMotion));
  const mounted = useMounted();
  const webgl = useWebGL();
  const maxDpr = useMaxDpr();

  const [phase, setPhase] = useState<Phase>("assembled");
  const [index, setIndex] = useState(-1);

  sceneRef.current.reducedMotion = reducedMotion;

  const onProgress = useCallback((progress: number) => {
    sceneRef.current.progress = progress;
    if (barRef.current) barRef.current.style.transform = `scaleX(${progress})`;
    setPhase((current) => {
      const next = phaseAt(progress);
      return next === current ? current : next;
    });
    setIndex((current) => {
      const next = partIndexAt(progress);
      return next === current ? current : next;
    });
  }, []);

  useScrollProgress(sectionRef, onProgress);

  const part = index >= 0 ? HOLODOCK_PARTS[index] : undefined;
  const copy = phase === "exploding" ? null : PHASE_COPY[phase];
  const activeId = part?.id ?? null;

  const caption = (
    <>
      <p className="label-mono text-electric">
        {part ? `Layer ${part.number} of 10` : copy?.label}
      </p>
      <h2 className="display-tight mt-4 text-[1.75rem] sm:mt-5 sm:text-[2.75rem]">
        {part ? part.name : copy?.title}
      </h2>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:mt-5">
        {part ? part.description : copy?.body}
      </p>

      {part && (
        <ul className="mt-5 flex flex-wrap gap-2 sm:mt-6">
          {part.capabilities.map((capability) => (
            <li
              key={capability}
              className="label-mono border border-border bg-background/70 px-3 py-2 text-steel backdrop-blur-sm"
            >
              {capability}
            </li>
          ))}
        </ul>
      )}

      {phase === "activating" && (
        <div className="pointer-events-auto mt-6 flex flex-wrap gap-2 sm:mt-7">
          <a
            href="/#spatialos"
            className="label-mono border border-border bg-background/70 px-4 py-2.5 text-steel backdrop-blur-sm transition-colors hover:border-electric hover:text-electric"
          >
            Open SpatialOS
          </a>
          <a
            href="/#mcp-gateway"
            className="label-mono border border-border bg-background/70 px-4 py-2.5 text-steel backdrop-blur-sm transition-colors hover:border-electric hover:text-electric"
          >
            MCP Gateway
          </a>
        </div>
      )}
    </>
  );

  return (
    <section
      ref={sectionRef}
      id="teardown"
      aria-label="HoloDock teardown"
      className="relative border-b border-border"
      style={{ height: "560vh" }}
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="absolute inset-0">
          {mounted && webgl !== false ? (
            <Suspense fallback={<StageFallback />}>
              <HoloDockStage
                sceneRef={sceneRef}
                activeId={activeId}
                mode="scroll"
                reducedMotion={reducedMotion}
                maxDpr={maxDpr}
              />
            </Suspense>
          ) : (
            <StageFallback unsupported={webgl === false} />
          )}
        </div>

        {/* Caption — whichever layer is separating, or the phase it is in.
            Beside the device on tablet and up; a sheet below it on phones, so
            the type never sits on top of the model. */}
        <div className="pointer-events-none absolute inset-0 hidden sm:flex sm:items-center">
          <div className="shell w-full">
            <div className="max-w-md">{caption}</div>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 sm:hidden">
          <div className="max-h-[52vh] overflow-hidden border-t border-border bg-background/88 px-5 py-6 backdrop-blur-md">
            {caption}
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 hidden sm:block">
          <div className="shell flex items-end justify-between gap-6 pb-16">
            <p className="label-mono text-steel">
              {phase === "assembled"
                ? "Scroll to take it apart"
                : "Assembly axis · one layer at a time"}
            </p>
            <p className="label-mono text-steel">
              {phase === "assembled"
                ? "00"
                : index >= 0
                  ? String(index + 1).padStart(2, "0")
                  : "10"}{" "}
              / 10
            </p>
          </div>
        </div>

        {/* Layer rail. */}
        <ol className="pointer-events-none absolute top-1/2 right-6 hidden -translate-y-1/2 gap-px lg:grid">
          {HOLODOCK_PARTS.map((item, i) => {
            const on = i === index;
            return (
              <li
                key={item.id}
                className={`flex items-center justify-end gap-3 px-3 py-2 transition-colors ${
                  on ? "text-foreground" : "text-steel"
                }`}
              >
                <span className="label-mono">{item.name}</span>
                <span
                  className={`h-px transition-all ${on ? "w-10 bg-electric" : "w-4 bg-border-strong"}`}
                  aria-hidden
                />
                <span className={`label-mono ${on ? "text-electric" : "text-steel"}`}>
                  {item.number}
                </span>
              </li>
            );
          })}
        </ol>

        {/* Sequence progress. */}
        <div className="absolute inset-x-0 bottom-0 h-px bg-border">
          <div
            ref={barRef}
            className="gradient-fill h-px origin-left"
            style={{ transform: "scaleX(0)" }}
            aria-hidden
          />
        </div>
      </div>
    </section>
  );
}
