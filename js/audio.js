// Webdog's sounds, using the Web Audio API.
//
// The sounds in sound/ are loaded up front. howl and birds are optional:
// drop sound/howl.mp3 or sound/birds.mp3 into the repo and they're used
// automatically; until then a synthesized version plays instead.

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
    howl: "sound/howl.mp3",
    celebrate: "sound/stripes.wav", // the sunburst rays shooting out
    birds: "sound/birds.mp3"
  };

  // matches the original sketch (growl.amp(0.5), frustrated.amp(0.4))
  const VOLUME = { growl: 0.5, frustrated: 0.4, howl: 0.9, birds: 0.2 };
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

  // "Aroooooo": a rising, vibrato-y saw voice through a moving vowel formant.
  function synthHowl() {
    const t0 = ctx.currentTime + 0.02;
    const dur = 3.3;

    const out = ctx.createGain();
    out.gain.setValueAtTime(0.0001, t0);
    out.gain.exponentialRampToValueAtTime(0.35, t0 + 0.35);
    out.gain.setValueAtTime(0.35, t0 + 2.3);
    out.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    out.connect(master);

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.value = 2800;
    lowpass.connect(out);

    const formant = ctx.createBiquadFilter();
    formant.type = "bandpass";
    formant.Q.value = 1.4;
    formant.frequency.setValueAtTime(600, t0);
    formant.frequency.linearRampToValueAtTime(1150, t0 + 0.8);
    formant.frequency.linearRampToValueAtTime(750, t0 + dur);
    formant.connect(lowpass);

    const vibrato = ctx.createOscillator();
    const vibratoDepth = ctx.createGain();
    vibrato.frequency.value = 5.5;
    vibratoDepth.gain.setValueAtTime(0, t0);
    vibratoDepth.gain.linearRampToValueAtTime(11, t0 + 1.0);
    vibrato.connect(vibratoDepth);

    const voices = [
      { type: "sawtooth", detune: -7, gain: 0.5, to: formant },
      { type: "sawtooth", detune: 7, gain: 0.5, to: formant },
      { type: "sine", detune: 0, gain: 0.35, to: lowpass }
    ];
    voices.forEach((v) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = v.type;
      osc.detune.value = v.detune;
      osc.frequency.setValueAtTime(250, t0);
      osc.frequency.exponentialRampToValueAtTime(560, t0 + 0.7);
      osc.frequency.linearRampToValueAtTime(600, t0 + 2.1);
      osc.frequency.exponentialRampToValueAtTime(390, t0 + dur);
      vibratoDepth.connect(osc.frequency);
      g.gain.value = v.gain;
      osc.connect(g).connect(v.to);
      osc.start(t0);
      osc.stop(t0 + dur + 0.1);
    });
    vibrato.start(t0);
    vibrato.stop(t0 + dur + 0.1);
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

  const SYNTH = { howl: synthHowl, twinkle: synthTwinkle };

  return { loaded, unlock, play, stop, startBirds };
})();
