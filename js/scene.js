// Scene controller: click-to-advance cues, the "Grrrr" shake, "Pah." and the breakout.
//
// scene.mode:
//   "contained"   – Webdog is a sketch inside the p5.js editor (text drawn in the canvas)
//   "lifted"      – "Pah.": his face has snapped back out of the page, which is still shaking
//   "breakingOut" – the scripted breakout timeline is running
//   "free"        – Webdog is a 3D block on the sunburst (text shown in #caption)
//
// Controls: click / Space / → / PageDown = next cue; ← / PageUp = previous cue.
// Rehearsal: add ?cue=N to the URL to start at cue N (cues after the breakout start already free).
// Motion, size and shading values come from SETTINGS (js/settings.js, edited by the tool panel).

const scene = {
  mode: "contained",
  index: 0,
  isAnimating: false, // blocks clicks while a scripted animation is playing
  lastAdvance: 0,
  timeline: null, // the running "Pah." or breakout timeline
  chain: null, // the tool panel's auto-played replay
};

const PAH_INDEX = SEQUENCE.findIndex((cue) => cue.action === "pah");
const BREAKOUT_INDEX = SEQUENCE.findIndex((cue) => cue.action === "breakout");
const GRRRR_INDEX = SEQUENCE.findIndex((cue) => cue.action === "shake");

const HAPPY_BLUSH = { eyes: "happy", eyebrows: "neutral", cheeks: "blush", mouth: "closed" };
const ANGRY = { eyes: "angry", eyebrows: "frown", cheeks: "none", mouth: "closed" };

const $ = (id) => document.getElementById(id);
const els = {
  stage: $("stage"),
  world: $("world"),
  shaker: $("shaker"),
  preview: $("preview"),
  hole: $("preview-hole"),
  anchor: $("block-anchor"),
  float: $("block-float"),
  look: $("block-look"),
  block: $("block"),
  front: $("block-front"),
  shadow: $("block-shadow"),
  sparkle: $("sparkle"),
  caption: $("caption"),
  consoleMessages: $("console-messages"),
};

// Called from sketch.js setup() once the canvas exists.
function onWebdogReady() {
  setupMouseLook();
  const requested = parseInt(new URLSearchParams(location.search).get("cue"), 10);
  if (requested > 0) jumpTo(Math.min(requested, SEQUENCE.length - 1));
  else showCue(0, { silent: true });
}

///////////////
// Cues
///////////////

// Applying a cue: update dogState, update the visible text, play its sound, run its action.
function showCue(i, { silent = false } = {}) {
  const cue = SEQUENCE[i];
  scene.index = i;

  if (cue.state) Webdog.setState(cue.state);
  if (cue.action !== "breakout") say(cue.text || "");
  if (!silent) AudioFX.play(cue.sound || "bark");

  if (cue.action === "shake") startShake();
  if (cue.action === "pah") pah();
  if (cue.action === "breakout") breakout();
  else if (scene.mode === "free") {
    speakBounce();
    closeMouthSoon();
  }
}

function say(text) {
  if (scene.mode === "free") setCaption(text);
  else Webdog.say(text);
}

function advance() {
  if (scene.isAnimating || scene.chain?.isActive()) return;
  // ignore accidental double-clicks
  const now = performance.now();
  if (now - scene.lastAdvance < 250) return;
  scene.lastAdvance = now;

  if (scene.index >= SEQUENCE.length - 1) return;
  const next = SEQUENCE[scene.index + 1];
  // the shake keeps going through "Pah." and stops when the editor breaks away
  if (!["pah", "breakout"].includes(next.action)) stopShake();
  showCue(scene.index + 1);
}

function goBack() {
  if (scene.isAnimating || scene.chain?.isActive()) return;
  const target = scene.index - 1;
  if (target < 0) return;
  // once he's out, there's no going back into the editor
  if (scene.mode === "free" && target <= BREAKOUT_INDEX) return;
  if (scene.mode === "lifted") {
    resetToGrrrr({ sound: false });
    return;
  }
  stopShake();
  showCue(target, { silent: true });
}

