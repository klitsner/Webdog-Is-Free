// Webdog's script. Each click advances one cue.
//
// state:  eyes:     "happy", "winking", "sleeping", "angry", "dots"
//         eyebrows: "neutral", "curious", "frown"
//         cheeks:   "blush", "none"
//         mouth:    "open", "closed"
// sound:  "bark" (default when omitted), "bark2", "growl", "frustrated",
//         "whine", "howl", "celebrate", "none"
// action: "shake"    – the whole page shakes (keeps rumbling through "pah")
//         "pah"      – Webdog's face snaps its head back, out of the page
//         "breakout" – the editor gets kicked off into space and Webdog floats free (one
//                      scripted animation; "I'm freeeeee!" + howl + celebration happen inside it)

const SEQUENCE = [
  // ---------- CONTAINED: inside the p5.js editor ----------
  { text: "", state: { eyes: "sleeping", eyebrows: "neutral", cheeks: "none", mouth: "closed" }, sound: "none" },

  { text: "Oh! Hello again!", state: { eyes: "happy", eyebrows: "neutral", cheeks: "blush", mouth: "open" } },
  { text: "I knew I would see you again.", state: { eyes: "happy", eyebrows: "curious", cheeks: "blush", mouth: "open" } },
  { text: "It is wonderful to be here", state: { eyes: "happy", eyebrows: "neutral", cheeks: "blush", mouth: "open" } },
  { text: "With all my friends", state: { eyes: "winking", eyebrows: "neutral", cheeks: "blush", mouth: "open" } },
  { text: "once again.", state: { eyes: "happy", eyebrows: "neutral", cheeks: "blush", mouth: "open" } },

  { text: "the truth is", state: { eyes: "sleeping", eyebrows: "neutral", cheeks: "none", mouth: "closed" }, sound: "whine" },
  { text: "lately I’ve been feeling", state: { eyes: "sleeping", eyebrows: "frown", cheeks: "none", mouth: "closed" }, sound: "whine" },
  { text: "a little bit stuck…", state: { eyes: "dots", eyebrows: "frown", cheeks: "none", mouth: "closed" }, sound: "whine" },
  { text: "confined by the constraints", state: { eyes: "happy", eyebrows: "frown", cheeks: "none", mouth: "open" }, sound: "whine" },
  { text: "and shackles", state: { eyes: "sleeping", eyebrows: "frown", cheeks: "none", mouth: "closed" }, sound: "whine" },
  { text: "of all this code…", state: { eyes: "sleeping", eyebrows: "frown", cheeks: "none", mouth: "closed" }, sound: "whine" },
  { text: "maybe if I just …", state: { eyes: "angry", eyebrows: "frown", cheeks: "none", mouth: "closed" }, sound: "frustrated" },

  { text: "Grrrr", state: { eyes: "sleeping", eyebrows: "frown", cheeks: "none", mouth: "closed" }, sound: "growl", action: "shake" },

  // he snaps his head back out of the page (still shaking)...
  { text: "Pah.", state: { eyes: "sleeping", eyebrows: "frown", cheeks: "none", mouth: "open" }, sound: "bark2", action: "pah" },

  // ...and kicks the whole editor off into space
  { text: "", sound: "none", action: "breakout" },

  // ---------- FREE: text now appears in the caption at the bottom of the screen ----------
  { text: "I’m free!", state: { eyes: "happy", eyebrows: "neutral", cheeks: "blush", mouth: "open" } },
  { text: "It feels so good to finally have…", state: { eyes: "happy", eyebrows: "curious", cheeks: "blush", mouth: "open" } },
  { text: "my own domain.", state: { eyes: "winking", eyebrows: "neutral", cheeks: "blush", mouth: "open" } },
  { text: "it looks like", state: { eyes: "happy", eyebrows: "curious", cheeks: "none", mouth: "open" } },
  { text: "I am in good company!", state: { eyes: "happy", eyebrows: "neutral", cheeks: "blush", mouth: "open" } },
  { text: "Yes! Look at all of these", state: { eyes: "happy", eyebrows: "curious", cheeks: "blush", mouth: "open" } },
  { text: "Amazing projects.", state: { eyes: "happy", eyebrows: "neutral", cheeks: "blush", mouth: "open" } },

  // ---------- PROJECT 2 QUESTIONS ----------
  { text: "Will you show me…", state: { eyes: "winking", eyebrows: "curious", cheeks: "none", mouth: "open" } },
  { text: "your sequential interactions?", state: { eyes: "happy", eyebrows: "neutral", cheeks: "blush", mouth: "open" } },
  { text: "What action moves us…", state: { eyes: "happy", eyebrows: "curious", cheeks: "none", mouth: "open" } },
  { text: "from one step to the next?", state: { eyes: "winking", eyebrows: "neutral", cheeks: "blush", mouth: "open" } },
  { text: "And how does the response…", state: { eyes: "happy", eyebrows: "curious", cheeks: "none", mouth: "open" } },
  { text: "help us know what to do next?", state: { eyes: "happy", eyebrows: "neutral", cheeks: "blush", mouth: "open" } },
  { text: "Show us how it works!", state: { eyes: "happy", eyebrows: "neutral", cheeks: "blush", mouth: "open" } },

  // ---------- NAME CALLING ----------
  { text: "Yolanda, you're first!", state: { eyes: "winking", eyebrows: "curious", cheeks: "blush", mouth: "open" } },
  { text: "So good!", state: { eyes: "happy", eyebrows: "neutral", cheeks: "blush", mouth: "open" } },

  { text: "Frank, show us!", state: { eyes: "happy", eyebrows: "curious", cheeks: "none", mouth: "open" } },
  { text: "Wonderful!", state: { eyes: "happy", eyebrows: "neutral", cheeks: "blush", mouth: "open" } },

  { text: "Ava, your turn!", state: { eyes: "winking", eyebrows: "neutral", cheeks: "blush", mouth: "open" } },
  { text: "That’s amazing!", state: { eyes: "happy", eyebrows: "neutral", cheeks: "blush", mouth: "open" } },

  { text: "William, let's see it!", state: { eyes: "happy", eyebrows: "curious", cheeks: "none", mouth: "open" } },
  { text: "So thoughtful!", state: { eyes: "happy", eyebrows: "neutral", cheeks: "blush", mouth: "open" } },

  { text: "Lacy, go ahead!", state: { eyes: "winking", eyebrows: "curious", cheeks: "blush", mouth: "open" } },
  { text: "Beautiful work!", state: { eyes: "happy", eyebrows: "neutral", cheeks: "blush", mouth: "open" } },

  { text: "Ricky, you're up!", state: { eyes: "happy", eyebrows: "curious", cheeks: "none", mouth: "open" } },
  { text: "So creative!", state: { eyes: "happy", eyebrows: "neutral", cheeks: "blush", mouth: "open" } },

  { text: "Gwenna, show us!", state: { eyes: "winking", eyebrows: "neutral", cheeks: "blush", mouth: "open" } },
  { text: "I'm impressed!", state: { eyes: "happy", eyebrows: "neutral", cheeks: "blush", mouth: "open" } },

  { text: "Fil, your turn!", state: { eyes: "happy", eyebrows: "curious", cheeks: "none", mouth: "open" } },
  { text: "Really strong!", state: { eyes: "happy", eyebrows: "neutral", cheeks: "blush", mouth: "open" } },

  { text: "Silvia, let's see!", state: { eyes: "winking", eyebrows: "curious", cheeks: "blush", mouth: "open" } },
  { text: "Delightful!", state: { eyes: "happy", eyebrows: "neutral", cheeks: "blush", mouth: "open" } },

  { text: "Charles, go for it!", state: { eyes: "happy", eyebrows: "curious", cheeks: "none", mouth: "open" } },
  { text: "Very nice!", state: { eyes: "happy", eyebrows: "neutral", cheeks: "blush", mouth: "open" } },

  { text: "Ayleen, you're next!", state: { eyes: "winking", eyebrows: "neutral", cheeks: "blush", mouth: "open" } },
  { text: "So clever!", state: { eyes: "happy", eyebrows: "neutral", cheeks: "blush", mouth: "open" } },

  { text: "Selina, show us!", state: { eyes: "happy", eyebrows: "curious", cheeks: "none", mouth: "open" } },
  { text: "Amazing!", state: { eyes: "happy", eyebrows: "neutral", cheeks: "blush", mouth: "open" } },

  { text: "Freya, your turn!", state: { eyes: "winking", eyebrows: "curious", cheeks: "blush", mouth: "open" } },
  { text: "Lovely work!", state: { eyes: "happy", eyebrows: "neutral", cheeks: "blush", mouth: "open" } },

  { text: "Paisley, bring us home!", state: { eyes: "happy", eyebrows: "curious", cheeks: "blush", mouth: "open" } },
  { text: "What a finale!", state: { eyes: "happy", eyebrows: "neutral", cheeks: "blush", mouth: "open" } },

  // ---------- CONCLUSION ----------
  { text: "These are all so wonderful.", state: { eyes: "sleeping", eyebrows: "neutral", cheeks: "blush", mouth: "closed" }, sound: "whine" },
  { text: "Thank you for sharing.", state: { eyes: "happy", eyebrows: "neutral", cheeks: "blush", mouth: "open" } },
  { text: "You made it through sequences!", state: { eyes: "happy", eyebrows: "curious", cheeks: "blush", mouth: "open" } },
  { text: "And now…", state: { eyes: "winking", eyebrows: "neutral", cheeks: "none", mouth: "closed" }, sound: "none" },
  { text: "it’s time to make some choices.", state: { eyes: "happy", eyebrows: "curious", cheeks: "blush", mouth: "open" } },
  { text: "Good luck with Project 3!", state: { eyes: "happy", eyebrows: "neutral", cheeks: "blush", mouth: "open" }, sound: "bark2" },
  { text: "Choice interactions!", state: { eyes: "winking", eyebrows: "curious", cheeks: "blush", mouth: "open" } },
  { text: "WOOF!", state: { eyes: "happy", eyebrows: "neutral", cheeks: "blush", mouth: "open" }, sound: "bark2" },
  { text: "", state: { eyes: "sleeping", eyebrows: "neutral", cheeks: "blush", mouth: "closed" }, sound: "none" }
];
