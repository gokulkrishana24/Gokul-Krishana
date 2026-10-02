'use client';

import { Canvas } from '@react-three/fiber';
import PointsScene from './PointsScene';

/**
 * WEBGL FIELD — the lazily-loaded boundary.
 *
 * Everything three.js / R3F touches lives behind this module so it is
 * only fetched when the section is actually on screen, on a device
 * that reports WebGL support, and with reduced motion off.
 *
 * Kept deliberately cheap: no textures, no shadows, no
 * post-processing, capped DPR and a low-power context hint.
 */
export default function WebGLField() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{ antialias: false, alpha: true, powerPreference: 'low-power' }}
      camera={{ position: [0, 0, 6], fov: 55 }}
      style={{ width: '100%', height: '100%' }}
    >
      <PointsScene />
    </Canvas>
  );
}