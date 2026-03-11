import { GameCanvas } from "./game/GameCanvas";
import { DeadScreen } from "./game/screens/DeadScreen";
import { MenuScreen } from "./game/screens/MenuScreen";
import { VictoryScreen } from "./game/screens/VictoryScreen";
import { useGameStore } from "./game/store";

export default function App() {
  const { gameState } = useGameStore();

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        background: "#010308",
      }}
    >
      {/* Always render game canvas so 3D scene is ready */}
      {gameState !== "menu" && <GameCanvas />}

      {/* Screen overlays */}
      {gameState === "menu" && <MenuScreen />}
      {gameState === "dead" && (
        <>
          <GameCanvas />
          <DeadScreen />
        </>
      )}
      {gameState === "victory" && (
        <>
          <GameCanvas />
          <VictoryScreen />
        </>
      )}
    </div>
  );
}
