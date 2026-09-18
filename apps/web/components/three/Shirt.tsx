'use client';

import { useEffect, useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { easing } from 'maath';
import { useDesignStore } from '@/lib/store';
import { renderPrintArea } from '@/lib/design-canvas';

interface ShirtProps {
  modelUrl: string;
}

export function Shirt({ modelUrl }: ShirtProps) {
  const { nodes } = useGLTF(modelUrl) as any;

  const colorHex = useDesignStore((s) => s.colorHex);
  const areas = useDesignStore((s) => s.areas);
  const activeArea = useDesignStore((s) => s.activeArea);

  const [texture, setTexture] = useState<THREE.CanvasTexture | null>(null);
  const materialRef = useRef<THREE.MeshPhysicalMaterial>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const canvas = await renderPrintArea(areas[activeArea]);

      if (cancelled) return;

      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 16;
      tex.needsUpdate = true;

      setTexture((prev) => {
        prev?.dispose();
        return tex;
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [areas, activeArea]);

  useFrame((_, delta) => {
    if (materialRef.current) {
      easing.dampC(
        materialRef.current.color,
        colorHex,
        0.25,
        delta
      );
    }
  });

  // IMPORTANT:
  // Use the actual mesh from the GLB instead of extracting only its geometry.
  const shirtMesh = nodes.Object_4;

  if (!shirtMesh) {
    console.error('Object_4 was not found in GLB:', nodes);
    return null;
  }

  return (
    <group dispose={null}>
      <mesh
        castShadow
        receiveShadow
        geometry={shirtMesh.geometry}
        position={[0, 1.374, -0.021]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      >
        <meshPhysicalMaterial
          ref={materialRef}
          map={texture ?? undefined}
          roughness={0.85}
          sheen={0.4}
          sheenRoughness={0.6}
          sheenColor="#ffffff"
        />
      </mesh>
    </group>
  );
}