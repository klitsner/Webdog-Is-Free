// Scene controller: click-to-advance cues, the "Grrrr" shake and the breakout.
//
// scene.mode:
//   "contained"   – Webdog is a sketch inside the p5.js editor (text drawn in the canvas)
//   "breakingOut" – the scripted breakout timeline is running
//   "free"        – Webdog is a 3D block on the sunburst (text shown in #caption)
//
// Controls: click / Space / → / PageDown = next cue; ← / PageUp = previous cue.
// Rehearsal: add ?cue=N to the URL to start at cue N (cues after the breakout start already free).

const scene = {
  mode: "contained",
  index: 0,
  isAnimating: false, // blocks clicks while a scripted animation is playing
  lastAdvance: 0,
};

const BREAKOUT_INDEX = SEQUENCE.findIndex((cue) => cue.action === "breakout");

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
  block: $("block"),
  front: $("block-front"),
  shadow: $("block-shadow"),
  burstWrap: $("burst-wrap"),
  burst: $("burst"),
  caption: $("caption"),
  consoleMessages: $("console-messages"),
};

// Called from sketch.js setup() once the canvas exists.
function onWebdogReady() {
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
  if (cue.action === "breakout") breakout();
  else if (scene.mode === "free") speakBounce();
}

function say(text) {
  if (scene.mode === "contained") Webdog.say(text);
  else setCaption(text);
}

function advance() {
  if (scene.isAnimating) return;
  // ignore accidental double-clicks
  const now = performance.now();
  if (now - scene.lastAdvance < 250) return;
  scene.lastAdvance = now;

  if (scene.index >= SEQUENCE.length - 1) return;
  if (SEQUENCE[scene.index].action === "shake") stopShake();
  showCue(scene.index + 1);
}

function goBack() {
  if (scene.isAnimating) return;
  const target = scene.index - 1;
  if (target < 0) return;
  // once he's out, there's no going back into the editor
  if (scene.mode === "free" && target <= BREAKOUT_INDEX) return;
  if (SEQUENCE[scene.index].action === "shake") stopShake();
  showCue(target, { silent: true });
}

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

///////////////
// Caption (free world only)
///////////////

function setCaption(text) {
  gsap.killTweensOf(els.caption);
  if (!text) {
    gsap.set(els.caption, { autoAlpha: 0 });
    return;
  }
  els.caption.textContent = text;
  gsap.fromTo(
    els.caption,
    { autoAlpha: 0, y: 24, scale: 0.92 },
    { autoAlpha: 1, y: 0, scale: 1, duration: 0.35, ease: "back.out(2)" }
  );
}

// a little "talking" bounce each time he speaks once free
function speakBounce() {
  gsap.fromTo(els.block, { scale: 1.05 }, { scale: 1, duration: 0.45, ease: "back.out(3)", overwrite: "auto" });
}

///////////////
// "Grrrr": shake the whole page
///////////////

const shake = { active: false, start: 0 };

// Builds to full force over ~0.85 s, then keeps rumbling until the next click.
function shakeTick() {
  const t = (performance.now() - shake.start) / 1000;
  const amp = t < 0.85 ? 16 * (t / 0.85) ** 2 : gsap.utils.interpolate(16, 4, Math.min((t - 0.85) / 0.6, 1));
  gsap.set(els.shaker, {
    x: gsap.utils.random(-amp, amp),
    y: gsap.utils.random(-amp, amp),
    rotation: gsap.utils.random(-amp, amp) * 0.04,
  });
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
  gsap.set(els.shaker, { x: 0, y: 0, rotation: 0 });
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
  const face = Math.round(Math.min(window.innerWidth * 0.42, window.innerHeight * 0.56));
  const depth = Math.round(face * 0.2);
  const root = document.documentElement.style;
  root.setProperty("--face", `${face}px`);
  root.setProperty("--depth", `${depth}px`);
  // spin around the middle of the slab, not its front face
  gsap.set(els.block, { transformOrigin: `50% 50% ${-depth / 2}px` });
  return { face, depth };
}

window.addEventListener("resize", () => {
  if (scene.mode === "contained") {
    Webdog.fitPreview();
  } else if (scene.mode === "free") {
    const { face } = layoutBlock();
    Webdog.resize(face, face);
  }
});

///////////////
// The breakout
///////////////

