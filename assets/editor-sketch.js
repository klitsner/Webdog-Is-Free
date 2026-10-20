
let bark, bark2, growl, frustrated, electro, snooze, bangSound;

let whines = [];
let whineIndex = 0;
let textX = 330;
let textY = 350;

// eyes: "happy", "winking", "sleeping", "angry", "dots"

// eyebrows: "neutral", "curious", "frown"

// cheeks: "blush" or omitted

// mouth: "open", "closed"

// sound: "bark", "bark2", "growl", "frustrated", "whine", "snore", "none" or omitted

let dogState = {
  eyes: "happy",
  eyebrows: "neutral",
  cheeks: "none",
  sound: "none",
  mouth: "closed",
  textPlacement: "random",
  electro: "stop",
  background: "default",
};

// let shyState = {}
// let sleepState = {}
// let madState = {}
// let normalState = {}

let phraseArray = [
  "{eyes:sleeping, cheeks:blush, eyebrows:neutral, mouth:closed}",
  "{eyes:happy, cheeks:blush, sound:bark2, mouth:open} Congratulations everybody!",
  "{eyes:happy, eyebrows:neutral, sound:snore, mouth:closed} Lots of class...",
  "{eyes:happy, cheeks:none, eyebrows:curious, sound:none, mouth:closed} Lots of projects...",
  "{eyes:happy, eyebrows:curious, sound:frustrated, mouth:closed} Lots of work...",
  "{eyes:winking, cheeks:blush, sound:bark, mouth:open} Really good work!",
  "{eyes:sleeping, sound:whine, mouth:open} Will you show me...",
  "{eyes:happy, cheeks:blush, sound:whine, mouth:open} your p5.js prototypes?",
  "{eyes:happy, eyebrows:neutral, sound:none, mouth:closed} Please and...",
  "{eyes:happy, cheeks:blush, sound:bark2, mouth:open} Thank you!",
"{eyes:happy, cheeks:blush, sound:whine, mouth:open} How does your prototype...",
"{eyes:winking, sound:whine, mouth:open} invite an action?",
"{eyes:dots, eyebrows:curious, sound:none, mouth:closed} And what kind of feedback...",
"{eyes:happy, cheeks:blush, eyebrows:curious, sound:bark, mouth:open} is used to shape",
"{eyes:sleeping, eyebrows:neutral, sound:whine, mouth:closed} how that interaction feels?",
  "{eyes:happy, cheeks:blush, eyebrows:neutral, sound:whine, mouth:open} Show us how it works!,",
"{eyes:happy, cheeks:blush, eyebrows:neutral, sound:whine, mouth:open} I wanna know!",
"{eyes:winking, cheeks:none, eyebrows:curious, sound:bark, mouth:open} How about you go first...",
"{eyes:happy, eyebrows:curious, cheeks:blush, sound:whine, mouth:open} Alan, go ahead!",
"{eyes:happy, eyebrows:neutral, sound:bark, mouth:open} Nicely done!",

"{eyes:winking, cheeks:blush, sound:bark, mouth:open} Emma, you're up!",
"{eyes:happy, cheeks:none, sound:whine, mouth:open} So good!",

"{eyes:happy, eyebrows:frown, cheeks:blush, sound:bark2, mouth:open} Fe, let’s see it!",
"{eyes:happy, eyebrows:neutral, cheeks:blush, sound:whine, mouth:open} I'm impressed!",

"{eyes:sleeping, eyebrows:neutral, sound:whine, mouth:open} Thomas, are you ready?",
"{eyes:happy, cheeks:blush, sound:whine, mouth:open} That’s delightful!",

"{eyes:winking, cheeks:none, eyebrows:curious, sound:bark, mouth:open} Chloe!",
"{eyes:happy, eyebrows:neutral, sound:snore, mouth:open} So good!",

"{eyes:happy, cheeks:none, sound:bark2, mouth:open} MJ, your turn!",
"{eyes:winking, cheeks:blush, sound:whine, mouth:open} That’s amazing!",

"{eyes:happy, eyebrows:curious, cheeks:blush, sound:bark2, mouth:open} Dahlia, go ahead!",
"{eyes:happy, eyebrows:neutral, sound:bark, mouth:open} Beautiful work!",

"{eyes:winking, cheeks:blush, sound:bark, mouth:open} Tim, you're up!",
"{eyes:happy, cheeks:none, sound:snore, mouth:open} So thoughtful!",

"{eyes:happy, eyebrows:neutral, cheeks:none, sound:whine, mouth:open} Fiona, go for it!",
"{eyes:winking, cheeks:blush, sound:bark, mouth:open} Wonderful!",

"{eyes:happy, eyebrows:frown, sound:bark, mouth:open} Jules, show us what you made!",
"{eyes:happy, cheeks:blush, sound:bark2, mouth:open} So creative!",

"{eyes:sleeping, cheeks:blush, sound:whine, mouth:open} YiTi, show us what you made!",
"{eyes:happy, eyebrows:neutral, cheeks:none, sound:whine, mouth:open} What a journey!",

"{eyes:happy, eyebrows:curious, cheeks:blush, sound:whine, mouth:open} Asher, I’m ready!",
"{eyes:happy, eyebrows:neutral, sound:bark2, mouth:open} Such strong design!",

"{eyes:winking, cheeks:blush, sound:bark, mouth:open} Elaine, your moment!",
"{eyes:happy, eyebrows:neutral, cheeks:blush, sound:bark2, mouth:open} Great work!",

"{eyes:happy, eyebrows:curious, cheeks:blush, sound:bark2, mouth:open} Emily, finish us off!",
"{eyes:happy, eyebrows:neutral, cheeks:blush, sound:bark, mouth:open} Amazing work!",
"{eyes:sleeping, cheeks:blush, sound:snore, mouth:closed} These are all so wonderful.",
"{eyes:happy, eyebrows:neutral, sound:none, mouth:closed} Thank you for sharing.",
"{eyes:happy, cheeks:blush, sound:snore, mouth:open} I think you are...",
"{eyes:happy, eyebrows:neutral, sound:snore, mouth:open} ready for sequential interactions!",
"{eyes:winking, cheeks:blush, sound:bark2, mouth:open} Good luck with Project 2!",
"{eyes:happy, cheeks:blush, eyebrows:neutral, sound:bark, mouth:open} WOOF!",
"{eyes:sleeping, cheeks:blush, eyebrows:neutral, mouth:closed}"
];



