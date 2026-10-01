# `holodock.glb`

The ten-layer HoloDock model the device explorer at `/holodock` renders. The
page loads it through `HoloDockGltf.tsx`, pulls each named node into its own
layer group, and drives the rest — sequence, camera, captions — from
`src/lib/holodock-parts.ts`.

## How this file is made

It is generated, not hand-sculpted, so it stays reproducible and reviewable:

```sh
npm run model:build          # scripts/build-holodock-glb.mjs → this file
```

The script imports `src/lib/holodock-parts.ts` directly, so the layer names and
their assembled heights have exactly one source of truth and the model cannot
drift away from the page.

Current output: 10 layers, 31 meshes, ~5.1k triangles, ~165 kB, closed body
3.20 × 1.08 × 2.42 in scene units — the proportions of a 52 × 14 mm dock.

## The node contract

Ten nodes, named exactly. These names are the `mesh` field of each entry in
`src/lib/holodock-parts.ts`:

| Layer | Node |
| --- | --- |
| 01 | `TopCover` |
| 02 | `ProjectionOptics` |
| 03 | `BeamCombiner` |
| 04 | `MicroDisplay` |
| 05 | `SpatialSensors` |
| 06 | `TrackingCamera` |
| 07 | `AgentProcessor` |
| 08 | `ThermalSystem` |
| 09 | `PowerSystem` |
| 10 | `BottomCover` |

## Replacing it with a CAD export

Drop a new `holodock.glb` here with those ten node names and the page picks it
up unchanged. What the export needs to respect:

- **Y is the assembly axis.** Each layer's own transform is zeroed when it is
  cloned into its layer group, so author the parts in place — the `assembled`
  and `exploded` values in `holodock-parts.ts` do the moving.
- **Scene units.** The generated stack is 3.2 × 2.4 wide and ~1.08 tall closed.
  Match that, or adjust `assembled` / `exploded` to suit a different scale.
- **Enclosure.** The lid carries a skirt and the base is a tray, so the closed
  body reads as one machined object with no internals showing at the seam.
- **Materials.** PBR metal/rough. Layer focus multiplies `material.color`, so
  avoid pure black base colours or the dimmed state has nothing to dim. The
  canvas generates its own studio environment, so metals have something to
  reflect without any HDR being fetched.
- **Compression.** Draco or Meshopt is fine, but self-host the decoder — the
  page must not reach for a CDN. Point `useGLTF` at the local decoder path in
  `HoloDockGltf.tsx` if you compress.

## Turning it off

`USE_GLB` in `src/components/holodock/model-source.ts` switches the explorer
back to the procedural stand-in geometry in `HoloDockGeometry.tsx`, which is
also what renders if this file ever fails to load.
