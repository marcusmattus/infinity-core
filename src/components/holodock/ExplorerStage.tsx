import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { Assembly } from "./Assembly";
import { OpticalPath } from "./OpticalPath";
import { SpatialScene } from "./SpatialScene";
import { CalloutProjector } from "./Callouts";
import { HEX } from "./materials";
import { partIndex } from "@/lib/holodock-parts";
import {
  goalToPosition,
  offsetAt,
  type CameraGoal,
  POLAR_MAX,
  POLAR_MIN,
  RADIUS_MAX,
  RADIUS_MIN,
  useView,
} from "./explorer-store";

/**
 * Machined metal needs something to reflect. Three's generated room costs one
 * render at mount — no HDR to fetch, nothing to host — and it is what makes the
 * aluminium read as aluminium rather than as a flat dark shape.
 */
function StudioEnvironment() {
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);

  useEffect(() => {
    const generator = new THREE.PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const target = generator.fromScene(room, 0.04);
    scene.environment = target.texture;
    scene.environmentIntensity = 0.32;
    return () => {
      scene.environment = null;
      target.dispose();
      room.dispose();
      generator.dispose();
    };
  }, [gl, scene]);

  return null;
}

function shadowTexture() {
  const SIZE = 256;
  const element = document.createElement("canvas");
  element.width = SIZE;
  element.height = SIZE;
  const ctx = element.getContext("2d")!;
  const gradient = ctx.createRadialGradient(SIZE / 2, SIZE / 2, 4, SIZE / 2, SIZE / 2, SIZE / 2);
  gradient.addColorStop(0, "rgba(0,0,0,0.72)");
  gradient.addColorStop(0.45, "rgba(0,0,0,0.3)");
  gradient.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, SIZE, SIZE);
  return new THREE.CanvasTexture(element);
}

function GroundShadow() {
  const { anim } = useView();
  const mesh = useRef<THREE.Mesh>(null);
  const map = useMemo(shadowTexture, []);

  useFrame(() => {
    const node = mesh.current;
    if (!node) return;
    const material = node.material as THREE.MeshBasicMaterial;
    // The shadow loosens as the stack opens — nothing is sitting on the surface.
    material.opacity = 0.75 - anim.current.explode * 0.45 - anim.current.spatial * 0.2;
    node.scale.setScalar(7 + anim.current.explode * 4);
  });

  return (
    <mesh ref={mesh} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.02, 0]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={map} transparent depthWrite={false} opacity={0.75} />
    </mesh>
  );
}

/**
 * Drives the animated scalars every part reads, and the camera.
 *
 * Explosion, X-ray, optical and spatial are each a single number damped toward
 * a target. Everything downstream interpolates off them, which is what makes
 * every transition reversible mid-flight rather than only at its endpoints.
 */
function Rig() {
  const { state, camera, anim } = useView();
  const position = useMemo(() => new THREE.Vector3(), []);
  const FRAMED = useMemo<CameraGoal>(
    () => ({ azimuth: 0, polar: 0, radius: 0, target: new THREE.Vector3() }),
    [],
  );
  const look = useMemo(() => new THREE.Vector3(), []);

  useFrame((frame, delta) => {
    const dt = Math.min(delta, 0.08);
    const a = anim.current;
    const snap = state.reducedMotion ? 60 : 4.5;

    const wantsExplode =
      state.mode === "spatial" ? 0 : state.exploded || state.mode === "optical" ? 1 : 0;
    a.explode = THREE.MathUtils.damp(a.explode, wantsExplode, snap, dt);
    a.xray = THREE.MathUtils.damp(a.xray, state.xray ? 1 : 0, snap + 1, dt);
    a.optical = THREE.MathUtils.damp(a.optical, state.mode === "optical" ? 1 : 0, snap + 1, dt);
    a.spatial = THREE.MathUtils.damp(a.spatial, state.mode === "spatial" ? 1 : 0, snap + 1, dt);

    const goal = camera.current;

    // A selected part keeps the camera on it while it is still travelling.
    if (state.selected && state.mode === "explore") {
      const index = partIndex(state.selected);
      goal.target.y = THREE.MathUtils.damp(goal.target.y, offsetAt(index).y, 6, dt);
    }

    if (state.autoRotate && !state.selected && !state.reducedMotion && state.mode !== "spatial") {
      goal.azimuth += dt * 0.08;
    }

    // The stack is three times taller apart than together, so the framing has
    // to open with it — otherwise exploding walks the ends out of the viewport.
    const spread = state.selected ? 0 : a.explode * 0.62;
    FRAMED.azimuth = goal.azimuth;
    FRAMED.polar = goal.polar;
    FRAMED.radius = goal.radius * (1 + spread);
    FRAMED.target.copy(goal.target);
    goalToPosition(FRAMED, position);
    const camera3 = frame.camera;
    const rate = state.reducedMotion ? 60 : 3.4;
    camera3.position.x = THREE.MathUtils.damp(camera3.position.x, position.x, rate, dt);
    camera3.position.y = THREE.MathUtils.damp(camera3.position.y, position.y, rate, dt);
    camera3.position.z = THREE.MathUtils.damp(camera3.position.z, position.z, rate, dt);

    look.x = THREE.MathUtils.damp(look.x, goal.target.x, rate, dt);
    look.y = THREE.MathUtils.damp(look.y, goal.target.y, rate, dt);
    look.z = THREE.MathUtils.damp(look.z, goal.target.z, rate, dt);
    camera3.lookAt(look);
  });

  return null;
}

