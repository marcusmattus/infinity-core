import { useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { HOLODOCK_PARTS } from "@/lib/holodock-parts";
import { GLB_URL } from "./model-source";

/**
 * One layer, taken from the product model.
 *
 * Each layer group owns its position on the assembly axis, so the mesh's own
 * transform is zeroed on the clone — the GLB can be authored in place and the
 * sequence still drives it. Materials are cloned before dimming so focusing one
 * layer never bleeds into another instance.
 */
export default function HoloDockGltf({ index, focus }: { index: number; focus: number }) {
  const { scene } = useGLTF(GLB_URL);
  const part = HOLODOCK_PARTS[index];

  const object = useMemo(() => {
    const source = part ? scene.getObjectByName(part.mesh) : undefined;
    if (!source) return null;

    const clone = source.clone(true);
    clone.position.set(0, 0, 0);
    clone.traverse((node) => {
      const mesh = node as THREE.Mesh;
      if (!mesh.isMesh) return;
      const base = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
      if (!base) return;
      const material = base.clone() as THREE.MeshStandardMaterial;
      if (material.color) material.color.multiplyScalar(0.42 + 0.58 * focus);
      mesh.material = material;
    });
    return clone;
  }, [scene, part, focus]);

  if (!object) return null;
  return <primitive object={object} />;
}

useGLTF.preload(GLB_URL);