let phraseIndex = 0;
let phraseDisplay = "";
let sketchSize = 2;

//////////////
////////
//////

async function setup() {
  sketchSize = windowWidth / 400;
  createCanvas(400 * sketchSize, windowHeight);
  angleMode(DEGREES);
  noStroke();

  phraseDisplay = phraseArray[0];
  parsePhrase(phraseDisplay); // ✅ Parse the initial phrase

  getAudioContext();

  bark = await loadSound("sound/bark.mp3");
  bark2 = await loadSound("sound/bark2.mp3");
  growl = await loadSound("sound/growl.mp3");
  frustrated = await loadSound("sound/frustratedGrowl.mp3");
  electro = await loadSound("sound/electro.mp3");
  bangSound = await loadSound("sound/bang.mp3");

  growl.amp(0.5);
  frustrated.amp(0.4);

  whines.push(await loadSound("sound/whine-1.mp3"));
  whines.push(await loadSound("sound/whine-2.mp3"));
  whines.push(await loadSound("sound/whine-3.mp3"));
  whines.push(await loadSound("sound/whine-4.mp3"));
}

//////
//DRAW MAIN
//////////////

function windowResized() {
  sketchSize = windowWidth / 400;
  resizeCanvas(400 * sketchSize, windowHeight);
}

function draw() {
  scale(sketchSize);
  drawBackground();
  drawDogFace();
  displayPhrase();
}

