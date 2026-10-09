import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { FOOTPRINT, type PartId } from "@/lib/holodock-parts";
import { createMaterials, type Materials } from "./materials";

const F = FOOTPRINT;
const R = 0.44;

function roundedPath(w: number, d: number, r: number) {
  const path = new THREE.Shape();
  const x = -w / 2;
  const y = -d / 2;
  const radius = Math.min(r, Math.min(w, d) / 2);
  path.moveTo(x + radius, y);
  path.lineTo(x + w - radius, y);
  path.quadraticCurveTo(x + w, y, x + w, y + radius);
  path.lineTo(x + w, y + d - radius);
  path.quadraticCurveTo(x + w, y + d, x + w - radius, y + d);
  path.lineTo(x + radius, y + d);
  path.quadraticCurveTo(x, y + d, x, y + d - radius);
  path.lineTo(x, y + radius);
  path.quadraticCurveTo(x, y, x + radius, y);
  return path;
}

/**
 * A rounded plate extruded on the assembly axis.
 *
 * Every layer in the stack is some version of this: the covers are thick ones
 * with a bevel, the boards are thin ones without. Building them from one
 * primitive is what keeps the stack reading as a single machined object
 * rather than twelve unrelated shapes.
 */
function plate(w: number, d: number, h: number, r = R, bevel = 0.014) {
  const useBevel = bevel > 0 && h > bevel * 2.5;
  const geometry = new THREE.ExtrudeGeometry(roundedPath(w, d, r), {
    depth: useBevel ? h - bevel * 2 : h,
    bevelEnabled: useBevel,
    bevelSize: bevel,
    bevelThickness: bevel,
    bevelSegments: 3,
    curveSegments: 14,
  });
  geometry.rotateX(-Math.PI / 2);
  geometry.center();
  geometry.computeVertexNormals();
  return geometry;
}

/** A plate with the middle removed — the internal frame and the cover lips. */
function frame(w: number, d: number, h: number, wall: number, r = R) {
  const shape = roundedPath(w, d, r);
  shape.holes.push(roundedPath(w - wall * 2, d - wall * 2, Math.max(r - wall, 0.06)));
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: h,
    bevelEnabled: false,
    curveSegments: 14,
  });
  geometry.rotateX(-Math.PI / 2);
  geometry.center();
  geometry.computeVertexNormals();
  return geometry;
}

const G = {
  topShell: plate(F, F, 0.3, R, 0.02),
  topLip: frame(F - 0.1, F - 0.1, 0.07, 0.1, R - 0.05),
  bottomShell: plate(F, F, 0.3, R, 0.02),
  bottomWell: plate(F - 0.26, F - 0.26, 0.2, R - 0.12, 0),
  opticsBase: plate(F - 0.22, F - 0.22, 0.05, R - 0.08),
  opticsGlass: plate(F - 0.62, F - 0.62, 0.022, R - 0.18, 0),
  combinerBase: plate(F - 0.34, F - 0.34, 0.035, R - 0.12),
  displayBoard: plate(F - 0.44, F - 0.44, 0.03, R - 0.16),
  board: plate(F - 0.2, F - 0.2, 0.034, R - 0.08),
  boardThin: plate(F - 0.1, F - 0.1, 0.026, R - 0.04),
  spreader: plate(F - 0.24, F - 0.24, 0.022, R - 0.1),
  frameRing: frame(F - 0.06, F - 0.06, 0.12, 0.26, R - 0.02),
  pad: new THREE.PlaneGeometry(1, 1),
  slab: new THREE.BoxGeometry(1, 1, 1),
  cyl: new THREE.CylinderGeometry(1, 1, 1, 36),
  cylLow: new THREE.CylinderGeometry(1, 1, 1, 20),

  dome: new THREE.SphereGeometry(1, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2),
  sphere: new THREE.SphereGeometry(1, 20, 14),
  markRing: new THREE.TorusGeometry(0.155, 0.023, 10, 48),
};

