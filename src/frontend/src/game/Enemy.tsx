import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

interface Projectile {
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  alive: boolean;
}

interface EnemyProps {
  position: [number, number, number];
  patrolRange?: number;
  index: number;
  alive: boolean;
  projectiles: Projectile[];
  playerPosition: React.MutableRefObject<THREE.Vector3>;
  gameActive: boolean;
}

export function Enemy({
  position,
  patrolRange = 4,
  index,
  alive,
  projectiles,
  playerPosition,
  gameActive,
}: EnemyProps) {
  const meshRef = useRef<THREE.Group>(null);
  const patrolDir = useRef(1);
  const shootTimer = useRef(index * 1.2 + 1.5); // stagger shoot times
  const baseX = useRef(position[0]);

  useFrame((_, delta) => {
    if (!alive || !meshRef.current || !gameActive) return;

    // Patrol
    const speed = 1.5;
    meshRef.current.position.x += patrolDir.current * speed * delta;
    if (Math.abs(meshRef.current.position.x - baseX.current) > patrolRange) {
      patrolDir.current *= -1;
    }
    meshRef.current.rotation.y += patrolDir.current * delta * 2;

    // Shoot at player
    shootTimer.current -= delta;
    if (shootTimer.current <= 0) {
      shootTimer.current = 2.5;
      const enemyPos = new THREE.Vector3().copy(meshRef.current.position);
      enemyPos.y += 1;
      const toPlayer = new THREE.Vector3().subVectors(
        playerPosition.current,
        enemyPos,
      );
      const dist = toPlayer.length();
      if (dist < 40) {
        toPlayer.normalize().multiplyScalar(14);
        // Add to projectiles array directly
        projectiles.push({
          pos: enemyPos.clone(),
          vel: toPlayer.clone(),
          alive: true,
        });
        // Limit total projectiles
        while (projectiles.length > 20) projectiles.shift();
      }
    }
  });

  if (!alive) return null;

  return (
    <group ref={meshRef} position={position}>
      {/* Body */}
      <mesh position={[0, 0.8, 0]}>
        <boxGeometry args={[0.6, 1.0, 0.4]} />
        <meshStandardMaterial
          color="#001a1a"
          emissive="#00ffff"
          emissiveIntensity={0.6}
        />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.5, 0]}>
        <boxGeometry args={[0.45, 0.4, 0.45]} />
        <meshStandardMaterial
          color="#000d1a"
          emissive="#00ffff"
          emissiveIntensity={1.2}
        />
      </mesh>
      {/* Eye visor */}
      <mesh position={[0, 1.5, 0.23]}>
        <boxGeometry args={[0.3, 0.08, 0.02]} />
        <meshStandardMaterial
          color="#00ffff"
          emissive="#00ffff"
          emissiveIntensity={3}
        />
      </mesh>
      {/* Left leg */}
      <mesh position={[-0.18, 0.15, 0]}>
        <boxGeometry args={[0.2, 0.5, 0.2]} />
        <meshStandardMaterial
          color="#001a1a"
          emissive="#00ffff"
          emissiveIntensity={0.4}
        />
      </mesh>
      {/* Right leg */}
      <mesh position={[0.18, 0.15, 0]}>
        <boxGeometry args={[0.2, 0.5, 0.2]} />
        <meshStandardMaterial
          color="#001a1a"
          emissive="#00ffff"
          emissiveIntensity={0.4}
        />
      </mesh>
      {/* Cyan glow light */}
      <pointLight color="#00ffff" intensity={1.5} distance={5} />
    </group>
  );
}

interface ProjectileMeshProps {
  projectile: Projectile;
  gameActive: boolean;
}

export function ProjectileMesh({
  projectile,
  gameActive,
}: ProjectileMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (!projectile.alive || !meshRef.current || !gameActive) return;
    projectile.pos.addScaledVector(projectile.vel, delta);
    meshRef.current.position.copy(projectile.pos);
    // Kill if too far
    if (projectile.pos.y < -20 || projectile.pos.length() > 300) {
      projectile.alive = false;
    }
  });

  if (!projectile.alive) return null;

  return (
    <mesh
      ref={meshRef}
      position={[projectile.pos.x, projectile.pos.y, projectile.pos.z]}
    >
      <sphereGeometry args={[0.12, 6, 6]} />
      <meshStandardMaterial
        color="#ff0080"
        emissive="#ff0080"
        emissiveIntensity={4}
      />
      <pointLight color="#ff0080" intensity={2} distance={3} />
    </mesh>
  );
}
