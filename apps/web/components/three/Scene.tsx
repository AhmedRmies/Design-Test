'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import {
  Center,
  Environment,
  OrbitControls,
  AccumulativeShadows,
  RandomizedLight,
  Html,
  useProgress,
} from '@react-three/drei';
import { Shirt } from './Shirt';

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="text-sm text-neutral-500">{Math.round(progress)}% loaded</div>
    </Html>
  );
}

export function Scene({ modelUrl }: { modelUrl: string }) {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 0, 2.6], fov: 32 }}
      gl={{ preserveDrawingBuffer: true, antialias: true }}
      className="canvas-shell h-full w-full"
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 4, 3]} intensity={1.1} castShadow />
      <Environment preset="city" />

      <Suspense fallback={<Loader />}>
        <Center>
          <Shirt modelUrl={modelUrl} />
        </Center>
      </Suspense>

      <AccumulativeShadows temporal frames={60} alphaTest={0.85} scale={8} position={[0, -0.8, 0]}>
        <RandomizedLight amount={6} radius={5} intensity={0.7} position={[4, 6, -2]} />
      </AccumulativeShadows>

      <OrbitControls
        makeDefault
        enablePan={false}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 1.8}
        minDistance={1.8}
        maxDistance={4}
      />
    </Canvas>
  );
}
