// Webdog, drawn with p5.js.
//
// The face drawing is the original Webdog sketch. What changed for the breakout:
//  - mouseX/mouseY became dogMouseX/dogMouseY, so the face can follow the mouse both
//    inside the editor preview and later across the whole room;
//  - the canvas can be moved out of the preview into the 3D block (Webdog.free);
//  - text is only drawn in the canvas while he's still inside the editor;
//  - cues/sounds/clicks live in sequence.js, audio.js and scene.js.

let textX = 330;
let textY = 350;

// eyes: "happy", "winking", "sleeping", "angry", "dots"

// eyebrows: "neutral", "curious", "frown"

// cheeks: "blush" or omitted

// mouth: "open", "closed"

let dogState = {
  eyes: "sleeping",
  eyebrows: "neutral",
  cheeks: "none",
  mouth: "closed",
  textPlacement: "random",
  electro: "stop",
  background: "default",
};

let phraseDisplay = "";
let sketchSize = 2;

// Pointer position in canvas pixels (what mouseX/mouseY were in the original).
let dogMouseX = 0;
let dogMouseY = 0;

// "contained": canvas fills the editor's preview pane, like the original sketch in its iframe.
// "free": canvas is the square front face of the 3D block.
let canvasMode = "contained";

let previewEl;

//////////////
////////
//////

function setup() {
  previewEl = document.getElementById("preview");
  const r = previewEl.getBoundingClientRect();
  sketchSize = r.width / 400;
  createCanvas(r.width, r.height);
  previewEl.appendChild(drawingContext.canvas);
  angleMode(DEGREES);
  noStroke();

  window.addEventListener("pointermove", trackPointer);
  onWebdogReady();
}

function trackPointer(e) {
  if (canvasMode === "contained") {
    // Like the editor's preview iframe: the sketch only sees the mouse while it's over the preview.
    const r = drawingContext.canvas.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) return;
    dogMouseX = ((e.clientX - r.left) * width) / r.width;
    dogMouseY = ((e.clientY - r.top) * height) / r.height;
  } else {
    // Free: Webdog watches the whole room, so map the full window onto his face.
    dogMouseX = (e.clientX / window.innerWidth) * width;
    dogMouseY = (e.clientY / window.innerHeight) * height;
  }
}

// Called by scene.js
const Webdog = {
  setState(state) {
    Object.assign(dogState, state);
  },

  say(text) {
    phraseDisplay = text;
    textX = random(100, 300);
  },

  // Contained: keep the canvas the size of the preview pane (the original sized itself to its iframe).
  fitPreview() {
    const r = previewEl.getBoundingClientRect();
    this.resize(r.width, r.height);
  },

  // Move the live canvas into the block's front face.
  free(faceEl, size) {
    canvasMode = "free";
    pixelDensity(Math.max(2, window.devicePixelRatio || 1));
    this.resize(size, size);
    faceEl.appendChild(drawingContext.canvas);
  },

  resize(w, h) {
    w = Math.round(w);
    h = Math.round(h);
    if (w === width && h === height) return;
    dogMouseX *= w / width;
    dogMouseY *= h / height;
    resizeCanvas(w, h);
    sketchSize = w / 400;
  },
};

//////
//DRAW MAIN
//////////////

function draw() {
  scale(sketchSize);
  drawBackground();
  drawDogFace();
  if (canvasMode === "contained") {
    displayPhrase();
  }
}

let lastFaceColor = "";

function drawBackground() {
  let bgR = map(dogMouseY, height, 0, 130, 247);
  let bgG = map(dogMouseY, height, 0, 45, 85);
  let bgB = map(dogMouseY, height, 0, 198, 44);
  background(bgR, bgG, bgB);

  // Share the face colour with the page: the preview pane and the block's top/bottom match it.
  const faceColor = `rgb(${round(bgR)}, ${round(bgG)}, ${round(bgB)})`;
  if (faceColor !== lastFaceColor) {
    document.documentElement.style.setProperty("--face-color", faceColor);
    lastFaceColor = faceColor;
  }

  //electrocute logic
  if (dogState.electro === "go") {
    if (millis() % 100 < 50) {
      background("yellow");
    } else {
      background("rgb(255,175,0)");
    }
  }
}

function drawDogFace() {
  drawEyes();
  drawEyebrows();
  drawNose();
  drawCheeks();
  drawMouth();
  drawEars();
}

//////
// FACE COMPONENTS
//////////////

