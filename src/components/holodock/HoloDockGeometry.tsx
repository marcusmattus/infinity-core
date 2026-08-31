import { useMemo, type ReactElement } from "react";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import type { HoloDockPartId } from "@/lib/holodock-parts";

/**
 * Procedural stand-in geometry for the ten HoloDock layers.
 *
 * It is deliberately schematic — the real product model drops in at
 * `/public/models/holodock.glb` (see the README there), keyed by the same mesh
 * names. Every layer is built around the same 3.2 × 2.4 footprint so the stack
 * reads as one machined object rather than ten unrelated props.
 */

const W = 3.2;
const D = 2.4;

const PALETTE = {
  shell: "#262d3a",
  metal: "#5a6474",
  board: "#1e2634",
  chip: "#171d29",
  copper: "#a9663a",
  glass: "#2f6ad2",
} as const;

type SurfaceProps = {
  color: string;
  focus: number;
  metalness?: number;
  roughness?: number;
  emissive?: string;
  glow?: number;
  opacity?: number;
};

/** One material rule for the whole device: focus lights a part, the rest recede. */
function Surface({
  color,
  focus,
  metalness = 0.82,
  roughness = 0.34,
  emissive = "#1677FF",
  glow = 0,
  opacity = 1,
}: SurfaceProps) {
  const tint = useMemo(
    () => new THREE.Color(color).multiplyScalar(0.42 + 0.58 * focus),
    [color, focus],
  );
  return (
    <meshStandardMaterial
      color={tint}
      metalness={metalness}
      roughness={roughness}
      emissive={emissive}
      emissiveIntensity={glow * (0.25 + 0.75 * focus)}
      transparent={opacity < 1}
      opacity={opacity}
    />
  );
}

function Board({ focus, thickness = 0.06 }: { focus: number; thickness?: number }) {
  return (
    <mesh>
      <boxGeometry args={[W - 0.28, thickness, D - 0.28]} />
      <Surface color={PALETTE.board} focus={focus} metalness={0.42} roughness={0.55} glow={0.05} />
    </mesh>
  );
}

function TopCover({ focus }: { focus: number }) {
  return (
    <group>
      <RoundedBox args={[W, 0.3, D]} radius={0.1} smoothness={4}>
        <Surface color={PALETTE.shell} focus={focus} glow={0.05} />
      </RoundedBox>

      {/* Infinity emblem. */}
      {[-0.19, 0.19].map((x) => (
        <mesh key={x} position={[x, 0.16, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.19, 0.035, 12, 32]} />
          <Surface color="#7aa6ff" focus={focus} metalness={0.4} roughness={0.25} glow={1.6} />
        </mesh>
      ))}

      {/* Status indicator. */}
      <mesh position={[0, 0.12, D / 2 - 0.16]}>
        <boxGeometry args={[0.6, 0.08, 0.05]} />
        <Surface color="#8fbaff" focus={focus} metalness={0.2} roughness={0.2} glow={2.4} />
      </mesh>
    </group>
  );
}

function ProjectionOptics({ focus }: { focus: number }) {
  return (
    <group>
      <mesh>
        <cylinderGeometry args={[0.62, 0.68, 0.16, 48]} />
        <Surface color={PALETTE.metal} focus={focus} roughness={0.28} />
      </mesh>
      <mesh position={[0, 0.06, 0]}>
        <cylinderGeometry args={[0.46, 0.46, 0.1, 48]} />
        <Surface
          color={PALETTE.glass}
          focus={focus}
          metalness={0.1}
          roughness={0.06}
          glow={0.9}
          opacity={0.72}
        />
      </mesh>
      <mesh position={[0, 0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.74, 0.03, 10, 48]} />
        <Surface color={PALETTE.metal} focus={focus} glow={0.5} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 1.15, 0, 0]}>
          <boxGeometry args={[0.34, 0.1, 0.34]} />
          <Surface color={PALETTE.metal} focus={focus} />
        </mesh>
      ))}
    </group>
  );
}

