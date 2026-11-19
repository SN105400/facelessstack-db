'use strict';
// SceneLib v1 — reusable rigs, props, backgrounds, captions for the skit line.
// Extracted 2026-11-19 from proven sources: skit-001.html, skit-002.html,
// stickman-walk-jump.html (same anatomy: seg widths 5/4/3.5, head r11, 540x960).
// Conventions (see scenes/README.md): skit pages keep beat logic + CAPS + drawAt(tSec,
// mouthOpen) and honor ?static=1; everything here is deterministic given t.
(function () {
  const COL = {
    line: '#e8ecff', bg0: '#0a0d18', bg1: '#0d1226', bg2: '#04060d',
    ground: '#3a4468', marks: '#26304f', prop: '#1a2242', propEdge: '#4a5a94',
    propScreen: '#0f1630', propLit: '#8fb0ff', moon: 'rgba(220,228,255,0.85)',
  };

  const ease = x => x * x * (3 - 2 * x);

  // ---- stickman anatomy ----------------------------------------------------
  // p: {x, groundY, lean, thighF, thighB, kneeF, kneeB, armF, armB, eF, eB,
  //     hipDy, mouthOpen, eye:'dot'|'flat', phone:null|'ear'|'watch', scale}
  function drawStickman(ctx, p) {
    const s = p.scale || 1;
    const hipX = p.x, hipY = p.groundY - 58 * s + (p.hipDy || 0);
    const lean = p.lean == null ? 0.05 : p.lean;
    const lx = Math.sin(lean), ly = Math.cos(lean);
    const neckX = hipX + lx * 34 * s, neckY = hipY - ly * 34 * s;
    const headX = neckX + lx * 14 * s, headY = neckY - 15 * s;

    ctx.lineCap = 'round';
    ctx.strokeStyle = COL.line; ctx.fillStyle = COL.line;
    const seg = (x1, y1, x2, y2, w) => { ctx.lineWidth = w * s; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); };
    function leg(th, kn) {
      const kx = hipX + Math.sin(th) * 26 * s, ky = hipY + Math.cos(th) * 26 * s;
      const fx = kx + Math.sin(th - kn) * 30 * s, fy = ky + Math.cos(th - kn) * 30 * s;
      seg(hipX, hipY, kx, ky, 5); seg(kx, ky, fx, fy, 4);
    }
    function arm(a, e) {
      const ex = neckX + Math.sin(a) * 22 * s, ey = neckY + Math.cos(a) * 22 * s;
      const hx = ex + Math.sin(a + e) * 20 * s, hy = ey + Math.cos(a + e) * 20 * s;
      seg(neckX, neckY, ex, ey, 4); seg(ex, ey, hx, hy, 3.5);
    }
    leg(p.thighB == null ? -0.08 : p.thighB, p.kneeB == null ? 0.10 : p.kneeB);
    seg(hipX, hipY, neckX, neckY, 5);
    arm(p.armB == null ? -0.10 : p.armB, p.eB == null ? 0.4 : p.eB);
    leg(p.thighF == null ? 0.08 : p.thighF, p.kneeF == null ? 0.10 : p.kneeF);
    arm(p.armF == null ? 0.10 : p.armF, p.eF == null ? 0.4 : p.eF);
    ctx.lineWidth = 4 * s; ctx.beginPath(); ctx.arc(headX, headY, 11 * s, 0, Math.PI * 2); ctx.stroke();
    if (p.eye === 'flat') {   // unamused line (skit-002 deadpan)
      ctx.lineWidth = 2.2 * s; ctx.beginPath();
      ctx.moveTo(headX + 1 * s, headY - 3 * s); ctx.lineTo(headX + 7 * s, headY - 2 * s); ctx.stroke();
    } else {                  // default dot
      ctx.beginPath(); ctx.arc(headX + 4 * s, headY - 2 * s, 1.8 * s, 0, Math.PI * 2); ctx.fill();
    }
    if ((p.mouthOpen || 0) > 0.08) {   // amplitude-driven mouth (audio RMS)
      ctx.beginPath();
      ctx.ellipse(headX + 6 * s, headY + 4.5 * s, 2.4 * s, 1 * s + 3 * s * p.mouthOpen, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    if (p.phone === 'ear') {           // held to ear (skit-001)
      const phx = neckX + Math.sin((p.armF || 0) + (p.eF || 0) + 0.15) * 40 * s;
      const phy = neckY + Math.cos((p.armF || 0) + (p.eF || 0) + 0.15) * 40 * s - 4 * s;
      ctx.fillStyle = COL.propEdge; ctx.fillRect(phx - 3 * s, phy - 6 * s, 6 * s, 12 * s);
    } else if (p.phone === 'watch') {  // held in front, watching (skit-002)
      ctx.fillStyle = COL.propEdge; ctx.fillRect(neckX + 26 * s, neckY + 2 * s, 12 * s, 20 * s);
      ctx.fillStyle = COL.propLit; ctx.fillRect(neckX + 28 * s, neckY + 4 * s, 8 * s, 12 * s);
    }
  }

  const BASE = { lean: 0.05, thighF: 0.08, thighB: -0.08, kneeF: 0.10, kneeB: 0.10,
                 armF: 0.10, armB: -0.10, eF: 0.4, eB: 0.4, hipDy: 0, mouthOpen: 0, eye: 'dot' };
  const pose = over => Object.assign({}, BASE, over || {});

  // ---- rigs (t = local seconds; page maps beats -> rig + t) -----------------
  const rigs = {
    // continuous stride in place (world scrolls via bg.street)
    walk(t, o) {
      o = o || {}; const hz = o.hz || 2.2;
      const wf = t * hz * Math.PI * 2, s = 0.62 * Math.sin(wf);
      return pose({
        lean: 0.10, thighF: s, thighB: -s,
        kneeF: Math.max(0.12, 0.5 * Math.sin(wf + 0.9)),
        kneeB: Math.max(0.12, 0.5 * Math.sin(wf + 0.9 + Math.PI)),
        armF: -0.75 * Math.sin(wf), armB: 0.75 * Math.sin(wf), eF: 0.55, eB: 0.55,
        hipDy: -3 * Math.abs(Math.sin(wf)),
      });
    },
    // idle + gesturing (mouth comes from audio RMS, not this rig)
    talk(t) {
      return pose({
        lean: 0.05,
        armF: 0.15 + 0.18 * Math.sin(t * 2.4), eF: 0.5 + 0.15 * Math.sin(t * 2.4 + 1.1),
        armB: -0.12, eB: 0.4, hipDy: -1.4 * Math.abs(Math.sin(t * 1.2)),
      });
    },
    // raised arm waving
    wave(t, o) {
      o = o || {}; const hz = o.hz || 3;
      return pose({
        lean: 0.02, armF: -2.35 + 0.28 * Math.sin(t * hz * Math.PI * 2),
        eF: 0.25 + 0.25 * Math.sin(t * hz * Math.PI * 2 + 0.6),
        armB: 0.15, eB: 0.35, hipDy: -1.5 * Math.abs(Math.sin(t * 1.4)),
      });
    },
    // seated on a seat prop (page draws props.box at seat height)
    sit(t, o) {
      o = o || {}; const seatH = o.seatH || 26;
      return pose({
        lean: 0.04, hipDy: 48 - seatH + 1.2 * Math.sin(t * 1.1),   // lower onto seat + breath
        thighF: 1.25, kneeF: 1.5, thighB: 1.05, kneeB: 1.55,
        armF: 0.6, eF: 0.35, armB: -0.4, eB: 0.3,
      });
    },
    // walk -> crouch -> air -> land -> walk (full stickman-walk-jump machine)
    jump(t, o) {
      o = o || {};
      const jumpIn = o.jumpIn == null ? 3.0 : o.jumpIn, airIn = o.airIn == null ? 3.8 : o.airIn;
      const landIn = o.landIn == null ? 4.6 : o.landIn, walkBack = o.walkBack == null ? 5.6 : o.walkBack;
      const hz = o.hz || 2.2, height = o.height || 118;
      const wf = t * hz * Math.PI * 2, sw = 0.62 * Math.sin(wf);
      const p = pose({
        lean: 0.10, thighF: sw, thighB: -sw,
        kneeF: Math.max(0.12, 0.5 * Math.sin(wf + 0.9)),
        kneeB: Math.max(0.12, 0.5 * Math.sin(wf + 0.9 + Math.PI)),
        armF: -0.75 * Math.sin(wf), armB: 0.75 * Math.sin(wf), eF: 0.55, eB: 0.55,
        hipDy: -3 * Math.abs(Math.sin(wf)),
      });
      let phase = 'walk', jt = 0;
      if (t >= jumpIn && t < airIn) { phase = 'crouch'; jt = (t - jumpIn) / (airIn - jumpIn); }
      else if (t >= airIn && t < landIn) { phase = 'air'; jt = (t - airIn) / (landIn - airIn); }
      else if (t >= landIn && t < walkBack) { phase = 'land'; jt = (t - landIn) / (walkBack - landIn); }
      if (phase === 'crouch') {
        const k = ease(jt);
        p.hipDy += 16 * k;
        p.kneeF = p.kneeB = 1.15 * k + p.kneeF * (1 - k);
        p.thighF = p.thighF * (1 - k) + 0.15 * k; p.thighB = p.thighB * (1 - k) - 0.15 * k;
        p.armF = p.armF * (1 - k) - 0.9 * k; p.armB = p.armB * (1 - k) - 0.7 * k;
        p.lean += 0.16 * k;
      } else if (phase === 'air') {
        const k = ease(jt);
        p.hipDy = -height * 4 * k * (1 - k);
        p.kneeF = 2.0; p.kneeB = 1.6; p.thighF = 0.5; p.thighB = -0.35;
        p.armF = -2.1 + 0.3 * Math.sin(jt * Math.PI * 2); p.armB = -1.6;
        p.lean = 0.10 - 0.06 * Math.sin(jt * Math.PI);
      } else if (phase === 'land') {
        const k = ease(Math.min(1, jt * 1.6)), r = ease(Math.max(0, (jt - 0.35) / 0.65));
        p.hipDy += 18 * (1 - r);
        p.kneeF = 1.0 * (1 - r) + p.kneeF * r; p.kneeB = 0.9 * (1 - r) + p.kneeB * r;
        p.thighF = 0.3 * (1 - r) + p.thighF * r; p.thighB = -0.3 * (1 - r) + p.thighB * r;
        p.armF = -0.4 * (1 - r) + p.armF * r; p.armB = 0.5 * (1 - r) + p.armB * r;
      }
      p.phase = phase;
      return p;
    },
  };

  // reaction presets (elapsed t since the beat started); page overlays CAPS/audio
  const react = {
    // hop back, arms up (skit-001 4.3-5.9)
    shock(t) {
      const k = Math.min(1, t / 0.5);
      return pose({ lean: -0.10, hipDy: -6 * k - 10 * Math.sin(Math.min(1, k) * Math.PI),
        armF: -2.2, armB: 2.0, eF: 0.3, eB: 0.3 });
    },
    // lean into the phone (skit-002 <3.5)
    jealous(t) {
      const k = Math.min(1, t / 1.2);
      return pose({ lean: 0.14 * k, armF: 0.9 * k, eF: 0.5, hipDy: -0.6 * Math.sin(t * 6), phone: 'watch' });
    },
    // flat eye, arms crossed-ish (skit-002 >=6.9)
    deadpan() {
      return pose({ lean: -0.02, armF: 0.6, eF: 1.4, armB: -0.5, eB: 1.2, eye: 'flat' });
    },
    // facepalm recover (skit-001 >=6.3)
    facepalm(t) {
      const k = Math.min(1, t / 0.6);
      return pose({ lean: 0.05, hipDy: -3 * k, armF: -2.4 * k + 0.1 * (1 - k), eF: 1.9 * k,
        armB: 0.15, eB: 0.35 });
    },
  };
  rigs.react = (kind, t) => (react[kind] || react.deadpan)(t);

  // ---- props ----------------------------------------------------------------
  const props = {
    box(ctx, x, yTop, w, h) {  // obstacle/seat crate
      ctx.fillStyle = COL.prop; ctx.strokeStyle = COL.propEdge; ctx.lineWidth = 2;
      ctx.fillRect(x, yTop, w, h); ctx.strokeRect(x, yTop, w, h);
    },
    nightstandPhone(ctx, x, groundY) {  // skit-001 room phone
      props.box(ctx, x, groundY - 26, 74, 26);
      ctx.fillStyle = COL.propScreen; ctx.fillRect(x + 28, groundY - 46, 16, 20);
      ctx.strokeStyle = '#5a6a95'; ctx.strokeRect(x + 28, groundY - 46, 16, 20);
    },
    tvFrame(ctx, x, y, r, inner) {      // skit-002 TV; inner(ctx) draws the guest
      ctx.strokeStyle = COL.propEdge; ctx.lineWidth = 5;
      ctx.strokeRect(x - r - 26, y - r - 30, r * 2 + 52, r * 2 + 56);
      ctx.fillStyle = COL.propScreen; ctx.fillRect(x - r - 22, y - r - 26, r * 2 + 44, r * 2 + 48);
      if (inner) inner(ctx);
    },
  };

  // ---- backgrounds ----------------------------------------------------------
  const bg = {
    plain(ctx, W, H, groundY) {
      ctx.fillStyle = COL.bg0; ctx.fillRect(0, 0, W, H);
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, COL.bg1); g.addColorStop(1, COL.bg2);
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = COL.ground; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(0, groundY + 1); ctx.lineTo(W, groundY + 1); ctx.stroke();
    },
    // scrolling street + moon + hills (walk-jump world minus obstacle)
    street(ctx, W, H, groundY, t, speed) {
      speed = speed == null ? 150 : speed;
      bg.plain(ctx, W, H, groundY);
      const sp = 46, off = (t * speed) % sp;
      ctx.lineWidth = 2; ctx.strokeStyle = COL.marks;
      for (let x = -off; x < W; x += sp) {
        ctx.beginPath(); ctx.moveTo(x, groundY + 4); ctx.lineTo(x - 9, groundY + 14); ctx.stroke();
      }
      ctx.fillStyle = COL.moon; ctx.beginPath();
      ctx.arc(W * 0.78, H * 0.14, 22, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = COL.bg0; ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.quadraticCurveTo(W * 0.25, groundY - 46, W * 0.5, groundY);
      ctx.quadraticCurveTo(W * 0.75, groundY - 30, W, groundY - 8);
      ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.fill();
    },
  };

  // ---- overlays ---------------------------------------------------------------
  function makeVignette(W, H) {  // build once per page, drawVig each frame
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const x = c.getContext('2d');
    const v = x.createRadialGradient(W / 2, H / 2, H * 0.25, W / 2, H / 2, H * 0.75);
    v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.45)');
    x.fillStyle = v; x.fillRect(0, 0, W, H);
    return c;
  }
  function drawVig(ctx, vig) { ctx.drawImage(vig, 0, 0); }

  function makeGrain() {  // two 128px tiles, generated once (deterministic after init)
    const tiles = [];
    for (let g = 0; g < 2; g++) {
      const c = document.createElement('canvas'); c.width = 128; c.height = 128;
      const x = c.getContext('2d'), img = x.createImageData(128, 128);
      for (let i = 0; i < img.data.length; i += 4) {
        const v = Math.random() * 255;
        img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 10;
      }
      x.putImageData(img, 0, 0); tiles.push(c);
    }
    return tiles;
  }
  function drawGrain(ctx, W, H, tiles, t) {
    ctx.globalAlpha = 0.45;
    const tile = tiles[Math.floor(t * 16) % tiles.length];
    for (let gy = 0; gy < H; gy += 128) for (let gx = 0; gx < W; gx += 128) ctx.drawImage(tile, gx, gy);
    ctx.globalAlpha = 1;
  }

  // burned caption, proven style; text may contain \n for a 2nd line
  function drawCaption(ctx, W, H, text, o) {
    o = o || {};
    const lines = String(text).split('\n');
    ctx.font = 'bold ' + (o.size || 27) + 'px system-ui, sans-serif';
    ctx.textAlign = 'center';
    const y0 = H * (o.y == null ? 0.88 : o.y) - (lines.length - 1) * (o.size || 27) * 1.15;
    ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(0,0,0,0.78)';
    ctx.fillStyle = '#ffffff';
    lines.forEach((ln, i) => {
      const y = y0 + i * (o.size || 27) * 1.15;
      ctx.strokeText(ln, W / 2, y); ctx.fillText(ln, W / 2, y);
    });
  }

  window.SceneLib = { COL, drawStickman, rigs, react, props, bg, makeVignette, drawVig, makeGrain, drawGrain, drawCaption };
})();
