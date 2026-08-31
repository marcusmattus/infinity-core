import { PART_COUNT } from "@/lib/holodock-parts";

/**
 * The scroll story, as fractions of the pinned section's scroll distance.
 * They sum to 1: assembled hold → each layer separates in turn → a beat fully
 * apart → reassembly → SpatialOS comes up.
 */
export const SEQUENCE = {
  hold: 0.06,
  explode: 0.62,
  apart: 0.12,
  reassemble: 0.12,
  activate: 0.08,
} as const;

const EXPLODE_END = SEQUENCE.hold + SEQUENCE.explode;
const APART_END = EXPLODE_END + SEQUENCE.apart;
const REASSEMBLE_END = APART_END + SEQUENCE.reassemble;
const STEP = SEQUENCE.explode / PART_COUNT;

export type Phase = "assembled" | "exploding" | "apart" | "reassembling" | "activating";

export const clamp01 = (value: number) => (value < 0 ? 0 : value > 1 ? 1 : value);

/** Smoothstep — the layers should not start or stop abruptly. */
export const ease = (t: number) => t * t * (3 - 2 * t);

/**
 * How far layer `index` has travelled at this scroll position, 0–1. Layers
 * separate one at a time, then all of them collapse back together.
 */
export function partProgress(progress: number, index: number): number {
  const out = ease(clamp01((progress - (SEQUENCE.hold + index * STEP)) / STEP));
  const back = ease(clamp01((progress - APART_END) / SEQUENCE.reassemble));
  return out * (1 - back);
}

/** 0 before reassembly completes, ramping to 1 as SpatialOS comes up. */
export function activation(progress: number): number {
  return ease(clamp01((progress - REASSEMBLE_END) / SEQUENCE.activate));
}

export function phaseAt(progress: number): Phase {
  if (progress < SEQUENCE.hold) return "assembled";
  if (progress < EXPLODE_END) return "exploding";
  if (progress < APART_END) return "apart";
  if (progress < REASSEMBLE_END) return "reassembling";
  return "activating";
}

/** Index of the layer currently separating, or -1 when none is. */
export function partIndexAt(progress: number): number {
  if (phaseAt(progress) !== "exploding") return -1;
  const index = Math.floor((progress - SEQUENCE.hold) / STEP);
  return Math.min(Math.max(index, 0), PART_COUNT - 1);
}

/** Mean travel across all ten layers — how far apart the device is overall. */
export function spread(progress: number): number {
  let total = 0;
  for (let index = 0; index < PART_COUNT; index += 1) total += partProgress(progress, index);
  return total / PART_COUNT;
}