function drawBackground() {
  let bgR = map(mouseY, height, 0, 130, 247);
  let bgG = map(mouseY, height, 0, 45, 85);
  let bgB = map(mouseY, height, 0, 198, 44);
  background(bgR, bgG, bgB);

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
  }else if (dogState.eyes === "dots") {
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
  let eyeX = map(mouseX, 0, width, -30, 30);
  let eyeY = map(mouseY, 0, width, -10, 10);
  fill("purple");
  push();
  strokeWeight(0);
  ellipse(x + eyeX, y + eyeY, 40 + eyeSize, 30);
  pop();
}

function drawEyebrows() {
  push();
  fill("#801B80");
  let quadY1 = map(mouseX, 0, width, 90, 70);
  let quadY2 = map(mouseX, 0, width, 70, 10);
  let quadY4 = map(mouseX, 0, width, 70, 90);
  let quadY3 = map(mouseX, 0, width, 10, 70);
  let quadX = map(mouseX, 0, width, -20, 20);
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
  
  if(dogState.electro==="go"){
      drawElectroChin();
  }else{
  drawChin();
  }
  
  drawMuzzle();
}

function drawMuzzle() {
  let triX = map(mouseX, 0, width, 20, -20);
  triangle(200, 200, 115 + triX, 290, 285 + triX, 290);
  arc(160 + triX, 289, 90, 40, 0, 180);
  arc(240 + triX, 289, 90, 40, 0, 180);
}

function drawChin() {
  push();
  translate(200, 310);
  angleMode(DEGREES);
  let rotator = map(mouseX, 0, width, -10, 10);
  rotate(rotator);
  if (dogState.mouth === "open") {
    arc(0 - rotator * 4, 50, 90, 50, 10, 170);
  } else if (dogState.mouth === "closed") {
    arc(0 - rotator * 4, 0, 90, 50, 10, 170);
  }
  pop();
}

function drawElectroChin(){
  
  push();
  translate(200, 310);
  angleMode(DEGREES);
  let rotator = map(mouseX, 0, width, -10, 10);
  rotate(rotator);  
  if (millis() % 150 > 50) {
    arc(0 - rotator * 4, 60, 90, 50, 10, 170);
  } else {
    arc(0 - rotator * 4, 0, 90, 50, 10, 170);
  }
  pop();
}

function drawEars(earDance = 0) {
  let earY = map(mouseX, 0, width, -30, 30);
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

///////////////
/////SOUND/////
///////////////

function playCurrentWhine() {
  if (whines.length > 0) {
    whines[whineIndex].stop();
    whines[whineIndex].play();
    whineIndex = (whineIndex + 1) % whines.length; // Increment index and loop back to 0 if it exceeds the array length
  }
}

function playBark() {
  bark.stop();
  bark.play();
}

function playBarkLoud() {
  bark2.stop();
  bark2.play();
}

function playGrowl() {
  growl.stop();
  growl.play();
}

function playfrustrated() {
  frustrated.stop();
  frustrated.play();
}

function playDogSound() {
  switch (dogState.sound) {
    case "bark":
      playBark();
      break;
    case "growl":
      playGrowl();
      break;
    case "frustrated":
      playfrustrated();
      break;
    case "bark2":
      playBarkLoud();
      break;
    case "whine":
    case "snore":
      playCurrentWhine();
      break;
    case "none":
    default:
      // do nothing
      break;
  }
}

///////////////
/////interaction /////
///////////////

function setStates(){
  // if(dogState.electrocute === "go"){
  //    electro = true;
  //    }
  
}


function mousePressed() {
  userStartAudio(); // in case future sound triggers are added
  phraseIndex = (phraseIndex + 1) % phraseArray.length;
  parsePhrase(phraseArray[phraseIndex]);
  playDogSound(); // ← call it here so it uses updated dogState
  textX = random(100, 300);
  texty = random(310, 360);
}

function parsePhrase(phrase) {
  const stateMatch = phrase.match(/\{(.*?)\}/);
  if (stateMatch) {
    const stateString = stateMatch[1];
    const states = stateString.split(", ").reduce((acc, state) => {
      const [key, value] = state.split(":");
      acc[key] = value;
      return acc;
    }, {});
    Object.assign(dogState, states);
    phraseDisplay = phrase.replace(stateMatch[0], "").trim();
  }
}
