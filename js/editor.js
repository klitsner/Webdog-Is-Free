// Fills the faux editor's code pane with the original Webdog sketch,
// highlighted with the p5.js editor's dark-theme token colours.

(() => {
  const KEYWORDS = new Set(
    "let const var function async await if else return switch case break default new for while do of in class this typeof".split(" ")
  );
  const ATOMS = new Set(["true", "false", "null", "undefined"]);
  const P5_VARIABLES = new Set(
    "width height mouseX mouseY frameCount windowWidth windowHeight DEGREES RADIANS CENTER LEFT RIGHT".split(" ")
  );
  const P5_FUNCTIONS = new Set(
    ("setup draw createCanvas resizeCanvas background fill noFill stroke noStroke strokeWeight ellipse arc line quad " +
      "triangle rect push pop translate rotate scale map sin cos random millis text textSize textAlign angleMode " +
      "loadSound getAudioContext userStartAudio windowResized mousePressed").split(" ")
  );

  const TOKEN = /(\/\/.*$)|("(?:[^"\\]|\\.)*"?|'(?:[^'\\]|\\.)*'?|`(?:[^`\\]|\\.)*`?)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_$][\w$]*)|([=+\-*/%<>!&|?:]+)|(\s+|.)/g;

  const escapeHTML = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const span = (cls, s) => `<span class="${cls}">${escapeHTML(s)}</span>`;

  function highlight(line) {
    let html = "";
    let previous = "";
    for (const m of line.matchAll(TOKEN)) {
      const [token, comment, string, number, word, operator] = m;
      if (comment) html += span("cm-comment", token);
      else if (string) html += span("cm-string", token);
      else if (number) html += span("cm-number", token);
      else if (word) {
        if (previous === ".") html += span("cm-property", token);
        else if (KEYWORDS.has(token)) html += span("cm-keyword", token);
        else if (ATOMS.has(token)) html += span("cm-atom", token);
        else if (P5_FUNCTIONS.has(token)) html += span("cm-p5-function", token);
        else if (P5_VARIABLES.has(token)) html += span("cm-p5-variable", token);
        else html += span("cm-variable", token);
      } else if (operator) html += span("cm-operator", token);
      else html += escapeHTML(token);
      if (token.trim()) previous = token;
    }
    return html;
  }

  function render(source) {
    const code = document.getElementById("code");
    code.innerHTML = source
      .replace(/\r\n/g, "\n")
      .split("\n")
      .map(
        (line, i) =>
          `<div class="cm-row"><div class="cm-gutter-cell">${i + 1}</div>` +
          `<div class="cm-line${i === 0 ? " cm-activeLine" : ""}">${highlight(line) || "​"}</div></div>`
      )
      .join("");
  }

  fetch("assets/editor-sketch.js")
    .then((response) => response.text())
    .then(render)
    .catch(() => render("// sketch.js"));
})();
