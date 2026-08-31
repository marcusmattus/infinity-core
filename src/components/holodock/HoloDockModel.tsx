import { Suspense, lazy, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { HOLODOCK_PARTS, type HoloDockPartId } from "@/lib/holodock-parts";
import { PartGeometry } from "./HoloDockGeometry";
import { USE_GLB } from "./model-source";
import { partProgress } from "./sequence";
import type { SceneRef } from "./scene";

/** Only fetched when the product model is switched on — see model-source.ts. */
const HoloDockGltf = lazy(() => import("./HoloDockGltf"));

/**
 * The ten layers on their assembly axis.
 *
 * Positions are damped toward a target every frame rather than set from React
 * state, so scrolling stays smooth and a part that is mid-travel when the
 * visitor changes direction eases instead of snapping.
 */
export function HoloDockModel({
  sceneRef,
  activeId,
}: {
  sceneRef: SceneRef;
  activeId: HoloDockPartId | null;
}) {
  const group = useRef<THREE.Group>(null);
  const layers = useRef<Array<THREE.Group | null>>([]);

  useFrame((state, delta) => {
    const scene = sceneRef.current;
    const dt = Math.min(delta, 0.1);

    HOLODOCK_PARTS.forEach((part, index) => {
      const layer = layers.current[index];
      if (!layer) return;
      const t = scene.mode === "scroll" ? partProgress(scene.progress, index) : scene.explosion;
      const target = THREE.MathUtils.lerp(part.assembled, part.exploded, t);
      layer.position.y = THREE.MathUtils.damp(layer.position.y, target, 6, dt);
    });

    if (!group.current) return;
    // A slow turn while the device is apart; still when motion is reduced.
    const spin = scene.reducedMotion
      ? -0.35
      : scene.mode === "scroll"
        ? -0.35 + scene.progress * 1.1
        : -0.35 + Math.sin(state.clock.elapsedTime * 0.16) * 0.12;
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, spin, 3, dt);
  });

  const focusOf = useMemo(
    () => (id: HoloDockPartId) => (activeId === null || activeId === id ? 1 : 0.55),
    [activeId],
  );

  return (
    <group ref={group} rotation={[0.06, -0.35, 0]}>
      {HOLODOCK_PARTS.map((part, index) => {
        return (
          <group
            key={part.id}
            name={part.mesh}
            ref={(node) => {
              layers.current[index] = node;
            }}
            position={[0, part.assembled, 0]}
          >
            {USE_GLB ? (
              <Suspense fallback={null}>
                <HoloDockGltf index={index} focus={focusOf(part.id)} />
              </Suspense>
            ) : (
              <PartGeometry id={part.id} focus={focusOf(part.id)} />
            )}
          </group>
        );
      })}
    </group>
  );
}
