// Tunable motion, size and shading values.
//
// The tool panel (press T, or add ?tools to the URL) edits these live and saves
// your changes in this browser only. To make them permanent on every computer,
// click "Copy settings" in the panel and paste the result over DEFAULTS below.
//
// Times are in seconds, distances in px, angles in degrees, eases are GSAP ease names.

const DEFAULTS = {
  shake: { maxPx: 16, rampSec: 0.85, rumblePx: 4, settleSec: 0.6, tilt: 0.04 },
  pah: { angle: 28, z: -40, duration: 0.14, ease: "power4.out", settle: 0.75, settleDuration: 0.6, settleEase: "elastic.out(1, 0.4)" },
  kick: { impact: 160, impactDuration: 0.08, x: 0, y: 110, z: -500, spinX: 35, spinY: 0, spinZ: -8, duration: 1, ease: "power2.in", sparkle: false },
  drift: { delay: 0.05, z: -330, tilt: -9, duration: 1.1, ease: "back.out(1.4)" },
  look: { angle: 38, duration: 0.65, hold: 0.45, ease: "power2.inOut" },
  hop: { height: 22, duration: 0.18, ease: "power1.out" },
  windup: { angle: 48, squash: 0.96, duration: 0.8, ease: "power2.out" },
  spin: { turns: 4, duration: 4.6, ease: "power4.out", returnDuration: 3.4, returnEase: "power2.inOut" },
  rays: { count: 36, start: 1.2, stagger: 0.015, duration: 1, ease: "sine.out", order: "clockwise" },
  float: { enabled: true, bob: 10, bobDuration: 2.4, sway: 6, swayDuration: 3.6, ease: "sine.inOut" },
  mouseLook: { enabled: true, turn: 52, tilt: 38, smoothing: 0.6, ease: "power3.out" },
  speak: { scale: 1.05, duration: 0.6, ease: "power4.inOut", closeMouth: true, closeDelay: 0.8 },
  caption: { rise: 24, duration: 0.35, ease: "back.out(2)" },
  size: { height: 56, maxWidth: 42, depth: 37, y: 47, perspective: 700 },
  shading: { side: 0.52, top: 0.26, bottom: 0.3, frontEdge: 0.12, rim: 0.18, ground: 0.48 },
};

const SETTINGS_KEY = "webdog-settings";

const SETTINGS = (() => {
  const settings = structuredClone(DEFAULTS);
  try {
    const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}");
    for (const section of Object.keys(settings)) Object.assign(settings[section], saved[section]);
  } catch (err) {
    // no saved settings (or storage blocked): use the defaults
  }
  return settings;
})();

function saveSettings() {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(SETTINGS));
  } catch (err) {
    // storage blocked: changes still apply until the page reloads
  }
}

function resetSettings() {
  for (const section of Object.keys(DEFAULTS)) Object.assign(SETTINGS[section], structuredClone(DEFAULTS[section]));
  try {
    localStorage.removeItem(SETTINGS_KEY);
  } catch (err) {
    // ignore
  }
}

// Sizes and shading are CSS variables; motion values are read when each animation starts.
function applyStyleSettings() {
  const root = document.documentElement.style;
  const { size, shading } = SETTINGS;
  root.setProperty("--anchor-y", `${size.y}%`);
  root.setProperty("--perspective", `${size.perspective}px`);
  root.setProperty("--shade-side", shading.side);
  root.setProperty("--shade-top", shading.top);
  root.setProperty("--shade-bottom", shading.bottom);
  root.setProperty("--shade-front-edge", shading.frontEdge);
  root.setProperty("--shade-rim", shading.rim);
  root.setProperty("--shade-ground", shading.ground);
}

applyStyleSettings();