function BeamCombiner({ focus }: { focus: number }) {
  return (
    <group>
      <mesh rotation={[-0.62, 0, 0]}>
        <boxGeometry args={[1.7, 0.03, 1.5]} />
        <Surface
          color={PALETTE.glass}
          focus={focus}
          metalness={0.08}
          roughness={0.04}
          glow={1.1}
          opacity={0.5}
        />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.95, 0.025, 10, 48]} />
        <Surface color="#6f8dff" focus={focus} metalness={0.3} roughness={0.2} glow={1.8} />
      </mesh>
      <mesh>
        <boxGeometry args={[W - 0.5, 0.04, D - 0.5]} />
        <Surface color={PALETTE.shell} focus={focus} opacity={0.9} />
      </mesh>
    </group>
  );
}

function MicroDisplay({ focus }: { focus: number }) {
  return (
    <group>
      <Board focus={focus} />
      <mesh position={[0, 0.06, 0]}>
        <boxGeometry args={[1.5, 0.05, 1.05]} />
        <Surface color="#0b1a3a" focus={focus} metalness={0.2} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.09, 0]}>
        <boxGeometry args={[1.34, 0.02, 0.9]} />
        <Surface color="#4f9dff" focus={focus} metalness={0.1} roughness={0.2} glow={3.2} />
      </mesh>
    </group>
  );
}

function SpatialSensors({ focus }: { focus: number }) {
  return (
    <group>
      <Board focus={focus} thickness={0.07} />
      {[-0.62, 0.62].map((x) => (
        <mesh key={x} position={[x, 0.09, -0.35]}>
          <sphereGeometry args={[0.16, 24, 16]} />
          <Surface color={PALETTE.chip} focus={focus} metalness={0.5} roughness={0.18} glow={0.7} />
        </mesh>
      ))}
      <mesh position={[0, 0.08, 0.45]}>
        <boxGeometry args={[1.1, 0.09, 0.32]} />
        <Surface color={PALETTE.chip} focus={focus} glow={0.35} />
      </mesh>
      {[-0.3, 0, 0.3].map((x) => (
        <mesh key={x} position={[x, 0.09, 0.45]}>
          <cylinderGeometry args={[0.05, 0.05, 0.1, 20]} />
          <Surface color="#5f8dff" focus={focus} metalness={0.2} roughness={0.15} glow={2.2} />
        </mesh>
      ))}
    </group>
  );
}