function drawEyes() {
  push();
  fill("white");
  strokeWeight(7);
  stroke("#801B80");
  if (dogState.eyes === "happy") {
    ellipse(100, 120, 100, 50);
    ellipse(300, 120, 100, 50);
    fill("purple");
    drawPupil(100, 120, 0);
    drawPupil(300, 120, 0);
  } else if (dogState.eyes === "winking") {
    noFill();
    arc(100, 120, 100, 50, 0, 160);
    drawPupil(300, 120);
  } else if (dogState.eyes === "dots") {
    noFill();
    drawPupil(100, 120, 0);
    drawPupil(300, 120);
  } else if (dogState.eyes === "sleeping") {
    noFill();
    arc(100, 120, 100, 50, 0, 160);
    arc(300, 120, 100, 50, 20, 180);
  } else if (dogState.eyes === "angry") {
    line(80, 110, 120, 130);
    line(280, 130, 320, 110);
  }
  pop();
}

function drawPupil(x, y, eyeSize = -10) {
  let eyeX = map(dogMouseX, 0, width, -30, 30);
  let eyeY = map(dogMouseY, 0, width, -10, 10);
  fill("purple");
  push();
  strokeWeight(0);
  ellipse(x + eyeX, y + eyeY, 40 + eyeSize, 30);
  pop();
}

function drawEyebrows() {
  push();
  fill("#801B80");
  let quadY1 = map(dogMouseX, 0, width, 90, 70);
  let quadY2 = map(dogMouseX, 0, width, 70, 10);
  let quadY4 = map(dogMouseX, 0, width, 70, 90);
  let quadY3 = map(dogMouseX, 0, width, 10, 70);
  let quadX = map(dogMouseX, 0, width, -20, 20);
  if (dogState.eyebrows === "neutral") {
    quad(50, quadY1, 70, quadY2, 330, quadY3, 350, quadY4);
  } else if (dogState.eyebrows === "curious") {
    quad(50, quadY1 + 20, 70, quadY2 + 30, 200 + quadX, 50, 200 + quadX, 80);
    quad(200 + quadX, 80, 200 + quadX, 50, 330, quadY3 + 30, 350, quadY4 + 20);
  } else if (dogState.eyebrows === "frown") {
    quad(50, quadY1, 70, quadY2 - 30, 200 + quadX, 100, 200 + quadX, 130);
    quad(200 + quadX, 130, 200 + quadX, 100, 330, quadY3 - 30, 350, quadY4);
  }
  pop();
}

function drawNose() {
  push();
  fill("purple");
  let noseY = 1.5 * sin(frameCount * 35);
  if (frameCount % 60 > 20) {
    noseY = 0;
  }
  ellipse(200, 200 + noseY, 100, 50);
  pop();
}

function drawCheeks() {
  if (dogState.cheeks === "blush") {
    push();
    fill("rgba(255,192,203,0.26)");
    ellipse(80, 230, 90, 90);
    ellipse(320, 230, 90, 90);
    pop();
  }
}

function drawMouth() {
  fill("purple");

  if (dogState.electro === "go") {
    drawElectroChin();
  } else {
    drawChin();
  }

  drawMuzzle();
}

function drawMuzzle() {
  let triX = map(dogMouseX, 0, width, 20, -20);
  triangle(200, 200, 115 + triX, 290, 285 + triX, 290);
  arc(160 + triX, 289, 90, 40, 0, 180);
  arc(240 + triX, 289, 90, 40, 0, 180);
}

function drawChin() {
  push();
  translate(200, 310);
  angleMode(DEGREES);
  let rotator = map(dogMouseX, 0, width, -10, 10);
  rotate(rotator);
  if (dogState.mouth === "open") {
    arc(0 - rotator * 4, 50, 90, 50, 10, 170);
  } else if (dogState.mouth === "closed") {
    arc(0 - rotator * 4, 0, 90, 50, 10, 170);
  }
  pop();
}

function drawElectroChin() {
  push();
  translate(200, 310);
  angleMode(DEGREES);
  let rotator = map(dogMouseX, 0, width, -10, 10);
  rotate(rotator);
  if (millis() % 150 > 50) {
    arc(0 - rotator * 4, 60, 90, 50, 10, 170);
  } else {
    arc(0 - rotator * 4, 0, 90, 50, 10, 170);
  }
  pop();
}

function drawEars(earDance = 0) {
  let earY = map(dogMouseX, 0, width, -30, 30);
  ellipse(0, 80 - earY + earDance, 70, 400);
  ellipse(400, 80 + earY + earDance, 70, 400);
}

function displayPhrase() {
  fill("purple");

  if (dogState.mouth === "open") {
    text(phraseDisplay, 200, 330);
    textSize(24);
    textAlign(CENTER, CENTER);
  } else if (dogState.mouth === "closed") {
    textSize(14);
    textAlign(CENTER, CENTER);
    if (dogState.textPlacement === "random") {
      text(phraseDisplay, textX, textY);
    } else {
      text(phraseDisplay, 300, 330);
    }
  }
}
