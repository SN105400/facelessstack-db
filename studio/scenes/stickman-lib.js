// StickmanLib v3 — shared scene library.
// v3 (2026-11-20): foot-IK walk (stance feet PINNED to the scrolling ground — no slide),
//   smear ghosts on fast limbs, 'sit' pose + chair prop, foot-flat contacts.
// v2: squash & stretch, head follow-through, blinks, breathing, dust, generic jump beat.
// API: POSES, poseAt(script,t), drawScene(ctx,W,H,t,script,rms), beat_name, jumpJuice.
window.StickmanLib = (function () {
  const POSES = {
    idle:        { lean: 0.04, armF: 0.12, armB: -0.12, eF: 0.45, eB: 0.45 },
    'talk-phone':{ lean: 0.06, armF: 1.9, eF: 0.25, armB: -0.1, eB: 0.4, phone: true },
    shock:       { lean: -0.10, armF: -2.2, armB: 2.0, eF: 0.3, eB: 0.3, hop: true },
    facepalm:    { lean: 0.02, armF: -2.4, eF: 1.9, armB: 0.15, eB: 0.35, hipY: -3 },
    'walk-away': { walk: true, lean: 0.10, scroll: true },
    think:       { lean: -0.03, armF: 0.5, eF: 1.6, armB: -0.3, eB: 0.5, hipY: -2 },
    wave:        { lean: 0.02, armF: -1.5, eF: 0.25, armB: -0.1, eB: 0.4, waveArm: true },
    sit:         { sit: true, lean: 0.03, armF: 0.3, eF: 0.6, armB: -0.2, eB: 0.5 },
    crouch:      { lean: 0.24, armF: -0.7, eF: 0.6, armB: -0.55, eB: 0.5, hipY: 16, kneeOverride: 1.15 },
  };

  function poseAt(script, t) {
    const beats = script.beats;
    let beat = beats[beats.length - 1];
    for (const b of beats) if (t >= (b.from ?? 0) && t < (b.to ?? script.duration)) { beat = b; break; }
    const pose = { ...(POSES[beat.pose ?? 'idle'] || POSES.idle) };
    if (!POSES[beat.pose ?? 'idle']) pose.__unknownPose = beat.pose;
    pose.__beat = beat;
    const idx = beats.indexOf(beat);
    const t0 = beat.from ?? 0;
    if (idx > 0) {
      const prev = POSES[beats[idx - 1].pose ?? 'idle'] || POSES.idle;
      const k = Math.min(1, (t - t0) / 0.35), e = k * k * (3 - 2 * k);
      for (const key of ['lean', 'armF', 'armB', 'eF', 'eB', 'hipY']) {
        const a = prev[key] ?? 0, b = pose[key] ?? 0;
        pose[key] = (a ?? 0) + ((b ?? 0) - (a ?? 0)) * e;
      }
      pose.walk = pose.walk || (prev.walk && e < 0.5);
    }
    if (pose.hop) pose.hop = Math.sin(Math.min(1, (t - t0) / 0.5) * Math.PI) * 10;
    return pose;
  }

  function beat_name(script, t) {
    for (const b of script.beats) if (t >= (b.from ?? 0) && t < (b.to ?? script.duration)) return b.pose;
    return script.beats[script.beats.length - 1]?.pose || 'idle';
  }

  // 2-bone IK: returns knee position. bendSign -1 = knee toward +x (facing dir).
  function solveIK(hx, hy, fx, fy, L1, L2, bendSign) {
    let dx = fx - hx, dy = fy - hy;
    let d = Math.hypot(dx, dy) || 1;
    const maxL = (L1 + L2) * 0.999, minL = Math.abs(L1 - L2) + 2;
    d = Math.max(minL, Math.min(maxL, d));
    const a = (L1 * L1 - L2 * L2 + d * d) / (2 * d);
    const h = Math.sqrt(Math.max(0, L1 * L1 - a * a));
    const ux = dx / d, uy = dy / d;
    return [hx + ux * a - uy * h * bendSign, hy + uy * a + ux * h * bendSign];
  }

  let grainCache = null;
  function grainTiles() {
    if (grainCache) return grainCache;
    grainCache = [];
    for (let g = 0; g < 2; g++) {
      const gc = document.createElement('canvas'); gc.width = 128; gc.height = 128;
      const gx = gc.getContext('2d'), img = gx.createImageData(128, 128);
      for (let i = 0; i < img.data.length; i += 4) {
        const v = Math.random() * 255;
        img.data[i] = img.data[i+1] = img.data[i+2] = v; img.data[i+3] = 10;
      }
      gx.putImageData(img, 0, 0); grainCache.push(gc);
    }
    return grainCache;
  }

  let vigCache = {};
  function vig(W, H) {
    const key = W + 'x' + H;
    if (!vigCache[key]) {
      const vc = document.createElement('canvas'); vc.width = W; vc.height = H;
      const vx = vc.getContext('2d');
      const v = vx.createRadialGradient(W/2, H/2, H*0.25, W/2, H/2, H*0.75);
      v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.45)');
      vx.fillStyle = v; vx.fillRect(0, 0, W, H);
      vigCache[key] = vc;
    }
    return vigCache[key];
  }

  function jumpJuice(beat, tt, t0) {
    const airIn = beat.airIn ?? (t0 + 0.8), landIn = beat.landIn ?? (airIn + 0.8);
    const height = beat.height ?? 118;
    const st = { phase: 'walk', hipDy: 0, squashY: 1, squashX: 1, headLag: 0, dust: 0, kneeF: 0.1, kneeB: 0.1 };
    if (tt < airIn - 0.55) {
      const k = Math.min(1, Math.max(0, (tt - (airIn - 1.6)) / 1.05));
      st.phase = 'approach'; st.hipDy = 16 * k; st.kneeF = st.kneeB = 1.15 * k; st.squashY = 1 - 0.06 * k; st.squashX = 1 + 0.05 * k;
    } else if (tt < airIn) {
      st.phase = 'crouch'; st.hipDy = 16; st.kneeF = st.kneeB = 1.15; st.squashY = 0.94; st.squashX = 1.06;
    } else if (tt < landIn) {
      const p = (tt - airIn) / (landIn - airIn);
      st.phase = 'air'; st.hipDy = -height * 4 * p * (1 - p);
      st.squashY = 1 + 0.10 * Math.sin(p * Math.PI); st.squashX = 1 - 0.06 * Math.sin(p * Math.PI);
      st.kneeF = 2.0; st.kneeB = 1.6;
      st.headLag = -5 * Math.sin(p * Math.PI * 2);
      if (p > 0.92) { st.squashY = 0.97; st.squashX = 1.03; }
    } else if (tt < landIn + 0.45) {
      const k = (tt - landIn) / 0.45;
      st.phase = 'land'; st.hipDy = 14 * (1 - k);
      st.squashY = 0.86 + 0.14 * k; st.squashX = 1.12 - 0.12 * k;
      st.kneeF = st.kneeB = 0.9 * (1 - k);
      st.dust = (tt - landIn) < 0.3 ? 1 : 0;
      st.headLag = -6 * Math.sin(Math.min(1, k * 1.4) * Math.PI);
    }
    return st;
  }

  // walk foot targets (treadmill-pinned): stance foot moves at ground speed = no slide.
  // STEP steps/sec, stride px per stance, lift px swing arc. legPhase: legA 0, legB 0.5.
  function walkFoot(tAbs, legPhase, STEP, stride, lift) {
    const c = ((tAbs * STEP + legPhase) % 1 + 1) % 1;
    if (c < 0.5) return { x: stride / 2 - (c / 0.5) * stride, y: 0, stance: true };
    const k = (c - 0.5) / 0.5;
    return { x: -stride / 2 + k * stride, y: -lift * Math.sin(k * Math.PI), stance: false };
  }

  function drawScene(ctx, W, H, t, script, rms) {
    const tClamped = Math.min(t, script.duration);
    ctx.fillStyle = '#0a0d18'; ctx.fillRect(0, 0, W, H);
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#0d1226'); g.addColorStop(1, '#04060d');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    const GY = H * 0.70, CX = W * 0.46;
    const pose = poseAt(script, tClamped);
    const beat = pose.__beat || {};
    let hipY = GY - 58 + (pose.hipY ?? 0), lean = pose.lean ?? 0;
    let thighF = 0.08, thighB = -0.08, kneeF = 0.10, kneeB = 0.10;
    let armF = pose.armF ?? 0.12, armB = pose.armB ?? -0.12, eF = pose.eF ?? 0.45, eB = pose.eB ?? 0.45;
    let scrollOff = 0, squashY = 1, squashX = 1, headLag = 0, dustT = -1, dustX = CX;
    const breathing = 1.2 * Math.sin(tClamped * Math.PI * 2 * 0.4) * (pose.walk ? 0 : 1);
    hipY += breathing;
    let footA = null, footB = null, footA_prev = null, footB_prev = null;

    if (pose.walk) {                                   // ---- foot-IK walk: no slide ----
      const STEP = 2.2, stride = 34, lift = 15;
      const wf = tClamped * STEP * Math.PI * 2;
      const s = 0.55 * Math.sin(wf);
      if ((pose.armF ?? 0) === 0) { armF = -0.7 * Math.sin(wf) + 0.1; armB = 0.7 * Math.sin(wf) - 0.1; }
      hipY += -3 * Math.abs(Math.sin(wf)) + 1.5 * Math.max(0, Math.sin(wf * 2));
      scrollOff = (tClamped * 150) % 46;
      const dt = 1 / (script.fps ?? 24);
      const toAbs = f => ({ x: CX + f.x, y: GY + f.y, stance: f.stance });
      footA = toAbs(walkFoot(tClamped, 0, STEP, stride, lift));
      footB = toAbs(walkFoot(tClamped, 0.5, STEP, stride, lift));
      footA_prev = toAbs(walkFoot(tClamped - dt, 0, STEP, stride, lift));
      footB_prev = toAbs(walkFoot(tClamped - dt, 0.5, STEP, stride, lift));
    }
    if (beat.pose === 'jump') {
      const j = jumpJuice(beat, tClamped, beat.from ?? 0);
      hipY += j.hipDy; kneeF = j.kneeF; kneeB = j.kneeB;
      squashY = j.squashY; squashX = j.squashX; headLag = j.headLag; dustT = j.dust; dustX = CX;
      if (j.phase === 'air') { thighF = 0.5; thighB = -0.35; kneeF = j.kneeF; kneeB = j.kneeB;
        armF = -2.1 + 0.3 * Math.sin((tClamped - (beat.airIn ?? 0)) * Math.PI * 2); armB = -1.6; lean = 0.10 - 0.06; }
      if (j.phase === 'crouch') lean = 0.24;
      if (j.phase === 'approach') lean = 0.10 + 0.10 * j.hipDy / 16;
    }

    const hop = pose.hop ? pose.hop : 0;
    const hipX = CX, lx = Math.sin(lean), ly = Math.cos(lean);
    const neckY0 = hipY - ly * 34;
    const neckX = hipX + lx * 34, neckY = neckY0 + headLag;
    const headX = neckX + lx * 14, headY = neckY - 15 + headLag * 0.4;
    ctx.lineCap = 'round'; ctx.strokeStyle = '#e8ecff'; ctx.fillStyle = '#e8ecff';
    const seg = (x1,y1,x2,y2,w) => { ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke(); };
    function legTo(fx, fy, alpha) {
      const [kx, ky] = solveIK(hipX, hipY, fx, fy, 26, 30, -1);
      if (alpha < 1) ctx.globalAlpha = alpha;
      seg(hipX, hipY, kx, ky, 5); seg(kx, ky, fx, fy, 4);
      ctx.globalAlpha = 1;
      return [kx, ky];
    }
    const L1 = 26, L2 = 30;
    function leg(th, kn) { const kx = hipX + Math.sin(th)*26, ky = hipY + Math.cos(th)*26;
      const fx = kx + Math.sin(th-kn)*30, fy = ky + Math.cos(th-kn)*30;
      seg(hipX, hipY, kx, ky, 5); seg(kx, ky, fx, fy, 4); }
    function arm(a, e) { const ex = neckX + Math.sin(a)*22, ey = neckY + Math.cos(a)*22;
      const hx = ex + Math.sin(a+e)*20, hy = ey + Math.cos(a+e)*20;
      seg(neckX, neckY, ex, ey, 4); seg(ex, ey, hx, hy, 3.5); }

    // squash & stretch around the hip
    ctx.save();
    ctx.translate(hipX, hipY); ctx.scale(squashX, squashY); ctx.translate(-hipX, -hipY);

    if (pose.walk) {
      // smear ghosts on the swing legs (previous-frame IK poses, low alpha)
      for (const [ft, ftp, on] of [[footA, footA_prev, footA.stance], [footB, footB_prev, footB.stance]]) {
        if (on) continue;                                  // stance feet are planted — no smear
        const [kxg, kyg] = solveIK(hipX, hipY, ftp.x, ftp.y, L1, L2, -1);
        ctx.globalAlpha = 0.15;
        seg(hipX, hipY, kxg, kyg, 5); seg(kxg, kyg, ftp.x, ftp.y, 4);
        ctx.globalAlpha = 1;
      }
      legTo(footA.x, footA.y, 1);
      legTo(footB.x, footB.y, 1);
      // foot-flat contacts on stance feet (grounded look)
      for (const ft of [footA, footB]) if (ft.stance) {
        ctx.lineWidth = 4; ctx.beginPath();
        ctx.moveTo(ft.x + 4, ft.y); ctx.lineTo(ft.x - 6, ft.y); ctx.stroke();
      }
    } else if (pose.sit) {                             // sit: thighs forward, shins down (chair)
      thighF = 1.45; kneeF = -1.45; thighB = 1.35; kneeB = -1.40;
      leg(thighB, kneeB); leg(thighF, kneeF);
    } else {
      leg(thighB, thighB < 0 ? Math.max(0.1, -thighB * 0.6) : 0.1);
      leg(thighF, kneeF);
    }
    seg(hipX, hipY, neckX, neckY, 5);
    arm(armB, eB);
    arm(armF, eF);
    ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(headX, headY, 11, 0, Math.PI*2); ctx.stroke();
    const blink = (tClamped % 3.1) < 0.11 && !script.noBlink;
    const mouthOpen = (rms || 0) * 6 * (pose.phone ? 0 : 1);
    const deadpan = script.deadpan && tClamped >= (script.deadpan.from ?? 1e9);
    if (blink && !deadpan) {
      ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(headX + 1, headY - 2); ctx.lineTo(headX + 7, headY - 2); ctx.stroke();
    } else if (deadpan) {
      ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(headX + 1, headY - 3); ctx.lineTo(headX + 7, headY - 2); ctx.stroke();
    } else {
      ctx.beginPath(); ctx.arc(headX + 4, headY - 2, 1.8, 0, Math.PI*2); ctx.fill();
    }
    if (mouthOpen > 0.08 && !blink && !deadpan) {
      ctx.beginPath(); ctx.ellipse(headX + 6, headY + 4.5, 2.4, 1 + 3 * Math.min(1, mouthOpen), 0, 0, Math.PI*2); ctx.fill();
    }
    if (pose.phone) { ctx.fillStyle = '#4a5a94'; ctx.fillRect(neckX + 26, neckY + 2, 12, 20); }
    ctx.restore();
    if (dustT >= 0) {
      ctx.fillStyle = 'rgba(143,160,201,0.5)';
      for (let k = 0; k < 6; k++) {
        const dir = k % 2 === 0 ? 1 : -1;
        const px = dustX + dir * (8 + k * 6) * Math.min(1, dustT / 0.3);
        const py = GY - 4 - 8 * (dustT / 0.3) * (1 - k * 0.12);
        ctx.beginPath(); ctx.arc(px, py, 3.2 - k * 0.4, 0, Math.PI*2); ctx.fill();
      }
    }
    if (beat.prop === 'chair' || pose.sit) {           // chair prop
      const chx = CX - 24;
      ctx.fillStyle = '#1a2242'; ctx.strokeStyle = '#4a5a94'; ctx.lineWidth = 2;
      ctx.fillRect(chx, GY - 30, 34, 8); ctx.strokeRect(chx, GY - 30, 34, 8);
      ctx.fillRect(chx + 26, GY - 58, 6, 58); ctx.strokeRect(chx + 26, GY - 58, 6, 58);
    }
    ctx.strokeStyle = '#3a4468'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(0, GY + 1); ctx.lineTo(W, GY + 1); ctx.stroke();
    if (scrollOff) {
      ctx.lineWidth = 2; ctx.strokeStyle = '#26304f';
      for (let x = -scrollOff; x < W; x += 46) { ctx.beginPath(); ctx.moveTo(x, GY + 4); ctx.lineTo(x - 9, GY + 14); ctx.stroke(); }
    }
    const cap = (script.captions || []).find(c => tClamped >= c.from && tClamped <= c.to);
    if (cap) {
      ctx.font = 'bold 27px system-ui, sans-serif'; ctx.textAlign = 'center';
      ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(0,0,0,0.78)';
      ctx.strokeText(cap.text, W/2, H * 0.88); ctx.fillStyle = '#ffffff';
      ctx.fillText(cap.text, W/2, H * 0.88);
    }
    const flash = (script.sfx || []).find(s => s.text && tClamped >= s.t && tClamped <= s.t + 0.8);
    if (flash) {
      ctx.font = 'bold 34px system-ui, sans-serif'; ctx.fillStyle = '#ffd76e';
      ctx.fillText(flash.text, W/2, H * 0.2);
    }
    ctx.drawImage(vig(W, H), 0, 0);
    const tile = grainTiles()[Math.floor(tClamped * 16) % 2];
    ctx.globalAlpha = 0.45;
    for (let gy = 0; gy < H; gy += 128) for (let gx = 0; gx < W; gx += 128) ctx.drawImage(tile, gx, gy);
    ctx.globalAlpha = 1;
    return { pose: beat_name(script, tClamped), scrollOff, squashY, phase: beat.pose };
  }
  function beat_name(script, t) {
    for (const b of script.beats) if (t >= (b.from ?? 0) && t < (b.to ?? script.duration)) return b.pose;
    return script.beats[script.beats.length - 1]?.pose || 'idle';
  }

  return { POSES, poseAt, drawScene, beat_name, jumpJuice, solveIK, walkFoot };
})();
