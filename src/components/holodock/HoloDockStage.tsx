import { useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Float, OrbitControls, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import { HOLODOCK_PARTS, type HoloDockPartId } from "@/lib/holodock-parts";
import { HoloDockModel } from "./HoloDockModel";
import { Hologram } from "./Hologram";
import { activation, partIndexAt, partProgress, spread } from "./sequence";
import type { SceneRef } from "./scene";

/** Where a layer currently sits, so the camera can follow it. */
function layerHeight(sceneRef: SceneRef, index: number): number {
  const scene = sceneRef.current;
  const part = HOLODOCK_PARTS[index];
  if (!part) return 0;
  const t = scene.mode === "scroll" ? partProgress(scene.progress, index) : scene.explosion;
  return THREE.MathUtils.lerp(part.assembled, part.exploded, t);
}

type OrbitLike = { target: THREE.Vector3; update: () => void } | null;

/**
 * In the scroll sequence the camera is scripted: it pulls back as the stack
 * opens and rides down the assembly axis with whichever layer is separating.
 * In the explorer the visitor owns the camera and this only moves what
 * the controls look at.
 */
function CameraRig({ sceneRef }: { sceneRef: SceneRef }) {
  const look = useRef(new THREE.Vector3());

  useFrame((state, delta) => {
    const scene = sceneRef.current;
    const dt = Math.min(delta, 0.1);

    if (scene.mode === "explorer") {
      const controls = state.controls as unknown as OrbitLike;
      if (!controls) return;
      const index = scene.focus ? HOLODOCK_PARTS.findIndex((part) => part.id === scene.focus) : -1;
      const targetY = index >= 0 ? layerHeight(sceneRef, index) : 0;
      controls.target.y = THREE.MathUtils.damp(controls.target.y, targetY, 4, dt);
      controls.update();
      return;
    }

    const open = spread(scene.progress);
    const act = activation(scene.progress);
    const index = partIndexAt(scene.progress);
    const focusY = index >= 0 ? layerHeight(sceneRef, index) : 0;

    // Pull back as the stack opens, and again when the projection comes up.
    // Phones get a wider view, and the device rides above the caption sheet.
    const portrait = state.size.width < 640 ? 1 : 0;
    const distance = 10.6 + open * 5.4 + act * 2.4 + portrait * 3.4;
    const angle = 0.34 + scene.progress * 0.42;
    const height = focusY * 0.3 + 1.4 + open * 0.9 + act * 1.4;

    const camera = state.camera;
    camera.position.x = THREE.MathUtils.damp(
      camera.position.x,
      Math.sin(angle) * distance,
      2.4,
      dt,
    );
    camera.position.z = THREE.MathUtils.damp(
      camera.position.z,
      Math.cos(angle) * distance,
      2.4,
      dt,
    );
    camera.position.y = THREE.MathUtils.damp(camera.position.y, height, 2.4, dt);

    const lookY = focusY * 0.35 + act * 1.7 - portrait * 1.7;
    look.current.y = THREE.MathUtils.damp(look.current.y, lookY, 2.4, dt);
    camera.lookAt(look.current);
  });

  return null;
}

export type HoloDockStageProps = {
  sceneRef: SceneRef;
  activeId: HoloDockPartId | null;
  mode: "scroll" | "explorer";
  reducedMotion: boolean;
  /** Device pixel ratio ceiling — lowered on phones. */
  maxDpr: number;
};

export default function HoloDockStage({
  sceneRef,
  activeId,
  mode,
  reducedMotion,
  maxDpr,
}: HoloDockStageProps) {
  const model = <HoloDockModel sceneRef={sceneRef} activeId={activeId} />;

  return (
    <Canvas
      dpr={[1, maxDpr]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
    >
      <PerspectiveCamera
        makeDefault
        position={mode === "explorer" ? [5.6, 3.4, 13.6] : [4.2, 2.6, 10.4]}
        fov={34}
      />

      <ambientLight intensity={0.62} />
      <directionalLight position={[5, 9, 5]} intensity={2.1} color="#f2f6ff" />
      <directionalLight position={[-6, 4, 6]} intensity={1.25} color="#dde6f7" />
      <pointLight position={[-5, 3, 4]} intensity={8} color="#1677FF" />
      <pointLight position={[4.5, -2.5, -4]} intensity={5} color="#6425F5" />

      {mode === "explorer" && !reducedMotion ? (
        <Float speed={1.1} rotationIntensity={0.06} floatIntensity={0.18}>
          {model}
        </Float>
      ) : (
        model
      )}

      <Hologram sceneRef={sceneRef} />

      <ContactShadows position={[0, -4.9, 0]} opacity={0.36} scale={22} blur={3.2} far={12} />

      {mode === "explorer" && (
        <OrbitControls
          makeDefault
          enablePan={false}
          enableDamping
          dampingFactor={0.08}
          minDistance={6.5}
          maxDistance={18}
          maxPolarAngle={Math.PI * 0.86}
        />
      )}

      <CameraRig sceneRef={sceneRef} />
    </Canvas>
  );
}
