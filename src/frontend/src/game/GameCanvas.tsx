import { Stars } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Enemy, ProjectileMesh } from "./Enemy";
import { HUD } from "./HUD";
import {
  CHECKPOINT_POSITIONS,
  ENEMY_SPAWNS,
  Level,
  PLATFORMS,
  VICTORY_ZONE,
} from "./Level";
import { MobileControls } from "./MobileControls";
import { Player } from "./Player";
import { useGameStore } from "./store";

interface EnemyState {
  alive: boolean;
  pos: THREE.Vector3;
  id: number;
}

interface ProjectileState {
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  alive: boolean;
  id: number;
}

let projIdCounter = 0;

export function GameCanvas() {
  const { gameState, setCheckpoint } = useGameStore();
  const gameActive = gameState === "playing";

  const [enemies, setEnemies] = useState<EnemyState[]>(() =>
    ENEMY_SPAWNS.map((pos, i) => ({
      alive: true,
      pos: new THREE.Vector3(...pos),
      id: i,
    })),
  );

  const projectilesRef = useRef<ProjectileState[]>([]);
  const [projectileVersion, setProjectileVersion] = useState(0);

  const playerPosRef = useRef(new THREE.Vector3(0, 2, 0));

  const handleEnemyKilled = useCallback((index: number) => {
    setEnemies((prev) => {
      const next = [...prev];
      if (next[index]) {
        next[index] = { ...next[index], alive: false };
      }
      return next;
    });
  }, []);

  useEffect(() => {
    if (gameState === "playing") {
      setEnemies(
        ENEMY_SPAWNS.map((pos, i) => ({
          alive: true,
          pos: new THREE.Vector3(...pos),
          id: i,
        })),
      );
      projectilesRef.current = [];
      setProjectileVersion((v) => v + 1);
    }
  }, [gameState]);

  useEffect(() => {
    if (!gameActive) return;
    const interval = setInterval(() => {
      const pp = playerPosRef.current;
      for (const cp of CHECKPOINT_POSITIONS) {
        const d = pp.distanceTo(new THREE.Vector3(...cp));
        if (d < 4) {
          setCheckpoint(cp);
        }
      }
    }, 500);
    return () => clearInterval(interval);
  }, [gameActive, setCheckpoint]);

  useEffect(() => {
    const interval = setInterval(() => {
      for (const p of projectilesRef.current) {
        const ps = p as ProjectileState;
        if (ps.id === undefined) {
          ps.id = projIdCounter++;
        }
      }
      setProjectileVersion((v) => v + 1);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const liveProjectiles = projectilesRef.current.filter(
    (p) => p.alive && projectileVersion >= 0,
  );

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        position: "relative",
        touchAction: "none",
      }}
    >
      <Canvas
        camera={{ fov: 90, near: 0.1, far: 500 }}
        style={{ background: "#010308" }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
        }}
      >
        <ambientLight intensity={0.15} color="#050a20" />
        <directionalLight
          position={[10, 20, 5]}
          intensity={0.3}
          color="#8888ff"
        />
        <pointLight
          position={[0, 10, -20]}
          color="#00ffff"
          intensity={2}
          distance={60}
        />
        <pointLight
          position={[0, 10, -90]}
          color="#ff00ff"
          intensity={2}
          distance={60}
        />
        <pointLight
          position={[0, 10, -135]}
          color="#00ffff"
          intensity={3}
          distance={40}
        />

        <fog attach="fog" args={["#010308", 40, 160]} />
        <Stars
          radius={150}
          depth={60}
          count={3000}
          factor={3}
          saturation={0.5}
          fade
        />

        <Level />

        {enemies.map((enemy) => (
          <Enemy
            key={enemy.id}
            index={enemy.id}
            position={ENEMY_SPAWNS[enemy.id]}
            alive={enemy.alive}
            projectiles={projectilesRef.current}
            playerPosition={playerPosRef}
            gameActive={gameActive}
          />
        ))}

        {liveProjectiles.map((proj) => (
          <ProjectileMesh
            key={proj.id}
            projectile={proj}
            gameActive={gameActive}
          />
        ))}

        {gameActive && (
          <Player
            platforms={PLATFORMS}
            enemyPositions={enemies}
            projectiles={projectilesRef.current}
            onEnemyKilled={handleEnemyKilled}
            victoryZone={VICTORY_ZONE}
          />
        )}
      </Canvas>

      {gameActive && <HUD />}
      {gameActive && <MobileControls />}
    </div>
  );
}