// The tool panel stops its own clicks and key presses from reaching these.
window.addEventListener("click", () => {
  AudioFX.unlock();
  if (scene.mode === "free") AudioFX.startBirds();
  advance();
});

window.addEventListener("keydown", (e) => {
  if (e.repeat) return;
  if ([" ", "ArrowRight", "PageDown", "Enter"].includes(e.key)) {
    e.preventDefault();
    AudioFX.unlock();
    if (scene.mode === "free") AudioFX.startBirds();
    advance();
  } else if (["ArrowLeft", "PageUp"].includes(e.key)) {
    e.preventDefault();
    goBack();
  }
});

// Clicking and dragging must never select or drag anything on the page (the tool panel excepted).
const inTools = (target) => (target.nodeType === 1 ? target : target.parentElement)?.closest(".tools");
window.addEventListener("dragstart", (e) => e.preventDefault());
window.addEventListener("selectstart", (e) => {
  if (!inTools(e.target)) e.preventDefault();
});

///////////////
// Caption (free world only)
///////////////

function setCaption(text) {
  gsap.killTweensOf(els.caption);
  if (!text) {
    gsap.set(els.caption, { autoAlpha: 0 });
    return;
  }
  const { rise, duration, ease } = SETTINGS.caption;
  els.caption.textContent = text;
  gsap.fromTo(
    els.caption,
    { autoAlpha: 0, y: rise, scale: 0.92 },
    { autoAlpha: 1, y: 0, scale: 1, duration, ease }
  );
}

// a little "talking" bounce each time he speaks once free
function speakBounce() {
  const { scale, duration, ease } = SETTINGS.speak;
  gsap.fromTo(els.block, { scale }, { scale: 1, duration, ease, overwrite: "auto" });
}

// Once he's free (and the words are in the caption), his mouth closes shortly after each line.
let mouthTimer = null;
function closeMouthSoon() {
  mouthTimer?.kill();
  const { closeMouth, closeDelay } = SETTINGS.speak;
  if (!closeMouth || dogState.mouth !== "open") return;
  mouthTimer = gsap.delayedCall(closeDelay, () => Webdog.setState({ mouth: "closed" }));
}

///////////////
// "Grrrr": shake the whole page (Webdog's face included once it's lifted out)
///////////////

const shake = { active: false, start: 0 };

// Builds to full force, then keeps rumbling until the editor breaks away.
function shakeTick() {
  const { maxPx, rampSec, rumblePx, settleSec, tilt } = SETTINGS.shake;
  const t = (performance.now() - shake.start) / 1000;
  const amp =
    t < rampSec
      ? maxPx * (t / rampSec) ** 2
      : gsap.utils.interpolate(maxPx, rumblePx, Math.min((t - rampSec) / Math.max(settleSec, 0.01), 1));
  // the editor and (once it's lifted out) Webdog's face shake together
  const jolt = {
    x: gsap.utils.random(-amp, amp),
    y: gsap.utils.random(-amp, amp),
    rotation: gsap.utils.random(-amp, amp) * tilt,
  };
  gsap.set(els.shaker, jolt);
  gsap.set(els.anchor, jolt);
}

function startShake() {
  if (shake.active) return;
  shake.active = true;
  shake.start = performance.now();
  gsap.ticker.add(shakeTick);
  logToConsole("🌸 p5.js says: Webdog appears to be pushing against the edges of the canvas. Hold on tight!");
}

function stopShake() {
  if (!shake.active) return;
  shake.active = false;
  gsap.ticker.remove(shakeTick);
  gsap.set([els.shaker, els.anchor], { x: 0, y: 0, rotation: 0 });
}

function logToConsole(message) {
  const line = document.createElement("div");
  line.className = "console-message";
  line.textContent = message;
  els.consoleMessages.appendChild(line);
}

///////////////
// Block layout
///////////////