/** Internal lighting that comes up with the stack. */
function InternalGlow() {
  const { anim } = useView();
  const light = useRef<THREE.PointLight>(null);

  useFrame(() => {
    if (!light.current) return;
    light.current.intensity = 1.4 + anim.current.explode * 3.2 + anim.current.optical * 4;
  });

  return (
    <pointLight
      ref={light}
      position={[0, 0.2, 0]}
      color={HEX.cyan}
      intensity={1.4}
      distance={5.5}
    />
  );
}

export type StageProps = { maxDpr: number };

export default function Stage({ maxDpr }: StageProps) {
  const { camera, select } = useView();
  const host = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: number; x: number; y: number } | null>(null);
  const pinch = useRef<number | null>(null);
  const moved = useRef(0);

  // Pointer control writes the same camera goal presets do, so a drag part-way
  // through a preset transition simply redirects it.
  useEffect(() => {
    const node = host.current;
    if (!node) return;

    const points = new Map<number, { x: number; y: number }>();

    const down = (event: PointerEvent) => {
      points.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (points.size === 1) {
        drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
        moved.current = 0;
      }
      node.setPointerCapture(event.pointerId);
    };

    const move = (event: PointerEvent) => {
      if (!points.has(event.pointerId)) return;
      points.set(event.pointerId, { x: event.clientX, y: event.clientY });

      if (points.size >= 2) {
        const [a, b] = [...points.values()];
        if (!a || !b) return;
        const distance = Math.hypot(a.x - b.x, a.y - b.y);
        if (pinch.current !== null) {
          const scale = pinch.current / distance;
          camera.current.radius = THREE.MathUtils.clamp(
            camera.current.radius * scale,
            RADIUS_MIN,
            RADIUS_MAX,
          );
        }
        pinch.current = distance;
        return;
      }

      const current = drag.current;
      if (!current || current.id !== event.pointerId) return;
      const dx = event.clientX - current.x;
      const dy = event.clientY - current.y;
      current.x = event.clientX;
      current.y = event.clientY;
      moved.current += Math.abs(dx) + Math.abs(dy);
      camera.current.azimuth -= dx * 0.0062;
      camera.current.polar = THREE.MathUtils.clamp(
        camera.current.polar - dy * 0.0062,
        POLAR_MIN,
        POLAR_MAX,
      );
    };

    const up = (event: PointerEvent) => {
      points.delete(event.pointerId);
      if (points.size < 2) pinch.current = null;
      if (drag.current?.id === event.pointerId) drag.current = null;
      if (node.hasPointerCapture(event.pointerId)) node.releasePointerCapture(event.pointerId);
    };

    const wheel = (event: WheelEvent) => {
      event.preventDefault();
      camera.current.radius = THREE.MathUtils.clamp(
        camera.current.radius * (1 + Math.sign(event.deltaY) * 0.09),
        RADIUS_MIN,
        RADIUS_MAX,
      );
    };

    node.addEventListener("pointerdown", down);
    node.addEventListener("pointermove", move);
    node.addEventListener("pointerup", up);
    node.addEventListener("pointercancel", up);
    node.addEventListener("wheel", wheel, { passive: false });
    return () => {
      node.removeEventListener("pointerdown", down);
      node.removeEventListener("pointermove", move);
      node.removeEventListener("pointerup", up);
      node.removeEventListener("pointercancel", up);
      node.removeEventListener("wheel", wheel);
    };
  }, [camera]);

  return (
    <div ref={host} className="absolute inset-0 touch-none" style={{ cursor: "grab" }}>
      <Canvas
        dpr={[1, maxDpr]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        camera={{ fov: 34, position: [6, 4, 10] }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.0;
        }}
        onPointerMissed={() => {
          // A drag that ends on empty space should not clear the selection.
          if (moved.current < 6) select(null);
        }}
      >
        <StudioEnvironment />

        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 9, 5]} intensity={2.2} color="#f2f6ff" />
        <directionalLight position={[-6, 4, 6]} intensity={1.2} color="#dde6f7" />
        <directionalLight position={[0, -6, -4]} intensity={0.5} color="#8ab4ff" />
        <pointLight position={[-6, 3, 5]} intensity={7} color={HEX.blue} distance={26} />
        <pointLight position={[4.5, -2.5, -4]} intensity={6} color={HEX.violet} distance={20} />
        <InternalGlow />

        <Assembly />
        <OpticalPath />
        <SpatialScene />
        <GroundShadow />
        <CalloutProjector />

        <Rig />
      </Canvas>
    </div>
  );
}
