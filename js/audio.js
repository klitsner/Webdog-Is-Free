// Webdog's sounds, using the Web Audio API.
//
// The sounds in sound/ are loaded up front. birds is optional: drop
// sound/birds.mp3 into the repo and it's used automatically; until then
// synthesized chirps play instead.

const AudioFX = (() => {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const master = ctx.createGain();
  master.connect(ctx.destination);

  const FILES = {
    bark: "sound/bark.mp3",
    bark2: "sound/bark2.mp3",
    growl: "sound/growl.mp3",
    frustrated: "sound/frustratedGrowl.mp3",
    breakout: "sound/breakout.wav", // "Pah." and the moment he breaks out
    whoosh: "sound/whoosh.wav",
    whine1: "sound/whine-1.mp3",
    whine2: "sound/whine-2.mp3",
    whine3: "sound/whine-3.mp3",
    whine4: "sound/whine-4.mp3",
    freeSong: "sound/webdog-synth.wav", // "I'm freeeeee!" spin and celebration
    celebrate: "sound/stripes.wav", // the sunburst rays shooting out
    birds: "sound/birds.mp3"
  };

  // matches the original sketch (growl.amp(0.5), frustrated.amp(0.4))
  const VOLUME = { growl: 0.5, frustrated: 0.4, birds: 0.2 };
  const WHINES = ["whine1", "whine2", "whine3", "whine4"];

  const buffers = {};
  const playing = {};
  let whineIndex = 0;

  async function load(name, url) {
    try {
      const response = await fetch(url);
      if (!response.ok) return;
      buffers[name] = await ctx.decodeAudioData(await response.arrayBuffer());
    } catch (err) {
      // missing/undecodable file: the synth fallback (if any) takes over
    }
  }

  const loaded = Promise.all(Object.entries(FILES).map(([name, url]) => load(name, url)));

  // Browsers keep audio suspended until the first click.
  function unlock() {
    if (ctx.state !== "running") return ctx.resume();
    return Promise.resolve();
  }

  // Stops the previous copy of a sound before playing it again, so repeated
  // clicks never stack barks on top of each other.
  function playBuffer(name, { loop = false, destination = master } = {}) {
    stop(name);
    const source = ctx.createBufferSource();
    const gain = ctx.createGain();
    source.buffer = buffers[name];
    source.loop = loop;
    gain.gain.value = VOLUME[name] ?? 1;
    source.connect(gain).connect(destination);
    source.start();
    playing[name] = source;
    source.onended = () => {
      if (playing[name] === source) delete playing[name];
    };
  }

  function stop(name) {
    if (!playing[name]) return;
    try {
      playing[name].stop();
    } catch (err) {
      // already stopped
    }
    delete playing[name];
  }

  function play(name) {
    if (!name || name === "none") return;
    if (name === "whine" || name === "snore") {
      const whine = WHINES[whineIndex];
      whineIndex = (whineIndex + 1) % WHINES.length;
      WHINES.forEach(stop);
      if (buffers[whine]) playBuffer(whine);
      return;
    }
    if (buffers[name]) playBuffer(name);
    else if (SYNTH[name]) SYNTH[name]();
  }

  ///////////////
  // Birds: quiet ambient loop, faded in once Webdog is free
  ///////////////

  let birdsStarted = false;

  function startBirds() {
    if (birdsStarted) return;
    birdsStarted = true;
    const bus = ctx.createGain();
    bus.gain.setValueAtTime(0.0001, ctx.currentTime);
    bus.gain.exponentialRampToValueAtTime(1, ctx.currentTime + 5);
    bus.connect(master);
    if (buffers.birds) playBuffer("birds", { loop: true, destination: bus });
    else synthBirds(bus);
  }

  ///////////////
  // Synthesized fallbacks
  ///////////////

  function tone(freq, start, duration, type, volume, destination = master) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(gain).connect(destination);
    osc.start(start);
    osc.stop(start + duration + 0.05);
  }

  // Little phrases of fast-sweeping sine chirps at random times, panned around the room.
  function synthBirds(bus) {
    function chirp(t, from, to, length, pan, volume) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const panner = ctx.createStereoPanner();
      osc.type = "sine";
      osc.frequency.setValueAtTime(from, t);
      osc.frequency.exponentialRampToValueAtTime(to, t + length);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(volume, t + length * 0.25);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + length);
      panner.pan.value = pan;
      osc.connect(gain).connect(panner).connect(bus);
      osc.start(t);
      osc.stop(t + length + 0.02);
    }

    function phrase() {
      const t = ctx.currentTime + 0.05;
      const base = 2300 + Math.random() * 2000;
      const notes = 1 + Math.floor(Math.random() * 5);
      const gap = 0.07 + Math.random() * 0.09;
      const pan = Math.random() * 1.6 - 0.8;
      const volume = 0.025 + Math.random() * 0.03;
      const rising = Math.random() < 0.5;
      for (let i = 0; i < notes; i++) {
        const from = base * (0.9 + Math.random() * 0.2);
        const to = rising ? from * (1.25 + Math.random() * 0.3) : from * (0.6 + Math.random() * 0.2);
        chirp(t + i * gap, from, to, 0.045 + Math.random() * 0.06, pan, volume);
      }
      setTimeout(phrase, 350 + Math.random() * 1900);
    }

    phrase();
  }

  // Video-game "ting" when the kicked-away editor vanishes.
  function synthTwinkle() {
    const t0 = ctx.currentTime + 0.01;
    [1568, 2093, 2637, 3136].forEach((f, i) => tone(f, t0 + i * 0.05, 0.35, "sine", 0.09));
  }

  const SYNTH = { twinkle: synthTwinkle };

  return { loaded, unlock, play, stop, startBirds };
})();
