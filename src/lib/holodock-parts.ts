import * as THREE from "three";

/**
 * The twelve addressable groups of the HoloDock, top of the stack to bottom.
 *
 * This supersedes the earlier ten-layer breakdown: the board stack now
 * separates the Main PCB from the modules that land on it, and the Internal
 * Frame that holds optical alignment is its own group rather than being
 * folded into the covers.
 *
 * The two reference breakdowns disagree about how the board stack divides; this
 * is the normalised master assembly. `mesh` is the name each group carries in
 * the model, so a CAD export can replace the procedural geometry without
 * touching anything downstream.
 *
 * `assembled` and `exploded` are distances along `axis` in scene units. Every
 * group travels along its own vector and nothing else — the explosion is a
 * mechanical separation, not a scatter, and it reverses exactly.
 */
export type PartId =
  | "top"
  | "optics"
  | "combiner"
  | "display"
  | "sensors"
  | "camera"
  | "processor"
  | "thermal"
  | "power"
  | "mainpcb"
  | "frame"
  | "bottom";

export type SystemId =
  "enclosure" | "optical" | "imaging" | "sensing" | "compute" | "thermal" | "power";

export type Part = {
  id: PartId;
  mesh: string;
  number: string;
  name: string;
  short: string;
  system: SystemId;
  description: string;
  /** Role inside the overall architecture, one line. */
  role: string;
  capabilities: string[];
  /** Provisional design assumptions — not verified manufacturing specs. */
  specs: Array<[string, string]>;
  /** Neighbours it mounts or couples to, by id. */
  couples: PartId[];
  assembled: number;
  exploded: number;
  /** Unit explosion vector. */
  axis: [number, number, number];
};

export const SYSTEMS: Record<SystemId, { label: string; tint: string }> = {
  enclosure: { label: "Enclosure", tint: "#9AA6B7" },
  optical: { label: "Optical engine", tint: "#32C5FF" },
  imaging: { label: "Imaging", tint: "#8B45FF" },
  sensing: { label: "Spatial sensing", tint: "#368BFF" },
  compute: { label: "Compute", tint: "#8B45FF" },
  thermal: { label: "Thermal", tint: "#FF9B4A" },
  power: { label: "Power", tint: "#4ADE9B" },
};

const STACK: Array<[PartId, number]> = [
  ["top", 0.52],
  ["optics", 0.3],
  ["combiner", 0.18],
  ["display", 0.07],
  ["sensors", -0.04],
  ["camera", -0.16],
  ["processor", -0.28],
  ["thermal", -0.39],
  ["power", -0.5],
  ["mainpcb", -0.61],
  ["frame", -0.73],
  ["bottom", -0.93],
];

/** Evenly spaced exploded configuration, top of the stack first. */
const EXPLODED_TOP = 3.45;
const EXPLODED_STEP = 0.63;

const assembledOf = (id: PartId) => STACK.find(([key]) => key === id)![1];
const explodedOf = (id: PartId) =>
  EXPLODED_TOP - STACK.findIndex(([key]) => key === id) * EXPLODED_STEP;

type PartSeed = Omit<Part, "assembled" | "exploded" | "axis"> & {
  axis?: [number, number, number];
};

const seed = (part: PartSeed): Part => ({
  ...part,
  assembled: assembledOf(part.id),
  exploded: explodedOf(part.id),
  axis: part.axis ?? [0, 1, 0],
});

