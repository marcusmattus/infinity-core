import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Layers, RotateCcw, RotateCw, Scan, Shrink } from "lucide-react";
import {
  HOLODOCK_PARTS,
  PART_COUNT,
  SYSTEMS,
  SYSTEM_COUNT,
  partById,
  partIndex,
  type HoloDockPartId,
} from "@/lib/holodock-parts";
import {
  INITIAL,
  offsetAt,
  PRESETS,
  ViewContext,
  useView,
  type Animated,
  type CameraGoal,
  type Controller,
  type Mode,
  type PresetId,
  type SpatialLayer,
  type ViewState,
} from "./explorer-store";
import { PartThumb } from "./PartThumb";
import { CalloutOverlay } from "./Callouts";
import { useMaxDpr, useMounted, usePrefersReducedMotion, useWebGL } from "./hooks";
import { StageFallback } from "./StageFallback";

const ExplorerStage = lazy(() => import("./ExplorerStage"));

const MODES: Array<{ id: Mode; label: string }> = [
  { id: "explore", label: "Teardown" },
  { id: "optical", label: "Light path" },
  { id: "spatial", label: "Spatial session" },
];

const LAYERS: Array<[SpatialLayer, string]> = [
  ["anchors", "Anchors"],
  ["depth", "Depth"],
  ["gesture", "Gesture"],
  ["agent", "Agent"],
  ["hud", "SpatialOS"],
];

const STEPS = [
  { n: "1", label: "Connect", body: "Plug HoloDock into your phone" },
  { n: "2", label: "Launch app", body: "Open the InfinityID app" },
  { n: "3", label: "Calibrate", body: "The dock auto-calibrates" },
  { n: "4", label: "Project", body: "Spatial content comes up" },
  { n: "5", label: "Interact", body: "Voice, gesture or touch" },
];

/**
 * The hands-on half of the page: orbit the device, take it apart, open any of
 * the twelve groups, follow the light through the optical chain, or watch a
 * session come up around the dock.
 *
 * The scroll sequence above tells the story once; this is for going back to
 * the part someone actually cares about.
 */
