/**
 * Where the device model comes from.
 *
 * Today the stack is procedural geometry built in `HoloDockGeometry.tsx`. When
 * the CAD export lands at `GLB_URL` with the ten meshes named as
 * `HOLODOCK_PARTS[].mesh`, flip `USE_GLB` and the same layers, sequence, camera
 * and copy drive the real product instead. See `public/models/README.md`.
 */
export const GLB_URL = "/models/holodock.glb";
export const USE_GLB = false;
