import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { activation } from "./sequence";
import type { SceneRef } from "./scene";

/**
 * The projection SpatialOS puts above the dock once it has reassembled.
 *
 * A separate object from the enclosure, as it should be: the optics throw it,
 * they do not contain it.
 */
export function Hologram({ sceneRef }: { sceneRef: SceneRef }) {
  const group = useRef<THREE.Group>(null);
  const core = useRef<THREE.Mesh>(null);
  const rings = useRef<THREE.Group>(null);
  const pyramid = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    const scene = sceneRef.current;
    const dt = Math.min(delta, 0.1);
    const visible =
      scene.mode === "scroll" ? activation(scene.progress) : scene.explosion < 0.15 ? 1 : 0;

    if (group.current) {
      group.current.visible = visible > 0.01;
      const scale = THREE.MathUtils.damp(group.current.scale.x, 0.35 + visible * 0.65, 5, dt);
      group.current.scale.setScalar(scale);
      if (!scene.reducedMotion) group.current.rotation.y += dt * 0.35;
    }

    const pulse = scene.reducedMotion ? 1 : 1 + Math.sin(state.clock.elapsedTime * 2.4) * 0.18;

    for (const node of [core.current, pyramid.current]) {
      if (!node) continue;
      const material = node.material as THREE.MeshStandardMaterial;
      material.opacity = visible * (node === pyramid.current ? 0.38 : 0.72);
      material.emissiveIntensity = visible * 2.2 * pulse;
    }

    if (rings.current) {
      rings.current.children.forEach((ring, i) => {
        const material = (ring as THREE.Mesh).material as THREE.MeshStandardMaterial;
        material.opacity = visible * 0.5;
        material.emissiveIntensity = visible * 2.6 * pulse;
        if (!scene.reducedMotion) ring.rotation.z += dt * (0.2 + i * 0.12);
      });
    }
  });

  return (
    <group ref={group} position={[0, 2.4, 0]}>
      {/* The display pyramid the optics throw. */}
      {/* Apex down, into the dock: the optics throw it upward and outward. */}
      <mesh ref={pyramid} position={[0, -1.1, 0]} rotation={[Math.PI, Math.PI / 4, 0]}>
        <coneGeometry args={[1.75, 2.3, 4, 1, true]} />
        <meshStandardMaterial
          color="#4f8dff"
          emissive="#1677FF"
          transparent
          opacity={0}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <mesh ref={core}>
        <icosahedronGeometry args={[0.85, 2]} />
        <meshStandardMaterial
          wireframe
          color="#8fbaff"
          emissive="#1677FF"
          transparent
          opacity={0}
          depthWrite={false}
        />
      </mesh>

      <group ref={rings}>
        {[1.25, 1.55, 1.85].map((radius, i) => (
          <mesh key={radius} rotation={[Math.PI / 2 + i * 0.22, 0, i * 0.4]}>
            <torusGeometry args={[radius, 0.012, 8, 64]} />
            <meshStandardMaterial
              color="#a5c8ff"
              emissive="#6425F5"
              transparent
              opacity={0}
              depthWrite={false}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}
