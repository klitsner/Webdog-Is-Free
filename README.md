# Webdog Is Free

Webdog, the IXD 107 name caller, starts out as a p5.js sketch inside the p5.js web editor.
Then he growls and shakes the page, snaps his face out of it ("Pah."), and on the next
click the editor breaks away and falls out of view while he floats free as a 3D block.
He spins, and the pink and yellow sunburst rays shoot out one by one. After that he introduces Project 2 presentations
and Project 3 (Choice interactions).

It's a plain static site with no build step. GitHub Pages serves `index.html` from the repo root.

## Presenting

| Action | Control |
| --- | --- |
| Next cue | Click anywhere, **Space**, **→**, **Enter**, or **Page Down** (most presentation clickers send this) |
| Previous cue | **←** or **Page Up** (once he's free, you can't go back into the editor) |
| Rehearse from a cue | Add `?cue=N` to the URL, e.g. `…/Webdog-Is-Free/?cue=30`. Cues after the breakout start with him already free. |

Once he's free, the block turns to look toward the mouse.

Clicks are ignored while the breakout animation is playing. Browsers block audio until
the first click, so the opening sleeping cue makes no sound.

## Tool panel

Press **T** (or add `?tools` to the URL) to open the tool panel. It's hidden by default so it
never shows up mid-presentation. It controls:

- every motion: the shake, the "Pah." head snap, the editor breaking away, the drift, look-around,
  hop, wind-up, spin, the ray timing and order, and the talking bounce and caption pop-in. Each
  motion has a curve (ease) selector with a preview graph.
- ambient motion: the idle float, plus mouse look sensitivity and smoothing
- Webdog's dimensions: face size, thickness, vertical position and perspective
- shading: sides, top, bottom, front edge, rim light and ground shadow

**Replay breakout** plays Grrrr → Pah. → breakout so you can see your changes. **Back to Grrrr**
puts you just before it. Changes save in that browser only. To make them permanent everywhere,
click **Copy settings** and paste the result over `DEFAULTS` in `js/settings.js`.

## Editing the script

All of Webdog's lines, faces and sounds are in **`js/sequence.js`**, one object per click:

```js
{ text: "Frank, show us!", state: { eyes: "happy", eyebrows: "curious", cheeks: "none", mouth: "open" } },
```

- `eyes`: `happy`, `winking`, `sleeping`, `angry`, `dots`
- `eyebrows`: `neutral`, `curious`, `frown`
- `cheeks`: `blush`, `none`
- `mouth`: `open`, `closed`
- `sound` (optional): `bark` is the default. Also `bark2`, `growl`, `frustrated`, `whine`, `howl`, `celebrate`, and `none`.
- `action` (optional): `shake` (the "Grrrr" cue), `pah` (the head snap) or `breakout` (the escape animation)

## Sounds

The mp3s in `sound/` come from the original sketch. `sound/whoosh.wav` plays as the spin
starts. Three sounds are optional:

- `sound/howl.mp3`: plays during the spin ("I'm freeeeee!")
- `sound/celebrate.mp3`: plays when the sunburst appears
- `sound/birds.mp3`: a quiet loop after he escapes

Until you add these files, the page synthesizes a howl, a fanfare and bird chirps with the
Web Audio API. (The optional twinkle in the tool panel is always synthesized.) Add a file with the exact name above and the page uses it instead, with no
code changes. Volumes are in `VOLUME` in `js/audio.js`.

## Files

```
index.html            faux p5.js editor + 3D block markup
css/editor.css        p5.js web editor dark theme (values from processing/p5.js-web-editor)
css/style.css         stage, 3D block, sunburst, caption
css/tools.css         tool panel
js/sketch.js          Webdog's p5.js drawing (the original face code)
js/sequence.js        the script: every cue, face and sound
js/settings.js        motion / size / shading defaults
js/scene.js           click handling, shake, "Pah.", the GSAP breakout timeline, mouse look
js/burst.js           the sunburst, built ray by ray so they can fire one at a time
js/tools.js           the tool panel
js/audio.js           Web Audio playback and synthesized fallbacks
js/editor.js          syntax-highlighted code shown in the editor pane
js/vendor/            p5.js 2.0.3 and GSAP 3.12.5, bundled locally so the page works offline
assets/editor-sketch.js  the original sketch.js, displayed in the editor pane
fonts/                Montserrat and Inconsolata, the p5.js editor's fonts
```

The original p5.js editor export is still in `Pup5 js name caller IXD 107 FA26 copy_…/` for reference.
