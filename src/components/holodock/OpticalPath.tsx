import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { HEX } from "./materials";
import { partIndex } from "@/lib/holodock-parts";
import { offsetAt, useView } from "./explorer-store";

const DISPLAY = partIndex("display");
const COMBINER = partIndex("combiner");
const OPTICS = partIndex("optics");

/**
 * Illustrative light path: micro display → optical conditioning → beam
 * combiner → output optics.
 *
 * This is a visualisation of the architecture, not an optical simulation. The
 * beam radii, divergence and the colours are design illustration; the stage
 * order and the geometry they connect are the real thing. Wavelength,
 * divergence and efficiency are the parameters to drive from engineering data
 * once it exists — they are deliberately isolated in CONFIG below.
 */
const CONFIG = {
  /** Illustrative only — swap for measured values when they land. */
  sourceRadius: 0.16,
  combinerRadius: 0.24,
  outputRadius: 0.34,
  divergence: 3.1,
  throw: 2.2,
  pulseSpeed: 0.55,
  pulses: 4,
};

export function OpticalPath() {
  const { anim } = useView();
  const group = useRef<THREE.Group>(null);
  const lower = useRef<THREE.Mesh>(null);
  const upper = useRef<THREE.Mesh>(null);
  const output = useRef<THREE.Mesh>(null);
  const pulses = useRef<THREE.Mesh[]>([]);

  const materials = useMemo(() => {
    const make = (hex: number, opacity: number) =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(hex),
        transparent: true,
        opacity,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
        toneMapped: false,
      });
    return {
      source: make(HEX.cyan, 0.3),
      combined: make(HEX.violet, 0.28),
      output: make(HEX.blue, 0.2),
      pulse: make(0xdff1ff, 0.9),
    };
  }, []);

  const pulseGeometry = useMemo(() => new THREE.ConeGeometry(0.055, 0.13, 16), []);

  useFrame((frame, delta) => {
    const node = group.current;
    if (!node) return;
    const strength = anim.current.optical * (1 - anim.current.spatial);
    node.visible = strength > 0.01;
    if (!node.visible) return;

    const yDisplay = offsetAt(DISPLAY).y + 0.06;
    const yCombiner = offsetAt(COMBINER).y;
    const yOptics = offsetAt(OPTICS).y + 0.09;

    const place = (mesh: THREE.Mesh | null, from: number, to: number) => {
      if (!mesh) return;
      const length = Math.max(to - from, 0.001);
      mesh.position.y = (from + to) / 2;
      mesh.scale.y = length;
    };

    place(lower.current, yDisplay, yCombiner - 0.03);
    place(upper.current, yCombiner + 0.03, yOptics);

    if (output.current) {
      output.current.position.y = yOptics + CONFIG.throw / 2;
      output.current.scale.y = CONFIG.throw;
    }

    // Direction indicators riding the path from source to output.
    const span = yOptics + CONFIG.throw - yDisplay;
    const t = (frame.clock.elapsedTime * CONFIG.pulseSpeed) % 1;
    pulses.current.forEach((mesh, i) => {
      if (!mesh) return;
      const local = (t + i / CONFIG.pulses) % 1;
      mesh.position.y = yDisplay + local * span;
      const material = mesh.material as THREE.MeshBasicMaterial;
      material.opacity = 0.9 * strength * Math.sin(local * Math.PI);
    });

    materials.source.opacity = 0.34 * strength;
    materials.combined.opacity = 0.3 * strength;
    materials.output.opacity = 0.18 * strength;
    void delta;
  });

  return (
    <group ref={group}>
      <mesh ref={lower}>
        <cylinderGeometry args={[CONFIG.combinerRadius, CONFIG.sourceRadius, 1, 28, 1, true]} />
        <primitive object={materials.source} attach="material" />
      </mesh>
      <mesh ref={upper}>
        <cylinderGeometry args={[CONFIG.outputRadius, CONFIG.combinerRadius, 1, 28, 1, true]} />
        <primitive object={materials.combined} attach="material" />
      </mesh>
      <mesh ref={output}>
        <cylinderGeometry
          args={[CONFIG.outputRadius * CONFIG.divergence, CONFIG.outputRadius, 1, 32, 1, true]}
        />
        <primitive object={materials.output} attach="material" />
      </mesh>
      {Array.from({ length: CONFIG.pulses }, (_, i) => (
        <mesh
          key={i}
          ref={(node) => {
            if (node) pulses.current[i] = node;
          }}
          geometry={pulseGeometry}
          material={materials.pulse.clone()}
          renderOrder={4}
        />
      ))}
    </group>
  );
}
