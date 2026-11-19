#!/usr/bin/env python3
"""Skit audio builder — reads studio/scripts/<name>.json, generates TTS voice lines
(macOS `say`), synthesizes SFX, mixes at the scripted offsets, writes studio/<name>-mix.wav.
Usage: python3 scripts/build_skit_audio.py <name>"""
import json, os, subprocess, wave, math, struct, sys

name = sys.argv[1] if len(sys.argv) > 1 else sys.exit("usage: build_skit_audio.py <name>")
WS = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
script = json.load(open(os.path.join(WS, "studio/scripts", f"{name}.json")))
SR = 48000

def read_wav(p):
    w = wave.open(p, "rb"); n = w.getnframes()
    data = list(struct.unpack(f"<{n}h", w.readframes(n))); w.close()
    return data

def say(text, voice, out_base):
    subprocess.run(["say", "-v", voice, "-o", out_base + ".aiff", text], check=True)
    subprocess.run(["afconvert", "-f", "WAVE", "-d", "LEI16@48000", "-c", "1",
                    out_base + ".aiff", out_base + ".wav"], check=True)
    return read_wav(out_base + ".wav")

def place(mix, data, t, gain=1.0):
    s0 = int(t * SR)
    for i, v in enumerate(data):
        if s0 + i < len(mix): mix[s0 + i] += int(v * gain)

def sfx(kind, t):
    """Procedural SFX — royalty-proof by construction."""
    out = []
    if kind == "ring":
        for burst_t in [t, t + 0.5]:
            s0 = int(burst_t * SR)
            for i in range(int(0.38 * SR)):
                if s0 + i < len(mix):
                    env = min(1, i / 500, (int(0.38*SR) - i) / 800)
                    mix[s0 + i] += int(14000 * env * (0.6 * math.sin(2*math.pi*440*i/SR) + 0.4 * math.sin(2*math.pi*480*i/SR)))
    elif kind == "boing":
        s0 = int(t * SR); freq = 380
        for i in range(int(0.75 * SR)):
            if s0 + i < len(mix):
                f = 380 * (72/380) ** (i / (0.55 * SR)) + 12 * math.sin(2*math.pi*11*i/SR)
                env = (1 - i / (0.75 * SR)) ** 1.5
                out.append((s0 + i, int(14000 * env * math.sin(2*math.pi*f*i/SR))))
    elif kind == "whoosh":
        s0 = int(t * SR)
        for i in range(int(0.7 * SR)):
            if s0 + i < len(mix):
                p = i / (0.7 * SR); env = math.sin(p * math.pi) ** 2
                noise = (2 * ((i/SR*47) % 1) - 1)
                out.append((s0 + i, int(12000 * env * noise * (0.4 + 0.6*math.sin(2*math.pi*(300+2900*p)*i/SR)))))
    elif kind == "splash":
        s0 = int(t * SR)
        for i in range(int(0.25 * SR)):
            if s0 + i < len(mix):
                env = (1 - i / (0.25 * SR)) ** 2
                mix[s0 + i] += int(9000 * env * (2 * (0.5 - abs(((i/SR*40) % 1) - 0.5)) - 0.5))
    for s, v in out:
        if s < len(mix): mix[s] += max(-32767, min(32767, v))

TOTAL = int(script["duration"] * SR)
mix = [0] * TOTAL
warnings = []
lines = sorted(script.get("lines", []), key=lambda l: l["t"])
for i, ln in enumerate(lines):
    voice = ln.get("voice", "Fred")
    data = say(ln["text"], voice, f"/tmp/{name}_line{i}")
    dur = len(data) / SR
    end = ln["t"] + dur
    nxt = lines[i + 1]["t"] if i + 1 < len(lines) else script["duration"]
    if end > nxt + 0.05:
        warnings.append(f"line {i} ({voice}) ends {end:.2f} but next starts {nxt:.2f} — OVERLAP")
    place(mix, data, ln["t"], ln.get("gain", 1.0))
for s in script.get("sfx", []):
    sfx(s["type"], s["t"])
mix = [max(-32767, min(32767, v)) for v in mix]
os.makedirs(os.path.join(WS, "studio"), exist_ok=True)
w = wave.open(os.path.join(WS, "studio", f"{name}-mix.wav"), "wb")
w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
w.writeframes(struct.pack(f"<{len(mix)}h", *mix)); w.close()
print(f"mix written: studio/{name}-mix.wav ({len(mix)/SR:.2f}s)")
for wmsg in warnings: print("WARN:", wmsg)
