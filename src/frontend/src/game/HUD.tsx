import { useEffect, useRef } from "react";
import { mobileInput } from "./mobileInput";
import { useGameStore } from "./store";

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 10);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}.${ms}`;
}

export function HUD() {
  const {
    deaths,
    elapsedTime,
    boostEnergy,
    dashCooldown,
    sensoryBoost,
    isSlashing,
    deathFlash,
  } = useGameStore();
  const flashRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (deathFlash && flashRef.current) {
      flashRef.current.style.animation = "none";
      void flashRef.current.offsetWidth;
      flashRef.current.style.animation = "death-flash 0.6s ease-out forwards";
    }
  }, [deathFlash]);

  return (
    <div
      className="fixed inset-0 pointer-events-none z-10"
      style={{ fontFamily: "'Geist Mono', monospace" }}
    >
      {/* Death flash overlay */}
      <div
        ref={flashRef}
        className="absolute inset-0 pointer-events-none"
        style={{ background: "#ff002080", opacity: 0 }}
      />

      {/* Sensory boost overlay */}
      {sensoryBoost && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 40%, rgba(0,100,255,0.15) 100%)",
            border: "2px solid rgba(0,150,255,0.3)",
          }}
        />
      )}

      {/* Top Left: Deaths */}
      <div
        data-ocid="hud.deaths"
        className="absolute top-6 left-6 hud-panel px-4 py-2"
      >
        <div
          style={{
            color: "#ff4466",
            fontSize: "10px",
            letterSpacing: "0.2em",
            marginBottom: 2,
          }}
        >
          DEATHS
        </div>
        <div
          style={{
            color: "#ff4466",
            fontSize: "28px",
            fontWeight: 700,
            textShadow: "0 0 10px #ff4466",
          }}
        >
          {deaths.toString().padStart(3, "0")}
        </div>
      </div>

      {/* Top Right: Timer */}
      <div
        data-ocid="hud.timer"
        className="absolute top-6 right-6 hud-panel px-4 py-2"
        style={{ textAlign: "right" }}
      >
        <div
          style={{
            color: "#00ffff",
            fontSize: "10px",
            letterSpacing: "0.2em",
            marginBottom: 2,
          }}
        >
          RUN TIME
        </div>
        <div
          style={{
            color: "#00ffff",
            fontSize: "22px",
            fontWeight: 700,
            textShadow: "0 0 10px #00ffff",
          }}
        >
          {formatTime(elapsedTime)}
        </div>
      </div>

      {/* Bottom Left: Abilities */}
      <div className="absolute bottom-8 left-6 flex gap-3 items-end">
        {/* Sensory Boost */}
        <div
          data-ocid="hud.boost_bar"
          className="hud-panel p-3"
          style={{ width: 60 }}
        >
          <div
            style={{
              color: "#4488ff",
              fontSize: "8px",
              letterSpacing: "0.15em",
              marginBottom: 4,
              textAlign: "center",
            }}
          >
            BOOST
          </div>
          <div
            style={{
              width: "100%",
              height: 8,
              background: "rgba(0,0,50,0.8)",
              border: "1px solid rgba(68,136,255,0.4)",
              borderRadius: 2,
            }}
          >
            <div
              style={{
                width: `${boostEnergy}%`,
                height: "100%",
                background: sensoryBoost ? "#4488ff" : "#2255aa",
                boxShadow: sensoryBoost ? "0 0 8px #4488ff" : "none",
                transition: "width 0.1s",
                borderRadius: 2,
              }}
            />
          </div>
          <div
            style={{
              color: "#4488ff",
              fontSize: "9px",
              textAlign: "center",
              marginTop: 3,
            }}
          >
            {Math.round(boostEnergy)}%
          </div>
        </div>

        {/* Dash */}
        <div
          data-ocid="hud.dash_toggle"
          className="hud-panel p-3"
          style={{ width: 60, textAlign: "center" }}
        >
          <div
            style={{
              color: dashCooldown > 0 ? "#666" : "#00ffff",
              fontSize: "8px",
              letterSpacing: "0.15em",
              marginBottom: 4,
            }}
          >
            DASH
          </div>
          <div
            style={{
              width: 28,
              height: 28,
              margin: "0 auto",
              borderRadius: "50%",
              background:
                dashCooldown > 0 ? "rgba(0,50,50,0.5)" : "rgba(0,255,255,0.1)",
              border: `2px solid ${dashCooldown > 0 ? "#334" : "#00ffff"}`,
              boxShadow: dashCooldown > 0 ? "none" : "0 0 10px #00ffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "8px",
              color: dashCooldown > 0 ? "#666" : "#00ffff",
            }}
          >
            {dashCooldown > 0 ? dashCooldown.toFixed(1) : "RDY"}
          </div>
        </div>

        {/* Slash */}
        <div
          className="hud-panel p-3"
          style={{ width: 60, textAlign: "center" }}
        >
          <div
            style={{
              color: isSlashing ? "#ff00ff" : "#884488",
              fontSize: "8px",
              letterSpacing: "0.15em",
              marginBottom: 4,
            }}
          >
            SLASH
          </div>
          <div
            style={{
              width: 28,
              height: 28,
              margin: "0 auto",
              borderRadius: "50%",
              background: isSlashing
                ? "rgba(255,0,255,0.2)"
                : "rgba(80,0,80,0.3)",
              border: `2px solid ${isSlashing ? "#ff00ff" : "#440044"}`,
              boxShadow: isSlashing ? "0 0 15px #ff00ff" : "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "14px",
            }}
          >
            ⚔
          </div>
        </div>
      </div>

      {/* Crosshair */}
      <div
        className="absolute"
        style={{
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 24,
          height: 24,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: 0,
            right: 0,
            height: 1,
            background: isSlashing ? "#ff00ff" : "#00ffff",
            opacity: 0.8,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: 0,
            bottom: 0,
            width: 1,
            background: isSlashing ? "#ff00ff" : "#00ffff",
            opacity: 0.8,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 4,
            height: 4,
            borderRadius: "50%",
            background: isSlashing ? "#ff00ff" : "#00ffff",
            boxShadow: isSlashing ? "0 0 8px #ff00ff" : "0 0 5px #00ffff",
          }}
        />
      </div>

      {/* Pointer lock hint - desktop only */}
      {!mobileInput.isMobile && (
        <div
          className="absolute bottom-8 right-6 hud-panel px-3 py-2"
          style={{
            fontSize: "9px",
            color: "rgba(0,255,255,0.4)",
            lineHeight: 1.6,
          }}
        >
          <div>CLICK TO LOCK MOUSE</div>
          <div>E - GRAPPLE │ SHIFT - DASH</div>
          <div>RMB - SLOW TIME</div>
        </div>
      )}
    </div>
  );
}
