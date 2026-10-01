/**
 * Where the device model comes from.
 *
 * `USE_GLB` loads the generated product model at `GLB_URL` — ten named layers,
 * built by `npm run model:build` (see `public/models/README.md`). Turning it off
 * falls back to the procedural stand-in geometry in `HoloDockGeometry.tsx`,
 * which is also what a CAD export would replace.
 */
export const GLB_URL = "/models/holodock.glb";
export const USE_GLB = true;
