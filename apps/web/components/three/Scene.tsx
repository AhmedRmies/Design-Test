'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import {
  OrbitControls,
  Environment,
  Html,
  useProgress,
} from '@react-three/drei';
import { ModelTest } from './ModelTest';

function Loader() {
  const { progress } = useProgress();

  return (
    <Html center>
      <div className="text-sm text-neutral-500">
        {Math.round(progress)}% loaded
      </div>
    </Html>
  );
}

export function Scene() {
  return (
    <Canvas
      camera={{
        position: [0, 0, 2.6],
        fov: 32,
      }}
      className="h-full w-full"
    >
      <ambientLight intensity={1} />

      <Environment preset="city" />

      <Suspense fallback={<Loader />}>
        <ModelTest />
      </Suspense>

      <OrbitControls
        makeDefault
        enablePan={false}
      />
    </Canvas>
  );
}