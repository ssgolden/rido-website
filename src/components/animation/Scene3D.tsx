"use client";

import { useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment, MeshDistortMaterial, Sphere } from "@react-three/drei";
import * as THREE from "three";
import { useReducedMotion } from "framer-motion";

/**
 * 3D orb scene with distortion material — the kind of premium floating
 * brand element used by Stripe, Linear, Vercel landing pages.
 *
 * Pure R3F + drei; no extra plugins. Drop into any hero section.
 */
function DistortOrb() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = state.clock.elapsedTime * 0.15;
      ref.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });
  return (
    <Sphere args={[1, 64, 64]} ref={ref}>
      <MeshDistortMaterial
        color="#DE0498"
        attach="material"
        distort={0.4}
        speed={1.6}
        roughness={0.15}
        metalness={0.6}
      />
    </Sphere>
  );
}

/**
 * Stars — minimal particle field for atmosphere.
 */
function Stars({ count = 200 }: { count?: number }) {
  const [positions, setPositions] = useState<Float32Array | null>(null);
  useEffect(() => {
    // Defer to a microtask so the initial commit completes first.
    const handle = queueMicrotask(() => {
      const arr = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        arr[i * 3] = (Math.random() - 0.5) * 12;
        arr[i * 3 + 1] = (Math.random() - 0.5) * 12;
        arr[i * 3 + 2] = (Math.random() - 0.5) * 12;
      }
      setPositions(arr);
    });
    return () => {
      // queueMicrotask doesn't return a cancel handle; nothing to clean up.
      void handle;
    };
  }, [count]);
  const ref = useRef<THREE.Points>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.05;
  });
  if (!positions) return null;
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
        />
      </bufferGeometry>
      <pointsMaterial size={0.02} color="#ffffff" transparent opacity={0.7} sizeAttenuation />
    </points>
  );
}

export interface Scene3DProps {
  height?: string;
  className?: string;
  showStars?: boolean;
  showEnvironment?: boolean;
}

export function Scene3D({
  height = "100%",
  className = "",
  showStars = true,
  showEnvironment = false,
}: Scene3DProps) {
  const reduce = useReducedMotion();
  return (
    <div
      className={className}
      style={{ height, width: "100%", pointerEvents: "none" }}
      aria-hidden="true"
    >
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 4], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 3, 5]} intensity={0.8} color="#F23DB5" />
        <directionalLight position={[-3, -3, 2]} intensity={0.4} color="#22C55E" />
        {showStars ? <Stars /> : null}
        <Float speed={reduce ? 0 : 1.2} rotationIntensity={0.3} floatIntensity={0.5}>
          <DistortOrb />
        </Float>
        {showEnvironment ? <Environment preset="city" /> : null}
      </Canvas>
    </div>
  );
}
