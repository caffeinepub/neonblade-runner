import { useFrame, useThree } from "@react-three/fiber";
import { useCallback, useEffect, useRef } from "react";
import * as THREE from "three";
import { mobileInput } from "./mobileInput";
import { useGameStore } from "./store";

// Grapple anchors shared reference - set by Level
export const grappleAnchors: THREE.Vector3[] = [];

interface PlayerProps {
  platforms: Array<{
    pos: [number, number, number];
    size: [number, number, number];
  }>;
  enemyPositions: Array<{ pos: THREE.Vector3; alive: boolean }>;
  projectiles: Array<{
    pos: THREE.Vector3;
    vel: THREE.Vector3;
    alive: boolean;
  }>;
  onEnemyKilled: (index: number) => void;
  victoryZone: {
    pos: [number, number, number];
    size: [number, number, number];
  };
}

const GRAVITY = -25;
const MOVE_SPEED = 12;
const JUMP_FORCE = 12;
const DASH_FORCE = 18;
const PLAYER_HEIGHT = 1.8;
const PLAYER_RADIUS = 0.4;
const WALL_RUN_DURATION = 0.8;
const SLASH_RANGE = 3.5;
const SLASH_CONE = Math.PI / 3;

type KeyMap = {
  KeyW?: boolean;
  KeyS?: boolean;
  KeyA?: boolean;
  KeyD?: boolean;
  KeyE?: boolean;
  Space?: boolean;
  ShiftLeft?: boolean;
  ShiftRight?: boolean;
  [key: string]: boolean | undefined;
};

