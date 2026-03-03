import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial, Float } from '@react-three/drei';
import * as THREE from 'three';

function Particles() {
  const ref = useRef<THREE.Points>(null!);
  const stride = 3;
  const numPoints = 1500;
  
  const positions = useMemo(() => {
    const pos = new Float32Array(numPoints * stride);
    for (let i = 0; i < numPoints; i++) {
      pos[i * stride] = (Math.random() - 0.5) * 15;
      pos[i * stride + 1] = (Math.random() - 0.5) * 15;
      pos[i * stride + 2] = (Math.random() - 0.5) * 15;
    }
    return pos;
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    ref.current.rotation.y = t * 0.02;
    ref.current.rotation.x = t * 0.01;
  });

  return (
    <Points ref={ref} positions={positions} stride={stride} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#00f2ff"
        size={0.01}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.2}
      />
    </Points>
  );
}

function HeartbeatWave({ scrollProgress = 0 }: { scrollProgress?: number }) {
  const meshRef = useRef<any>(null!);
  const particlesRef = useRef<THREE.Points>(null!);
  const numPoints = 300;
  const numTrailParticles = 200;

  // Heartbeat function with multiple beats and variable sizes
  const getHeartbeatY = (x: number, time: number) => {
    let y = 0;
    // Base beats: 2 or 3 depending on time
    const numBeats = 3; 
    for (let b = 0; b < numBeats; b++) {
      // Toggle 3rd beat visibility over time
      if (b === 2 && Math.sin(time * 0.2) < -0.5) continue;

      const offset = b * 5; // Space them out
      const speed = 1.2;
      const headPos = ((time * speed + offset) % 15) - 7.5;
      const dist = Math.abs(x - headPos);
      
      // Variable size based on beat index and time
      const sizeScale = (0.6 + Math.sin(time * 0.3 + b) * 0.3) * 0.8;

      if (dist < 0.6) {
        if (dist < 0.1) y += 1.5 * sizeScale * (1 - dist / 0.1); // R spike
        else if (dist < 0.2) y += -0.4 * sizeScale * (1 - (dist - 0.1) / 0.1); // S dip
        else if (dist < 0.5) y += 0.2 * sizeScale * (1 - dist / 0.5); // P/T waves
      }
    }
    return y;
  };

  const [linePositions, trailPositions, trailVelocities] = useMemo(() => {
    return [
      new Float32Array(numPoints * 3),
      new Float32Array(numTrailParticles * 3),
      new Float32Array(numTrailParticles * 3)
    ];
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const pos = meshRef.current.geometry.attributes.position;
    const trailPos = particlesRef.current.geometry.attributes.position;
    
    // Update line
    for (let i = 0; i < numPoints; i++) {
      const x = (i / numPoints) * 15 - 7.5;
      const y = getHeartbeatY(x, t);
      pos.setXYZ(i, x, y, 0);
    }
    pos.needsUpdate = true;

    // Update trail particles (dust)
    // Particles should come from the mid-line (y=0)
    for (let i = 0; i < numTrailParticles; i++) {
      if (Math.random() > 0.98) {
        // Emit new particle from a random point on the horizontal line
        const rx = (Math.random() - 0.5) * 15;
        trailPos.setXYZ(i, rx, 0, (Math.random() - 0.5) * 0.5);
        trailVelocities[i * 3] = (Math.random() - 0.5) * 0.01; // vx
        trailVelocities[i * 3 + 1] = Math.random() * 0.02; // vy (float up)
      } else {
        // Drift and fade
        const px = trailPos.getX(i);
        const py = trailPos.getY(i);
        const pz = trailPos.getZ(i);
        
        trailPos.setXYZ(
          i, 
          px + trailVelocities[i * 3], 
          py + trailVelocities[i * 3 + 1], 
          pz
        );
        
        // Reset if too high
        if (py > 2) trailPos.setY(i, -2);
      }
    }
    trailPos.needsUpdate = true;

    // Scroll-based positioning
    // Start below subtext (approx y = -0.8) and move to center (y = 0)
    const startY = -0.8;
    const targetY = startY * (1 - Math.min(scrollProgress * 3, 1));
    meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, targetY, 0.05);
    particlesRef.current.position.y = meshRef.current.position.y;
  });

  return (
    <group>
      <line ref={meshRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={numPoints}
            array={linePositions}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#00f2ff" transparent opacity={0.2} linewidth={1} />
      </line>
      
      <Points ref={particlesRef} positions={trailPositions} stride={3}>
        <PointMaterial
          transparent
          color="#00f2ff"
          size={0.02}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.15}
        />
      </Points>
    </group>
  );
}

export default function ThreeScene({ showRibbon = true, scrollProgress = 0 }: { showRibbon?: boolean, scrollProgress?: number }) {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <Particles />
        {showRibbon && <HeartbeatWave scrollProgress={scrollProgress} />}
      </Canvas>
    </div>
  );
}
