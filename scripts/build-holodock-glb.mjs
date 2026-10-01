/**
 * Builds `public/models/holodock.glb` — the ten-layer HoloDock model the device
 * explorer at `/holodock` renders.
 *
 * The model is generated, not hand-sculpted, so it stays reproducible and
 * reviewable in a diff: run `npm run model:build` after changing anything here.
 * A CAD export can replace the output wholesale — the only contract the page
 * depends on is the ten node names.
 *
 * Conventions:
 * - `src/lib/holodock-parts.ts` is the single source of truth for the layer
 *   names and their assembled heights; this script imports it directly, so the
 *   model and the page can never drift apart.
 * - Y is the assembly axis. Each layer is authored at its assembled height, so
 *   the file opens as a closed device in any glTF viewer; the page zeroes that
 *   transform and drives the layer groups itself.
 * - Layers sit 0.08 apart when closed, and every internal layer keeps its
 *   features within +0.065 / -0.03 of its own origin, so nothing pokes through
 *   the layer above it or through the covers.
 * - No textures. Materials are PBR metal/rough with non-black base colours, so
 *   the explorer's focus dimming — which multiplies base colour — has something
 *   to work with.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { mergeGeometries, mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { HOLODOCK_PARTS } from "../src/lib/holodock-parts.ts";

// The exporter reads its binary chunk back through FileReader, which Node has
// no equivalent of. Blob.arrayBuffer() covers everything it actually uses.
if (typeof globalThis.FileReader === "undefined") {
  globalThis.FileReader = class {
    readAsArrayBuffer(blob) {
      blob
        .arrayBuffer()
        .then((buffer) => {
          this.result = buffer;
          this.onloadend?.();
        })
        .catch((error) => this.onerror?.(error));
    }
  };
}

const W = 3.2;
const D = 2.4;
const COVER = 0.14;

const HEIGHT = Object.fromEntries(HOLODOCK_PARTS.map((part) => [part.mesh, part.assembled]));

/* --------------------------------------------------------------- materials */

const surface = (color, metalness, roughness) =>
  new THREE.MeshStandardMaterial({ color, metalness, roughness });

const lit = (color, emissive, metalness = 0.2, roughness = 0.25) =>
  new THREE.MeshStandardMaterial({ color, emissive, metalness, roughness });

/** Keyed so merged meshes can be named `<Layer>_<material>`. */
const M = {
  shell: surface(0x2a3140, 0.78, 0.32),
  metal: surface(0x646e80, 0.9, 0.22),
  board: surface(0x1e2634, 0.4, 0.55),
  chip: surface(0x171d29, 0.55, 0.3),
  copper: surface(0xb06f3e, 0.88, 0.26),
  pad: surface(0x12161e, 0.2, 0.9),
  glass: Object.assign(surface(0x3d7ad8, 0.1, 0.06), { transparent: true, opacity: 0.6 }),
  emblem: lit(0x7aa6ff, 0x1d63d6, 0.4, 0.22),
  indicator: lit(0x9fc4ff, 0x2f86ff),
  panel: lit(0x9cc6ff, 0x2f86ff),
  die: lit(0x8fb7ff, 0x1d63d6),
  sensorLens: lit(0x6f9dff, 0x1d63d6),
};

for (const [id, material] of Object.entries(M)) {
  material.name = id;
  material.userData.id = id;
}

/* ----------------------------------------------------------------- helpers */

function mesh(name, geometry, material, position = [0, 0, 0], rotation = [0, 0, 0], scale) {
  const node = new THREE.Mesh(geometry, material);
  node.name = name;
  node.position.set(...position);
  node.rotation.set(...rotation);
  if (scale) node.scale.set(...scale);
  return node;
}

const box = (name, size, material, position, rotation) =>
  mesh(name, new THREE.BoxGeometry(...size), material, position, rotation);

const rounded = (name, size, radius, material, position) =>
  mesh(name, new RoundedBoxGeometry(...size, 2, radius), material, position);

const cylinder = (name, top, bottom, height, material, position, segments = 24) =>
  mesh(name, new THREE.CylinderGeometry(top, bottom, height, segments), material, position);