// Size the block for the window: big enough to read across a classroom,
// with room for the caption underneath.
function layoutBlock() {
  const { height, maxWidth, depth: depthPercent } = SETTINGS.size;
  const face = Math.round(Math.min((window.innerWidth * maxWidth) / 100, (window.innerHeight * height) / 100));
  const depth = Math.round((face * depthPercent) / 100);
  const root = document.documentElement.style;
  root.setProperty("--face", `${face}px`);
  root.setProperty("--depth", `${depth}px`);
  // spin around the middle of the slab, not its front face
  gsap.set(els.block, { transformOrigin: `50% 50% ${-depth / 2}px` });
  return { face, depth };
}

// Re-fit after a window resize or a size change in the tool panel.
function refreshLayout() {
  applyStyleSettings();
  Burst.fit();
  if (scene.mode === "contained") {
    Webdog.fitPreview();
  } else if (scene.mode === "free") {
    const { face } = layoutBlock();
    Webdog.resize(face, face);
  }
}

window.addEventListener("resize", refreshLayout);

///////////////
// Mouse look: once free, the block turns toward the mouse
///////////////

const lookAt = { x: 0, y: 0 }; // -1…1, mouse position relative to the block
let lookTurn = null;
let lookTilt = null;

function setupMouseLook() {
  const { smoothing, ease } = SETTINGS.mouseLook;
  lookTurn = gsap.quickTo(els.look, "rotationY", { duration: Math.max(smoothing, 0.01), ease });
  lookTilt = gsap.quickTo(els.look, "rotationX", { duration: Math.max(smoothing, 0.01), ease });
}

function updateMouseLook() {
  if (!lookTurn) return;
  const { enabled, turn, tilt } = SETTINGS.mouseLook;
  const active = enabled && scene.mode === "free";
  lookTurn(active ? lookAt.x * turn : 0); // mouse to the right → face turns right
  lookTilt(active ? -lookAt.y * tilt : 0); // mouse above → face tips up
}

// Called by the tool panel when the mouse-look settings change.
function refreshMouseLook() {
  setupMouseLook();
  updateMouseLook();
}

window.addEventListener("pointermove", (e) => {
  const r = els.anchor.getBoundingClientRect();
  lookAt.x = gsap.utils.clamp(-1, 1, (e.clientX - r.left) / (window.innerWidth / 2));
  lookAt.y = gsap.utils.clamp(-1, 1, (e.clientY - r.top) / (window.innerHeight / 2));
  updateMouseLook();
});

///////////////
// "Pah." and the breakout
///////////////

// Move the live canvas into the block's front face, positioned exactly where the
// face was on the page, and leave an empty socket behind.
function liftFaceOutOfPage() {
  const { face } = layoutBlock();
  // The face is drawn 400×400 scaled to the preview's width, from the preview's top-left.
  const preview = els.preview.getBoundingClientRect();
  const anchor = els.anchor.getBoundingClientRect();
  const size = preview.width;
  Webdog.free(els.front, face);
  gsap.set(els.hole, { display: "block", width: size, height: Math.min(size, preview.height) });
  gsap.set(els.block, {
    visibility: "visible",
    x: preview.left + size / 2 - anchor.left,
    y: preview.top + size / 2 - anchor.top,
    z: 0,
    scale: size / face,
    rotationX: 0,
    rotationY: 0,
  });
}

// "Pah.": he snaps his head back out of the page. The page keeps shaking.
function pah() {
  liftFaceOutOfPage();
  scene.mode = "lifted";
  scene.isAnimating = true;
  const { angle, z, duration, ease, settle, settleDuration, settleEase } = SETTINGS.pah;
  scene.timeline = gsap
    .timeline({
      onComplete: () => {
        scene.isAnimating = false;
        scene.timeline = null;
      },
    })
    .to(els.block, { rotationX: angle, z, duration, ease })
    .to(els.block, { rotationX: angle * settle, duration: settleDuration, ease: settleEase });
}

