'use client';

import { useGLTF } from '@react-three/drei';

export function ModelTest() {
  const { nodes, materials } = useGLTF(
    '/classic-tee-transformed.glb'
  ) as any;

  return (
    <group dispose={null}>
      <mesh
        geometry={nodes.Object_4.geometry}
        material={materials['Material.005']}
        position={[0, 1.374, -0.021]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
    </group>
  );
}

useGLTF.preload('/classic-tee-transformed.glb');