const ring = (name, radius, tube, material, position) =>
  mesh(name, new THREE.TorusGeometry(radius, tube, 6, 32), material, position, [Math.PI / 2, 0, 0]);

/** A flattened dome — a sensor window sitting proud of its board. */
const window_ = (name, radius, material, position) =>
  mesh(name, new THREE.SphereGeometry(radius, 16, 10), material, position, [0, 0, 0], [1, 0.45, 1]);

/** The carrier board every electronics layer is built on. */
const carrier = (thickness = 0.045) => box("Board", [W - 0.28, thickness, D - 0.28], M.board);

/**
 * The wall a cover carries toward the mid-plane. The lid is a cap with a skirt,
 * the base a shallow tray; together they close the body and hide the internals,
 * and apart they read as the two halves of a machined enclosure.
 */
function wall(height, centre, material = M.shell) {
  const group = new THREE.Group();
  group.name = "Wall";
  const t = 0.06;
  group.add(
    box("WallLeft", [t, height, D - 0.02], material, [-(W / 2 - t / 2), centre, 0]),
    box("WallRight", [t, height, D - 0.02], material, [W / 2 - t / 2, centre, 0]),
    box("WallFront", [W - t * 2, height, t], material, [0, centre, D / 2 - t / 2]),
    box("WallBack", [W - t * 2, height, t], material, [0, centre, -(D / 2 - t / 2)]),
  );
  return group;
}

/** Four corner bosses, so the covers read as fastened rather than floating. */
function bosses(y) {
  const group = new THREE.Group();
  group.name = "Bosses";
  for (const x of [-1, 1]) {
    for (const z of [-1, 1]) {
      group.add(
        cylinder(
          `Boss${x > 0 ? "X" : "x"}${z > 0 ? "Z" : "z"}`,
          0.07,
          0.07,
          0.05,
          M.metal,
          [x * (W / 2 - 0.26), y, z * (D / 2 - 0.26)],
          12,
        ),
      );
    }
  }
  return group;
}

function layer(name, children) {
  const group = new THREE.Group();
  group.name = name;
  if (HEIGHT[name] === undefined) throw new Error(`No assembled height for ${name}`);
  group.position.y = HEIGHT[name];
  for (const child of children) group.add(child);
  return group;
}

/* ----------------------------------------------------------- the ten layers */

/** 01 — machined lid, the infinity emblem, the touch button and indicator. */
const topCover = () =>
  layer("TopCover", [
    rounded("Shell", [W, COVER, D], 0.05, M.shell),
    ring("EmblemLeft", 0.19, 0.026, M.emblem, [-0.19, 0.075, 0]),
    ring("EmblemRight", 0.19, 0.026, M.emblem, [0.19, 0.075, 0]),
    cylinder("TouchButton", 0.17, 0.17, 0.016, M.metal, [0, 0.072, -0.72]),
    box("Indicator", [0.6, 0.02, 0.04], M.indicator, [0, 0.05, D / 2 - 0.14]),
    wall(0.4, -0.27),
    bosses(-0.075),
  ]);

/** 02 — the optical engine: barrel, front element, retaining ring. */
const projectionOptics = () =>
  layer("ProjectionOptics", [
    cylinder("Barrel", 0.58, 0.62, 0.09, M.metal, [0, 0, 0]),
    cylinder("FrontElement", 0.44, 0.44, 0.05, M.glass, [0, 0.03, 0]),
    ring("RetainingRing", 0.7, 0.018, M.metal, [0, 0.012, 0]),
    box("MountLeft", [0.3, 0.05, 0.3], M.metal, [-1.15, 0, 0]),
    box("MountRight", [0.3, 0.05, 0.3], M.metal, [1.15, 0, 0]),
    box("Flex", [0.16, 0.02, 0.85], M.board, [0, -0.02, 0.78]),
  ]);