export const PARTS: Part[] = [
  seed({
    id: "top",
    mesh: "TopCover",
    number: "01",
    name: "Top Cover",
    short: "Protective shell",
    system: "enclosure",
    description:
      "Machined aluminium enclosure over the optical and electronic stack. It carries the illuminated InfinityID mark, the status indicator and the optical window, and nothing else — no data, no logic.",
    role: "Mechanical ground for the upper stack and the only surface a user touches.",
    capabilities: ["Anodised aluminium", "Illuminated mark", "Optical window"],
    specs: [
      ["Finish", "Matte anodised, bead-blasted"],
      ["Corner radius", "6 mm (provisional)"],
      ["Window", "Sapphire, AR-coated (provisional)"],
    ],
    couples: ["optics", "frame"],
  }),
  seed({
    id: "optics",
    mesh: "ProjectionOptics",
    number: "02",
    name: "Projection Optics",
    short: "Precision optics",
    system: "optical",
    description:
      "Multi-element output assembly — lens stack, mounts and light guides. It conditions light arriving from the combiner and holds calibration against the dock's own thermal drift.",
    role: "Final optical stage before light leaves the enclosure.",
    capabilities: ["Focus stack", "Light guides", "Thermal calibration"],
    specs: [
      ["Elements", "4 (provisional)"],
      ["Mount", "Kinematic, 3-point"],
      ["Coating", "Broadband AR (target)"],
    ],
    couples: ["top", "combiner"],
  }),
  seed({
    id: "combiner",
    mesh: "BeamCombiner",
    number: "03",
    name: "Beam Combiner",
    short: "Light manipulation",
    system: "optical",
    description:
      "Folds the illumination and image paths into one and steers the result up into the output optics. This is the stage that sets where the projected image appears to sit.",
    role: "Combines and redirects the optical paths between display and output.",
    capabilities: ["Path combination", "Beam steering", "Fold geometry"],
    specs: [
      ["Type", "Dichroic fold (illustrative)"],
      ["Steering", "2-axis trim"],
      ["Clear aperture", "11 mm (provisional)"],
    ],
    couples: ["optics", "display"],
  }),
  seed({
    id: "display",
    mesh: "MicroDisplay",
    number: "04",
    name: "Micro Display",
    short: "OLED display",
    system: "imaging",
    description:
      "High-brightness micro-OLED module, the primary image source. Every frame SpatialOS composes on the phone lands here before it becomes light in the room.",
    role: "Image origin for the whole optical chain.",
    capabilities: ["Micro-OLED", "High brightness", "60 fps"],
    specs: [
      ["Panel", "Micro-OLED (provisional)"],
      ["Refresh", "60 fps target"],
      ["Interface", "MIPI DSI"],
    ],
    couples: ["combiner", "sensors"],
  }),
  seed({
    id: "sensors",
    mesh: "SpatialSensors",
    number: "05",
    name: "Spatial Sensors",
    short: "Depth sensing",
    system: "sensing",
    description:
      "Depth and environmental sensing module. It meshes the surfaces and objects around the dock so that spatial anchors hold where they were placed.",
    role: "Builds the environment model the scene is anchored to.",
    capabilities: ["Depth sensing", "Environment mesh", "Ambient light"],
    specs: [
      ["Range", "0.2–4 m (target)"],
      ["Mesh rate", "30 Hz (target)"],
      ["Aperture count", "3"],
    ],
    couples: ["display", "camera"],
  }),
  seed({
    id: "camera",
    mesh: "TrackingCamera",
    number: "06",
    name: "Tracking Camera",
    short: "SLAM vision",
    system: "sensing",
    description:
      "Stereo camera array for SLAM, hand tracking and interaction detection. It is what lets a gesture in the air resolve to a target in the scene.",
    role: "Visual pose and interaction input for the agent runtime.",
    capabilities: ["Stereo RGB", "SLAM", "Hand tracking"],
    specs: [
      ["Field of view", "120° (target)"],
      ["Cameras", "2 + 1 wide"],
      ["Sync", "Hardware-triggered"],
    ],
    couples: ["sensors", "processor"],
  }),
  seed({
    id: "processor",
    mesh: "AgentProcessor",
    number: "07",
    name: "Agent Processor",
    short: "AI orchestration",
    system: "compute",
    description:
      "Embedded compute module running local inference and the device half of the Agent Kernel, so a tool call does not have to round-trip to the cloud to move something in the room.",
    role: "On-device coordination between sensing, display and the paired phone.",
    capabilities: ["On-module NPU", "Local inference", "Agent Kernel"],
    specs: [
      ["Accelerator", "Integrated NPU (provisional)"],
      ["Memory", "On-package LPDDR"],
      ["Link", "USB-C to host"],
    ],
    couples: ["camera", "thermal", "mainpcb"],
  }),
  seed({
    id: "thermal",
    mesh: "ThermalSystem",
    number: "08",
    name: "Thermal System",
    short: "Heat management",
    system: "thermal",
    description:
      "Graphene spreader, thermal interface and passive fin stack. Optical calibration drifts with temperature, so holding the thermal envelope is what keeps a long session sharp.",
    role: "Moves heat from the processor and display to the enclosure walls.",
    capabilities: ["Graphene spreader", "Passive fins", "Interface pads"],
    specs: [
      ["Spreader", "Graphene laminate"],
      ["Cooling", "Passive (no fan)"],
      ["Target envelope", "Sustained session"],
    ],
    couples: ["processor", "power"],
  }),
  seed({
    id: "power",
    mesh: "PowerSystem",
    number: "09",
    name: "Power System",
    short: "Power + USB-C",
    system: "power",
    description:
      "USB-C power-delivery negotiation and internal regulation, with an optional cell for untethered bursts. One cable carries power and data in both directions.",
    role: "Negotiates input power and feeds every rail in the stack.",
    capabilities: ["USB-C PD", "Rail regulation", "Optional cell"],
    specs: [
      ["Input", "USB-C PD (provisional)"],
      ["Rails", "5 regulated"],
      ["Cell", "Optional, burst only"],
    ],
    couples: ["thermal", "mainpcb", "bottom"],
  }),
  seed({
    id: "mainpcb",
    mesh: "MainPCB",
    number: "10",
    name: "Main PCB",
    short: "System board",
    system: "compute",
    description:
      "Multi-layer board carrying the interconnect between every module — processor, sensing, display and power — plus the board-to-board connectors the stack plugs into.",
    role: "The electrical backbone every other module lands on.",
    capabilities: ["Multi-layer", "Board-to-board", "Power distribution"],
    specs: [
      ["Layers", "10 (provisional)"],
      ["Connectors", "4 board-to-board"],
      ["Controlled impedance", "Yes"],
    ],
    couples: ["power", "processor", "frame"],
  }),
  seed({
    id: "frame",
    mesh: "InternalFrame",
    number: "11",
    name: "Internal Frame",
    short: "Alignment chassis",
    system: "enclosure",
    description:
      "Machined chassis that sets alignment between the optical axis and the board stack, carries the mounting bosses and ties the top and bottom covers together.",
    role: "Holds optical alignment under load, shock and thermal cycling.",
    capabilities: ["Optical alignment", "Mounting bosses", "Cover tie"],
    specs: [
      ["Material", "Aluminium (provisional)"],
      ["Bosses", "6 × M1.6"],
      ["Datum", "Optical axis"],
    ],
    couples: ["mainpcb", "bottom", "top"],
  }),
  seed({
    id: "bottom",
    mesh: "BottomCover",
    number: "12",
    name: "Bottom Cover",
    short: "Base protection",
    system: "enclosure",
    description:
      "Structural base with side ventilation, the USB-C cutout and the anti-slip face that sits against the desk. The mechanical ground the other eleven groups reference.",
    role: "Closes the enclosure and carries the external interface.",
    capabilities: ["Structural base", "Ventilation", "USB-C cutout"],
    specs: [
      ["Face", "Anti-slip elastomer"],
      ["Venting", "Side slots, both flanks"],
      ["Interface", "USB-C"],
    ],
    couples: ["frame", "power"],
  }),
];

/* Legacy aliases: the scroll scene, the stage and the GLB builder import these. */
export type HoloDockPartId = PartId;
export type HoloDockPart = Part;
export const HOLODOCK_PARTS = PARTS;

export const PART_COUNT = PARTS.length;
export const SYSTEM_COUNT = new Set(PARTS.map((part) => part.system)).size;

export const partById = (id: PartId): Part => {
  const part = PARTS.find((item) => item.id === id);
  if (!part) throw new Error(`Unknown HoloDock part: ${id}`);
  return part;
};

export const partIndex = (id: PartId): number => PARTS.findIndex((item) => item.id === id);

/** Where a group sits at explosion `t`, as a world-space offset. */
export function partOffset(part: Part, t: number, out = new THREE.Vector3()): THREE.Vector3 {
  const distance = THREE.MathUtils.lerp(part.assembled, part.exploded, t);
  return out.set(part.axis[0], part.axis[1], part.axis[2]).multiplyScalar(distance);
}

/** Device footprint in scene units — everything else is derived from this. */
export const FOOTPRINT = 3.4;
