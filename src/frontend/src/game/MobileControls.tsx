import { useRef, useState } from "react";
import { mobileInput } from "./mobileInput";

interface JoystickState {
  active: boolean;
  baseX: number;
  baseY: number;
  knobX: number;
  knobY: number;
  pointerId: number;
}

const BTN_STYLE_BASE: React.CSSProperties = {
  position: "absolute",
  borderRadius: "50%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  background: "rgba(0, 10, 30, 0.85)",
  cursor: "pointer",
  userSelect: "none",
  WebkitUserSelect: "none",
  touchAction: "none",
};

interface ActionButtonProps {
  label: string;
  icon: string;
  size: number;
  bottom: number;
  right: number;
  color: string;
  onPress: () => void;
  onRelease: () => void;
}

function ActionButton({
  label,
  icon,
  size,
  bottom,
  right,
  color,
  onPress,
  onRelease,
}: ActionButtonProps) {
  const [active, setActive] = useState(false);

  return (
    <div
      style={{
        ...BTN_STYLE_BASE,
        width: size,
        height: size,
        bottom,
        right,
        border: `2px solid ${color}`,
        boxShadow: active
          ? `0 0 16px ${color}, 0 0 32px ${color}40`
          : `0 0 4px ${color}40`,
        fontSize: size >= 60 ? 22 : 16,
        gap: 1,
      }}
      onPointerDown={(e) => {
        e.stopPropagation();
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        setActive(true);
        onPress();
      }}
      onPointerUp={(e) => {
        e.stopPropagation();
        setActive(false);
        onRelease();
      }}
      onPointerCancel={(e) => {
        e.stopPropagation();
        setActive(false);
        onRelease();
      }}
    >
      <span
        style={{
          color,
          lineHeight: 1,
          textShadow: active ? `0 0 8px ${color}` : "none",
        }}
      >
        {icon}
      </span>
      <span
        style={{
          color,
          fontSize: 7,
          letterSpacing: "0.1em",
          opacity: 0.7,
          lineHeight: 1,
        }}
      >
        {label}
      </span>
    </div>
  );
}