/** 03 — the folded path and the frame that holds it at angle. */
const beamCombiner = () =>
  layer("BeamCombiner", [
    box("Combiner", [1.35, 0.02, 0.95], M.glass, [0, 0.01, 0], [-0.11, 0, 0]),
    ring("Aperture", 0.8, 0.018, M.sensorLens, [0, 0, 0]),
    box("Frame", [W - 0.5, 0.03, D - 0.5], M.shell, [0, -0.035, 0]),
    box("BraceLeft", [0.06, 0.09, 0.06], M.metal, [-0.88, 0.005, -0.62]),
    box("BraceRight", [0.06, 0.09, 0.06], M.metal, [0.88, 0.005, -0.62]),
  ]);

/** 04 — the micro-OLED panel and its bezel. */
const microDisplay = () =>
  layer("MicroDisplay", [
    carrier(),
    box("Bezel", [1.5, 0.03, 1.05], M.chip, [0, 0.035, 0]),
    box("Panel", [1.34, 0.012, 0.9], M.panel, [0, 0.052, 0]),
    box("Driver", [0.44, 0.03, 0.28], M.chip, [-1.1, 0.035, 0.66]),
  ]);

/** 05 — LiDAR windows and the depth emitter bar. */
const spatialSensors = () =>
  layer("SpatialSensors", [
    carrier(0.05),
    window_("LidarLeft", 0.09, M.chip, [-0.62, 0.025, -0.35]),
    window_("LidarRight", 0.09, M.chip, [0.62, 0.025, -0.35]),
    box("EmitterBar", [1.1, 0.045, 0.3], M.chip, [0, 0.045, 0.45]),
    cylinder("EmitterA", 0.045, 0.045, 0.05, M.sensorLens, [-0.3, 0.05, 0.45], 12),
    cylinder("EmitterB", 0.045, 0.045, 0.05, M.sensorLens, [0, 0.05, 0.45], 12),
    cylinder("EmitterC", 0.045, 0.045, 0.05, M.sensorLens, [0.3, 0.05, 0.45], 12),
  ]);

/** 06 — the stereo pair for SLAM and hand tracking. */
function trackingCamera() {
  const children = [carrier(0.05), box("ISP", [0.66, 0.035, 0.28], M.chip, [0, 0.04, 0.5])];
  for (const x of [-0.5, 0.5]) {
    const side = x < 0 ? "Left" : "Right";
    children.push(
      cylinder(`Barrel${side}`, 0.2, 0.22, 0.05, M.chip, [x, 0.04, -0.2]),
      cylinder(`Lens${side}`, 0.12, 0.12, 0.012, M.sensorLens, [x, 0.062, -0.2]),
    );
  }
  return layer("TrackingCamera", children);
}

/** 07 — the NPU package, its die, and the memory around it. */
function agentProcessor() {
  const children = [
    carrier(0.05),
    box("Package", [1.05, 0.05, 0.95], M.chip, [0, 0.04, 0]),
    box("Die", [0.82, 0.012, 0.72], M.die, [0, 0.062, 0]),
  ];
  for (const x of [-1.05, 1.05]) {
    for (const z of [-0.6, 0.6]) {
      children.push(
        box(`Memory${x < 0 ? "L" : "R"}${z < 0 ? "F" : "B"}`, [0.26, 0.035, 0.26], M.chip, [
          x,
          0.04,
          z,
        ]),
      );
    }
  }
  return layer("AgentProcessor", children);
}

/** 08 — graphene spreader under a passive fin stack. */
function thermalSystem() {
  const children = [box("Spreader", [W - 0.34, 0.035, D - 0.34], M.copper)];
  for (const z of [-0.9, -0.6, -0.3, 0, 0.3, 0.6, 0.9]) {
    children.push(box(`Fin${z}`, [W - 0.7, 0.05, 0.05], M.metal, [0, 0.04, z]));
  }
  return layer("ThermalSystem", children);
}

/** 09 — the cells, the delivery board, and the USB-C receptacle. */
const powerSystem = () =>
  layer("PowerSystem", [
    carrier(0.05),
    rounded("CellLeft", [1.1, 0.055, 1.5], 0.02, M.chip, [-0.62, 0.045, 0]),
    rounded("CellRight", [1.1, 0.055, 1.5], 0.02, M.chip, [0.62, 0.045, 0]),
    box("Receptacle", [0.5, 0.05, 0.26], M.metal, [0, 0.02, D / 2 - 0.2]),
    box("Controller", [0.28, 0.03, 0.28], M.chip, [0, 0.035, -0.85]),
  ]);

