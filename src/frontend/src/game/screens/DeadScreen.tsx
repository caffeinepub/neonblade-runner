import { useGameStore } from "../store";

export function DeadScreen() {
  const { deaths, elapsedTime, setGameState, setDeathFlash } = useGameStore();

  const m = Math.floor(elapsedTime / 60);
  const s = Math.floor(elapsedTime % 60);
  const timeStr = `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;

  const handleRespawn = () => {
    setDeathFlash(false);
    setGameState("playing");
    document.body.requestPointerLock();
  };

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center scanlines"
      style={{
        background: "rgba(8, 0, 0, 0.92)",
        zIndex: 200,
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, rgba(255,0,0,0.05) 0%, rgba(80,0,0,0.3) 50%, rgba(255,0,0,0.05) 100%)",
        }}
      />

      <div className="relative flex flex-col items-center" style={{ gap: 16 }}>
        <div
          className="glitch-text"
          data-text="SYSTEM FAILURE"
          style={{ marginBottom: 8 }}
        >
          <div
            style={{
              fontSize: "clamp(36px, 6vw, 72px)",
              fontWeight: 900,
              letterSpacing: "0.1em",
              color: "#ff2244",
              textShadow: "0 0 20px #ff2244, 0 0 40px #ff224480",
              fontFamily: "'Geist Mono', monospace",
            }}
          >
            SYSTEM FAILURE
          </div>
        </div>

        <div
          style={{
            color: "rgba(255,100,100,0.7)",
            fontSize: "13px",
            letterSpacing: "0.4em",
            textTransform: "uppercase",
            marginBottom: 24,
          }}
        >
          OPERATIVE TERMINATED
        </div>

        <div
          style={{
            display: "flex",
            gap: 32,
            border: "1px solid rgba(255,34,68,0.3)",
            padding: "16px 32px",
            background: "rgba(30,0,0,0.6)",
            marginBottom: 32,
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                color: "rgba(255,100,100,0.5)",
                fontSize: "9px",
                letterSpacing: "0.3em",
                marginBottom: 6,
              }}
            >
              TOTAL DEATHS
            </div>
            <div
              style={{
                color: "#ff2244",
                fontSize: "40px",
                fontWeight: 700,
                textShadow: "0 0 15px #ff2244",
              }}
            >
              {deaths.toString().padStart(3, "0")}
            </div>
          </div>
          <div style={{ width: 1, background: "rgba(255,34,68,0.3)" }} />
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                color: "rgba(255,100,100,0.5)",
                fontSize: "9px",
                letterSpacing: "0.3em",
                marginBottom: 6,
              }}
            >
              RUN TIME
            </div>
            <div
              style={{ color: "#ff6644", fontSize: "40px", fontWeight: 700 }}
            >
              {timeStr}
            </div>
          </div>
        </div>

        <button
          type="button"
          data-ocid="dead.primary_button"
          onClick={handleRespawn}
          className="cyber-btn cyber-btn-magenta"
          style={{
            fontSize: "15px",
            padding: "14px 48px",
            borderColor: "#ff2244",
            color: "#ff2244",
          }}
        >
          ↺ RESPAWN AT CHECKPOINT
        </button>
      </div>
    </div>
  );
}