function breakout() {
  if (scene.mode !== "lifted") liftFaceOutOfPage();
  scene.mode = "breakingOut";
  scene.isAnimating = true;
  stopShake();
  Webdog.setCanvasText(false);
  Webdog.setState(ANGRY);

  const S = SETTINGS;
  const kickEnd = Math.max(S.kick.duration - 0.2, 0);

  // One timeline for the whole sequence.
  const tl = gsap.timeline({ onComplete: finishBreakout });
  scene.timeline = tl;

  // 1. impact: the p5.js editor gets knocked back, then breaks away and falls out of view
  tl.addLabel("kick")
    .call(() => AudioFX.play("breakout"), null, "kick")
    .to(els.world, { transformOrigin: "50% 50%", z: -S.kick.impact, duration: S.kick.impactDuration, ease: "power3.out" }, "kick")
    .addLabel("fall", `kick+=${S.kick.impactDuration}`)
    .to(
      els.world,
      {
        x: (window.innerWidth * S.kick.x) / 100,
        y: (window.innerHeight * S.kick.y) / 100,
        z: S.kick.z,
        rotationX: S.kick.spinX,
        rotationY: S.kick.spinY,
        rotation: S.kick.spinZ,
        duration: S.kick.duration,
        ease: S.kick.ease,
      },
      "fall"
    )
    .call(() => S.kick.sparkle && sparkle(), null, `fall+=${kickEnd}`)
    .to(els.world, { autoAlpha: 0, duration: 0.2 }, `fall+=${kickEnd}`)
    .to(els.stage, { backgroundColor: "#ffffff", duration: 0.4, ease: "power1.out" }, "kick")

    // 2. at the same moment Webdog pops backward into space, to his resting spot
    .addLabel("drift", `kick+=${S.drift.delay}`)
    .to(
      els.block,
      { x: 0, y: 0, scale: 1, z: S.drift.z, rotationX: S.drift.tilt, duration: S.drift.duration, ease: S.drift.ease },
      "drift"
    )
    .fromTo(els.shadow, { autoAlpha: 0, scale: 0.6 }, { autoAlpha: 1, scale: 0.75, duration: 1.2 }, "drift+=0.4")

    // 3. still angry, he looks left... then right... then back at us
    .addLabel("look", ">+0.3")
    .to(els.block, { rotationY: S.look.angle, duration: S.look.duration, ease: S.look.ease }, "look")
    .to(els.block, { rotationY: -S.look.angle, duration: S.look.duration * 1.3, ease: S.look.ease }, `>+${S.look.hold}`)
    .to(els.block, { rotationY: 0, duration: S.look.duration * 0.85, ease: S.look.ease }, `>+${S.look.hold}`)

    // 4. he likes it out here: happy and blushing, with a little hop
    .call(() => Webdog.setState(HAPPY_BLUSH), null, ">+0.2")
    .to(els.block, { y: -S.hop.height, duration: S.hop.duration, ease: S.hop.ease, yoyo: true, repeat: 1 }, "<")

    // 5. wind up, storing rotational energy
    .addLabel("windup", ">+0.5")
    .to(els.block, { rotationY: S.windup.angle, scaleX: S.windup.squash, duration: S.windup.duration, ease: S.windup.ease }, "windup")

    // 6. release: several free spins that slow to a stop facing the audience
    .addLabel("spin", ">+0.06")
    .call(() => {
      Webdog.setState({ mouth: "open" });
      setCaption("I’m freeeeee!");
      AudioFX.play("whoosh");
      AudioFX.play("howl");
    }, null, "spin")
    .to(els.block, { rotationY: -360 * S.spin.turns, scaleX: 1, duration: S.spin.duration, ease: S.spin.ease }, "spin")
    .to(els.block, { z: 0, rotationX: 0, duration: S.spin.returnDuration, ease: S.spin.returnEase }, "spin+=0.3")
    .to(els.shadow, { scale: 1, duration: S.spin.returnDuration, ease: S.spin.returnEase }, "spin+=0.3")
    .call(() => Webdog.setState({ mouth: "closed" }), null, `spin+=${S.spin.returnDuration}`)

    // 7. celebration: rays shoot out from behind him one by one as the spin settles
    .addLabel("celebrate", `spin+=${S.rays.start}`)
    .call(() => AudioFX.play("celebrate"), null, "celebrate")
    .add(Burst.shootOut(), "celebrate");
}

