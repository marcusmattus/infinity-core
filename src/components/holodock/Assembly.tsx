import { useEffect, useMemo, useRef } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { PARTS, partOffset, type Part, type PartId } from "@/lib/holodock-parts";
import { createMaterials, HEX } from "./materials";
import { PartGeometry } from "./geometry";
import { offsetAt, useView } from "./explorer-store";

/**
 * `?solo=optics,combiner` renders a subset — the fastest way to find a part
 * whose geometry is wrong once twelve of them are stacked together.
 */
const SOLO =
  typeof window === "undefined" ? null : new URLSearchParams(window.location.search).get("solo");

/** Covers and chassis — the groups X-ray makes transparent. */
const SHELL_PARTS = new Set<PartId>(["top", "bottom", "frame"]);
/** The optical chain, isolated in the light-path visualisation. */
const OPTICAL_PARTS = new Set<PartId>(["optics", "combiner", "display"]);

type Tracked = {
  material: THREE.Material & {
    opacity: number;
    transparent: boolean;
    color?: THREE.Color;
    emissiveIntensity?: number;
  };
  opacity: number;
  color: THREE.Color | null;
  emissive: number;
};

function PartGroup({
  part,
  index,
  onPick,
}: {
  part: Part;
  index: number;
  onPick: (id: PartId) => void;
}) {
  const { state, anim } = useView();
  const group = useRef<THREE.Group>(null);
  const outline = useRef<THREE.LineSegments>(null);
  const tracked = useRef<Tracked[]>([]);
  const focus = useRef(1);
  const fade = useRef(1);
  const glow = useRef(0);

  // Each group owns its materials, so dimming one never touches another.
  const materials = useMemo(() => createMaterials(), []);
  const offset = useMemo(() => new THREE.Vector3(), []);

  const outlineGeometry = useMemo(() => new THREE.BufferGeometry(), []);

  useEffect(() => {
    const node = group.current;
    if (!node) return;

    const seen = new Set<THREE.Material>();
    const list: Tracked[] = [];
    node.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh) return;
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      mats.forEach((material) => {
        if (!material || seen.has(material)) return;
        seen.add(material);
        const typed = material as Tracked["material"];
        list.push({
          material: typed,
          opacity: typed.opacity,
          color: typed.color ? typed.color.clone() : null,
          emissive: typed.emissiveIntensity ?? 1,
        });
      });
    });
    tracked.current = list;

    // Selection outline, sized from the group's own bounds.
    const box = new THREE.Box3().setFromObject(node);
    const size = new THREE.Vector3();
    const centre = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(centre);
    const edges = new THREE.EdgesGeometry(
      new THREE.BoxGeometry(size.x * 1.06, size.y * 1.5 + 0.06, size.z * 1.06),
    );
    edges.translate(0, centre.y - node.position.y, 0);
    outlineGeometry.copy(edges);
    edges.dispose();

    return () => {
      tracked.current = [];
      list.forEach((entry) => entry.material.dispose());
    };
  }, [outlineGeometry]);

  useFrame((_, delta) => {
    const node = group.current;
    if (!node) return;
    const dt = Math.min(delta, 0.08);
    const view = state;
    const a = anim.current;

    // Position along this group's own explosion vector.
    partOffset(part, a.explode, offset);
    node.position.lerp(offset, 1 - Math.exp(-7 * dt));
    offsetAt(index).copy(node.position);

    // Focus: full brightness when nothing is selected or this is the selection.
    const isSelected = view.selected === part.id;
    const isHovered = view.hovered === part.id;
    const selectionActive = view.selected !== null;
    const opticalActive = a.optical > 0.01;

    let focusTarget = 1;
    if (selectionActive && !isSelected) focusTarget = 0.22;
    if (opticalActive && !OPTICAL_PARTS.has(part.id)) {
      focusTarget = Math.min(focusTarget, 1 - a.optical * 0.82);
    }

    let fadeTarget = 1;
    if (SHELL_PARTS.has(part.id)) fadeTarget = 1 - a.xray * 0.88;
    if (opticalActive && !OPTICAL_PARTS.has(part.id)) {
      fadeTarget = Math.min(fadeTarget, 1 - a.optical * 0.72);
    }

    focus.current = THREE.MathUtils.damp(focus.current, focusTarget, 6, dt);
    fade.current = THREE.MathUtils.damp(fade.current, fadeTarget, 6, dt);
    glow.current = THREE.MathUtils.damp(glow.current, isSelected || isHovered ? 1 : 0, 8, dt);

    const f = focus.current;
    const o = fade.current;
    tracked.current.forEach((entry) => {
      const { material } = entry;
      if (entry.color && material.color) {
        material.color.copy(entry.color).multiplyScalar(0.24 + 0.76 * f);
      }
      if (entry.emissive && material.emissiveIntensity !== undefined) {
        material.emissiveIntensity = entry.emissive * (0.1 + 0.9 * f);
      }
      // Dimmed groups also lose a little opacity: an emissive panel that is
      // merely darkened still competes with the part actually being inspected.
      const opacity = entry.opacity * o * (0.52 + 0.48 * f);
      material.opacity = opacity;
      const needsBlend = opacity < 0.995;
      if (material.transparent !== needsBlend) {
        material.transparent = needsBlend;
        material.needsUpdate = true;
      }
      material.depthWrite = opacity > 0.55;
    });

    if (outline.current) {
      const line = outline.current.material as THREE.LineBasicMaterial;
      line.opacity = glow.current * (view.selected === part.id ? 0.85 : 0.4);
      outline.current.visible = line.opacity > 0.01;
    }
  });

  const stop = (event: ThreeEvent<PointerEvent>) => event.stopPropagation();
  const { set } = useView();

  return (
    <group
      ref={group}
      name={part.mesh}
      position={[0, part.assembled, 0]}
      onPointerOver={(event) => {
        stop(event);
        set({ hovered: part.id });
      }}
      onPointerOut={(event) => {
        stop(event);
        set({ hovered: null });
      }}
      onClick={(event) => {
        event.stopPropagation();
        onPick(part.id);
      }}
    >
      <PartGeometry id={part.id} m={materials} />
      <lineSegments ref={outline} geometry={outlineGeometry} renderOrder={3}>
        <lineBasicMaterial
          color={HEX.cyan}
          transparent
          opacity={0}
          depthTest={false}
          toneMapped={false}
        />
      </lineSegments>
    </group>
  );
}

/**
 * The twelve groups on the assembly axis.
 *
 * Positions are damped toward a target inside the render loop rather than set
 * from React state, so a visitor who hits Assemble halfway through an explosion
 * sees the stack ease back rather than snap — and the animation is reversible
 * at any point by construction, because there is only ever one target.
 */
const VISIBLE_PARTS = SOLO ? PARTS.filter((part) => SOLO.split(",").includes(part.id)) : PARTS;

export function Assembly() {
  const { state, anim, select } = useView();
  const group = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    const node = group.current;
    if (!node) return;
    const dt = Math.min(delta, 0.08);

    // The spatial scene replaces the teardown rather than sitting beside it.
    node.visible = anim.current.spatial < 0.85;

    const spinning = !state.reducedMotion && state.autoRotate && !state.selected;
    if (spinning) node.rotation.y += dt * 0.12 * (1 - anim.current.spatial);
  });

  return (
    <group ref={group}>
      {VISIBLE_PARTS.map((part, index) => (
        <PartGroup key={part.id} part={part} index={index} onPick={select} />
      ))}
    </group>
  );
}