export function HoloDockExplorer() {
  const reducedMotion = usePrefersReducedMotion();
  const mounted = useMounted();
  const webgl = useWebGL();
  const maxDpr = useMaxDpr();

  const [state, setState] = useState<ViewState>(INITIAL);
  const [drawer, setDrawer] = useState(false);

  const camera = useRef<CameraGoal>({
    azimuth: PRESETS.iso.azimuth,
    polar: PRESETS.iso.polar,
    radius: PRESETS.iso.radius,
    target: new THREE.Vector3(),
  });
  const anim = useRef<Animated>({ explode: 0, xray: 0, optical: 0, spatial: 0 });

  useEffect(() => {
    setState((current) => ({ ...current, reducedMotion }));
  }, [reducedMotion]);

  const set = useCallback((patch: Partial<ViewState>) => {
    setState((current) => ({ ...current, ...patch }));
  }, []);

  const applyPreset = useCallback((preset: PresetId) => {
    const config = PRESETS[preset];
    camera.current.azimuth = config.azimuth;
    camera.current.polar = config.polar;
    camera.current.radius = config.radius;
    camera.current.target.set(0, config.targetY, 0);
    setState((current) => ({
      ...current,
      preset,
      selected: null,
      autoRotate: false,
      exploded:
        preset === "exploded" || preset === "optics" || preset === "pcb" ? true : current.exploded,
      xray: preset === "xray" ? true : current.xray,
    }));
  }, []);

  const select = useCallback((id: HoloDockPartId | null) => {
    setState((current) => {
      if (!id) {
        camera.current.radius = PRESETS.iso.radius;
        camera.current.target.set(0, 0, 0);
        return { ...current, selected: null };
      }
      camera.current.radius = 8.2;
      camera.current.polar = 1.16;
      camera.current.target.set(0, offsetAt(partIndex(id)).y, 0);
      return { ...current, selected: id, autoRotate: false, exploded: true };
    });
    if (id) setDrawer(true);
  }, []);

  const reset = useCallback(() => {
    camera.current.azimuth = PRESETS.iso.azimuth;
    camera.current.polar = PRESETS.iso.polar;
    camera.current.radius = PRESETS.iso.radius;
    camera.current.target.set(0, 0, 0);
    setState({ ...INITIAL, reducedMotion });
    setDrawer(false);
  }, [reducedMotion]);

  const setMode = useCallback(
    (mode: Mode) => {
      setState((current) => ({ ...current, mode, selected: null }));
      if (mode === "optical") {
        camera.current.azimuth = 0.9;
        camera.current.polar = 1.14;
        camera.current.radius = 8.6;
        camera.current.target.set(0, 1.5, 0);
      } else if (mode === "spatial") {
        camera.current.azimuth = 0.66;
        camera.current.polar = 1.24;
        camera.current.radius = 17.5;
        camera.current.target.set(0.1, -0.15, 0.2);
      } else {
        applyPreset("iso");
      }
    },
    [applyPreset],
  );

  const controller = useMemo<Controller>(
    () => ({ state, set, select, applyPreset, reset, camera, anim }),
    [state, set, select, applyPreset, reset],
  );

  const selected = state.selected ? partById(state.selected) : null;

  return (
    <ViewContext.Provider value={controller}>
      <section id="explorer" className="border-b border-border">
        <div className="rule-grid xl:grid-cols-[21rem_1fr_21rem]">
          {/* Copy. */}
          <div className="order-2 flex flex-col justify-center bg-background p-7 sm:p-10 xl:order-1">
            <p className="label-mono text-electric">HoloDock / explore the device</p>

            <h2 className="display-tight mt-6 text-[2.25rem] sm:text-[2.75rem]">
              Explore the <span className="gradient-text">HoloDock</span>
              <br />
              <span className="text-steel">from the inside.</span>
            </h2>

            <p className="mt-6 max-w-sm text-sm leading-relaxed text-muted-foreground">
              HoloDock transforms your phone into a spatial computing system. Every layer is
              engineered to deliver holographic visuals, spatial tracking and intelligent
              interaction.
            </p>

            <dl className="mt-9 flex gap-10">
              <div>
                <dt className="font-display text-[2.6rem] font-semibold leading-none tracking-[-0.045em] text-violet">
                  {PART_COUNT}
                </dt>
                <dd className="label-mono mt-2 text-steel">Precision components</dd>
              </div>
              <div>
                <dt className="font-display text-[2.6rem] font-semibold leading-none tracking-[-0.045em] text-electric">
                  {SYSTEM_COUNT}
                </dt>
                <dd className="label-mono mt-2 text-steel">Advanced systems</dd>
              </div>
            </dl>

            <div className="hairline mt-10 max-w-sm bg-surface p-5">
              <p className="label-mono text-electric">About HoloDock</p>
              <p className="mt-3 text-[0.82rem] leading-relaxed text-muted-foreground">
                Plug in. Launch the InfinityID app. Project spatial experiences powered by SpatialOS
                and the InfinityID Agent Kernel.
              </p>
              <a
                href="/#device"
                className="label-mono mt-4 inline-flex items-center gap-2 text-electric"
              >
                Learn more about HoloDock <span aria-hidden>→</span>
              </a>
            </div>

            <p className="label-mono mt-8 max-w-sm leading-relaxed text-steel/70">
              Dimensions and component parameters shown here are provisional design assumptions, not
              verified manufacturing specifications.
            </p>
          </div>

          {/* The device. */}
          <div className="relative order-1 min-h-[32rem] bg-surface sm:min-h-[36rem] xl:order-2 xl:min-h-[46rem]">
            <div
              className="blueprint-grid pointer-events-none absolute inset-0 opacity-25"
              aria-hidden
            />

            <div className="absolute inset-0">
              {mounted && webgl !== false ? (
                <Suspense fallback={<StageFallback />}>
                  <ExplorerStage maxDpr={maxDpr} />
                </Suspense>
              ) : (
                <StageFallback unsupported={webgl === false} />
              )}
            </div>

            <CalloutOverlay />

            {/* Mode. */}
            <div className="absolute left-1/2 top-4 flex -translate-x-1/2 gap-1 border border-border bg-background/80 p-1 backdrop-blur-md">
              {MODES.map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setMode(mode.id)}
                  data-on={state.mode === mode.id}
                  className="label-mono whitespace-nowrap px-2 py-1.5 text-steel transition-colors data-[on=true]:bg-elevated data-[on=true]:text-foreground sm:px-3"
                >
                  {mode.label}
                </button>
              ))}
            </div>

            {/* Camera presets. */}
            {state.mode !== "spatial" && (
              <div className="absolute left-4 top-16 hidden w-[7.5rem] flex-col gap-1 border border-border bg-background/75 p-2 backdrop-blur-md md:flex">
                <p className="label-mono mb-1 px-1 text-steel/70">Camera</p>
                {(Object.keys(PRESETS) as PresetId[]).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => applyPreset(key)}
                    data-on={state.preset === key && !state.selected}
                    className="label-mono border border-transparent px-2.5 py-1.5 text-left text-steel transition-colors hover:text-foreground data-[on=true]:border-electric data-[on=true]:text-foreground"
                  >
                    {PRESETS[key].label}
                  </button>
                ))}
              </div>
            )}

            {state.mode === "spatial" && (
              <p className="label-mono pointer-events-none absolute left-4 top-16 hidden max-w-[14rem] border border-border bg-background/75 p-3 leading-relaxed text-steel backdrop-blur-md md:block">
                Conceptual spatial session. The projection shown stands for the interaction model,
                not for a validated optical architecture.
              </p>
            )}

            {/* Controls — centred by inset, since a left-50% box can only grow
                into the remaining half and wraps the row on a phone. */}
            <div className="pointer-events-none absolute inset-x-2 bottom-3 flex justify-center sm:bottom-4">
              <div className="pointer-events-auto flex flex-wrap justify-center gap-1 border border-border bg-background/80 p-1.5 backdrop-blur-md sm:gap-1.5">
                {state.mode === "spatial" ? (
                  LAYERS.map(([key, label]) => (
                    <Control
                      key={key}
                      on={state.layers[key]}
                      onClick={() =>
                        set({ layers: { ...state.layers, [key]: !state.layers[key] } })
                      }
                    >
                      {label}
                    </Control>
                  ))
                ) : (
                  <>
                    <Control on={state.exploded} onClick={() => set({ exploded: !state.exploded })}>
                      {state.exploded ? (
                        <Shrink className="hidden size-3.5 sm:block" />
                      ) : (
                        <Layers className="hidden size-3.5 sm:block" />
                      )}
                      {state.exploded ? "Assemble" : "Explode"}
                    </Control>
                    <Control on={state.xray} onClick={() => set({ xray: !state.xray })}>
                      <Scan className="hidden size-3.5 sm:block" />
                      X-ray
                    </Control>
                    <Control
                      on={state.autoRotate}
                      onClick={() => set({ autoRotate: !state.autoRotate })}
                    >
                      <RotateCw className="hidden size-3.5 sm:block" />
                      Rotate
                    </Control>
                    <Control onClick={reset}>
                      <RotateCcw className="hidden size-3.5 sm:block" />
                      Reset
                    </Control>
                  </>
                )}
              </div>
            </div>

            {state.mode !== "spatial" && (
              <p className="label-mono pointer-events-none absolute bottom-[4.25rem] left-1/2 hidden -translate-x-1/2 whitespace-nowrap text-steel/70 md:block">
                Drag to rotate · scroll to zoom · click a component
              </p>
            )}
          </div>

          {/* Parts and inspector. */}
          <aside
            className={`order-3 flex flex-col bg-background xl:h-[46rem] ${
              drawer ? "" : "max-xl:max-h-[3.5rem] max-xl:overflow-hidden"
            }`}
          >
            <button
              type="button"
              onClick={() => setDrawer((open) => !open)}
              className="flex w-full shrink-0 items-center justify-between border-b border-border px-5 py-4 xl:cursor-default"
            >
              <span className="text-sm font-semibold">
                {selected ? selected.name : "Device parts"}
              </span>
              <span className="label-mono text-steel xl:hidden">{drawer ? "Close" : "Open"}</span>
              <span className="label-mono hidden text-steel xl:inline">
                {selected ? selected.number : "Click to focus"}
              </span>
            </button>

            {selected ? <Inspector /> : <PartList />}
          </aside>
        </div>

        {/* Experience timeline. */}
        <ol className="rule-grid sm:grid-cols-2 lg:grid-cols-5">
          {STEPS.map((step) => (
            <li key={step.n} className="flex items-start gap-3 bg-background px-5 py-5">
              <span className="hairline mt-0.5 flex size-8 shrink-0 items-center justify-center font-mono text-xs text-electric">
                {step.n}
              </span>
              <span>
                <span className="label-mono block text-foreground">{step.label}</span>
                <span className="mt-1.5 block text-[0.78rem] leading-snug text-muted-foreground">
                  {step.body}
                </span>
              </span>
            </li>
          ))}
        </ol>
      </section>
    </ViewContext.Provider>
  );
}