/** Torus geometries, cached by their actual radius and tube. */
const RINGS = new Map<string, THREE.TorusGeometry>();
function ringGeometry(r: number, tube: number) {
  const key = `${r}|${tube}`;
  let geometry = RINGS.get(key);
  if (!geometry) {
    geometry = new THREE.TorusGeometry(r, tube, 10, 44);
    RINGS.set(key, geometry);
  }
  return geometry;
}

/** A retaining or trim ring, lying flat on the assembly axis. */
function Ring({ mat, r, tube, y }: { mat: THREE.Material; r: number; tube: number; y: number }) {
  return (
    <mesh
      geometry={ringGeometry(r, tube)}
      material={mat}
      position={[0, y, 0]}
      rotation={[Math.PI / 2, 0, 0]}
    />
  );
}

/** Texture plane sitting just proud of a board face. */
function Art({ y, size, map }: { y: number; size: number; map: THREE.Material }) {
  return (
    <mesh
      geometry={G.pad}
      material={map}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, y, 0]}
      scale={[size, size, 1]}
    />
  );
}

type Triple = [number, number, number];
const NO_ROTATION: Triple = [0, 0, 0];

function Box({
  mat,
  position,
  scale,
  rotation = NO_ROTATION,
}: {
  mat: THREE.Material;
  position: Triple;
  scale: Triple;
  rotation?: Triple;
}) {
  return (
    <mesh geometry={G.slab} material={mat} position={position} scale={scale} rotation={rotation} />
  );
}

function Cyl({
  mat,
  position,
  r,
  h,
  rotation = NO_ROTATION,
  low = false,
}: {
  mat: THREE.Material;
  position: Triple;
  r: number;
  h: number;
  rotation?: Triple;
  low?: boolean;
}) {
  return (
    <mesh
      geometry={low ? G.cylLow : G.cyl}
      material={mat}
      position={position}
      rotation={rotation}
      scale={[r, h, r]}
    />
  );
}

/** Evenly spaced row of identical children along x. */
/** Evenly spaced offsets along one axis. */
function row(count: number, span: number): number[] {
  return Array.from({ length: count }, (_, i) => -span / 2 + (span / (count - 1)) * i);
}