function TrackingCamera({ focus }: { focus: number }) {
  return (
    <group>
      <Board focus={focus} thickness={0.07} />
      {[-0.5, 0.5].map((x) => (
        <group key={x} position={[x, 0.1, -0.2]}>
          <mesh>
            <cylinderGeometry args={[0.22, 0.24, 0.16, 32]} />
            <Surface color={PALETTE.chip} focus={focus} metalness={0.6} roughness={0.22} />
          </mesh>
          <mesh position={[0, 0.09, 0]}>
            <cylinderGeometry args={[0.13, 0.13, 0.04, 32]} />
            <Surface color="#3d7bd6" focus={focus} metalness={0.1} roughness={0.05} glow={1.6} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0.08, 0.5]}>
        <boxGeometry args={[0.7, 0.08, 0.3]} />
        <Surface color={PALETTE.chip} focus={focus} glow={0.3} />
      </mesh>
    </group>
  );
}

function AgentProcessor({ focus }: { focus: number }) {
  return (
    <group>
      <Board focus={focus} thickness={0.07} />
      <mesh position={[0, 0.09, 0]}>
        <boxGeometry args={[1.05, 0.1, 0.95]} />
        <Surface color={PALETTE.chip} focus={focus} metalness={0.55} roughness={0.3} glow={0.4} />
      </mesh>
      <mesh position={[0, 0.15, 0]}>
        <boxGeometry args={[0.82, 0.02, 0.72]} />
        <Surface color="#5b8dff" focus={focus} metalness={0.2} roughness={0.2} glow={2.6} />
      </mesh>
      {[
        [-1.05, -0.6],
        [-1.05, 0.6],
        [1.05, -0.6],
        [1.05, 0.6],
      ].map(([x, z]) => (
        <mesh key={`${x},${z}`} position={[x ?? 0, 0.08, z ?? 0]}>
          <boxGeometry args={[0.28, 0.07, 0.28]} />
          <Surface color={PALETTE.chip} focus={focus} glow={0.2} />
        </mesh>
      ))}
    </group>
  );
}

function ThermalSystem({ focus }: { focus: number }) {
  const fins = [-0.9, -0.6, -0.3, 0, 0.3, 0.6, 0.9];
  return (
    <group>
      <mesh>
        <boxGeometry args={[W - 0.34, 0.05, D - 0.34]} />
        <Surface
          color={PALETTE.copper}
          focus={focus}
          metalness={0.9}
          roughness={0.28}
          glow={0.15}
        />
      </mesh>
      {fins.map((z) => (
        <mesh key={z} position={[0, 0.09, z]}>
          <boxGeometry args={[W - 0.7, 0.12, 0.06]} />
          <Surface color={PALETTE.metal} focus={focus} metalness={0.95} roughness={0.22} />
        </mesh>
      ))}
    </group>
  );
}

function PowerSystem({ focus }: { focus: number }) {
  return (
    <group>
      <Board focus={focus} thickness={0.07} />
      {[-0.62, 0.62].map((x) => (
        <RoundedBox
          key={x}
          args={[1.1, 0.16, 1.5]}
          radius={0.05}
          smoothness={3}
          position={[x, 0.11, 0]}
        >
          <Surface color="#2a2f3c" focus={focus} metalness={0.7} roughness={0.4} glow={0.18} />
        </RoundedBox>
      ))}
      {/* USB-C port, facing out of the device. */}
      <mesh position={[0, 0.06, D / 2 - 0.2]}>
        <boxGeometry args={[0.52, 0.13, 0.28]} />
        <Surface color={PALETTE.metal} focus={focus} metalness={0.95} roughness={0.2} glow={0.4} />
      </mesh>
    </group>
  );
}

function BottomCover({ focus }: { focus: number }) {
  return (
    <group>
      <RoundedBox args={[W, 0.3, D]} radius={0.1} smoothness={4}>
        <Surface color={PALETTE.shell} focus={focus} glow={0.04} />
      </RoundedBox>
      <mesh position={[0, -0.14, 0]}>
        <boxGeometry args={[W - 0.5, 0.03, D - 0.5]} />
        <Surface color="#12161e" focus={focus} metalness={0.2} roughness={0.9} />
      </mesh>
      <mesh position={[0, 0, D / 2 - 0.02]}>
        <boxGeometry args={[0.56, 0.14, 0.1]} />
        <Surface color="#0a0d13" focus={focus} metalness={0.4} roughness={0.6} />
      </mesh>
    </group>
  );
}

/** One entry point for the ten layers, so this file only exports a component. */
export function PartGeometry({
  id,
  focus,
}: {
  id: HoloDockPartId;
  focus: number;
}): ReactElement | null {
  switch (id) {
    case "top":
      return <TopCover focus={focus} />;
    case "optics":
      return <ProjectionOptics focus={focus} />;
    case "combiner":
      return <BeamCombiner focus={focus} />;
    case "display":
      return <MicroDisplay focus={focus} />;
    case "sensors":
      return <SpatialSensors focus={focus} />;
    case "camera":
      return <TrackingCamera focus={focus} />;
    case "processor":
      return <AgentProcessor focus={focus} />;
    case "thermal":
      return <ThermalSystem focus={focus} />;
    case "power":
      return <PowerSystem focus={focus} />;
    case "bottom":
      return <BottomCover focus={focus} />;
    default:
      return null;
  }
}