function Control({
  on,
  onClick,
  children,
}: {
  on?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-on={on ? "true" : "false"}
      aria-pressed={on}
      className="label-mono flex items-center gap-1.5 whitespace-nowrap border border-border px-2 py-2 text-steel transition-colors hover:border-electric hover:text-foreground data-[on=true]:border-electric data-[on=true]:bg-elevated data-[on=true]:text-foreground sm:gap-2 sm:px-3"
    >
      {children}
    </button>
  );
}

function PartList() {
  const { state, select } = useView();

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ul className="min-h-0 flex-1 overflow-y-auto">
        {HOLODOCK_PARTS.map((part) => (
          <li key={part.id}>
            <button
              type="button"
              onClick={() => select(part.id)}
              className="flex w-full items-center gap-3 border-b border-border px-5 py-3 text-left transition-colors hover:bg-surface"
            >
              <PartThumb id={part.id} active={state.hovered === part.id} />
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline gap-2">
                  <span className="label-mono text-steel">{part.number}</span>
                  <span className="truncate text-[0.82rem] font-semibold">{part.name}</span>
                </span>
                <span className="label-mono mt-1 block truncate text-steel/80">{part.short}</span>
              </span>
              <span
                className="size-1.5 shrink-0 rounded-full"
                style={{ background: SYSTEMS[part.system].tint }}
                aria-hidden
              />
            </button>
          </li>
        ))}
      </ul>
      <div className="shrink-0 border-t border-border px-5 py-4">
        <a
          href="/#device"
          className="label-mono flex items-center justify-between border border-border px-4 py-3 text-steel transition-colors hover:border-electric hover:text-electric"
        >
          See all specifications <span aria-hidden>→</span>
        </a>
      </div>
    </div>
  );
}

