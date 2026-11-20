// StickmanLib v3.1 — shared scene library (single source of truth).
// Scenes: generic (walk/jump/sit) + bedroom. Poses: idle, talk-phone, shock, facepalm,
//   walk-away, think, wave, sit, lying, boltup, crouch.
// Juice v2/v3: squash & stretch, head follow-through, blinks, breathing, dust,
//   walk foot-IK (pinned stance, no slide), smear ghosts, camera punch-ins, line boil.
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
    lying:       { lean: 0 },
    boltup:      { lean: 0 },
    crouch:      { lean: 0.24, armF: -0.7, eF: 0.6, armB: -0.55, eB: 0.5, hipY: 16 },
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

  function walkFoot(tAbs, legPhase, STEP, stride, lift) {
    const c = ((tAbs * STEP + legPhase) % 1 + 1) % 1;
    if (c < 0.5) return { x: stride / 2 - (c / 0.5) * stride, y: 0, stance: true };
    const k = (c - 0.5) / 0.5;
    return { x: -stride / 2 + k * stride, y: -lift * Math.sin(k * Math.PI), stance: false };
  }

  function boil(seedStr) {
    let h = 0;
    for (let k = 0; k < seedStr.length; k++) h = (h * 31 + seedStr.charCodeAt(k)) | 0;
    return ((h % 200) / 100) - 1;
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

  function camera(script, t) {
    let zoom = 1, fx = 0.5, fy = 0.5;
    const cam = (script.cams || []).find(c => t >= c.from && t < (c.to ?? script.duration));
    if (cam) {
      const camT = Math.min(1, (t - cam.from) / Math.max(0.4, (cam.to ?? script.duration) - cam.from));
      zoom = (cam.zoom ?? 1) * (1 + 0.04 * (cam.drift ? camT : 0));
      fx = cam.fx ?? 0.5; fy = cam.fy ?? 0.5;
    }
    return { zoom, fx, fy };
  }

  function drawScene(ctx, W, H, t, script, rms) {
    const tClamped = Math.min(t, script.duration);
    const boilSeed = Math.floor(t * 8);
    let segCounter = 0;
    const seg = (x1, y1, x2, y2, w) => {
      const sid = 's' + (++segCounter);
      const j1 = boil(boilSeed + ':' + sid + 'a') * 1.7, j2 = boil(boilSeed + ':' + sid + 'b') * 1.7;
      const j3 = boil(boilSeed + ':' + sid + 'c') * 1.7, j4 = boil(boilSeed + ':' + sid + 'd') * 1.7;
      ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(x1 + j1, y1 + j2); ctx.lineTo(x2 + j3, y2 + j4); ctx.stroke();
      ctx.lineWidth = w * 0.55; ctx.strokeStyle = 'rgba(232,236,255,0.55)';
      ctx.beginPath(); ctx.moveTo(x1 + j3, y1 + j4); ctx.lineTo(x2 + j1, y2 + j2); ctx.stroke();
      ctx.strokeStyle = '#e8ecff';
    };

    const cam = camera(script, tClamped);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#0a0d18'; ctx.fillRect(0, 0, W, H);
    ctx.save();
    ctx.translate(W / 2, H / 2); ctx.scale(cam.zoom, cam.zoom); ctx.translate(-W * cam.fx, -H * cam.fy);

    if (script.scene === 'bedroom') { drawBedroom(ctx, W, H, tClamped, script, rms, seg); ctx.restore(); return { pose: 'bedroom' }; }

    const GY = H * 0.70, CX = W * 0.46;
    const pose = poseAt(script, tClamped);
    const beat = pose.__beat || {};
    let hipY = GY - 58 + (pose.hipY ?? 0), lean = pose.lean ?? 0;
    let thighF = 0.08, thighB = -0.08, kneeF = 0.10, kneeB = 0.10;
    let armF = pose.armF ?? 0.12, armB = pose.armB ?? -0.12, eF = pose.eF ?? 0.45, eB = pose.eB ?? 0.45;
    let scrollOff = 0, squashY = 1, squashX = 1, headLag = 0, dustT = -1, dustX = CX;
    const breathing = 1.2 * Math.sin(tClamped * Math.PI * 2 * 0.4) * (pose.walk ? 0 : 1);
    hipY += breathing;
    const hop = pose.hop ? pose.hop : 0;
    const hipX = CX, lx = Math.sin(lean), ly = Math.cos(lean);
    let footA = null, footB = null;

    function legFK(th, kn) { const kx = hipX + Math.sin(th)*26, ky = hipY + Math.cos(th)*26;
      const fx = kx + Math.sin(th-kn)*30, fy = ky + Math.cos(th-kn)*30;
      seg(hipX, hipY, kx, ky, 5); seg(kx, ky, fx, fy, 4); }
    function armFK(a, e) { const ex = neckX + Math.sin(a)*22, ey = neckY + Math.cos(a)*22;
      const hx = ex + Math.sin(a+e)*20, hy = ey + Math.cos(a+e)*20;
      seg(neckX, neckY, ex, ey, 4); seg(ex, ey, hx, hy, 3.5); }
    function legIK(fx, fy, ghost) {
      const [kx, ky] = solveIK(hipX, hipY, fx, fy, 26, 30, -1);
      if (ghost) ctx.globalAlpha = ghost;
      seg(hipX, hipY, kx, ky, 5); seg(kx, ky, fx, fy, 4);
      ctx.globalAlpha = 1;
    }

    ctx.save();
    ctx.translate(hipX, hipY); ctx.scale(squashX, squashY); ctx.translate(-hipX, -hipY);
    if (pose.walk) {
      const STEP = 2.2, stride = 34, lift = 15, dt = 1 / (script.fps ?? 24);
      const wf = tClamped * STEP * Math.PI * 2, s = 0.55 * Math.sin(wf);
      if ((pose.armF ?? 0) === 0) { armF = -0.7 * Math.sin(wf) + 0.1; armB = 0.7 * Math.sin(wf) - 0.1; }
      hipY += -3 * Math.abs(Math.sin(wf)) + 1.5 * Math.max(0, Math.sin(wf * 2));
      scrollOff = (tClamped * 150) % 46;
      footA = walkFoot(tClamped, 0, STEP, stride, lift);
      footB = walkFoot(tClamped, 0.5, STEP, stride, lift);
      footA = { x: CX + footA.x, y: GY + footA.y, stance: footA.stance };
      footB = { x: CX + footB.x, y: GY + footB.y, stance: footB.stance };
      const prevA = walkFoot(tClamped - dt, 0, STEP, stride, lift);
      const prevB = walkFoot(tClamped - dt, 0.5, STEP, stride, lift);
      for (const [ft, ftp] of [[footA, { x: CX + prevA.x, y: GY + prevA.y, stance: prevA.stance }],
                               [footB, { x: CX + prevB.x, y: GY + prevB.y, stance: prevB.stance }]]) {
        if (ft.stance) continue;
        legIK(ftp.x, ftp.y, 0.15);
      }
      legIK(footA.x, footA.y, 0);
      legIK(footB.x, footB.y, 0);
      for (const ft of [footA, footB]) if (ft.stance) {
        ctx.lineWidth = 4; ctx.beginPath();
        ctx.moveTo(ft.x + 4, ft.y); ctx.lineTo(ft.x - 6, ft.y); ctx.stroke();
      }
    } else if (pose.sit) {
      thighF = 1.45; kneeF = -1.45; thighB = 1.35; kneeB = -1.40;
      legFK(thighB, kneeB); legFK(thighF, kneeF);
    } else {
      legFK(thighB, thighB < 0 ? Math.max(0.1, -thighB * 0.6) : 0.1);
      legFK(thighF, kneeF);
    }
    const neckY0 = hipY - ly * 34;
    const neckX = hipX + lx * 34, neckY = neckY0 + headLag;
    const headX = neckX + lx * 14, headY = neckY - 15 + headLag * 0.4;
    ctx.restore();
    seg(hipX, hipY, neckX, neckY, 5);
    armFK(armB, eB);
    armFK(armF, eF);
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
    if (beat.prop === 'chair' || pose.sit) {
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
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    return { pose: beat_name(script, tClamped), scrollOff, squashY, phase: beat.pose };
  }

  function drawBedroom(ctx, W, H, tt, script, rms, seg) {
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#04060f'); bg.addColorStop(1, '#090b16');
    ctx.fillStyle = bg; ctx.fillRect(-W, -H, W * 3, H * 3);
    ctx.strokeStyle = '#3a4468'; ctx.lineWidth = 3;
    ctx.strokeRect(W * 0.12, H * 0.08, W * 0.26, H * 0.16);
    ctx.beginPath(); ctx.moveTo(W * 0.25, H * 0.08); ctx.lineTo(W * 0.25, H * 0.24); ctx.stroke();
    ctx.fillStyle = 'rgba(220,228,255,0.8)'; ctx.beginPath(); ctx.arc(W * 0.18, H * 0.155, 15, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = '#8fa0c9'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(W * 0.62, H * 0.13, 24, 0, Math.PI*2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(W * 0.62, H * 0.13); ctx.lineTo(W * 0.62, H * 0.13 - 14); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(W * 0.62, H * 0.13); ctx.lineTo(W * 0.62 + 14, H * 0.13); ctx.stroke();
    const bedTop = H * 0.66;
    ctx.fillStyle = '#1a2242'; ctx.fillRect(W * 0.08, bedTop, W * 0.84, H * 0.055);
    ctx.fillStyle = '#26304f'; ctx.fillRect(W * 0.10, bedTop - 13, 88, 25);
    const upBeat = script.beats.find(b => b.pose === 'boltup' && tt >= b.from && tt < (b.to ?? script.duration));
    if (!upBeat) {
      const ly = bedTop - 14;
      ctx.strokeStyle = '#e8ecff'; ctx.fillStyle = '#e8ecff'; ctx.lineCap = 'round';
      ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(W * 0.15, ly); ctx.lineTo(W * 0.44, ly); ctx.stroke();
      ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(W * 0.125, ly - 3, 11, 0, Math.PI*2); ctx.stroke();
      const blink = (tt % 3.1) < 0.11 && !script.noBlink;
      ctx.beginPath(); ctx.arc(W * 0.128, ly - 4, 1.6, 0, Math.PI*2); ctx.fill();
      if (blink) { ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(W * 0.121, ly - 4); ctx.lineTo(W * 0.134, ly - 4); ctx.stroke(); }
      ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(W * 0.26, ly - 1); ctx.lineTo(W * 0.33, ly + 5); ctx.stroke();
      ctx.fillStyle = '#182044'; ctx.fillRect(W * 0.30, bedTop - 6, W * 0.56, 24);
    } else {
      const hipX = W * 0.22, hipY = bedTop - 56;
      ctx.strokeStyle = '#e8ecff'; ctx.fillStyle = '#e8ecff'; ctx.lineCap = 'round';
      const seg2 = (x1,y1,x2,y2,w) => { ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke(); };
      seg2(hipX, hipY, hipX + 2, hipY - 34, 5);
      ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(hipX + 3, hipY - 47, 11, 0, Math.PI*2); ctx.stroke();
      ctx.beginPath(); ctx.arc(hipX + 5, hipY - 49, 2.3, 0, Math.PI*2); ctx.fill();
      seg2(hipX, hipY, hipX - 15, hipY - 25, 4); seg2(hipX - 15, hipY - 25, hipX - 22, hipY - 36, 3.5);
      seg2(hipX, hipY, hipX + 17, hipY - 23, 4); seg2(hipX + 17, hipY - 23, hipX + 26, hipY - 30, 3.5);
      ctx.fillStyle = '#182044'; ctx.beginPath(); ctx.ellipse(hipX, bedTop - 4, 84, 16, 0, Math.PI, 0); ctx.fill();
      if ((rms || 0) * 6 > 0.5) {
        ctx.beginPath(); ctx.ellipse(hipX + 5, hipY - 43, 3, 1.5 + 3.4 * Math.min(1, rms * 6), 0, 0, Math.PI*2); ctx.fill();
      }
    }
    const cap = (script.captions || []).find(c => tt >= c.from && tt <= c.to);
    if (cap) {
      if (cap.style === 'bubble') {
        const words = cap.text.split(' ');
        const rows = []; let cur = '';
        for (const w of words) { if ((cur + ' ' + w).trim().length > 30) { rows.push(cur.trim()); cur = w; } else cur += ' ' + w; }
        if (cur.trim()) rows.push(cur.trim());
        const bx = W * 0.56, by = H * 0.27;
        const wpx = Math.max(230, Math.max(...rows.map(l => l.length)) * 11.5 + 30);
        const hgt = 40 + rows.length * 26;
        ctx.fillStyle = 'rgba(234,240,255,0.94)';
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(bx - wpx/2, by - hgt/2, wpx, hgt, 16); else ctx.rect(bx - wpx/2, by - hgt/2, wpx, hgt);
        ctx.fill();
        ctx.fillStyle = '#0a0d18';
        for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.arc(bx - wpx/2 + 12 - k*15, by + hgt/2 + k*13, 6.5 - k*2, 0, Math.PI*2); ctx.fill(); }
        ctx.font = 'bold 23px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = '#0a0d18';
        rows.forEach((row, ri) => ctx.fillText(row, bx, by - hgt/2 + 30 + ri * 26));
      } else {
        ctx.font = 'bold 32px system-ui, sans-serif'; ctx.textAlign = 'center';
        ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(0,0,0,0.78)';
        ctx.strokeText(cap.text, W/2, H * 0.45); ctx.fillStyle = '#ffffff';
        ctx.fillText(cap.text, W/2, H * 0.45);
      }
    }
    const flash = (script.sfx || []).find(s => s.text && tt >= s.t && tt <= s.t + 0.9);
    if (flash) { ctx.font = 'bold 30px system-ui, sans-serif'; ctx.fillStyle = '#ffd76e'; ctx.fillText(flash.text, W/2, H * 0.6); }
    ctx.drawImage(vig(W, H), 0, 0);
    const tile = grainTiles()[Math.floor(tt * 16) % 2];
    ctx.globalAlpha = 0.4;
    for (let gy = 0; gy < H; gy += 128) for (let gx = 0; gx < W; gx += 128) ctx.drawImage(tile, gx, gy);
    ctx.globalAlpha = 1;
  }

  return { POSES, poseAt, drawScene, beat_name, jumpJuice, solveIK, walkFoot, camera };
})();
