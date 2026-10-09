import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { HEX } from "./materials";
import { useView } from "./explorer-store";

const clamp01 = (value: number) => (value < 0 ? 0 : value > 1 ? 1 : value);
const ease = (t: number) => t * t * (3 - 2 * t);
/** Stage `i` of the initialisation sequence, as a 0–1 ramp. */
const stage = (seq: number, from: number, to: number) => ease(clamp01((seq - from) / (to - from)));

function screenTexture() {
  const SIZE = 512;
  const element = document.createElement("canvas");
  element.width = SIZE;
  element.height = SIZE;
  const ctx = element.getContext("2d")!;

  ctx.fillStyle = "#04080f";
  ctx.fillRect(0, 0, SIZE, SIZE);

  const glow = ctx.createLinearGradient(0, 0, 0, SIZE);
  glow.addColorStop(0, "rgba(54,139,255,0.35)");
  glow.addColorStop(1, "rgba(139,69,255,0.12)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, SIZE, SIZE);

  ctx.strokeStyle = "rgba(50,197,255,0.45)";
  ctx.lineWidth = 2;
  ctx.strokeRect(36, 60, SIZE - 72, 150);
  ctx.fillStyle = "rgba(223,241,255,0.92)";
  ctx.font = "600 34px ui-sans-serif, system-ui, sans-serif";
  ctx.fillText("SpatialOS", 56, 118);
  ctx.font = "22px ui-monospace, monospace";
  ctx.fillStyle = "rgba(154,166,183,0.9)";
  ctx.fillText("HoloDock connected", 56, 164);

  const rows = ["Anchors  4", "Depth  30 Hz", "Agent  ready", "Session  live"];
  rows.forEach((row, i) => {
    const y = 260 + i * 56;
    ctx.fillStyle = "rgba(255,255,255,0.06)";
    ctx.fillRect(36, y, SIZE - 72, 40);
    ctx.fillStyle = "rgba(50,197,255,0.8)";
    ctx.fillRect(36, y, 5, 40);
    ctx.fillStyle = "rgba(200,214,232,0.75)";
    ctx.font = "20px ui-monospace, monospace";
    ctx.fillText(row, 60, y + 27);
  });

  const texture = new THREE.CanvasTexture(element);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function panelTexture(title: string, lines: string[]) {
  const W = 512;
  const H = 256;
  const element = document.createElement("canvas");
  element.width = W;
  element.height = H;
  const ctx = element.getContext("2d")!;

  ctx.fillStyle = "rgba(8,13,23,0.88)";
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = "rgba(50,197,255,0.5)";
  ctx.lineWidth = 3;
  ctx.strokeRect(2, 2, W - 4, H - 4);
  ctx.fillStyle = "#32C5FF";
  ctx.fillRect(2, 2, 6, H - 4);

  ctx.fillStyle = "#F5F7FB";
  ctx.font = "600 32px ui-sans-serif, system-ui, sans-serif";
  ctx.fillText(title, 32, 62);
  ctx.font = "22px ui-monospace, monospace";
  ctx.fillStyle = "#9AA6B7";
  lines.forEach((line, i) => ctx.fillText(line, 32, 112 + i * 36));

  const texture = new THREE.CanvasTexture(element);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/** Low-poly stand-in for a person in the scene, built from capsules. */
function Figure({ material }: { material: THREE.Material }) {
  const limb = useMemo(() => new THREE.CapsuleGeometry(1, 1, 4, 12), []);
  const head = useMemo(() => new THREE.SphereGeometry(1, 18, 14), []);
  return (
    <group>
      <mesh geometry={head} material={material} position={[0, 1.62, 0]} scale={0.19} />
      <mesh geometry={limb} material={material} position={[0, 1.08, 0]} scale={[0.19, 0.3, 0.13]} />
      {[-1, 1].map((s) => (
        <mesh
          key={`arm${s}`}
          geometry={limb}
          material={material}
          position={[s * 0.3, 1.04, 0]}
          rotation={[0, 0, s * 0.3]}
          scale={[0.07, 0.26, 0.07]}
        />
      ))}
      {[-1, 1].map((s) => (
        <mesh
          key={`leg${s}`}
          geometry={limb}
          material={material}
          position={[s * 0.13, 0.42, 0]}
          scale={[0.085, 0.3, 0.085]}
        />
      ))}
    </group>
  );
}

/**
 * The conceptual spatial experience: dock, paired phone, and what SpatialOS
 * places in the room around them.
 *
 * This is a conceptual representation of the interaction model, not a claim
 * about the optics. A micro display and a lens assembly do not by themselves
 * produce a free-floating volumetric image; what is shown here stands for the
 * spatial session — anchors, depth, gesture, agent — rather than for a
 * validated projection architecture.
 */
export function SpatialScene() {
  const { state, anim } = useView();
  const group = useRef<THREE.Group>(null);
  const phone = useRef<THREE.Group>(null);
  const figure = useRef<THREE.Group>(null);
  const cone = useRef<THREE.Mesh>(null);
  const anchors = useRef<THREE.Group>(null);
  const depth = useRef<THREE.Points>(null);
  const gesture = useRef<THREE.Mesh>(null);
  const panels = useRef<THREE.Group>(null);
  const seq = useRef(0);

  const assets = useMemo(() => {
    const body = new THREE.MeshStandardMaterial({
      color: 0x0d1016,
      metalness: 0.85,
      roughness: 0.4,
    });
    const screen = new THREE.MeshStandardMaterial({
      color: 0x000000,
      emissive: 0xffffff,
      emissiveIntensity: 1.25,
      emissiveMap: screenTexture(),
      toneMapped: false,
      roughness: 1,
      metalness: 0,
    });
    const additive = (hex: number, opacity: number) =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(hex),
        transparent: true,
        opacity,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
        toneMapped: false,
      });

    const panelMaterial = (title: string, lines: string[]) =>
      new THREE.MeshBasicMaterial({
        map: panelTexture(title, lines),
        transparent: true,
        opacity: 0,
        depthWrite: false,
        toneMapped: false,
        side: THREE.DoubleSide,
      });

    // Depth field: a dotted sampling of the surface around the dock.
    const count = 1400;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      const radius = 0.9 + Math.sqrt(Math.random()) * 5.4;
      const angle = Math.random() * Math.PI * 2;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = -0.98 + Math.random() * 0.04;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
    }
    const field = new THREE.BufferGeometry();
    field.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    return {
      body,
      screen,
      projection: additive(HEX.blue, 0),
      projectionEdge: new THREE.MeshBasicMaterial({
        color: new THREE.Color(HEX.cyan),
        wireframe: true,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
      }),
      figureMaterial: additive(HEX.cyan, 0),
      figureEdge: new THREE.MeshBasicMaterial({
        color: new THREE.Color(0xdff1ff),
        wireframe: true,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
      }),
      anchorMaterial: additive(HEX.violet, 0),
      gestureMaterial: additive(HEX.cyan, 0),
      depthMaterial: new THREE.PointsMaterial({
        color: new THREE.Color(HEX.blue),
        size: 0.055,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        toneMapped: false,
      }),
      field,
      panels: [
        panelMaterial("Agent Kernel", ["tool call · resolve", "scene.place(object)"]),
        panelMaterial("Depth", ["0.2 – 4 m", "mesh 30 Hz"]),
      ],
    };
  }, []);

  useFrame((frame, delta) => {
    const node = group.current;
    if (!node) return;
    const dt = Math.min(delta, 0.08);
    const active = anim.current.spatial;
    node.visible = active > 0.01;
    if (!node.visible) {
      seq.current = 0;
      return;
    }

    // Initialisation sequence, once, on entering the scene.
    seq.current = Math.min(seq.current + dt / (state.reducedMotion ? 0.4 : 4.4), 1);
    const s = seq.current;
    const time = frame.clock.elapsedTime;

    const arrive = stage(s, 0, 0.18);
    const connect = stage(s, 0.14, 0.32);
    const boot = stage(s, 0.3, 0.46);
    const depthUp = stage(s, 0.42, 0.6);
    const anchorUp = stage(s, 0.56, 0.74);
    const figureUp = stage(s, 0.7, 0.9);
    const interact = stage(s, 0.86, 1);

    if (phone.current) {
      phone.current.rotation.y = (1 - arrive) * -1.1;
      phone.current.position.x = 2.1 + (1 - arrive) * 2.2;
      phone.current.position.y = -0.9 + (1 - connect) * 0.5;
    }

    assets.screen.emissiveIntensity = 1.3 * boot * active;

    if (cone.current) {
      const material = cone.current.material as THREE.MeshBasicMaterial;
      material.opacity = 0.11 * boot * active * (0.85 + Math.sin(time * 1.4) * 0.15);
      assets.projectionEdge.opacity = 0.2 * boot * active;
      cone.current.visible = material.opacity > 0.005;
    }

    assets.depthMaterial.opacity =
      (state.layers.depth ? 0.8 : 0) * depthUp * active * (0.72 + Math.sin(time * 2) * 0.28);
    if (depth.current) depth.current.visible = assets.depthMaterial.opacity > 0.005;

    if (anchors.current) {
      const target = (state.layers.anchors ? 0.9 : 0) * anchorUp * active;
      assets.anchorMaterial.opacity = target;
      anchors.current.visible = target > 0.005;
      anchors.current.children.forEach((child, i) => {
        child.position.y = -0.92 + Math.sin(time * 1.6 + i) * 0.04;
      });
    }

    assets.figureMaterial.opacity = 0.26 * figureUp * active;
    assets.figureEdge.opacity = 0.22 * figureUp * active;
    if (figure.current) {
      figure.current.visible = assets.figureMaterial.opacity > 0.005;
      figure.current.rotation.y = Math.sin(time * 0.35) * 0.4;
      figure.current.position.y = -0.92 + Math.sin(time * 0.9) * 0.03;
      figure.current.scale.setScalar((0.85 + figureUp * 0.15) * 1.35);
    }

    if (gesture.current) {
      const target = (state.layers.gesture ? 0.6 : 0) * interact * active;
      assets.gestureMaterial.opacity = target * (0.4 + Math.abs(Math.sin(time * 1.8)) * 0.6);
      gesture.current.visible = target > 0.005;
      const pulse = 1 + ((time * 0.6) % 1) * 0.9;
      gesture.current.scale.set(pulse, pulse, pulse);
    }

    if (panels.current) {
      const target =
        (state.layers.hud ? 1 : 0) * (state.layers.agent ? 1 : 0.4) * interact * active;
      panels.current.visible = target > 0.01;
      assets.panels.forEach((material, i) => {
        material.opacity = target * 0.92;
        const child = panels.current!.children[i];
        if (child) child.position.y = 0.55 + i * 0.75 + Math.sin(time * 0.8 + i) * 0.04;
      });
    }
  });

  return (
    <group ref={group} position={[0, 0, 0]}>
      {/* The dock, simplified — the teardown above is the detailed one. */}
      <group position={[-1.6, -0.86, 0.4]}>
        <mesh material={assets.body} castShadow>
          <boxGeometry args={[1.5, 0.34, 1.5]} />
        </mesh>
        <mesh material={assets.projection} position={[0, 0.18, 0]}>
          <circleGeometry args={[0.42, 32]} />
        </mesh>
        <mesh position={[0, 0.175, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.3, 0.42, 36]} />
          <meshBasicMaterial color={HEX.cyan} transparent opacity={0.8} toneMapped={false} />
        </mesh>
      </group>

      {/* Paired phone. */}
      <group ref={phone} position={[2.1, -0.9, 0.9]} rotation={[0, -1.1, 0]}>
        <mesh material={assets.body} rotation={[-Math.PI / 2, 0, 0]} castShadow>
          <boxGeometry args={[1.5, 3.1, 0.16]} />
        </mesh>
        <mesh material={assets.screen} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.09, 0]}>
          <planeGeometry args={[1.32, 2.9]} />
        </mesh>
      </group>

      {/* USB-C link between the two. */}
      <mesh material={assets.body} position={[0.2, -0.95, 0.65]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.035, 0.035, 2.1, 10]} />
      </mesh>

      {/* Projection volume above the dock — narrow at the aperture, opening up. */}
      <mesh
        ref={cone}
        position={[-1.6, 0.52, 0.4]}
        rotation={[Math.PI, Math.PI / 4, 0]}
        material={assets.projection}
      >
        <coneGeometry args={[1.35, 2.9, 4, 1, true]} />
      </mesh>
      <mesh
        position={[-1.6, 0.52, 0.4]}
        rotation={[Math.PI, Math.PI / 4, 0]}
        material={assets.projectionEdge}
      >
        <coneGeometry args={[1.35, 2.9, 4, 1, true]} />
      </mesh>

      {/* Depth sampling of the surrounding surface. */}
      <points ref={depth} geometry={assets.field} material={assets.depthMaterial} />

      {/* Spatial anchors. */}
      <group ref={anchors}>
        {[
          [-3.4, 1.6],
          [2.6, -2.1],
          [-0.6, 3.1],
          [3.3, 1.9],
        ].map(([x, z], i) => (
          <group key={i} position={[x ?? 0, -0.92, z ?? 0]}>
            <mesh material={assets.anchorMaterial} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.16, 0.22, 24]} />
            </mesh>
            <mesh material={assets.anchorMaterial} position={[0, 0.22, 0]}>
              <octahedronGeometry args={[0.1, 0]} />
            </mesh>
          </group>
        ))}
      </group>

      {/* The virtual figure standing in the projection. */}
      <group ref={figure} position={[-1.6, -0.92, 0.4]}>
        <Figure material={assets.figureMaterial} />
        <Figure material={assets.figureEdge} />
      </group>

      {/* Gesture recognition ripple. */}
      <mesh
        ref={gesture}
        position={[-0.25, -0.35, 1.5]}
        rotation={[-Math.PI / 2.6, 0, 0]}
        material={assets.gestureMaterial}
      >
        <torusGeometry args={[0.3, 0.012, 8, 36]} />
      </mesh>

      {/* SpatialOS surfaces floating beside the session. */}
      <group ref={panels} position={[1.4, 0.2, -1.9]} rotation={[0, -0.5, 0]}>
        {assets.panels.map((material, i) => (
          <mesh key={i} material={material} position={[0, 0.55 + i * 0.75, 0]}>
            <planeGeometry args={[1.5, 0.75]} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
