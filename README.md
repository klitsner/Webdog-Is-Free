# Webdog Is Free

Webdog, the IXD 107 name caller, starts out as a p5.js sketch inside the p5.js web editor.
Then he growls, shakes the page, pulls his face out of the editor as a 3D block, and
celebrates on a pink and yellow sunburst. After that he introduces Project 2 presentations
and Project 3 (Choice interactions).

It's a plain static site with no build step. GitHub Pages serves `index.html` from the repo root.

## Presenting

| Action | Control |
| --- | --- |
| Next cue | Click anywhere, **Space**, **→**, **Enter**, or **Page Down** (most presentation clickers send this) |
| Previous cue | **←** or **Page Up** (once he's free, you can't go back into the editor) |
| Rehearse from a cue | Add `?cue=N` to the URL, e.g. `…/Webdog-Is-Free/?cue=30`. Cues after the breakout start with him already free. |

Clicks are ignored while the breakout animation is playing. Browsers block audio until
the first click, so the opening sleeping cue makes no sound.

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
- `action` (optional): `shake` (the "Grrrr" cue) or `breakout` (the escape animation)

## Sounds

The mp3s in `sound/` come from the original sketch. Three sounds are optional:

- `sound/howl.mp3`: plays during the spin ("I'm freeeeee!")
- `sound/celebrate.mp3`: plays when the sunburst appears
- `sound/birds.mp3`: a quiet loop after he escapes

Until you add these files, the page synthesizes a howl, a fanfare and bird chirps with the
Web Audio API. Add a file with the exact name above and the page uses it instead, with no
code changes. Volumes are in `VOLUME` in `js/audio.js`.

## Files

```
index.html            faux p5.js editor + 3D block markup
css/editor.css        p5.js web editor dark theme (values from processing/p5.js-web-editor)
css/style.css         stage, 3D block, sunburst, caption
js/sketch.js          Webdog's p5.js drawing (the original face code)
js/sequence.js        the script: every cue, face and sound
js/scene.js           click handling, page shake, the GSAP breakout timeline
js/audio.js           Web Audio playback and synthesized fallbacks
js/editor.js          syntax-highlighted code shown in the editor pane
js/vendor/            p5.js 2.0.3 and GSAP 3.12.5, bundled locally so the page works offline
assets/burst.svg      radial sunburst background
assets/editor-sketch.js  the original sketch.js, displayed in the editor pane
fonts/                Montserrat and Inconsolata, the p5.js editor's fonts
```

The original p5.js editor export is still in `Pup5 js name caller IXD 107 FA26 copy_…/` for reference.
