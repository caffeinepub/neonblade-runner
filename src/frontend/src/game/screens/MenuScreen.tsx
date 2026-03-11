import { useState } from "react";
import { mobileInput } from "../mobileInput";
import { useGameStore } from "../store";

export function MenuScreen() {
  const { setGameState, resetRun, setPlayerName, playerName } = useGameStore();
  const [name, setName] = useState(playerName || "");

  const handleStart = () => {
    setPlayerName(name || "GHOST");
    resetRun();
    setGameState("playing");
    if (!mobileInput.isMobile) {
      document.body.requestPointerLock();
    }
  };

  const desktopControls = [
    ["WASD", "Move"],
    ["MOUSE", "Look"],
    ["SPACE", "Jump (×2)"],
    ["SHIFT", "Dash"],
    ["E", "Grapple Hook"],
    ["LMB", "Sword Slash"],
    ["RMB HOLD", "Slow Time"],
    ["ESC", "Exit Lock"],
  ];

  const mobileControls = [
    ["LEFT THUMB", "Move"],
    ["RIGHT DRAG", "Look"],
    ["⬆ JUMP", "Jump (×2)"],
    ["» DASH", "Cyber Dash"],
    ["🪝 GRAPPLE", "Grapple Hook"],
    ["⚔ SLASH", "Sword Slash"],
    ["⏱ SLOW", "Slow Time"],
  ];

  const controls = mobileInput.isMobile ? mobileControls : desktopControls;

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center scanlines"
      style={{
        background:
          "linear-gradient(to bottom, #010308 0%, #020510 40%, #010308 100%)",
        zIndex: 100,
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "url('/assets/generated/neonblade-hero.dim_1920x1080.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.25,
        }}
      />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{ overflow: "hidden" }}
      >
        {[15, 35, 55, 75, 90].map((top) => (
          <div
            key={top}
            style={{
              position: "absolute",
              top: `${top}%`,
              left: 0,
              right: 0,
              height: "1px",
              background:
                top % 2 === 0 ? "rgba(0,255,255,0.06)" : "rgba(255,0,255,0.04)",
            }}
          />
        ))}
      </div>

      <div
        className="relative flex flex-col items-center"
        style={{ maxWidth: 600, width: "100%", padding: "0 24px" }}
      >
        <div
          style={{
            color: "rgba(0,255,255,0.6)",
            fontSize: "11px",
            letterSpacing: "0.5em",
            textTransform: "uppercase",
            marginBottom: 12,
            fontFamily: "'Geist Mono', monospace",
          }}
        >
          ◈ CYBERPUNK RUNNER ◈
        </div>

        <div
          className="glitch-text"
          data-text="NEONBLADE"
          style={{ marginBottom: 4 }}
        >
          <h1
            style={{
              fontSize: "clamp(48px, 8vw, 96px)",
              fontWeight: 900,
              letterSpacing: "-0.02em",
              color: "#00ffff",
              textShadow:
                "0 0 20px #00ffff, 0 0 40px #00ffff80, 0 0 80px #00ffff40",
              fontFamily: "'Geist Mono', monospace",
              lineHeight: 1,
              margin: 0,
            }}
          >
            NEONBLADE
          </h1>
        </div>
        <h2
          style={{
            fontSize: "clamp(14px, 2.5vw, 22px)",
            fontWeight: 300,
            letterSpacing: "0.4em",
            color: "#ff00ff",
            textShadow: "0 0 10px #ff00ff, 0 0 20px #ff00ff60",
            fontFamily: "'Geist Mono', monospace",
            margin: "0 0 40px 0",
            textTransform: "uppercase",
          }}
        >
          RUNNER
        </h2>

        <div style={{ marginBottom: 28, width: "100%", maxWidth: 320 }}>
          <div
            style={{
              color: "rgba(0,255,255,0.5)",
              fontSize: "10px",
              letterSpacing: "0.3em",
              marginBottom: 8,
            }}
          >
            OPERATIVE ID
          </div>
          <input
            data-ocid="menu.input"
            value={name}
            onChange={(e) => setName(e.target.value.toUpperCase().slice(0, 16))}
            placeholder="ENTER CALLSIGN"
            maxLength={16}
            style={{
              width: "100%",
              background: "rgba(0,255,255,0.04)",
              border: "1px solid rgba(0,255,255,0.3)",
              color: "#00ffff",
              fontFamily: "'Geist Mono', monospace",
              fontSize: "16px",
              letterSpacing: "0.2em",
              padding: "10px 16px",
              outline: "none",
              clipPath:
                "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleStart();
            }}
          />
        </div>

        <button
          type="button"
          data-ocid="menu.primary_button"
          onClick={handleStart}
          className="cyber-btn"
          style={{ fontSize: "16px", marginBottom: 40, padding: "14px 48px" }}
        >
          ▶ INITIATE RUN
        </button>

        <div
          style={{
            border: "1px solid rgba(0,255,255,0.15)",
            padding: "20px 28px",
            width: "100%",
            maxWidth: 480,
            background: "rgba(0,10,20,0.7)",
          }}
        >
          <div
            style={{
              color: "rgba(0,255,255,0.5)",
              fontSize: "10px",
              letterSpacing: "0.3em",
              marginBottom: 14,
              textAlign: "center",
            }}
          >
            {mobileInput.isMobile ? "TOUCH CONTROLS" : "CONTROLS"}
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "8px 24px",
            }}
          >
            {controls.map(([key, action]) => (
              <div
                key={key}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    color: "#00ffff",
                    fontSize: "11px",
                    letterSpacing: "0.1em",
                    padding: "2px 8px",
                    border: "1px solid rgba(0,255,255,0.3)",
                    background: "rgba(0,255,255,0.05)",
                    minWidth: 80,
                    textAlign: "center",
                  }}
                >
                  {key}
                </span>
                <span
                  style={{
                    color: "rgba(255,255,255,0.5)",
                    fontSize: "11px",
                    letterSpacing: "0.1em",
                  }}
                >
                  {action}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            marginTop: 32,
            color: "rgba(255,255,255,0.2)",
            fontSize: "10px",
            letterSpacing: "0.2em",
            textAlign: "center",
          }}
        >
          © {new Date().getFullYear()}. BUILT WITH LOVE USING{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noreferrer"
            style={{ color: "rgba(0,255,255,0.4)", textDecoration: "none" }}
          >
            CAFFEINE.AI
          </a>
        </div>
      </div>
    </div>
  );
}
