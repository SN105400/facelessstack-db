// StickmanLib v1 — shared scene library (single source of truth).
// Used by studio/skit_template.html (self-encoding) and studio/storyboard.html (review).
// Skit pages define their story as JSON (studio/scripts/<name>.json); this lib renders it.
// New rigs/props get added HERE, then all skits inherit them.
window.StickmanLib = (function () {
  const POSES = {
    idle:        { lean: 0.04, armF: 0.12, armB: -0.12, eF: 0.45, eB: 0.45 },
    'talk-phone':{ lean: 0.06, armF: 1.9, eF: 0.25, armB: -0.1, eB: 0.4, phone: true },
    shock:       { lean: -0.10, armF: -2.2, armB: 2.0, eF: 0.3, eB: 0.3, hop: true },
    facepalm:    { lean: 0.02, armF: -2.4, eF: 1.9, armB: 0.15, eB: 0.35, hipY: -3 },
    'walk-away': { walk: true, lean: 0.10, scroll: true },
    think:       { lean: -0.03, armF: 0.5, eF: 1.6, armB: -0.3, eB: 0.5, hipY: -2 },
    wave:        { lean: 0.02, armF: -1.5, eF: 0.25, armB: -0.1, eB: 0.4, waveArm: true },
  };

  function poseAt(script, t) {
    const beats = script.beats;
    let beat = beats[beats.length - 1];
    for (const b of beats) if (t >= (b.from ?? 0) && t < (b.to ?? script.duration)) { beat = b; break; }
    const pose = { ...(POSES[beat.pose ?? 'idle'] || POSES.idle) };
    if (!POSES[beat.pose ?? 'idle']) pose.__unknownPose = beat.pose;
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

  function drawScene(ctx, W, H, t, script, rms) {
    const tClamped = Math.min(t, script.duration);
    ctx.fillStyle = '#0a0d18'; ctx.fillRect(0, 0, W, H);
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#0d1226'); g.addColorStop(1, '#04060d');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    const GY = H * 0.70, CX = W * 0.46;
    const pose = poseAt(script, tClamped);
    let hipY = GY - 58 + (pose.hipY ?? 0), lean = pose.lean ?? 0;
    let thighF = 0.08, thighB = -0.08, kneeF = 0.10, kneeB = 0.10;
    let armF = pose.armF ?? 0.12, armB = pose.armB ?? -0.12, eF = pose.eF ?? 0.45, eB = pose.eB ?? 0.45;
    let scrollOff = 0;
    if (pose.walk) {
      const wf = tClamped * 2.2 * Math.PI * 2, s = 0.55 * Math.sin(wf);
      thighF = s; thighB = -s;
      kneeF = Math.max(0.12, 0.5 * Math.sin(wf + 0.9)); kneeB = Math.max(0.12, 0.5 * Math.sin(wf + 0.9 + Math.PI));
      if ((pose.armF ?? 0) === 0) { armF = -0.7 * Math.sin(wf) + 0.1; armB = 0.7 * Math.sin(wf) - 0.1; }
      hipY += -3 * Math.abs(Math.sin(wf));
      scrollOff = (tClamped * 150) % 46;
    }
    if (pose.waveArm) armF = (pose.armF ?? -1.5) + 0.25 * Math.sin(tClamped * Math.PI * 6);
    const hop = pose.hop ? pose.hop : 0;
    const hipX = CX, lx = Math.sin(lean), ly = Math.cos(lean);
    const neckX = hipX + lx * 34, neckY = hipY - ly * 34 + hop;
    const headX = neckX + lx * 14, headY = neckY - 15;
    ctx.lineCap = 'round'; ctx.strokeStyle = '#e8ecff'; ctx.fillStyle = '#e8ecff';
    const seg = (x1,y1,x2,y2,w) => { ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke(); };
    function leg(th, kn) { const kx = hipX + Math.sin(th)*26, ky = hipY + Math.cos(th)*26;
      const fx = kx + Math.sin(th-kn)*30, fy = ky + Math.cos(th-kn)*30;
      seg(hipX, hipY, kx, ky, 5); seg(kx, ky, fx, fy, 4); }
    function arm(a, e) { const ex = neckX + Math.sin(a)*22, ey = neckY + Math.cos(a)*22;
      const hx = ex + Math.sin(a+e)*20, hy = ey + Math.cos(a+e)*20;
      seg(neckX, neckY, ex, ey, 4); seg(ex, ey, hx, hy, 3.5); }
    leg(thighB, kneeB);
    seg(hipX, hipY, neckX, neckY, 5);
    arm(armB, eB);
    leg(thighF, kneeF);
    arm(armF, eF);
    ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(headX, headY, 11, 0, Math.PI*2); ctx.stroke();
    const mouthOpen = (rms || 0) * 6 * (pose.phone ? 0 : 1);
    const deadpan = script.deadpan && tClamped >= (script.deadpan.from ?? 1e9);
    if (mouthOpen > 0.08 && !deadpan) {
      ctx.beginPath(); ctx.ellipse(headX + 6, headY + 4.5, 2.4, 1 + 3 * Math.min(1, mouthOpen), 0, 0, Math.PI*2); ctx.fill();
    } else if (deadpan) {
      ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(headX + 1, headY - 3); ctx.lineTo(headX + 7, headY - 2); ctx.stroke();
    } else {
      ctx.beginPath(); ctx.arc(headX + 4, headY - 2, 1.8, 0, Math.PI*2); ctx.fill();
    }
    if (pose.phone) { ctx.fillStyle = '#4a5a94'; ctx.fillRect(neckX + 26, neckY + 2, 12, 20); }
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
    return { pose: pose.__unknownPose || beat_name(script, tClamped), scrollOff };
  }
  function beat_name(script, t) {
    for (const b of script.beats) if (t >= (b.from ?? 0) && t < (b.to ?? script.duration)) return b.pose;
    return script.beats[script.beats.length - 1]?.pose || 'idle';
  }

  return { POSES, poseAt, drawScene, beat_name };
})();