export function Player({
  platforms,
  enemyPositions,
  projectiles,
  onEnemyKilled,
  victoryZone,
}: PlayerProps) {
  const { camera } = useThree();
  const {
    gameState,
    checkpointPosition,
    setGameState,
    incrementDeaths,
    setDeathFlash,
    setSensoryBoost,
    setBoostEnergy,
    setDashCooldown,
    setIsSlashing,
    tickTimer,
  } = useGameStore();

  // Player state refs
  const pos = useRef(new THREE.Vector3(...checkpointPosition));
  const vel = useRef(new THREE.Vector3(0, 0, 0));
  const onGround = useRef(false);
  const jumpCount = useRef(0);
  const dashCooldownRef = useRef(0);
  const boostEnergyRef = useRef(100);
  const isDeadRef = useRef(false);
  const isSlashingRef = useRef(false);
  const slashTimerRef = useRef(0);

  // Camera look
  const yaw = useRef(0);
  const pitch = useRef(0);

  // Wall run
  const wallRunTimer = useRef(0);
  const wallRunNormal = useRef(new THREE.Vector3());
  const isWallRunning = useRef(false);

  // Grapple
  const isGrappling = useRef(false);
  const grappleTarget = useRef(new THREE.Vector3());

  // Keys (typed for dot-notation access)
  const keys = useRef<KeyMap>({});
  const mouseButtons = useRef<Record<number, boolean>>({});
  const sensoryRef = useRef(false);
  // Track space previous state separately
  const spaceWasPressed = useRef(false);
  const dashPressed = useRef(false);
  const grapplePressed = useRef(false);
  const slashPressed = useRef(false);

  const die = useCallback(() => {
    if (isDeadRef.current) return;
    isDeadRef.current = true;
    incrementDeaths();
    setDeathFlash(true);
    setTimeout(() => {
      setGameState("dead");
    }, 600);
  }, [incrementDeaths, setDeathFlash, setGameState]);

  // Pointer lock + input events
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (mobileInput.isMobile) return;
      if (document.pointerLockElement) {
        const scale = sensoryRef.current ? 0.4 : 1.0;
        yaw.current -= e.movementX * 0.002 * scale;
        pitch.current -= e.movementY * 0.002 * scale;
        pitch.current = Math.max(
          -Math.PI / 2.2,
          Math.min(Math.PI / 2.2, pitch.current),
        );
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      keys.current[e.code] = true;
      if (e.code === "Space") e.preventDefault();
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keys.current[e.code] = false;
    };
    const onMouseDown = (e: MouseEvent) => {
      mouseButtons.current[e.button] = true;
    };
    const onMouseUp = (e: MouseEvent) => {
      mouseButtons.current[e.button] = false;
    };
    const onClick = () => {
      if (!mobileInput.isMobile) {
        document.body.requestPointerLock();
      }
    };
    if (!mobileInput.isMobile) {
      document.addEventListener("mousemove", onMouseMove);
    }
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("keyup", onKeyUp);
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("click", onClick);
    };
  }, []);

  // AABB collision helper
  const getOverlap = useCallback(
    (
      playerPos: THREE.Vector3,
      platform: {
        pos: [number, number, number];
        size: [number, number, number];
      },
    ) => {
      const [px, py, pz] = platform.pos;
      const [sx, sy, sz] = platform.size;
      const halfX = sx / 2 + PLAYER_RADIUS;
      const halfY = sy / 2 + PLAYER_HEIGHT / 2;
      const halfZ = sz / 2 + PLAYER_RADIUS;
      const dx = playerPos.x - px;
      const dy = playerPos.y - py;
      const dz = playerPos.z - pz;
      const ox = halfX - Math.abs(dx);
      const oy = halfY - Math.abs(dy);
      const oz = halfZ - Math.abs(dz);
      if (ox > 0 && oy > 0 && oz > 0) {
        return { ox, oy, oz, dx, dy, dz };
      }
      return null;
    },
    [],
  );

  useFrame((_, rawDelta) => {
    if (gameState !== "playing" || isDeadRef.current) return;

    const timeScale = sensoryRef.current ? 0.3 : 1.0;
    const dt = Math.min(rawDelta, 0.05) * timeScale;

    tickTimer();

    // Update dash cooldown
    if (dashCooldownRef.current > 0) {
      dashCooldownRef.current = Math.max(0, dashCooldownRef.current - rawDelta);
      setDashCooldown(dashCooldownRef.current);
    }

    // Sensory Boost
    const slowmoActive = mobileInput.isMobile
      ? mobileInput.slowmo
      : !!mouseButtons.current[2];
    if (slowmoActive && boostEnergyRef.current > 0) {
      sensoryRef.current = true;
      boostEnergyRef.current = Math.max(
        0,
        boostEnergyRef.current - rawDelta * 30,
      );
      setSensoryBoost(true);
      setBoostEnergy(boostEnergyRef.current);
    } else {
      sensoryRef.current = false;
      setSensoryBoost(false);
      if (!slowmoActive) {
        boostEnergyRef.current = Math.min(
          100,
          boostEnergyRef.current + rawDelta * 15,
        );
        setBoostEnergy(boostEnergyRef.current);
      }
    }

    // Apply mobile look deltas
    if (mobileInput.isMobile) {
      const scale = sensoryRef.current ? 0.4 : 1.0;
      yaw.current -= mobileInput.lookDeltaX * scale;
      pitch.current -= mobileInput.lookDeltaY * scale;
      pitch.current = Math.max(
        -Math.PI / 2.2,
        Math.min(Math.PI / 2.2, pitch.current),
      );
      mobileInput.lookDeltaX = 0;
      mobileInput.lookDeltaY = 0;
    }

    // Slash
    let doSlash = false;
    if (mobileInput.isMobile) {
      if (
        mobileInput.slash &&
        !mobileInput.slashConsumed &&
        !isSlashingRef.current
      ) {
        doSlash = true;
        mobileInput.slashConsumed = true;
        mobileInput.slash = false;
      }
    } else {
      if (
        mouseButtons.current[0] &&
        !slashPressed.current &&
        !isSlashingRef.current
      ) {
        doSlash = true;
        slashPressed.current = true;
      } else if (!mouseButtons.current[0]) {
        slashPressed.current = false;
      }
    }

    if (doSlash) {
      isSlashingRef.current = true;
      slashTimerRef.current = 0.25;
      setIsSlashing(true);
      const forward = new THREE.Vector3(0, 0, -1).applyEuler(
        new THREE.Euler(0, yaw.current, 0),
      );
      enemyPositions.forEach((enemy, i) => {
        if (!enemy.alive) return;
        const toEnemy = new THREE.Vector3().subVectors(enemy.pos, pos.current);
        const dist = toEnemy.length();
        if (dist <= SLASH_RANGE) {
          toEnemy.normalize();
          const angle = Math.acos(
            Math.max(-1, Math.min(1, forward.dot(toEnemy))),
          );
          if (angle <= SLASH_CONE / 2) {
            onEnemyKilled(i);
          }
        }
      });
    }

    if (slashTimerRef.current > 0) {
      slashTimerRef.current -= dt;
      if (slashTimerRef.current <= 0) {
        isSlashingRef.current = false;
        setIsSlashing(false);
      }
    }

    // Grapple
    let doGrapple = false;
    if (mobileInput.isMobile) {
      if (mobileInput.grapple && !mobileInput.grappleConsumed) {
        doGrapple = true;
        mobileInput.grappleConsumed = true;
      }
    } else {
      if (keys.current.KeyE && !grapplePressed.current) {
        doGrapple = true;
        grapplePressed.current = true;
      } else if (!keys.current.KeyE) {
        grapplePressed.current = false;
      }
    }

    if (doGrapple && grappleAnchors.length > 0) {
      let nearest = grappleAnchors[0];
      let minDist = pos.current.distanceTo(grappleAnchors[0]);
      for (const anchor of grappleAnchors) {
        const d = pos.current.distanceTo(anchor);
        if (d < minDist) {
          minDist = d;
          nearest = anchor;
        }
      }
      if (minDist < 30) {
        isGrappling.current = true;
        grappleTarget.current.copy(nearest);
        vel.current.set(0, 0, 0);
      }
    }

    if (isGrappling.current) {
      const toTarget = new THREE.Vector3().subVectors(
        grappleTarget.current,
        pos.current,
      );
      const dist = toTarget.length();
      if (dist < 1.5) {
        isGrappling.current = false;
        jumpCount.current = 0;
      } else {
        toTarget.normalize().multiplyScalar(22);
        vel.current.lerp(toTarget, dt * 5);
        pos.current.addScaledVector(vel.current, dt);
        const euler = new THREE.Euler(pitch.current, yaw.current, 0, "YXZ");
        camera.position
          .copy(pos.current)
          .add(new THREE.Vector3(0, PLAYER_HEIGHT / 2, 0));
        camera.rotation.copy(euler);
        return;
      }
    }

    // Wall running
    if (isWallRunning.current) {
      wallRunTimer.current -= dt;
      if (wallRunTimer.current <= 0) {
        isWallRunning.current = false;
      } else {
        vel.current.y = 0;
        const forward = new THREE.Vector3(0, 0, -1).applyEuler(
          new THREE.Euler(0, yaw.current, 0),
        );
        vel.current.copy(forward.multiplyScalar(MOVE_SPEED));
        jumpCount.current = 0;
      }
    }

    // Gravity
    if (!isWallRunning.current) {
      vel.current.y += GRAVITY * dt;
    }

    // Movement input
    const inputDir = new THREE.Vector3();
    if (mobileInput.isMobile) {
      inputDir.x = mobileInput.move.x;
      inputDir.z = mobileInput.move.y; // joystick Y maps to world Z
    } else {
      if (keys.current.KeyW) inputDir.z -= 1;
      if (keys.current.KeyS) inputDir.z += 1;
      if (keys.current.KeyA) inputDir.x -= 1;
      if (keys.current.KeyD) inputDir.x += 1;
      if (inputDir.length() > 0) inputDir.normalize();
    }
    inputDir.applyEuler(new THREE.Euler(0, yaw.current, 0));

    // Dash
    let doDash = false;
    if (mobileInput.isMobile) {
      if (
        mobileInput.dash &&
        !mobileInput.dashConsumed &&
        dashCooldownRef.current <= 0
      ) {
        doDash = true;
        mobileInput.dashConsumed = true;
      }
    } else {
      if (
        (keys.current.ShiftLeft || keys.current.ShiftRight) &&
        !dashPressed.current &&
        dashCooldownRef.current <= 0
      ) {
        doDash = true;
        dashPressed.current = true;
      } else if (!keys.current.ShiftLeft && !keys.current.ShiftRight) {
        dashPressed.current = false;
      }
    }

    if (doDash) {
      const dashDir =
        inputDir.length() > 0
          ? inputDir.clone()
          : new THREE.Vector3(0, 0, -1).applyEuler(
              new THREE.Euler(0, yaw.current, 0),
            );
      vel.current.copy(dashDir.multiplyScalar(DASH_FORCE));
      dashCooldownRef.current = 1.5;
      setDashCooldown(1.5);
    }

    // Horizontal velocity
    if (!isWallRunning.current) {
      const targetVelX = inputDir.x * MOVE_SPEED;
      const targetVelZ = inputDir.z * MOVE_SPEED;
      const lerpFactor = onGround.current ? 15 : 5;
      vel.current.x = THREE.MathUtils.lerp(
        vel.current.x,
        targetVelX,
        lerpFactor * dt,
      );
      vel.current.z = THREE.MathUtils.lerp(
        vel.current.z,
        targetVelZ,
        lerpFactor * dt,
      );
    }

    // Jump
    let jumpNow = false;
    if (mobileInput.isMobile) {
      jumpNow = mobileInput.jump && !mobileInput.jumpConsumed;
    } else {
      jumpNow = !!keys.current.Space && !spaceWasPressed.current;
    }

    if (jumpNow) {
      if (mobileInput.isMobile) mobileInput.jumpConsumed = true;
      if (onGround.current) {
        vel.current.y = JUMP_FORCE;
        jumpCount.current = 1;
        onGround.current = false;
      } else if (isWallRunning.current) {
        vel.current.y = JUMP_FORCE * 0.9;
        vel.current.addScaledVector(wallRunNormal.current, JUMP_FORCE * 0.7);
        isWallRunning.current = false;
        jumpCount.current = 1;
      } else if (jumpCount.current < 2) {
        vel.current.y = JUMP_FORCE * 0.85;
        jumpCount.current += 1;
      }
    }
    if (!mobileInput.isMobile) {
      spaceWasPressed.current = !!keys.current.Space;
    }

    // Move player
    const nextPos = pos.current.clone().addScaledVector(vel.current, dt);

    // Collision detection
    onGround.current = false;
    let newWallRun = false;

    for (const platform of platforms) {
      const overlap = getOverlap(nextPos, platform);
      if (!overlap) continue;
      const { ox, oy, oz, dx, dy, dz } = overlap;
      const minOverlap = Math.min(ox, oy, oz);
      if (minOverlap === oy) {
        if (dy > 0) {
          nextPos.y =
            platform.pos[1] + platform.size[1] / 2 + PLAYER_HEIGHT / 2;
          if (vel.current.y < 0) vel.current.y = 0;
          onGround.current = true;
          jumpCount.current = 0;
        } else {
          nextPos.y =
            platform.pos[1] - platform.size[1] / 2 - PLAYER_HEIGHT / 2;
          if (vel.current.y > 0) vel.current.y = 0;
        }
      } else if (minOverlap === ox) {
        const wallNorm = new THREE.Vector3(Math.sign(dx), 0, 0);
        if (!onGround.current && jumpCount.current >= 1) {
          newWallRun = true;
          wallRunNormal.current.copy(wallNorm);
          wallRunTimer.current = WALL_RUN_DURATION;
        }
        nextPos.x =
          platform.pos[0] +
          Math.sign(dx) * (platform.size[0] / 2 + PLAYER_RADIUS);
        vel.current.x = 0;
      } else {
        const wallNorm = new THREE.Vector3(0, 0, Math.sign(dz));
        if (!onGround.current && jumpCount.current >= 1) {
          newWallRun = true;
          wallRunNormal.current.copy(wallNorm);
          wallRunTimer.current = WALL_RUN_DURATION;
        }
        nextPos.z =
          platform.pos[2] +
          Math.sign(dz) * (platform.size[2] / 2 + PLAYER_RADIUS);
        vel.current.z = 0;
      }
    }

    if (newWallRun && !onGround.current) {
      isWallRunning.current = true;
    } else if (onGround.current) {
      isWallRunning.current = false;
    }

    pos.current.copy(nextPos);

    // Death fall
    if (pos.current.y < -20) {
      die();
      return;
    }

    // Check projectile hits
    for (const proj of projectiles) {
      if (!proj.alive) continue;
      const dist = pos.current.distanceTo(proj.pos);
      if (dist < 0.8) {
        proj.alive = false;
        die();
        return;
      }
    }

    // Victory zone check
    const vz = victoryZone;
    const vdx = Math.abs(pos.current.x - vz.pos[0]);
    const vdy = Math.abs(pos.current.y - vz.pos[1]);
    const vdz = Math.abs(pos.current.z - vz.pos[2]);
    if (
      vdx < vz.size[0] / 2 &&
      vdy < vz.size[1] / 2 + 1 &&
      vdz < vz.size[2] / 2
    ) {
      setGameState("victory");
      if (!mobileInput.isMobile) document.exitPointerLock();
    }

    // Update camera
    const euler = new THREE.Euler(pitch.current, yaw.current, 0, "YXZ");
    camera.position
      .copy(pos.current)
      .add(new THREE.Vector3(0, PLAYER_HEIGHT / 2, 0));
    camera.rotation.copy(euler);
  });

  return null;
}