export function PartGeometry({ id, m }: { id: PartId; m: Materials }) {
  const chipRows = useMemo(() => row(5, 1.9), []);
  const fins = useMemo(() => row(13, 2.5), []);
  const vents = useMemo(() => row(6, 1.5), []);

  switch (id) {
    case "top":
      return (
        <group>
          <mesh geometry={G.topShell} material={m.shell} castShadow receiveShadow />
          <mesh geometry={G.topLip} material={m.shellInner} position={[0, -0.17, 0]} />
          {/* Illuminated mark: two interlocking rings, inlaid in the cover. */}
          {[-0.142, 0.142].map((x) => (
            <mesh
              key={x}
              geometry={G.markRing}
              material={m.mark}
              position={[x, 0.152, 0]}
              rotation={[Math.PI / 2, 0, 0]}
            />
          ))}
          <Box mat={m.cyan} position={[0, 0.152, F / 2 - 0.3]} scale={[0.3, 0.004, 0.035]} />
          {/* USB-C pass-through notch on the flank. */}
          <Box mat={m.darkMetal} position={[F / 2 - 0.02, -0.06, 0]} scale={[0.07, 0.1, 0.42]} />
          {/* Machined parting line. */}
          <Box mat={m.darkMetal} position={[0, -0.148, 0]} scale={[F - 0.3, 0.006, F - 0.3]} />
        </group>
      );

    case "optics":
      return (
        <group>
          <mesh geometry={G.opticsBase} material={m.darkMetal} />
          <mesh geometry={G.opticsGlass} material={m.glass} position={[0, 0.046, 0]} />
          {/* Output lens stack. */}
          <Cyl mat={m.lens} position={[0, 0.03, 0]} r={0.34} h={0.03} />
          <Cyl mat={m.lens} position={[0, 0.056, 0]} r={0.26} h={0.028} />
          <Cyl mat={m.lens} position={[0, 0.078, 0]} r={0.17} h={0.024} />
          {/* Barrel and kinematic mounts. */}
          <Ring mat={m.aluminium} r={0.37} tube={0.016} y={0.034} />
          <Ring mat={m.aluminium} r={0.29} tube={0.014} y={0.062} />
          {[0, 1, 2].map((i) => {
            const a = (i / 3) * Math.PI * 2 + 0.4;
            return (
              <Cyl
                key={i}
                low
                mat={m.aluminium}
                position={[Math.cos(a) * 1.15, 0.02, Math.sin(a) * 1.15]}
                r={0.07}
                h={0.09}
              />
            );
          })}
          {/* Light guides out to the enclosure edge. */}
          {[0, 1, 2, 3].map((i) => {
            const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
            return (
              <Box
                key={i}
                mat={m.lens}
                position={[Math.cos(a) * 0.78, 0.016, Math.sin(a) * 0.78]}
                scale={[0.62, 0.012, 0.07]}
                rotation={[0, -a, 0]}
              />
            );
          })}
        </group>
      );

    case "combiner":
      return (
        <group>
          <mesh geometry={G.combinerBase} material={m.darkMetal} />
          {/* Combining element and its glow. */}
          <Cyl mat={m.glass} position={[0, 0.03, 0]} r={0.44} h={0.05} />
          <Ring mat={m.violet} r={0.33} tube={0.035} y={0.03} />
          <Cyl mat={m.cyan} position={[0, 0.034, 0]} r={0.2} h={0.012} />
          {/* 45° fold, the element that turns the path upward. */}
          <Box
            mat={m.lens}
            position={[0.52, 0.035, 0]}
            scale={[0.36, 0.012, 0.36]}
            rotation={[0, 0, Math.PI / 4]}
          />
          <Box
            mat={m.lens}
            position={[-0.52, 0.035, 0]}
            scale={[0.36, 0.012, 0.36]}
            rotation={[0, 0, -Math.PI / 4]}
          />
          {/* Trim actuators. */}
          {[-1, 1].map((s) => (
            <Box
              key={s}
              mat={m.aluminium}
              position={[0, 0.012, s * 1.05]}
              scale={[0.5, 0.05, 0.1]}
            />
          ))}
        </group>
      );

    case "display":
      return (
        <group>
          <mesh geometry={G.displayBoard} material={m.chip} />
          <Art y={0.018} size={1.3} map={m.displayPanel} />
          {/* Bezel. */}
          {(
            [
              [0, 0.68],
              [0, -0.68],
            ] as Array<[number, number]>
          ).map(([x, z], i) => (
            <Box
              key={`h${i}`}
              mat={m.aluminium}
              position={[x, 0.016, z]}
              scale={[1.46, 0.016, 0.1]}
            />
          ))}
          {[-0.68, 0.68].map((x, i) => (
            <Box
              key={`v${i}`}
              mat={m.aluminium}
              position={[x, 0.016, 0]}
              scale={[0.1, 0.016, 1.46]}
            />
          ))}
          {/* Driver and flex tail. */}
          <Box mat={m.chip} position={[0, -0.022, -1.1]} scale={[0.6, 0.03, 0.18]} />
          <Box mat={m.copper} position={[0, -0.03, -1.32]} scale={[0.52, 0.008, 0.3]} />
        </group>
      );

    case "sensors":
      return (
        <group>
          <mesh geometry={G.board} material={m.chip} />
          <Art y={0.019} size={F - 0.26} map={m.boards.sensors} />
          {/* Depth pair plus a flood emitter. */}
          {[-0.62, 0.62].map((x, i) => (
            <group key={i} position={[x, 0.02, 0.35]}>
              <Cyl low mat={m.darkMetal} position={[0, 0.03, 0]} r={0.19} h={0.06} />
              <mesh
                geometry={G.dome}
                material={m.lens}
                position={[0, 0.058, 0]}
                scale={[0.16, 0.08, 0.16]}
              />
            </group>
          ))}
          <group position={[0, 0.02, -0.5]}>
            <Cyl low mat={m.darkMetal} position={[0, 0.028, 0]} r={0.14} h={0.055} />
            <Cyl mat={m.blue} position={[0, 0.058, 0]} r={0.09} h={0.01} />
          </group>
          {chipRows.slice(1, 4).map((x, i) => (
            <Box key={i} mat={m.chip} position={[x, 0.032, -1.1]} scale={[0.28, 0.045, 0.22]} />
          ))}
          <Box mat={m.copper} position={[-1.3, 0.028, 0]} scale={[0.1, 0.035, 0.6]} />
        </group>
      );

    case "camera":
      return (
        <group>
          <mesh geometry={G.board} material={m.chip} />
          <Art y={0.019} size={F - 0.26} map={m.boards.camera} />
          {/* Stereo pair plus the wide tracking camera. */}
          {(
            [
              [-0.7, 0.24],
              [0.7, 0.24],
            ] as Array<[number, number]>
          ).map(([x, r], i) => (
            <group key={i} position={[x, 0.02, 0.2]}>
              <Cyl mat={m.darkMetal} position={[0, 0.05, 0]} r={r} h={0.1} />
              <Ring mat={m.aluminium} r={r + 0.01} tube={0.016} y={0.09} />
              <Cyl mat={m.lens} position={[0, 0.101, 0]} r={r - 0.07} h={0.012} />
              <Cyl mat={m.blue} position={[0, 0.104, 0]} r={r - 0.14} h={0.008} />
            </group>
          ))}
          <group position={[0, 0.02, -0.72]}>
            <Cyl mat={m.darkMetal} position={[0, 0.045, 0]} r={0.3} h={0.09} />
            <Ring mat={m.aluminium} r={0.31} tube={0.018} y={0.082} />
            <Cyl mat={m.lens} position={[0, 0.094, 0]} r={0.21} h={0.014} />
          </group>
          <Box mat={m.chip} position={[0, 0.034, 0.95]} scale={[0.9, 0.05, 0.3]} />
          <Box mat={m.copper} position={[1.3, 0.028, -0.3]} scale={[0.1, 0.035, 0.5]} />
        </group>
      );

    case "processor":
      return (
        <group>
          <mesh geometry={G.board} material={m.chip} />
          <Art y={0.019} size={F - 0.26} map={m.boards.processor} />
          {/* Main package: substrate, die, integrated heat spreader. */}
          <Box mat={m.chip} position={[0, 0.04, 0]} scale={[1.16, 0.045, 1.16]} />
          <Box mat={m.die} position={[0, 0.07, 0]} scale={[0.88, 0.022, 0.88]} />
          <Box mat={m.aluminium} position={[0, 0.085, 0]} scale={[1.02, 0.018, 1.02]} />
          <Box mat={m.cyan} position={[0, 0.076, 0]} scale={[1.05, 0.004, 1.05]} />
          {/* On-package memory. */}
          {[-1, 1].map((s) => (
            <Box key={s} mat={m.chip} position={[s * 1.0, 0.04, 0]} scale={[0.3, 0.05, 0.78]} />
          ))}
          {/* Discretes. */}
          {chipRows.map((x, i) => (
            <Box
              key={i}
              mat={m.darkMetal}
              position={[x * 0.72, 0.03, -1.12]}
              scale={[0.12, 0.026, 0.1]}
            />
          ))}
          <Box mat={m.copper} position={[0, 0.028, 1.18]} scale={[1.2, 0.035, 0.12]} />
        </group>
      );

    case "thermal":
      return (
        <group>
          <mesh geometry={G.spreader} material={m.copper} />
          {/* Interface pad over the processor package. */}
          <Box mat={m.rubber} position={[0, -0.02, 0]} scale={[1.1, 0.016, 1.1]} />
          {/* Passive fin stack. */}
          {fins.map((x, i) => (
            <Box key={i} mat={m.aluminium} position={[x, 0.045, 0]} scale={[0.045, 0.07, 2.5]} />
          ))}
          {/* Spreader frame. */}
          {[-1, 1].map((s) => (
            <Box key={s} mat={m.copper} position={[s * 1.35, 0.03, 0]} scale={[0.08, 0.05, 2.6]} />
          ))}
        </group>
      );

    case "power":
      return (
        <group>
          <mesh geometry={G.board} material={m.chip} />
          <Art y={0.019} size={F - 0.26} map={m.boards.power} />
          {/* Bulk capacitors. */}
          {[-0.9, -0.38, 0.14].map((x, i) => (
            <group key={i} position={[x, 0.02, 0.6]}>
              <Cyl low mat={m.darkMetal} position={[0, 0.06, 0]} r={0.16} h={0.12} />
              <Cyl low mat={m.copper} position={[0, 0.122, 0]} r={0.16} h={0.008} />
            </group>
          ))}
          {/* Inductor and regulation. */}
          <Box mat={m.darkMetal} position={[0.85, 0.055, 0.55]} scale={[0.36, 0.11, 0.36]} />
          <Box mat={m.copper} position={[0.85, 0.112, 0.55]} scale={[0.38, 0.012, 0.2]} />
          <Box mat={m.chip} position={[-0.5, 0.035, -0.55]} scale={[0.62, 0.05, 0.42]} />
          {/* USB-C receptacle at the flank. */}
          <group position={[1.42, 0.03, -0.45]}>
            <Box mat={m.aluminium} position={[0, 0, 0]} scale={[0.3, 0.085, 0.46]} />
            <Box mat={m.darkMetal} position={[0.14, 0, 0]} scale={[0.06, 0.05, 0.34]} />
            <Box mat={m.copper} position={[0.14, 0, 0]} scale={[0.07, 0.016, 0.26]} />
          </group>
          <Box mat={m.cyan} position={[-1.3, 0.024, -1.05]} scale={[0.12, 0.006, 0.12]} />
        </group>
      );

    case "mainpcb":
      return (
        <group>
          <mesh geometry={G.boardThin} material={m.chip} />
          <Art y={0.015} size={F - 0.16} map={m.boards.mainpcb} />
          {/* Board-to-board connectors the stack lands on. */}
          {(
            [
              [-0.95, 0.85],
              [0.95, 0.85],
              [-0.95, -0.85],
              [0.95, -0.85],
            ] as Array<[number, number]>
          ).map(([x, z], i) => (
            <group key={i} position={[x, 0.016, z]}>
              <Box mat={m.darkMetal} position={[0, 0.026, 0]} scale={[0.62, 0.052, 0.17]} />
              <Box mat={m.copper} position={[0, 0.054, 0]} scale={[0.56, 0.008, 0.11]} />
            </group>
          ))}
          {/* Edge contacts. */}
          {row(9, 1.5).map((x, i) => (
            <Box key={i} mat={m.copper} position={[x, 0.015, 1.58]} scale={[0.09, 0.008, 0.2]} />
          ))}
          <Box mat={m.chip} position={[0, 0.03, 0]} scale={[0.5, 0.03, 0.5]} />
        </group>
      );

    case "frame":
      return (
        <group>
          <mesh geometry={G.frameRing} material={m.aluminium} />
          {/* Cross ribs carrying the optical datum. */}
          <Box mat={m.aluminium} position={[0, 0, 0]} scale={[F - 0.56, 0.05, 0.16]} />
          <Box mat={m.aluminium} position={[0, 0, 0]} scale={[0.16, 0.05, F - 0.56]} />
          {/* Mounting bosses. */}
          {(
            [
              [-1.3, -1.3],
              [1.3, -1.3],
              [-1.3, 1.3],
              [1.3, 1.3],
              [0, -1.45],
              [0, 1.45],
            ] as Array<[number, number]>
          ).map(([x, z], i) => (
            <group key={i} position={[x, 0, z]}>
              <Cyl low mat={m.aluminium} position={[0, 0, 0]} r={0.11} h={0.14} />
              <Cyl low mat={m.darkMetal} position={[0, 0.03, 0]} r={0.05} h={0.1} />
            </group>
          ))}
        </group>
      );

    case "bottom":
      return (
        <group>
          <mesh geometry={G.bottomShell} material={m.shell} castShadow receiveShadow />
          <mesh geometry={G.bottomWell} material={m.shellInner} position={[0, 0.07, 0]} />
          {/* Side ventilation, both flanks. */}
          {vents.map((z, i) => (
            <group key={i}>
              <Box
                mat={m.shellInner}
                position={[F / 2 - 0.012, 0.02, z]}
                scale={[0.05, 0.035, 0.14]}
              />
              <Box
                mat={m.shellInner}
                position={[-F / 2 + 0.012, 0.02, z]}
                scale={[0.05, 0.035, 0.14]}
              />
            </group>
          ))}
          {/* USB-C cutout and the port behind it. */}
          <Box mat={m.shellInner} position={[F / 2 - 0.01, 0.05, -0.45]} scale={[0.06, 0.1, 0.5]} />
          <Box
            mat={m.darkMetal}
            position={[F / 2 - 0.08, 0.05, -0.45]}
            scale={[0.12, 0.075, 0.42]}
          />
          {/* Status light visible at the base edge. */}
          <Box mat={m.cyan} position={[F / 2 - 0.012, -0.06, 0.95]} scale={[0.02, 0.028, 0.3]} />
          {/* Anti-slip face. */}
          <Box mat={m.rubber} position={[0, -0.152, 0]} scale={[F - 0.5, 0.012, F - 0.5]} />
          {(
            [
              [-1.3, -1.3],
              [1.3, -1.3],
              [-1.3, 1.3],
              [1.3, 1.3],
            ] as Array<[number, number]>
          ).map(([x, z], i) => (
            <Cyl key={i} low mat={m.rubber} position={[x, -0.156, z]} r={0.14} h={0.018} />
          ))}
        </group>
      );

    default:
      return null;
  }
}

