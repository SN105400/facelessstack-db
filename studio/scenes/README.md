# studio/scenes — SceneLib v1

Reusable rigs/props/backgrounds for the skit production line (SKIT-PIPELINE.md step 4:
"never bespoke-animate from scratch when a library piece exists").

Extracted 2026-11-19 from proven sources (`skit-001.html`, `skit-002.html`,
`stickman-walk-jump.html`) — same anatomy (seg widths 5/4/3.5, head r=11, 540×960, `#e8ecff`
lines on `#0a0d18→#0d1226→#04060d` gradient) so renders stay visually consistent with
SKIT-001/002.

## Usage in a skit page

```html
<script src="scenes/library.js"></script>
<script>
  const vig = SceneLib.makeVignette(W, H), grain = SceneLib.makeGrain();  // once
  function drawAt(tSec, mouthOpen) {
    SceneLib.bg.plain(ctx, W, H, GY);            // or SceneLib.bg.street(..., t)
    const p = SceneLib.rigs.walk(t);             // rig -> pose object
    p.x = W * 0.42; p.groundY = GY; p.mouthOpen = mouthOpen;
    SceneLib.drawStickman(ctx, p);
    SceneLib.drawCaption(ctx, W, H, 'caption text');
    SceneLib.drawGrain(ctx, W, H, grain, t); SceneLib.drawVig(ctx, vig);
  }
  window.drawAt = drawAt;
  if (!location.search.includes('static')) requestAnimationFrame(/* live preview */);
</script>
```

Unchanged pipeline conventions: page owns `T`, `CAPS`, beat logic and
`window.drawAt(tSec, mouthOpen)`; encode with `?static=1`; QC via `drawAt()` + pixel
sampling + playback screenshots (NIGHTLY-TASK.md rule 7).

## API

| Member | What |
|---|---|
| `drawStickman(ctx, p)` | full rig. `p`: `{x, groundY, scale, lean, thighF/B, kneeF/B, armF/B, eF/B, hipDy, mouthOpen, eye:'dot'\|'flat', phone:null\|'ear'\|'watch'}` — all pose fields optional with sane defaults |
| `rigs.walk(t,{hz})` | continuous stride in place (pair with `bg.street` scroll) |
| `rigs.talk(t)` | idle + gesture; mouth comes from audio RMS via `mouthOpen` |
| `rigs.wave(t,{hz})` | raised waving arm |
| `rigs.sit(t,{seatH})` | seated pose; draw `props.box` as the seat (defaults seatH 26) |
| `rigs.jump(t,{jumpIn,airIn,landIn,walkBack,height,hz})` | walk→crouch→air→land→walk machine; returns `p.phase` too |
| `rigs.react(kind,t)` | `'shock'` / `'jealous'` (phone:'watch') / `'deadpan'` (eye:'flat') / `'facepalm'`; t = elapsed since beat start |
| `props.box / nightstandPhone / tvFrame(x,y,r,inner)` | proven props from skits 001/002 |
| `bg.plain(ctx,W,H,GY)` / `bg.street(...,t,speed)` | gradient+ground; scrolling marks+moon+hills |
| `makeVignette(W,H)` + `drawVig` | build once, draw per frame |
| `makeGrain()` + `drawGrain(ctx,W,H,tiles,t)` | two noise tiles, deterministic after init |
| `drawCaption(ctx,W,H,text,{size,y})` | burned caption, `\n` for line 2 |

## Verified by

`scenes-test.html` — 8 tiles (all rigs + shock/jealous/facepalm), deterministic `drawAt(t)`,
same QC path as skits. `react.deadpan` is a static pose (documented, trivially composed).

## Expansion queue (surplus budget flows here per SKIT-PIPELINE.md)

expressions pack (brows, blush), walk-with-x-position + turnarounds, camera shake,
prop interactions (mug, laptop), 2-character blocking helper (skit-002 style), new react
presets (`nod`, `doubletake`).
