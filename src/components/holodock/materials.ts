import * as THREE from "three";

export const HEX = {
  /* The logo gradient endpoints, as the rest of the site uses them. */
  blue: 0x1677ff,
  cyan: 0x32c5ff,
  violet: 0x6425f5,
} as const;

/** Deterministic noise so a board's traces are the same on every reload. */
function rng(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0xffffffff;
  };
}

function canvas(size: number) {
  const element = document.createElement("canvas");
  element.width = size;
  element.height = size;
  return { element, ctx: element.getContext("2d")! };
}

function finish(element: HTMLCanvasElement, aniso = 8) {
  const texture = new THREE.CanvasTexture(element);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = aniso;
  texture.needsUpdate = true;
  return texture;
}

/**
 * A printed board, drawn rather than modelled: traces, pads, silkscreen and
 * a soldermask. Geometry for this many traces would cost far more than a
 * texture does, and at the distances the camera reaches it reads the same.
 */
export function pcbTexture(seed: number, substrate = "#0a1a1c", trace = "#1f7a6b") {
  const SIZE = 512;
  const { element, ctx } = canvas(SIZE);
  const random = rng(seed);

  ctx.fillStyle = substrate;
  ctx.fillRect(0, 0, SIZE, SIZE);

  // Soldermask mottling.
  for (let i = 0; i < 1600; i += 1) {
    ctx.fillStyle = `rgba(255,255,255,${random() * 0.025})`;
    ctx.fillRect(random() * SIZE, random() * SIZE, 2, 2);
  }

  // Routed traces: orthogonal runs with 45° corners, the way a router lays them.
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (let i = 0; i < 46; i += 1) {
    ctx.strokeStyle = trace;
    ctx.globalAlpha = 0.35 + random() * 0.45;
    ctx.lineWidth = random() < 0.2 ? 4 : 1.8;
    ctx.beginPath();
    let x = Math.round((random() * SIZE) / 8) * 8;
    let y = Math.round((random() * SIZE) / 8) * 8;
    ctx.moveTo(x, y);
    const segments = 3 + Math.floor(random() * 5);
    for (let s = 0; s < segments; s += 1) {
      const run = 24 + random() * 90;
      if (random() < 0.5) x += random() < 0.5 ? run : -run;
      else y += random() < 0.5 ? run : -run;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Via field.
  for (let i = 0; i < 90; i += 1) {
    const x = random() * SIZE;
    const y = random() * SIZE;
    ctx.fillStyle = "#c8a24a";
    ctx.beginPath();
    ctx.arc(x, y, 2.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = substrate;
    ctx.beginPath();
    ctx.arc(x, y, 1.1, 0, Math.PI * 2);
    ctx.fill();
  }

  // Component footprints — pad pairs and QFN rings.
  for (let i = 0; i < 16; i += 1) {
    const x = 30 + random() * (SIZE - 90);
    const y = 30 + random() * (SIZE - 90);
    const w = 14 + random() * 44;
    const h = 10 + random() * 26;
    ctx.fillStyle = "#cfa94f";
    ctx.fillRect(x, y, 6, h);
    ctx.fillRect(x + w, y, 6, h);
    ctx.strokeStyle = "rgba(226,233,245,0.22)";
    ctx.lineWidth = 1;
    ctx.strokeRect(x - 3, y - 4, w + 12, h + 8);
  }

  // Silkscreen reference designators.
  ctx.fillStyle = "rgba(226,233,245,0.3)";
  ctx.font = "11px ui-monospace, monospace";
  for (let i = 0; i < 22; i += 1) {
    const tag = ["U", "R", "C", "L", "J", "Q"][Math.floor(random() * 6)];
    ctx.fillText(
      `${tag}${Math.floor(random() * 90) + 10}`,
      random() * (SIZE - 30),
      random() * SIZE,
    );
  }

  return finish(element);
}

/** Micro-OLED emission — a pixel lattice with a soft centre bloom. */
export function displayTexture() {
  const SIZE = 512;
  const { element, ctx } = canvas(SIZE);

  const glow = ctx.createRadialGradient(SIZE / 2, SIZE / 2, 20, SIZE / 2, SIZE / 2, SIZE / 1.7);
  glow.addColorStop(0, "#dff1ff");
  glow.addColorStop(0.35, "#5ab9ff");
  glow.addColorStop(0.75, "#1b5fcc");
  glow.addColorStop(1, "#050a18");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, SIZE, SIZE);

  // Subpixel lattice.
  ctx.globalCompositeOperation = "multiply";
  const pitch = 8;
  for (let y = 0; y < SIZE; y += pitch) {
    for (let x = 0; x < SIZE; x += pitch) {
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.fillRect(x + pitch - 2, y, 2, pitch);
      ctx.fillRect(x, y + pitch - 2, pitch, 2);
    }
  }
  ctx.globalCompositeOperation = "source-over";

  return finish(element, 4);
}

/** Brushed anodising — fine directional grain on the covers. */
export function brushTexture() {
  const SIZE = 512;
  const { element, ctx } = canvas(SIZE);
  ctx.fillStyle = "#d8d8d8";
  ctx.fillRect(0, 0, SIZE, SIZE);
  const random = rng(99);
  for (let i = 0; i < 9000; i += 1) {
    const y = random() * SIZE;
    const shade = 196 + random() * 46;
    ctx.strokeStyle = `rgba(${shade},${shade},${shade},0.5)`;
    ctx.lineWidth = random() * 1.4;
    ctx.beginPath();
    ctx.moveTo(random() * SIZE, y);
    ctx.lineTo(random() * SIZE, y + (random() - 0.5) * 2);
    ctx.stroke();
  }
  const texture = new THREE.CanvasTexture(element);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 3);
  texture.anisotropy = 8;
  return texture;
}

export type Materials = ReturnType<typeof createMaterials>;

/**
 * Textures are shared; materials are not.
 *
 * Every group gets its own material instances so that dimming one while a
 * neighbour is selected, or fading the covers for X-ray, never bleeds across
 * the stack. Materials are cheap objects — the canvases behind them are not,
 * so those are built once and handed to all twelve.
 */
type TextureSet = {
  grain: THREE.Texture;
  display: THREE.Texture;
  boards: Record<"sensors" | "camera" | "processor" | "power" | "mainpcb", THREE.Texture>;
};

let textureCache: TextureSet | null = null;

function textures(): TextureSet {
  if (textureCache) return textureCache;
  textureCache = {
    grain: brushTexture(),
    display: displayTexture(),
    boards: {
      sensors: pcbTexture(11, "#0a1a1c", "#1f7a6b"),
      camera: pcbTexture(23, "#0c1620", "#1d6f87"),
      processor: pcbTexture(37, "#0b1420", "#2a5f9e"),
      power: pcbTexture(53, "#141019", "#8a6a2e"),
      mainpcb: pcbTexture(71, "#07151a", "#2e8f7a"),
    },
  };
  return textureCache;
}

export function createMaterials() {
  const tex = textures();
  const roughnessGrain = tex.grain;

  // Bead-blasted anodising, not a mirror: high roughness and a restrained
  // environment contribution, or twelve dark layers all read as chrome.
  const shell = new THREE.MeshStandardMaterial({
    color: 0x0f1319,
    metalness: 0.78,
    roughness: 0.62,
    roughnessMap: roughnessGrain,
    envMapIntensity: 0.55,
  });

  const shellInner = new THREE.MeshStandardMaterial({
    color: 0x0a0d12,
    metalness: 0.7,
    roughness: 0.72,
    side: THREE.DoubleSide,
  });

  const aluminium = new THREE.MeshStandardMaterial({
    color: 0x5d6572,
    metalness: 0.9,
    roughness: 0.45,
    envMapIntensity: 0.7,
  });

  const darkMetal = new THREE.MeshStandardMaterial({
    color: 0x2a3038,
    metalness: 0.9,
    roughness: 0.38,
  });

  const copper = new THREE.MeshStandardMaterial({
    color: 0x8a5a24,
    metalness: 0.92,
    roughness: 0.42,
  });

  const chip = new THREE.MeshStandardMaterial({
    color: 0x14181e,
    metalness: 0.42,
    roughness: 0.58,
  });

  const die = new THREE.MeshStandardMaterial({
    color: 0x1b2a46,
    metalness: 0.6,
    roughness: 0.25,
    emissive: new THREE.Color(HEX.blue),
    emissiveIntensity: 0.35,
  });

  const rubber = new THREE.MeshStandardMaterial({
    color: 0x070a0e,
    metalness: 0.02,
    roughness: 0.95,
  });

  const glass = new THREE.MeshPhysicalMaterial({
    color: 0xcfe9ff,
    metalness: 0,
    roughness: 0.06,
    transparent: true,
    opacity: 0.15,
    transmission: 0,
    envMapIntensity: 1.1,
    side: THREE.DoubleSide,
  });

  const lens = new THREE.MeshPhysicalMaterial({
    color: 0x9ed4ff,
    metalness: 0.1,
    roughness: 0.04,
    transparent: true,
    opacity: 0.32,
    envMapIntensity: 1.5,
    side: THREE.DoubleSide,
  });

  const emissive = (hex: number, intensity = 2.4) =>
    new THREE.MeshStandardMaterial({
      color: 0x000000,
      emissive: new THREE.Color(hex),
      emissiveIntensity: intensity,
      roughness: 1,
      metalness: 0,
      toneMapped: false,
    });

  const beam = (hex: number, opacity = 0.3) =>
    new THREE.MeshBasicMaterial({
      color: new THREE.Color(hex),
      transparent: true,
      opacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
      toneMapped: false,
    });

  const markMaterial = new THREE.MeshStandardMaterial({
    color: 0x0b1018,
    emissive: new THREE.Color(0xcfe9ff),
    emissiveIntensity: 1.15,
    metalness: 0.4,
    roughness: 0.3,
    toneMapped: false,
  });

  const displayPanel = new THREE.MeshStandardMaterial({
    color: 0x000000,
    emissive: 0xffffff,
    emissiveIntensity: 1.5,
    emissiveMap: tex.display,
    roughness: 1,
    metalness: 0,
    toneMapped: false,
  });

  const boards = {
    sensors: new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: tex.boards.sensors,
      metalness: 0.28,
      roughness: 0.66,
    }),
    camera: new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: tex.boards.camera,
      metalness: 0.28,
      roughness: 0.66,
    }),
    processor: new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: tex.boards.processor,
      metalness: 0.28,
      roughness: 0.64,
    }),
    power: new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: tex.boards.power,
      metalness: 0.28,
      roughness: 0.68,
    }),
    mainpcb: new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: tex.boards.mainpcb,
      metalness: 0.3,
      roughness: 0.62,
    }),
  };

  return {
    shell,
    shellInner,
    aluminium,
    darkMetal,
    copper,
    chip,
    die,
    rubber,
    glass,
    lens,
    emissive,
    beam,
    mark: markMaterial,
    displayPanel,
    boards,
    cyan: emissive(HEX.cyan),
    violet: emissive(HEX.violet),
    blue: emissive(HEX.blue),
  };
}