/** 10 — structural base, anti-slip face, port cut-out and vents. */
function bottomCover() {
  const children = [
    rounded("Shell", [W, COVER, D], 0.05, M.shell),
    box("AntiSlip", [W - 0.5, 0.02, D - 0.5], M.pad, [0, -0.072, 0]),
    box("PortCutout", [0.54, 0.09, 0.08], M.pad, [0, 0, D / 2 - 0.02]),
    wall(0.42, 0.28),
    bosses(0.075),
  ];
  for (let i = 0; i < 6; i += 1) {
    children.push(box(`Vent${i}`, [0.05, 0.015, 0.45], M.pad, [-0.5 + i * 0.2, -0.078, -0.55]));
  }
  return layer("BottomCover", children);
}

/* ------------------------------------------------------------------ flatten */

/**
 * Collapses a layer to one mesh per material: fewer draw calls at runtime, and
 * a much smaller file, since every geometry ends up indexed and stripped of the
 * UVs an untextured model has no use for.
 */
function flatten(group) {
  group.updateMatrixWorld(true);
  const inverse = group.matrixWorld.clone().invert();
  const byMaterial = new Map();

  group.traverse((node) => {
    if (!node.isMesh) return;
    const source = node.geometry.clone();
    const geometry = mergeVertices(source.getIndex() ? source.toNonIndexed() : source);
    geometry.deleteAttribute("uv");
    geometry.deleteAttribute("uv1");
    geometry.applyMatrix4(inverse.clone().multiply(node.matrixWorld));
    const bucket = byMaterial.get(node.material) ?? [];
    bucket.push(geometry);
    byMaterial.set(node.material, bucket);
  });

  const flattened = new THREE.Group();
  flattened.name = group.name;
  flattened.position.copy(group.position);

  for (const [material, geometries] of byMaterial) {
    const merged = mergeGeometries(geometries, false);
    if (!merged) throw new Error(`Could not merge ${group.name} / ${material.name}`);
    const node = new THREE.Mesh(merged, material);
    node.name = `${group.name}_${material.userData.id}`;
    flattened.add(node);
  }

  return flattened;
}

/* ------------------------------------------------------------------- export */

const BUILDERS = {
  TopCover: topCover,
  ProjectionOptics: projectionOptics,
  BeamCombiner: beamCombiner,
  MicroDisplay: microDisplay,
  SpatialSensors: spatialSensors,
  TrackingCamera: trackingCamera,
  AgentProcessor: agentProcessor,
  ThermalSystem: thermalSystem,
  PowerSystem: powerSystem,
  BottomCover: bottomCover,
};

const scene = new THREE.Scene();
scene.name = "HoloDock";

// Built in the order the parts file declares, so a layer can never be missed.
for (const part of HOLODOCK_PARTS) {
  const build = BUILDERS[part.mesh];
  if (!build) throw new Error(`No geometry for ${part.mesh}`);
  scene.add(flatten(build()));
}

const glb = await new GLTFExporter().parseAsync(scene, { binary: true, onlyVisible: false });

const here = dirname(fileURLToPath(import.meta.url));
const target = resolve(here, "../public/models/holodock.glb");
mkdirSync(dirname(target), { recursive: true });
writeFileSync(target, Buffer.from(glb));

const bounds = new THREE.Box3().setFromObject(scene);
let meshes = 0;
let triangles = 0;
scene.traverse((node) => {
  if (!node.isMesh) return;
  meshes += 1;
  triangles += node.geometry.getIndex().count / 3;
});

console.log(
  [
    `holodock.glb   ${(glb.byteLength / 1024).toFixed(1)} kB`,
    `layers         ${scene.children.length} (${scene.children.map((c) => c.name).join(", ")})`,
    `meshes         ${meshes}`,
    `triangles      ${Math.round(triangles)}`,
    `closed size    ${(bounds.max.x - bounds.min.x).toFixed(2)} × ` +
      `${(bounds.max.y - bounds.min.y).toFixed(2)} × ${(bounds.max.z - bounds.min.z).toFixed(2)}`,
  ].join("\n"),
);
