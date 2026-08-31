# `holodock.glb`

The device explorer at `/holodock` renders ten layers on one assembly axis. Today
they are procedural stand-in geometry (`src/components/holodock/HoloDockGeometry.tsx`).
When the CAD export lands, the same sequence, camera, captions and layer rail
drive the real product instead.

## What the export needs

One `.glb` at `/public/models/holodock.glb` containing ten meshes (or groups),
named exactly:

| Layer | Mesh name |
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

The names are the contract: they are the `mesh` field of each entry in
`src/lib/holodock-parts.ts`, and nothing else in the page needs to change.

Authoring notes:

- **Assembly axis is Y.** Each layer's own transform is zeroed when it is
  cloned into its layer group, so author the parts in place — the group
  positions in `holodock-parts.ts` (`assembled` / `exploded`) do the moving.
- **Scene units.** The stand-in stack is 3.2 × 2.4 wide and about 1.3 tall
  assembled. Match that footprint, or adjust `assembled`/`exploded` to suit.
- **Compression.** Draco or Meshopt is expected. Self-host the decoder — the
  page must not reach for a CDN. Point `useGLTF` at the local decoder path in
  `HoloDockGltf.tsx` if you compress.
- **Materials.** PBR metal/rough. Layer focus multiplies `material.color`, so
  avoid pure black base colours or the dimmed state has nothing to dim.

## Switching it on

Set `USE_GLB` in `src/components/holodock/model-source.ts`:

```ts
export const USE_GLB = true;
```

That is the whole switch. `HoloDockGltf.tsx` then loads the file, pulls each
named mesh into its layer group, and the procedural chunk is never fetched.

The loader was verified against a generated ten-node test GLB before shipping,
so the path is live — it is only waiting on the real asset.
