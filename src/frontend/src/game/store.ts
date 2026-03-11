import { create } from "zustand";

export type GameState = "menu" | "playing" | "dead" | "victory";

export interface LeaderboardEntry {
  playerName: string;
  completionTime: number;
  deaths: number;
}

export interface CheckpointData {
  position: [number, number, number];
}

interface GameStore {
  gameState: GameState;
  deaths: number;
  startTime: number;
  elapsedTime: number;
  playerName: string;
  leaderboard: LeaderboardEntry[];
  checkpointPosition: [number, number, number];
  sensoryBoost: boolean;
  boostEnergy: number; // 0-100
  dashCooldown: number; // 0 = ready, >0 = seconds until ready
  isSlashing: boolean;
  deathFlash: boolean;

  setGameState: (state: GameState) => void;
  incrementDeaths: () => void;
  resetRun: () => void;
  setPlayerName: (name: string) => void;
  setLeaderboard: (entries: LeaderboardEntry[]) => void;
  setCheckpoint: (pos: [number, number, number]) => void;
  setSensoryBoost: (active: boolean) => void;
  setBoostEnergy: (energy: number) => void;
  setDashCooldown: (cd: number) => void;
  setIsSlashing: (v: boolean) => void;
  setDeathFlash: (v: boolean) => void;
  tickTimer: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  gameState: "menu",
  deaths: 0,
  startTime: 0,
  elapsedTime: 0,
  playerName: "",
  leaderboard: [],
  checkpointPosition: [0, 2, 0],
  sensoryBoost: false,
  boostEnergy: 100,
  dashCooldown: 0,
  isSlashing: false,
  deathFlash: false,

  setGameState: (state) => set({ gameState: state }),
  incrementDeaths: () => set((s) => ({ deaths: s.deaths + 1 })),
  resetRun: () =>
    set({
      deaths: 0,
      startTime: Date.now(),
      elapsedTime: 0,
      checkpointPosition: [0, 2, 0],
      boostEnergy: 100,
      dashCooldown: 0,
      sensoryBoost: false,
    }),
  setPlayerName: (name) => set({ playerName: name }),
  setLeaderboard: (entries) => set({ leaderboard: entries }),
  setCheckpoint: (pos) => set({ checkpointPosition: pos }),
  setSensoryBoost: (active) => set({ sensoryBoost: active }),
  setBoostEnergy: (energy) =>
    set({ boostEnergy: Math.max(0, Math.min(100, energy)) }),
  setDashCooldown: (cd) => set({ dashCooldown: cd }),
  setIsSlashing: (v) => set({ isSlashing: v }),
  setDeathFlash: (v) => set({ deathFlash: v }),
  tickTimer: () => {
    const { startTime, gameState } = get();
    if (gameState === "playing") {
      set({ elapsedTime: (Date.now() - startTime) / 1000 });
    }
  },
}));
