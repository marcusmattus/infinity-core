import { createContext, useContext } from "react";
import * as THREE from "three";
import { PARTS, type PartId } from "@/lib/holodock-parts";

/** Current offset of every group, written by the scene, read by the UI. */
export const LIVE_OFFSETS: THREE.Vector3[] = PARTS.map(() => new THREE.Vector3());

const ORIGIN = new THREE.Vector3();

/** Live offset of group `index`; the origin if the index is out of range. */
export const offsetAt = (index: number): THREE.Vector3 => LIVE_OFFSETS[index] ?? ORIGIN;

export type Mode = "explore" | "optical" | "spatial";

export type PresetId = "iso" | "top" | "front" | "side" | "exploded" | "optics" | "pcb" | "xray";

export type SpatialLayer = "anchors" | "depth" | "gesture" | "agent" | "hud";

export type ViewState = {
  mode: Mode;
  exploded: boolean;
  selected: PartId | null;
  hovered: PartId | null;
  xray: boolean;
  autoRotate: boolean;
  preset: PresetId;
  layers: Record<SpatialLayer, boolean>;
  reducedMotion: boolean;
};

export const INITIAL: ViewState = {
  mode: "explore",
  exploded: false,
  selected: null,
  hovered: null,
  xray: false,
  autoRotate: true,
  preset: "iso",
  layers: { anchors: true, depth: true, gesture: true, agent: true, hud: true },
  reducedMotion: false,
};

/**
 * Camera goal, in spherical coordinates around a target.
 *
 * This is where the camera is heading, not where it is — the rig damps toward
 * it every frame. Presets, part selection and pointer drags all write the same
 * four numbers, which is why a preset transition and a drag never fight: they
 * are the same motion, started from different places.
 */
export type CameraGoal = {
  azimuth: number;
  polar: number;
  radius: number;
  target: THREE.Vector3;
};

export type Animated = {
  /** 0 assembled, 1 fully apart. */
  explode: number;
  /** 0 opaque covers, 1 transparent. */
  xray: number;
  /** 0 explore, 1 optical visualisation. */
  optical: number;
  /** 0 device stage, 1 spatial scene. */
  spatial: number;
};

export type Controller = {
  state: ViewState;
  set: (patch: Partial<ViewState>) => void;
  select: (id: PartId | null) => void;
  applyPreset: (preset: PresetId) => void;
  reset: () => void;
  camera: React.MutableRefObject<CameraGoal>;
  anim: React.MutableRefObject<Animated>;
};

export const ViewContext = createContext<Controller | null>(null);

export function useView(): Controller {
  const value = useContext(ViewContext);
  if (!value) throw new Error("useView must be used inside the explorer");
  return value;
}

export const PRESETS: Record<
  PresetId,
  { label: string; hint: string; azimuth: number; polar: number; radius: number; targetY: number }
> = {
  iso: {
    label: "Isometric",
    hint: "Product view",
    azimuth: 0.72,
    polar: 1.12,
    radius: 10.4,
    targetY: 0,
  },
  top: { label: "Top", hint: "Plan view", azimuth: 0, polar: 0.09, radius: 9.6, targetY: 0 },
  front: {
    label: "Front",
    hint: "USB-C face",
    azimuth: Math.PI / 2,
    polar: 1.5,
    radius: 9.2,
    targetY: 0,
  },
  side: { label: "Side", hint: "Profile", azimuth: 0, polar: 1.52, radius: 9.2, targetY: 0 },
  exploded: {
    label: "Exploded",
    hint: "Full stack",
    azimuth: 0.55,
    polar: 1.22,
    radius: 15.6,
    targetY: 0,
  },
  optics: {
    label: "Optics",
    hint: "Close-up",
    azimuth: 0.85,
    polar: 1.02,
    radius: 4.4,
    targetY: 2.5,
  },
  pcb: {
    label: "Main PCB",
    hint: "Close-up",
    azimuth: 0.6,
    polar: 1.1,
    radius: 4.8,
    targetY: -2.2,
  },
  xray: { label: "X-ray", hint: "Internal", azimuth: 0.95, polar: 1.18, radius: 11.2, targetY: 0 },
};

export const POLAR_MIN = 0.06;
export const POLAR_MAX = Math.PI * 0.92;
export const RADIUS_MIN = 2.6;
export const RADIUS_MAX = 22;

/** Spherical goal to a world position. */
export function goalToPosition(goal: CameraGoal, out = new THREE.Vector3()): THREE.Vector3 {
  const sin = Math.sin(goal.polar);
  return out.set(
    goal.target.x + Math.sin(goal.azimuth) * sin * goal.radius,
    goal.target.y + Math.cos(goal.polar) * goal.radius,
    goal.target.z + Math.cos(goal.azimuth) * sin * goal.radius,
  );
}
