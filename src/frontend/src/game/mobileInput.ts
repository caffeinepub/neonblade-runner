export const mobileInput = {
  move: { x: 0, y: 0 },
  lookDeltaX: 0,
  lookDeltaY: 0,
  jump: false,
  jumpConsumed: false,
  dash: false,
  dashConsumed: false,
  grapple: false,
  grappleConsumed: false,
  slash: false,
  slashConsumed: false,
  slowmo: false,
  isMobile:
    typeof window !== "undefined" &&
    ("ontouchstart" in window || navigator.maxTouchPoints > 0),
};