function Inspector() {
  const { state, select, set } = useView();
  const part = state.selected ? partById(state.selected) : null;
  if (!part) return null;
  const system = SYSTEMS[part.system];

  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
      <span
        className="label-mono inline-flex items-center gap-2 px-2 py-1"
        style={{ color: system.tint, border: `1px solid ${system.tint}44` }}
      >
        <span className="size-1.5 rounded-full" style={{ background: system.tint }} aria-hidden />
        {system.label}
      </span>

      <p className="mt-4 text-[0.84rem] leading-relaxed text-muted-foreground">
        {part.description}
      </p>

      <p className="label-mono mt-6 text-steel/70">Role in the architecture</p>
      <p className="mt-2 text-[0.8rem] leading-relaxed">{part.role}</p>

      <p className="label-mono mt-6 text-steel/70">Provisional parameters</p>
      <dl className="mt-2">
        {part.specs.map(([term, value]) => (
          <div
            key={term}
            className="flex items-baseline justify-between gap-4 border-b border-border py-2.5"
          >
            <dt className="label-mono text-steel">{term}</dt>
            <dd className="text-right text-[0.78rem]">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="label-mono mt-2 leading-relaxed text-steel/60">
        Design assumptions, not finalised specifications.
      </p>

      <p className="label-mono mt-6 text-steel/70">Couples to</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {part.couples.map((id) => {
          const neighbour = partById(id);
          return (
            <button
              key={id}
              type="button"
              onClick={() => select(id)}
              className="label-mono border border-border px-2 py-1 text-steel transition-colors hover:border-electric hover:text-electric"
            >
              {neighbour.number} {neighbour.name}
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap gap-1.5">
        <Control on={state.autoRotate} onClick={() => set({ autoRotate: !state.autoRotate })}>
          Isolated rotation
        </Control>
        <Control onClick={() => select(null)}>← Back to assembly</Control>
      </div>
    </div>
  );
}
