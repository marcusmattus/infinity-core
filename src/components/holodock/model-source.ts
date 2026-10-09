/**
 * Where the device model comes from.
 *
 * Currently off. The assembly is now twelve groups, and the generated model at
 * `GLB_URL` still carries the earlier ten — `scripts/build-holodock-glb.mjs`
 * needs builders for `MainPCB` and `InternalFrame` before it can be switched
 * back on. Until then the stack renders from the procedural geometry in
 * `geometry.tsx`, which is also what a CAD export would replace.
 */
export const GLB_URL = "/models/holodock.glb";
export const USE_GLB = false;
