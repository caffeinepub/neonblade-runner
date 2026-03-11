import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { grappleAnchors } from "./Player";

export const PLATFORMS: Array<{
  pos: [number, number, number];
  size: [number, number, number];
  label?: string;
}> = [
  { pos: [0, 0, 0], size: [12, 0.5, 12], label: "start" },
  { pos: [0, 1.5, -18], size: [4, 0.5, 4] },
  { pos: [4, 3, -28], size: [4, 0.5, 4] },
  { pos: [-2, 4.5, -38], size: [4, 0.5, 4] },
  { pos: [-3, 7, -52], size: [0.5, 6, 18] },
  { pos: [3, 7, -52], size: [0.5, 6, 18] },
  { pos: [0, 4.5, -44], size: [5, 0.5, 4] },
  { pos: [0, 5.5, -62], size: [5, 0.5, 4] },
  { pos: [0, 6, -70], size: [3, 0.5, 3] },
  { pos: [8, 7, -80], size: [3, 0.5, 3] },
  { pos: [-4, 7.5, -90], size: [3, 0.5, 3] },
  { pos: [0, 7, -100], size: [6, 0.5, 6] },
  { pos: [0, 7, -115], size: [20, 0.5, 16] },
  { pos: [0, 7, -135], size: [10, 0.5, 10] },
];

export const ENEMY_SPAWNS: Array<[number, number, number]> = [
  [-5, 7.5, -112],
  [5, 7.5, -112],
  [-3, 7.5, -118],
  [4, 7.5, -120],
];

export const GRAPPLE_ANCHOR_POSITIONS: Array<[number, number, number]> = [
  [4, 12, -75],
  [-2, 13, -85],
  [2, 13, -95],
];

export const VICTORY_ZONE = {
  pos: [0, 8, -135] as [number, number, number],
  size: [10, 3, 10] as [number, number, number],
};

export const CHECKPOINT_POSITIONS: Array<[number, number, number]> = [
  [0, 2, -15],
  [0, 6.5, -64],
  [0, 8, -100],
  [0, 8, -108],
];

function NeonPlatform({
  pos,
  size,
}: { pos: [number, number, number]; size: [number, number, number] }) {
  return (
    <group position={pos}>
      <mesh>
        <boxGeometry args={size} />
        <meshStandardMaterial
          color="#050a12"
          roughness={0.2}
          metalness={0.8}
          emissive="#001a33"
          emissiveIntensity={0.2}
        />
      </mesh>
      <mesh position={[0, size[1] / 2 + 0.01, 0]}>
        <boxGeometry args={[size[0], 0.04, size[2]]} />
        <meshStandardMaterial
          color="#00ffff"
          emissive="#00ffff"
          emissiveIntensity={2}
        />
      </mesh>
    </group>
  );
}

function GrappleAnchor({
  pos,
  index,
}: { pos: [number, number, number]; index: number }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useMemo(() => {
    if (!grappleAnchors[index]) {
      grappleAnchors[index] = new THREE.Vector3(...pos);
    } else {
      grappleAnchors[index].set(...pos);
    }
  }, [pos, index]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 2;
      const s = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.1;
      meshRef.current.scale.setScalar(s);
    }
  });

  return (
    <group position={pos}>
      <mesh ref={meshRef}>
        <octahedronGeometry args={[0.4, 0]} />
        <meshStandardMaterial
          color="#ff00ff"
          emissive="#ff00ff"
          emissiveIntensity={3}
        />
      </mesh>
      <pointLight color="#ff00ff" intensity={3} distance={8} />
      <mesh position={[0, -2, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 4, 4]} />
        <meshStandardMaterial
          color="#ff00ff"
          emissive="#ff00ff"
          emissiveIntensity={2}
          transparent
          opacity={0.5}
        />
      </mesh>
    </group>
  );
}

function CheckpointMarker({ pos }: { pos: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime;
      meshRef.current.position.y =
        pos[1] + 1 + Math.sin(state.clock.elapsedTime * 2) * 0.2;
    }
  });
  return (
    <group position={pos}>
      <mesh ref={meshRef}>
        <torusGeometry args={[0.5, 0.06, 8, 24]} />
        <meshStandardMaterial
          color="#00ff80"
          emissive="#00ff80"
          emissiveIntensity={2}
        />
      </mesh>
      <pointLight color="#00ff80" intensity={2} distance={5} />
    </group>
  );
}

function VictoryZone() {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
      const s = 1 + Math.sin(state.clock.elapsedTime) * 0.1;
      meshRef.current.scale.setScalar(s);
    }
  });
  return (
    <group position={VICTORY_ZONE.pos}>
      <mesh ref={meshRef} position={[0, 2, 0]}>
        <torusGeometry args={[2, 0.15, 8, 32]} />
        <meshStandardMaterial
          color="#ffff00"
          emissive="#ffff00"
          emissiveIntensity={3}
        />
      </mesh>
      <pointLight color="#ffff00" intensity={5} distance={15} />
      <mesh position={[0, 3, 0]}>
        <cylinderGeometry args={[0.5, 2, 6, 8, 1, true]} />
        <meshStandardMaterial
          color="#ffff00"
          emissive="#ffff00"
          emissiveIntensity={1}
          transparent
          opacity={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

interface BuildingData {
  x: number;
  z: number;
  h: number;
  w: number;
  emissive: string;
  id: string;
}

function CityBackground() {
  const buildings = useMemo<BuildingData[]>(() => {
    const items: BuildingData[] = [];
    for (let i = 0; i < 30; i++) {
      const x = (Math.random() - 0.5) * 120;
      const z = -20 - Math.random() * 150;
      const h = 15 + Math.random() * 40;
      const w = 3 + Math.random() * 6;
      const emissive = Math.random() > 0.5 ? "#00ffff" : "#ff00ff";
      items.push({
        x,
        z,
        h,
        w,
        emissive,
        id: `bldg-${i}-${Math.round(x)}-${Math.round(z)}`,
      });
    }
    return items;
  }, []);

  return (
    <>
      {buildings.map((b) => (
        <mesh key={b.id} position={[b.x, -5 + b.h / 2, b.z]}>
          <boxGeometry args={[b.w, b.h, b.w]} />
          <meshStandardMaterial
            color="#050a12"
            emissive={b.emissive}
            emissiveIntensity={0.05}
            roughness={0.6}
          />
        </mesh>
      ))}
    </>
  );
}

export function Level() {
  return (
    <group>
      {PLATFORMS.map((p) => (
        <NeonPlatform
          key={`plat-${p.pos.join("-")}`}
          pos={p.pos}
          size={p.size}
        />
      ))}

      {GRAPPLE_ANCHOR_POSITIONS.map((pos, i) => (
        <GrappleAnchor key={`anchor-${pos.join("-")}`} pos={pos} index={i} />
      ))}

      {CHECKPOINT_POSITIONS.map((pos) => (
        <CheckpointMarker key={`cp-${pos.join("-")}`} pos={pos} />
      ))}

      <VictoryZone />

      <mesh position={[0, -25, -70]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#010308" roughness={0.9} />
      </mesh>

      <CityBackground />

      <gridHelper
        args={[200, 40, "#00ffff", "#001a33"]}
        position={[0, -25.1, -70]}
      />
    </group>
  );
}
