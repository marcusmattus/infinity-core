import type { MutableRefObject } from "react";
import type { HoloDockPartId } from "@/lib/holodock-parts";

/**
 * Mutable scene state, shared between React and the render loop.
 *
 * Scroll and pointer input write here on every frame; the loop reads it inside
 * `useFrame`. Keeping it in a ref rather than state is what stops a 60 fps
 * scroll from re-rendering the tree 60 times a second — React only re-renders
 * when the *active layer* changes, which is ten times over the whole sequence.
 */
export type SceneState = {
  /** Scroll position through the pinned sequence, 0–1. */
  progress: number;
  /** Explorer-mode explosion, 0 assembled, 1 fully apart. */
  explosion: number;
  mode: "scroll" | "explorer";
  /** Layer the camera should favour, or null for the whole device. */
  focus: HoloDockPartId | null;
  /** Set when the visitor asked for less motion — the loop goes still. */
  reducedMotion: boolean;
};

export type SceneRef = MutableRefObject<SceneState>;

export function createSceneState(mode: SceneState["mode"], reducedMotion: boolean): SceneState {
  return {
    progress: 0,
    explosion: mode === "explorer" ? 1 : 0,
    mode,
    focus: null,
    reducedMotion,
  };
}
