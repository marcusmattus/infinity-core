/**
 * The ten addressable layers of the HoloDock, top of the stack to bottom.
 *
 * `mesh` is the name each layer carries in `/public/models/holodock.glb` once
 * the CAD export lands; until then the same names label the procedural stand-in
 * geometry, so swapping the source does not touch anything downstream.
 *
 * `assembled` and `exploded` are positions on the assembly axis in scene units.
 * Every layer travels along that axis and nothing else — the explosion is a
 * mechanical separation, not a scatter.
 */
export type HoloDockPartId =
  | "top"
  | "optics"
  | "combiner"
  | "display"
  | "sensors"
  | "camera"
  | "processor"
  | "thermal"
  | "power"
  | "bottom";

export type HoloDockPart = {
  id: HoloDockPartId;
  mesh: string;
  number: string;
  name: string;
  short: string;
  description: string;
  capabilities: string[];
  assembled: number;
  exploded: number;
};

export const HOLODOCK_PARTS: HoloDockPart[] = [
  {
    id: "top",
    mesh: "TopCover",
    number: "01",
    name: "Top Cover",
    short: "Protective shell",
    description:
      "Precision-machined aluminium enclosure over the optical and electronic stack. Carries the touch button and the status indicator, and nothing else — no data, no logic.",
    capabilities: ["Aluminium shell", "Touch button", "Status indicator"],
    assembled: 0.62,
    exploded: 3.2,
  },
  {
    id: "optics",
    mesh: "ProjectionOptics",
    number: "02",
    name: "Projection Optics",
    short: "Precision optics",
    description:
      "The optical engine. It focuses light from the micro display into the projection volume and holds calibration against the dock's own thermal drift.",
    capabilities: ["Focus stack", "Projection calibration", "Sapphire front element"],
    assembled: 0.48,
    exploded: 1.8,
  },
  {
    id: "combiner",
    mesh: "BeamCombiner",
    number: "03",
    name: "Beam Combiner",
    short: "Light manipulation",
    description:
      "Folds the optical paths into one and steers the result into the display pyramid above the phone. This is the part that makes the image appear to float.",
    capabilities: ["Path combination", "Beam steering", "Pyramid geometry"],
    assembled: 0.34,
    exploded: 2.5,
  },
  {
    id: "display",
    mesh: "MicroDisplay",
    number: "04",
    name: "Micro Display",
    short: "OLED display",
    description:
      "A high-brightness micro-OLED panel, the primary image source. Every frame SpatialOS composes on the phone lands here before it becomes light in the room.",
    capabilities: ["Micro-OLED", "60 fps light field", "High brightness"],
    assembled: 0.2,
    exploded: 1.1,
  },
  {
    id: "sensors",
    mesh: "SpatialSensors",
    number: "05",
    name: "Spatial Sensors",
    short: "Depth sensing",
    description:
      "LiDAR and stereo depth, meshing the surfaces and objects around the dock so anchors hold where you put them.",
    capabilities: ["LiDAR", "0.2–4 m depth", "30 Hz environment mesh"],
    assembled: 0.06,
    exploded: 0.45,
  },
  {
    id: "camera",
    mesh: "TrackingCamera",
    number: "06",
    name: "Tracking Camera",
    short: "SLAM vision",
    description:
      "Stereo RGB for SLAM, hand tracking and interaction detection. It is what lets a gesture in the air resolve to a target in the scene.",
    capabilities: ["Stereo RGB", "120° FOV", "Hand and pointer tracking"],
    assembled: -0.08,
    exploded: -0.25,
  },
  {
    id: "processor",
    mesh: "AgentProcessor",
    number: "07",
    name: "Agent Processor",
    short: "AI orchestration",
    description:
      "The on-module NPU. It runs local inference and the device half of the Agent Kernel, so a tool call does not need to round-trip to the cloud to move something in the room.",
    capabilities: ["On-module NPU", "Local inference", "Device orchestration"],
    assembled: -0.22,
    exploded: -0.95,
  },
  {
    id: "thermal",
    mesh: "ThermalSystem",
    number: "08",
    name: "Thermal System",
    short: "Heat management",
    description:
      "Graphene spreader and fin stack. Optical calibration drifts with temperature, so holding the thermal envelope is what keeps a long session sharp.",
    capabilities: ["Graphene spreader", "Passive fin stack", "Sustained-session envelope"],
    assembled: -0.36,
    exploded: -1.65,
  },
  {
    id: "power",
    mesh: "PowerSystem",
    number: "09",
    name: "Power System",
    short: "Power + USB-C",
    description:
      "USB-C PD negotiation and internal delivery, with an optional cell for untethered bursts. One cable does power and data both ways.",
    capabilities: ["USB-C PD", "Power delivery", "Optional cell"],
    assembled: -0.5,
    exploded: -2.35,
  },
  {
    id: "bottom",
    mesh: "BottomCover",
    number: "10",
    name: "Bottom Cover",
    short: "Base protection",
    description:
      "Structural base, mounting points and the anti-slip face that sits against the phone. The mechanical ground the other nine layers reference.",
    capabilities: ["Structural base", "Anti-slip face", "Mounting points"],
    assembled: -0.64,
    exploded: -3.05,
  },
];

export const PART_COUNT = HOLODOCK_PARTS.length;

export function partById(id: HoloDockPartId): HoloDockPart {
  const part = HOLODOCK_PARTS.find((item) => item.id === id);
  if (!part) throw new Error(`Unknown HoloDock part: ${id}`);
  return part;
}
