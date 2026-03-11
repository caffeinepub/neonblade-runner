import { useEffect, useState } from "react";
import { useActor } from "../../hooks/useActor";
import { useGameStore } from "../store";

export function VictoryScreen() {
  const {
    deaths,
    elapsedTime,
    playerName,
    setGameState,
    resetRun,
    leaderboard,
    setLeaderboard,
  } = useGameStore();
  const { actor } = useActor();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadingScores, setLoadingScores] = useState(false);

  const m = Math.floor(elapsedTime / 60);
  const s = Math.floor(elapsedTime % 60);
  const ms = Math.floor((elapsedTime % 1) * 100);
  const timeStr = `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}.${ms.toString().padStart(2, "0")}`;

  useEffect(() => {
    if (!actor) return;
    const loadScores = async () => {
      setLoadingScores(true);
      try {
        const scores = await actor.getTopScores();
        const mapped = scores.map((sc) => ({
          playerName: sc.playerName,
          completionTime: Number(sc.completionTime),
          deaths: Number(sc.deaths),
        }));
        setLeaderboard(mapped);
      } catch (e) {
        console.error("Failed to load scores", e);
      } finally {
        setLoadingScores(false);
      }
    };
    loadScores();
  }, [actor, setLeaderboard]);

  const handleSubmit = async () => {
    if (submitted || !actor) return;
    setSubmitting(true);
    try {
      await actor.submitScore(
        playerName || "GHOST",
        BigInt(Math.floor(elapsedTime)),
        BigInt(deaths),
      );
      const scores = await actor.getTopScores();
      const mapped = scores.map((sc) => ({
        playerName: sc.playerName,
        completionTime: Number(sc.completionTime),
        deaths: Number(sc.deaths),
      }));
      setLeaderboard(mapped);
      setSubmitted(true);
    } catch (e) {
      console.error("Submit error", e);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePlayAgain = () => {
    resetRun();
    setGameState("playing");
    document.body.requestPointerLock();
  };

  const formatLeaderTime = (secs: number) => {
    const m2 = Math.floor(secs / 60);
    const s2 = Math.floor(secs % 60);
    return `${m2.toString().padStart(2, "0")}:${s2.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center scanlines"
      style={{
        background: "rgba(0, 8, 4, 0.95)",
        zIndex: 200,
        overflowY: "auto",
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(0,255,100,0.08) 0%, transparent 70%)",
        }}
      />

      <div
        className="relative flex flex-col items-center"
        style={{ gap: 12, padding: "32px 24px", maxWidth: 640, width: "100%" }}
      >
        <div
          style={{
            color: "rgba(0,255,100,0.5)",
            fontSize: "11px",
            letterSpacing: "0.5em",
            marginBottom: 8,
          }}
        >
          ◈ MISSION COMPLETE ◈
        </div>

        <div className="glitch-text" data-text="VICTORY">
          <div
            style={{
              fontSize: "clamp(48px, 8vw, 88px)",
              fontWeight: 900,
              letterSpacing: "0.05em",
              color: "#00ff80",
              textShadow:
                "0 0 20px #00ff80, 0 0 40px #00ff8080, 0 0 80px #00ff8040",
              fontFamily: "'Geist Mono', monospace",
              lineHeight: 1,
              marginBottom: 8,
            }}
          >
            VICTORY
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 32,
            border: "1px solid rgba(0,255,128,0.3)",
            padding: "16px 32px",
            background: "rgba(0,20,10,0.7)",
            marginBottom: 8,
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                color: "rgba(0,255,128,0.5)",
                fontSize: "9px",
                letterSpacing: "0.3em",
                marginBottom: 6,
              }}
            >
              COMPLETION TIME
            </div>
            <div
              style={{
                color: "#00ff80",
                fontSize: "32px",
                fontWeight: 700,
                textShadow: "0 0 10px #00ff80",
              }}
            >
              {timeStr}
            </div>
          </div>
          <div style={{ width: 1, background: "rgba(0,255,128,0.2)" }} />
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                color: "rgba(0,255,128,0.5)",
                fontSize: "9px",
                letterSpacing: "0.3em",
                marginBottom: 6,
              }}
            >
              DEATHS
            </div>
            <div
              style={{
                color: deaths === 0 ? "#00ff80" : "#ffaa00",
                fontSize: "32px",
                fontWeight: 700,
              }}
            >
              {deaths.toString().padStart(3, "0")}
            </div>
          </div>
          <div style={{ width: 1, background: "rgba(0,255,128,0.2)" }} />
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                color: "rgba(0,255,128,0.5)",
                fontSize: "9px",
                letterSpacing: "0.3em",
                marginBottom: 6,
              }}
            >
              OPERATIVE
            </div>
            <div
              style={{
                color: "#00ffff",
                fontSize: "18px",
                fontWeight: 700,
                letterSpacing: "0.1em",
              }}
            >
              {playerName || "GHOST"}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 16,
            marginBottom: 24,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {!submitted ? (
            <button
              type="button"
              data-ocid="victory.submit_button"
              onClick={handleSubmit}
              disabled={submitting || !actor}
              className="cyber-btn"
              style={{ fontSize: "13px", padding: "12px 32px" }}
            >
              {submitting ? "UPLOADING..." : "◈ SUBMIT SCORE"}
            </button>
          ) : (
            <div
              style={{
                color: "#00ff80",
                fontSize: "12px",
                letterSpacing: "0.3em",
                padding: "12px 24px",
                border: "1px solid rgba(0,255,128,0.3)",
              }}
            >
              ✓ SCORE UPLOADED
            </div>
          )}
          <button
            type="button"
            onClick={handlePlayAgain}
            className="cyber-btn cyber-btn-magenta"
            style={{ fontSize: "13px", padding: "12px 32px" }}
          >
            ↺ RUN AGAIN
          </button>
          <button
            type="button"
            onClick={() => setGameState("menu")}
            className="cyber-btn"
            style={{
              fontSize: "13px",
              padding: "12px 32px",
              borderColor: "rgba(0,255,255,0.3)",
              color: "rgba(0,255,255,0.6)",
            }}
          >
            ⌂ MAIN MENU
          </button>
        </div>

        <div style={{ width: "100%", maxWidth: 560 }}>
          <div
            style={{
              color: "rgba(0,255,255,0.5)",
              fontSize: "10px",
              letterSpacing: "0.4em",
              marginBottom: 12,
              textAlign: "center",
            }}
          >
            ◈ GLOBAL LEADERBOARD ◈
          </div>
          <div
            data-ocid="victory.leaderboard.table"
            style={{
              border: "1px solid rgba(0,255,255,0.15)",
              background: "rgba(0,10,20,0.8)",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "48px 1fr 1fr 80px",
                padding: "8px 16px",
                borderBottom: "1px solid rgba(0,255,255,0.1)",
                color: "rgba(0,255,255,0.4)",
                fontSize: "9px",
                letterSpacing: "0.3em",
              }}
            >
              <span>RANK</span>
              <span>OPERATIVE</span>
              <span>TIME</span>
              <span style={{ textAlign: "right" }}>DEATHS</span>
            </div>
            {loadingScores ? (
              <div
                style={{
                  color: "rgba(0,255,255,0.3)",
                  fontSize: "11px",
                  textAlign: "center",
                  padding: "20px",
                  letterSpacing: "0.2em",
                }}
              >
                ACCESSING NEURAL DATABASE...
              </div>
            ) : leaderboard.length === 0 ? (
              <div
                style={{
                  color: "rgba(0,255,255,0.3)",
                  fontSize: "11px",
                  textAlign: "center",
                  padding: "20px",
                  letterSpacing: "0.2em",
                }}
              >
                NO RECORDS FOUND
              </div>
            ) : (
              leaderboard.slice(0, 10).map((entry, i) => (
                <div
                  key={entry.playerName + entry.completionTime}
                  data-ocid={`victory.leaderboard.row.${i + 1}`}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "48px 1fr 1fr 80px",
                    padding: "10px 16px",
                    borderBottom:
                      i < leaderboard.length - 1
                        ? "1px solid rgba(0,255,255,0.06)"
                        : "none",
                    background:
                      i === 0 ? "rgba(0,255,128,0.04)" : "transparent",
                    color:
                      i === 0
                        ? "#00ff80"
                        : i < 3
                          ? "rgba(0,255,255,0.8)"
                          : "rgba(255,255,255,0.5)",
                    fontSize: "12px",
                    letterSpacing: "0.05em",
                  }}
                >
                  <span style={{ fontWeight: 700 }}>
                    #{(i + 1).toString().padStart(2, "0")}
                  </span>
                  <span style={{ letterSpacing: "0.1em" }}>
                    {entry.playerName}
                  </span>
                  <span>{formatLeaderTime(entry.completionTime)}</span>
                  <span style={{ textAlign: "right" }}>{entry.deaths}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div
          style={{
            marginTop: 20,
            color: "rgba(255,255,255,0.15)",
            fontSize: "9px",
            letterSpacing: "0.2em",
            textAlign: "center",
          }}
        >
          © {new Date().getFullYear()}. BUILT WITH LOVE USING{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noreferrer"
            style={{ color: "rgba(0,255,255,0.3)", textDecoration: "none" }}
          >
            CAFFEINE.AI
          </a>
        </div>
      </div>
    </div>
  );
}
