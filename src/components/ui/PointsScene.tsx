'use client';

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

/**
 * POINTS SCENE — a single THREE.Points cloud. One draw call, no
 * textures, no post-processing, no shadows: cheap enough to stay
 * smooth on mobile and trivially degradable.
 */

const COUNT = 900;
const PALETTE = [new THREE.Color('#8ECBF2'), new THREE.Color('#FFD34D'), new THREE.Color('#FF5C5C')];

export default function PointsScene() {
  const group = useRef<THREE.Points>(null);

  const geometry = useMemo(() => {
    // deterministic layout — stable across server/client renders
    let seed = 23;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };

    const positions = new Float32Array(COUNT * 3);
    const colors = new Float32Array(COUNT * 3);

    for (let i = 0; i < COUNT; i++) {
      // flattened disc keeps density in view rather than in depth
      positions[i * 3] = (rand() - 0.5) * 16;
      positions[i * 3 + 1] = (rand() - 0.5) * 9;
      positions[i * 3 + 2] = (rand() - 0.5) * 6 - 1;

      // mostly baby blue, sparse yellow, very rare red accent
      const r = rand();
      const c = r > 0.94 ? PALETTE[2] : r > 0.78 ? PALETTE[1] : PALETTE[0];
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return g;
  }, []);

  useFrame((state, delta) => {
    const pts = group.current;
    if (!pts) return;
    const t = state.clock.elapsedTime;

    // slow drift — never a spin, never distracting
    pts.rotation.y = Math.sin(t * 0.08) * 0.12;
    pts.rotation.x = Math.cos(t * 0.06) * 0.07;

    // pointer parallax, damped
    const px = state.pointer.x;
    const py = state.pointer.y;
    pts.position.x += (px * 0.35 - pts.position.x) * Math.min(1, delta * 1.6);
    pts.position.y += (py * 0.22 - pts.position.y) * Math.min(1, delta * 1.6);
  });

  return (
    <points ref={group} geometry={geometry} frustumCulled={false}>
      <pointsMaterial
        size={0.05}
        sizeAttenuation
        vertexColors
        transparent
        opacity={0.6}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}