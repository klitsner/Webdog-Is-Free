// Tool panel for tuning motion, size and shading.
// Hidden by default so it never shows up mid-presentation: press T (or add ?tools to the URL).
// Changes save in this browser; "Copy settings" gives you DEFAULTS to paste into js/settings.js.

(() => {
  const EASES = [
    "none",
    "power1.in", "power1.out", "power1.inOut",
    "power2.in", "power2.out", "power2.inOut",
    "power3.in", "power3.out", "power3.inOut",
    "power4.in", "power4.out", "power4.inOut",
    "sine.in", "sine.out", "sine.inOut",
    "expo.in", "expo.out", "expo.inOut",
    "circ.in", "circ.out", "circ.inOut",
    "back.in(1.7)", "back.out(1.7)", "back.out(2.2)", "back.out(3)", "back.inOut(1.7)",
    "elastic.out(1, 0.3)", "elastic.out(1, 0.5)", "elastic.inOut(1, 0.4)",
    "bounce.out", "bounce.inOut",
  ];

  // [key, label, min, max, step] for sliders; [key, label, "ease"]; [key, label, "checkbox"];
  // [key, label, "select", options]
  const GROUPS = [
    {
      title: "Grrrr shake",
      section: "shake",
      note: "Use “Back to Grrrr” to see it. It keeps rumbling through “Pah.”",
      controls: [
        ["maxPx", "Peak shake (px)", 0, 60, 1],
        ["rampSec", "Build-up time (s)", 0.1, 3, 0.05],
        ["rumblePx", "Rumble afterwards (px)", 0, 20, 0.5],
        ["settleSec", "Settle into rumble (s)", 0, 3, 0.05],
        ["tilt", "Rotation (° per px)", 0, 0.2, 0.005],
      ],
    },
    {
      title: "“Pah.” head snap",
      section: "pah",
      controls: [
        ["angle", "Snaps back (°)", 0, 90, 1],
        ["z", "Pulls back (z px)", -400, 200, 5],
        ["duration", "Snap time (s)", 0.03, 1, 0.01],
        ["ease", "Snap curve", "ease"],
        ["settle", "Settles to (× angle)", 0, 1.2, 0.05],
        ["settleDuration", "Settle time (s)", 0.05, 2, 0.05],
        ["settleEase", "Settle curve", "ease"],
      ],
    },
    {
      title: "Breakout · editor breaks away",
      section: "kick",
      note: "Raise the tumble angles to make it spin away like kicked trash.",
      controls: [
        ["impact", "Impact knock-back (z px)", 0, 800, 10],
        ["impactDuration", "Impact time (s)", 0.02, 0.5, 0.01],
        ["x", "Falls sideways (% of screen)", -100, 100, 1],
        ["y", "Falls down (% of screen, negative = up)", -150, 150, 1],
        ["z", "Falls away (z px)", -8000, 0, 50],
        ["spinX", "Tumble: tips back (°)", -1440, 1440, 5],
        ["spinY", "Tumble: turns (°)", -1440, 1440, 5],
        ["spinZ", "Tumble: spins (°)", -1440, 1440, 5],
        ["duration", "Fall time (s)", 0.2, 5, 0.05],
        ["ease", "Fall curve", "ease"],
        ["sparkle", "Twinkle when it vanishes", "checkbox"],
      ],
    },
    {
      title: "Breakout · Webdog pops back into space",
      section: "drift",
      controls: [
        ["delay", "Starts after the kick (s)", 0, 3, 0.05],
        ["z", "Distance back (z px)", -1200, 0, 10],
        ["tilt", "Tilt (°, negative shows the top)", -40, 40, 1],
        ["duration", "Drift time (s)", 0.2, 4, 0.05],
        ["ease", "Drift curve", "ease"],
      ],
    },
    {
      title: "Breakout · look around",
      section: "look",
      controls: [
        ["angle", "Turn angle (°)", 0, 90, 1],
        ["duration", "Turn time (s)", 0.1, 2, 0.05],
        ["hold", "Pause between turns (s)", 0, 2, 0.05],
        ["ease", "Turn curve", "ease"],
      ],
    },
    {
      title: "Breakout · happy hop",
      section: "hop",
      controls: [
        ["height", "Hop height (px)", 0, 120, 1],
        ["duration", "Hop time (s)", 0.05, 1, 0.01],
        ["ease", "Hop curve", "ease"],
      ],
    },
    {
      title: "Breakout · wind-up",
      section: "windup",
      controls: [
        ["angle", "Wind-up angle (°)", 0, 180, 1],
        ["squash", "Squash (width)", 0.7, 1, 0.01],
        ["duration", "Wind-up time (s)", 0.1, 3, 0.05],
        ["ease", "Wind-up curve", "ease"],
      ],
    },
    {
      title: "Breakout · spin",
      section: "spin",
      controls: [
        ["turns", "Full turns", 0, 12, 1],
        ["duration", "Spin time (s)", 0.5, 12, 0.1],
        ["ease", "Spin curve", "ease"],
        ["returnDuration", "Come forward time (s)", 0.2, 8, 0.1],
        ["returnEase", "Come forward curve", "ease"],
      ],
    },
    {
      title: "Celebration rays",
      section: "rays",
      button: ["Replay rays", () => replayRays()],
      note: "“Replay rays” works once he's free.",
      controls: [
        ["order", "Order", "select", ["clockwise", "counterclockwise", "both ways", "alternating", "random"]],
        ["count", "Number of rays", 4, 72, 2],
        ["start", "Starts after spin begins (s)", 0, 8, 0.05],
        ["stagger", "Time between rays (s)", 0, 0.3, 0.005],
        ["duration", "Each ray shoots out in (s)", 0.05, 3, 0.05],
        ["ease", "Ray curve", "ease"],
      ],
    },
    {
      title: "Ambient float",
      section: "float",
      controls: [
        ["enabled", "Float while students present", "checkbox"],
        ["bob", "Bob height (px)", 0, 60, 1],
        ["bobDuration", "Bob time (s)", 0.3, 10, 0.1],
        ["sway", "Sway angle (°)", 0, 45, 0.5],
        ["swayDuration", "Sway time (s)", 0.3, 12, 0.1],
        ["ease", "Float curve", "ease"],
      ],
    },
    {
      title: "Mouse look",
      section: "mouseLook",
      note: "Once he's free, the block turns toward the mouse.",
      controls: [
        ["enabled", "Follow the mouse", "checkbox"],
        ["turn", "Left/right sensitivity (max °)", 0, 80, 1],
        ["tilt", "Up/down sensitivity (max °)", 0, 60, 1],
        ["smoothing", "Smoothing (s to catch up)", 0, 3, 0.05],
        ["ease", "Follow curve", "ease"],
      ],
    },
    {
      title: "Talking",
      section: "speak",
      note: "Once he's free, each line opens his mouth; it closes after this delay.",
      controls: [
        ["closeMouth", "Close mouth after each line", "checkbox"],
        ["closeDelay", "Mouth closes after (s)", 0, 5, 0.05],
        ["scale", "Bounce size", 1, 1.3, 0.01],
        ["duration", "Bounce time (s)", 0.05, 2, 0.05],
        ["ease", "Bounce curve", "ease"],
      ],
    },
    {
      title: "Caption pop-in",
      section: "caption",
      controls: [
        ["rise", "Rises from (px)", 0, 120, 1],
        ["duration", "Pop-in time (s)", 0.05, 2, 0.05],
        ["ease", "Pop-in curve", "ease"],
      ],
    },
    {
      title: "Webdog dimensions",
      section: "size",
      note: "Changes show live once he's free. Try ?cue=16.",
      controls: [
        ["height", "Face size (% of window height)", 20, 90, 1],
        ["maxWidth", "Max face width (% of window width)", 20, 90, 1],
        ["depth", "Thickness (% of face)", 2, 80, 1],
        ["y", "Vertical position (% from top)", 20, 70, 1],
        ["perspective", "Perspective (px, lower = more dramatic)", 400, 4000, 50],
      ],
    },
    {
      title: "Shading",
      section: "shading",
      controls: [
        ["side", "Side faces", 0, 1, 0.01],
        ["top", "Top highlight", 0, 1, 0.01],
        ["bottom", "Bottom shade", 0, 1, 0.01],
        ["frontEdge", "Front edge shadow", 0, 1, 0.01],
        ["rim", "Front top rim light", 0, 1, 0.01],
        ["ground", "Ground shadow", 0, 1, 0.01],
      ],
    },
  ];

  const h = (tag, attrs = {}, ...children) => {
    const el = document.createElement(tag);
    for (const [key, value] of Object.entries(attrs)) {
      if (key === "class") el.className = value;
      else if (key.startsWith("on")) el.addEventListener(key.slice(2), value);
      else el.setAttribute(key, value);
    }
    el.append(...children);
    return el;
  };

  // A setting changed: save it and apply whatever can update live.
  function changed(section) {
    saveSettings();
    if (section === "size" || section === "shading") refreshLayout();
    if (section === "float") startIdleFloat();
    if (section === "mouseLook") refreshMouseLook();
    if (section === "rays" && scene.mode === "free") Burst.show();
  }

  function easeGraph(ease) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 64 44");
    svg.setAttribute("class", "tools__ease-graph");
    const draw = (name) => {
      const fn = gsap.parseEase(name) || ((t) => t);
      // y range -0.35..1.35 leaves room for back/elastic overshoot
      const y = (v) => (40 - ((v + 0.35) / 1.7) * 36).toFixed(1);
      let points = "";
      for (let i = 0; i <= 48; i++) {
        const t = i / 48;
        points += `${(4 + t * 56).toFixed(1)},${y(fn(t))} `;
      }
      svg.innerHTML =
        `<line x1="4" x2="60" y1="${y(0)}" y2="${y(0)}" class="tools__ease-guide"/>` +
        `<line x1="4" x2="60" y1="${y(1)}" y2="${y(1)}" class="tools__ease-guide"/>` +
        `<polyline points="${points}" class="tools__ease-line"/>`;
    };
    draw(ease);
    return { svg, draw };
  }

  function control(section, [key, label, a, b, c]) {
    const value = SETTINGS[section][key];

    if (a === "checkbox") {
      const input = h("input", { type: "checkbox" });
      input.checked = value;
      input.addEventListener("change", () => {
        SETTINGS[section][key] = input.checked;
        changed(section);
      });
      return h("label", { class: "tools__row tools__row--check" }, input, label);
    }

    if (a === "select" || a === "ease") {
      const options = a === "ease" ? EASES.slice() : b.slice();
      if (!options.includes(value)) options.unshift(value);
      const select = h("select", {}, ...options.map((o) => h("option", { value: o }, o)));
      select.value = value;
      const row = h("label", { class: "tools__row" }, h("span", { class: "tools__label" }, label), select);
      if (a === "ease") {
        const graph = easeGraph(value);
        row.classList.add("tools__row--ease");
        row.append(graph.svg);
        select.addEventListener("change", () => graph.draw(select.value));
      }
      select.addEventListener("change", () => {
        SETTINGS[section][key] = select.value;
        changed(section);
      });
      return row;
    }

    const [min, max, step] = [a, b, c];
    const range = h("input", { type: "range", min, max, step });
    const number = h("input", { type: "number", min, max, step });
    range.value = number.value = value;
    const set = (v) => {
      if (v === "" || Number.isNaN(Number(v))) return;
      SETTINGS[section][key] = Number(v);
      changed(section);
    };
    range.addEventListener("input", () => {
      number.value = range.value;
      set(range.value);
    });
    number.addEventListener("input", () => {
      range.value = number.value;
      set(number.value);
    });
    return h(
      "div",
      { class: "tools__row tools__row--range" },
      h("span", { class: "tools__label" }, label),
      range,
      number
    );
  }

  function button(text, onClick) {
    return h("button", {
      type: "button",
      onclick: (e) => {
        onClick(e);
        e.currentTarget.blur(); // so Space advances cues again instead of re-pressing this
      },
    }, text);
  }

  function build() {
    const groups = GROUPS.map((group) =>
      h(
        "details",
        { class: "tools__group" },
        h("summary", {}, group.title),
        ...(group.note ? [h("p", { class: "tools__note" }, group.note)] : []),
        ...group.controls.map((c) => control(group.section, c)),
        ...(group.button ? [h("div", { class: "tools__buttons" }, button(...group.button))] : [])
      )
    );

    const copy = button("Copy settings", async (e) => {
      const text = `const DEFAULTS = ${JSON.stringify(SETTINGS, null, 2)};\n`;
      const target = e.currentTarget;
      try {
        await navigator.clipboard.writeText(text);
        target.textContent = "Copied!";
      } catch (err) {
        window.prompt("Copy these settings:", text);
      }
      setTimeout(() => (target.textContent = "Copy settings"), 1500);
    });

    const reset = button("Reset all", () => {
      if (!window.confirm("Reset every setting to its default?")) return;
      resetSettings();
      panel.remove();
      panel = build();
      document.body.append(panel);
      panel.hidden = false;
      refreshLayout();
      startIdleFloat();
    });

    const collapse = h("button", { type: "button", class: "tools__icon", title: "Collapse", "aria-label": "Collapse panel" }, "▾");
    collapse.addEventListener("click", () => {
      const collapsed = panel.classList.toggle("tools--collapsed");
      collapse.textContent = collapsed ? "▸" : "▾";
      collapse.blur();
    });
    const close = h("button", { type: "button", class: "tools__icon", title: "Hide (T)", "aria-label": "Hide panel" }, "×");
    close.addEventListener("click", () => (panel.hidden = true));

    const el = h(
      "aside",
      { class: "tools", "aria-label": "Webdog tools" },
      h("header", { class: "tools__header" }, h("strong", {}, "Webdog tools"), h("span", { class: "tools__hint" }, "T to hide"), collapse, close),
      h(
        "div",
        { class: "tools__body" },
        h(
          "div",
          { class: "tools__buttons" },
          button("Replay breakout", () => replayBreakout()),
          button("Back to Grrrr", () => resetToGrrrr())
        ),
        ...groups,
        h("p", { class: "tools__note" }, "Motion changes apply the next time that moment plays. Settings are saved in this browser only; use Copy settings to make them permanent."),
        h("div", { class: "tools__buttons" }, copy, reset)
      )
    );
    el.hidden = true;

    // Keep the panel's clicks and keys from advancing the presentation.
    for (const type of ["click", "pointerdown", "keydown"]) el.addEventListener(type, (e) => e.stopPropagation());
    return el;
  }

  let panel = build();
  document.body.append(panel);
  if (new URLSearchParams(location.search).has("tools")) panel.hidden = false;

  window.addEventListener("keydown", (e) => {
    if (e.key === "t" || e.key === "T") panel.hidden = !panel.hidden;
  });
})();