// Optional twinkle where the broken-away editor vanishes (video-game style).
function sparkle() {
  const r = els.world.getBoundingClientRect();
  AudioFX.play("twinkle");
  gsap.set(els.sparkle, { x: r.left + r.width / 2, y: r.top + r.height / 2 });
  gsap.fromTo(
    els.sparkle,
    { autoAlpha: 1, scale: 0, rotation: 0 },
    { scale: 1.3, rotation: 180, duration: 0.25, ease: "back.out(3)", yoyo: true, repeat: 1, onComplete: () => gsap.set(els.sparkle, { autoAlpha: 0 }) }
  );
}

function finishBreakout() {
  scene.mode = "free";
  scene.isAnimating = false;
  scene.timeline = null;
  gsap.set(els.world, { display: "none" });
  gsap.set(els.block, { rotationY: 0 });
  AudioFX.startBirds();
  startIdleFloat();
  updateMouseLook();
}

// Gentle bob and sway so the block keeps showing its depth while students present.
function startIdleFloat() {
  gsap.killTweensOf(els.float);
  gsap.set(els.float, { y: 0, rotationY: 0 });
  const { enabled, bob, bobDuration, sway, swayDuration, ease } = SETTINGS.float;
  if (!enabled || scene.mode !== "free") return;
  gsap.fromTo(els.float, { y: 0 }, { y: -bob, duration: bobDuration, ease, yoyo: true, repeat: -1 });
  gsap.fromTo(els.float, { rotationY: -sway }, { rotationY: sway, duration: swayDuration, ease, yoyo: true, repeat: -1 });
}

///////////////
// Tool panel helpers
///////////////

// Put everything back inside the editor at the "Grrrr" cue.
function resetToGrrrr({ sound = true } = {}) {
  scene.chain?.kill();
  scene.chain = null;
  scene.timeline?.kill();
  scene.timeline = null;
  gsap.killTweensOf([els.block, els.float, els.look, els.world, els.stage, els.shadow, els.caption, els.sparkle]);
  stopShake();
  scene.mode = "contained";
  scene.isAnimating = false;
  Webdog.contain();
  gsap.set([els.world, els.block, els.float, els.look, els.shadow, els.sparkle], { clearProps: "all" });
  gsap.set(els.stage, { clearProps: "backgroundColor" });
  gsap.set(els.hole, { display: "none" });
  gsap.set(els.caption, { autoAlpha: 0 });
  Burst.hide();
  applyStyleSettings();
  setupMouseLook();
  showCue(GRRRR_INDEX, { silent: !sound });
}

// Plays Grrrr → Pah. → breakout on its own, with a beat between each.
function replayBreakout() {
  AudioFX.unlock();
  resetToGrrrr();
  scene.chain = gsap
    .timeline()
    .call(() => showCue(PAH_INDEX), null, 1.2)
    .call(() => showCue(BREAKOUT_INDEX), null, 2.4);
}

// Replay only the celebration rays (free mode).
function replayRays() {
  if (scene.mode !== "free") return;
  AudioFX.play("celebrate");
  Burst.shootOut();
}

// Rehearsal shortcut (?cue=N): jump straight to a cue without the animations.
function jumpTo(i) {
  if (i < BREAKOUT_INDEX) {
    showCue(i, { silent: true });
    stopShake();
    return;
  }
  i = Math.max(i, BREAKOUT_INDEX + 1);
  scene.mode = "free";
  const { face } = layoutBlock();
  Webdog.free(els.front, face);
  Webdog.setCanvasText(false);
  gsap.set(els.world, { display: "none" });
  gsap.set(els.stage, { backgroundColor: "#ffffff" });
  gsap.set(els.block, { visibility: "visible", x: 0, y: 0, z: 0, scale: 1, rotationX: 0, rotationY: 0 });
  gsap.set(els.shadow, { autoAlpha: 1, scale: 1 });
  Burst.show();
  startIdleFloat();
  updateMouseLook();
  showCue(i, { silent: true });
}