/**
 * One group with its own materials, dimmed by `focus`.
 *
 * The scroll sequence renders the stack through this: it owns no per-frame
 * material state of its own, so a single scalar is the whole interface. The
 * explorer takes the lower-level `PartGeometry` instead, because it animates
 * focus, X-ray and the optical isolation independently.
 */
export function FocusedPart({ id, focus }: { id: PartId; focus: number }) {
  const materials = useMemo(() => createMaterials(), []);

  // Base colours are captured once; every focus change is applied to those
  // rather than to the previous result, so dimming never compounds.
  const base = useMemo(() => {
    const entries = new Map<THREE.Material, THREE.Color>();
    Object.values(materials).forEach((value) => {
      const candidates =
        value && typeof value === "object" && !("isMaterial" in value)
          ? Object.values(value as Record<string, unknown>)
          : [value];
      candidates.forEach((candidate) => {
        const material = candidate as THREE.MeshStandardMaterial;
        if (!material || typeof material !== "object" || !material.isMaterial) return;
        if (material.color) entries.set(material, material.color.clone());
      });
    });
    return entries;
  }, [materials]);

  useEffect(() => {
    const scale = 0.24 + 0.76 * focus;
    base.forEach((colour, material) => {
      (material as THREE.MeshStandardMaterial).color.copy(colour).multiplyScalar(scale);
    });
  }, [base, focus]);

  return <PartGeometry id={id} m={materials} />;
}