export function MobileControls() {
  const [joystick, setJoystick] = useState<JoystickState>({
    active: false,
    baseX: 0,
    baseY: 0,
    knobX: 0,
    knobY: 0,
    pointerId: -1,
  });

  const lookPointerRef = useRef<{
    id: number;
    lastX: number;
    lastY: number;
  } | null>(null);

  if (!mobileInput.isMobile) return null;

  const RADIUS = 40;

  // Left joystick area handlers
  const handleJoyDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setJoystick({
      active: true,
      baseX: e.clientX,
      baseY: e.clientY,
      knobX: e.clientX,
      knobY: e.clientY,
      pointerId: e.pointerId,
    });
  };

  const handleJoyMove = (e: React.PointerEvent) => {
    setJoystick((prev) => {
      if (!prev.active || prev.pointerId !== e.pointerId) return prev;
      const dx = e.clientX - prev.baseX;
      const dy = e.clientY - prev.baseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const clamp = Math.min(dist, RADIUS);
      const angle = Math.atan2(dy, dx);
      const knobX = prev.baseX + Math.cos(angle) * clamp;
      const knobY = prev.baseY + Math.sin(angle) * clamp;
      mobileInput.move.x = (clamp / RADIUS) * Math.cos(angle);
      mobileInput.move.y = (clamp / RADIUS) * Math.sin(angle);
      return { ...prev, knobX, knobY };
    });
  };

  const handleJoyUp = (e: React.PointerEvent) => {
    setJoystick((prev) => {
      if (prev.pointerId !== e.pointerId) return prev;
      mobileInput.move.x = 0;
      mobileInput.move.y = 0;
      return {
        active: false,
        baseX: 0,
        baseY: 0,
        knobX: 0,
        knobY: 0,
        pointerId: -1,
      };
    });
  };

  // Right look area handlers
  const handleLookDown = (e: React.PointerEvent) => {
    if (lookPointerRef.current !== null) return;
    lookPointerRef.current = {
      id: e.pointerId,
      lastX: e.clientX,
      lastY: e.clientY,
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleLookMove = (e: React.PointerEvent) => {
    const lp = lookPointerRef.current;
    if (!lp || lp.id !== e.pointerId) return;
    const dx = e.clientX - lp.lastX;
    const dy = e.clientY - lp.lastY;
    mobileInput.lookDeltaX += dx * 0.006;
    mobileInput.lookDeltaY += dy * 0.006;
    lp.lastX = e.clientX;
    lp.lastY = e.clientY;
  };

  const handleLookUp = (e: React.PointerEvent) => {
    if (lookPointerRef.current?.id === e.pointerId) {
      lookPointerRef.current = null;
    }
  };

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 20,
        touchAction: "none",
      }}
    >
      {/* Left joystick area */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: "40%",
          pointerEvents: "auto",
          touchAction: "none",
        }}
        onPointerDown={handleJoyDown}
        onPointerMove={handleJoyMove}
        onPointerUp={handleJoyUp}
        onPointerCancel={handleJoyUp}
      >
        {joystick.active && (
          <>
            {/* Base circle */}
            <div
              style={{
                position: "absolute",
                width: 80,
                height: 80,
                borderRadius: "50%",
                border: "2px solid rgba(0,255,255,0.35)",
                background: "rgba(0,255,255,0.06)",
                left: joystick.baseX - 40,
                top: joystick.baseY - 40,
                pointerEvents: "none",
              }}
            />
            {/* Knob */}
            <div
              style={{
                position: "absolute",
                width: 36,
                height: 36,
                borderRadius: "50%",
                border: "2px solid rgba(0,255,255,0.8)",
                background: "rgba(0,255,255,0.2)",
                boxShadow: "0 0 12px rgba(0,255,255,0.6)",
                left: joystick.knobX - 18,
                top: joystick.knobY - 18,
                pointerEvents: "none",
              }}
            />
          </>
        )}
      </div>

      {/* Right look + buttons area */}
      <div
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          bottom: 0,
          width: "60%",
          pointerEvents: "auto",
          touchAction: "none",
        }}
        onPointerDown={handleLookDown}
        onPointerMove={handleLookMove}
        onPointerUp={handleLookUp}
        onPointerCancel={handleLookUp}
      >
        {/* Action buttons */}
        <ActionButton
          label="JUMP"
          icon="⬆"
          size={64}
          bottom={80}
          right={20}
          color="#00ffff"
          onPress={() => {
            mobileInput.jump = true;
            mobileInput.jumpConsumed = false;
          }}
          onRelease={() => {
            mobileInput.jump = false;
          }}
        />
        <ActionButton
          label="SLASH"
          icon="⚔"
          size={52}
          bottom={160}
          right={90}
          color="#ff00ff"
          onPress={() => {
            mobileInput.slash = true;
            mobileInput.slashConsumed = false;
          }}
          onRelease={() => {
            // slash fires once, cleared by player
          }}
        />
        <ActionButton
          label="DASH"
          icon="»"
          size={52}
          bottom={80}
          right={110}
          color="#00ffff"
          onPress={() => {
            mobileInput.dash = true;
            mobileInput.dashConsumed = false;
          }}
          onRelease={() => {
            mobileInput.dash = false;
          }}
        />
        <ActionButton
          label="GRAPPLE"
          icon="🪝"
          size={48}
          bottom={200}
          right={30}
          color="#00ffff"
          onPress={() => {
            mobileInput.grapple = true;
            mobileInput.grappleConsumed = false;
          }}
          onRelease={() => {
            mobileInput.grapple = false;
          }}
        />
        <ActionButton
          label="SLOW"
          icon="⏱"
          size={48}
          bottom={280}
          right={20}
          color="#4488ff"
          onPress={() => {
            mobileInput.slowmo = true;
          }}
          onRelease={() => {
            mobileInput.slowmo = false;
          }}
        />
      </div>
    </div>
  );
}