function breakout() {
  scene.mode = "breakingOut";
  scene.isAnimating = true;
  stopShake();

  const { face } = layoutBlock();

  // The face is drawn 400×400 scaled to the preview's width, from the preview's top-left.
  const preview = els.preview.getBoundingClientRect();
  const anchor = els.anchor.getBoundingClientRect();
  const size = preview.width;
  const startScale = size / face;

  // Physically move the live canvas into the block's front face, positioned exactly
  // where the face was on the page, and leave an empty socket behind.
  Webdog.free(els.front, face);
  Webdog.setState(ANGRY);
  gsap.set(els.hole, { display: "block", width: size, height: Math.min(size, preview.height) });
  gsap.set(els.block, {
    visibility: "visible",
    x: preview.left + size / 2 - anchor.left,
    y: preview.top + size / 2 - anchor.top,
    z: 0,
    scale: startScale,
    rotationX: 0,
    rotationY: 0,
  });

  // One timeline for the whole sequence.
  const tl = gsap.timeline({ onComplete: finishBreakout });

  // 1. a tug back into the page... then POP, out toward the audience
  tl.to(els.block, { z: -50, scale: startScale * 0.97, duration: 0.22, ease: "power2.in" })
    .call(() => AudioFX.play("bang"))
    .addLabel("pop")
    .to(els.block, { z: 260, scale: startScale, duration: 0.55, ease: "back.out(2.2)" }, "pop")

    // 2. the editor page falls away backwards behind him, leaving a white void
    .to(els.world, { rotationX: 82, y: window.innerHeight * 0.35, z: -900, duration: 1.5, ease: "power2.in" }, "pop+=0.2")
    .to(els.world, { autoAlpha: 0, duration: 0.45 }, "pop+=1.3")
    .to(els.stage, { backgroundColor: "#ffffff", duration: 0.9, ease: "power1.inOut" }, "pop+=0.5")

    // 3. drift to the centre and pull back into space, tipped a little so the slab reads as 3D
    .addLabel("drift", "pop+=0.9")
    .to(els.block, { x: 0, y: 0, scale: 1, z: -330, rotationX: -9, duration: 1.5, ease: "power3.inOut" }, "drift")
    .fromTo(els.shadow, { autoAlpha: 0, scale: 0.6 }, { autoAlpha: 1, scale: 0.75, duration: 1.2 }, "drift+=0.6")

    // 4. still angry, he looks left... then right... then back at us
    .addLabel("look", ">+0.3")
    .to(els.block, { rotationY: 38, duration: 0.6, ease: "power2.inOut" }, "look")
    .to(els.block, { rotationY: -38, duration: 0.85, ease: "power2.inOut" }, ">+0.45")
    .to(els.block, { rotationY: 0, duration: 0.55, ease: "power2.inOut" }, ">+0.45")

    // 5. he likes it out here: happy and blushing, with a little hop
    .call(() => Webdog.setState(HAPPY_BLUSH), null, ">+0.2")
    .to(els.block, { y: -22, duration: 0.18, ease: "power1.out", yoyo: true, repeat: 1 }, "<")

    // 6. wind up, storing rotational energy
    .addLabel("windup", ">+0.5")
    .to(els.block, { rotationY: 48, scaleX: 0.96, duration: 0.8, ease: "power2.out" }, "windup")

    // 7. release: several free spins that slow to a stop facing the audience
    .addLabel("spin", ">+0.06")
    .call(() => {
      Webdog.setState({ mouth: "open" });
      setCaption("I’m freeeeee!");
      AudioFX.play("howl");
    }, null, "spin")
    .to(els.block, { rotationY: -1440, scaleX: 1, duration: 4.6, ease: "power4.out" }, "spin")
    .to(els.block, { z: 0, rotationX: 0, duration: 3.4, ease: "power2.inOut" }, "spin+=0.3")
    .to(els.shadow, { scale: 1, duration: 3.4, ease: "power2.inOut" }, "spin+=0.3")

    // 8. celebration: rays shoot out from behind him as the spin settles
    .addLabel("celebrate", "spin+=1.7")
    .call(() => AudioFX.play("celebrate"), null, "celebrate")
    .set(els.burstWrap, { visibility: "visible" }, "celebrate")
    .fromTo(
      els.burstWrap,
      { clipPath: "circle(0% at 50% 44%)" },
      { clipPath: "circle(120% at 50% 44%)", duration: 1.3, ease: "power2.out" },
      "celebrate"
    )
    .fromTo(els.burst, { scale: 0.35, rotation: -25 }, { scale: 1, rotation: 0, duration: 1.6, ease: "power3.out" }, "celebrate")
    .call(() => Webdog.setState({ mouth: "closed" }), null, "spin+=3.4");
}

function finishBreakout() {
  scene.mode = "free";
  scene.isAnimating = false;
  gsap.set(els.world, { display: "none" });
  gsap.set(els.block, { rotationY: 0 });
  AudioFX.startBirds();
  startIdleFloat();
}

// Gentle bob and sway so the block keeps showing its depth while students present.
function startIdleFloat() {
  gsap.to(els.float, { y: -10, duration: 2.4, ease: "sine.inOut", yoyo: true, repeat: -1 });
  gsap.fromTo(els.float, { rotationY: -6 }, { rotationY: 6, duration: 3.6, ease: "sine.inOut", yoyo: true, repeat: -1 });
}

// Rehearsal shortcut (?cue=N): jump straight to a cue without the animations.
function jumpTo(i) {
  if (i < BREAKOUT_INDEX) {
    showCue(i, { silent: true });
    if (SEQUENCE[i].action === "shake") stopShake();
    return;
  }
  i = Math.max(i, BREAKOUT_INDEX + 1);
  const { face } = layoutBlock();
  Webdog.free(els.front, face);
  gsap.set(els.world, { display: "none" });
  gsap.set(els.stage, { backgroundColor: "#ffffff" });
  gsap.set(els.block, { visibility: "visible", x: 0, y: 0, z: 0, scale: 1, rotationX: 0, rotationY: 0 });
  gsap.set(els.shadow, { autoAlpha: 1, scale: 1 });
  gsap.set(els.burstWrap, { visibility: "visible", clipPath: "circle(120% at 50% 44%)" });
  scene.mode = "free";
  startIdleFloat();
  showCue(i, { silent: true });
}
