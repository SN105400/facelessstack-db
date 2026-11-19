#!/usr/bin/env python3
"""Skit script validator — gates scripts BEFORE audio/encode.
Usage: python3 scripts/validate_skit.py <name>   (exit 0 = pass)"""
import json, os, sys, re

name = sys.argv[1] if len(sys.argv) > 1 else sys.exit("usage: validate_skit.py <name>")
WS = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
path = os.path.join(WS, "studio/scripts", f"{name}.json")
try:
    s = json.load(open(path))
except Exception as e:
    print(f"FAIL: cannot parse {path}: {e}"); sys.exit(1)

issues, warns = [], []

# required fields
for k in ["title", "duration", "fps", "lines", "captions", "beats"]:
    if k not in s: issues.append(f"missing field: {k}")
if issues: print("\n".join("FAIL: " + i for i in issues)); sys.exit(1)

dur = s["duration"]
if dur <= 0 or dur > 60: issues.append(f"duration {dur}s outside (0, 60]")
if s["fps"] not in (24, 25, 30): warns.append(f"fps {s['fps']} unusual (24 recommended)")

# beats: coverage + known poses
lib = open(os.path.join(WS, "studio/scenes/stickman-lib.js")).read()
beats = sorted(s["beats"], key=lambda b: b.get("from", 0))
cursor = 0.0
for i, b in enumerate(beats):
    f, t = b.get("from"), b.get("to", dur)
    if f is None or t is None: issues.append(f"beat {i}: missing from/to"); continue
    if abs(f - cursor) > 0.11: issues.append(f"beat {i} ('{b.get('pose')}') starts {f} but coverage cursor at {cursor:.2f} — GAP")
    if t <= f: issues.append(f"beat {i}: to ({t}) <= from ({f})")
    cursor = t
    if b.get("pose") and b["pose"] not in lib: issues.append(f"beat {i}: pose '{b['pose']}' not in stickman-lib.js")
if abs(cursor - dur) > 0.11: issues.append(f"beats end at {cursor:.2f} but duration is {dur} — TRAILING GAP")

# captions within duration
for c in s["captions"]:
    if c.get("to", 0) > dur + 0.05: warns.append(f"caption '{c['text'][:30]}…' ends {c['to']} > duration {dur}")

# lines: fields + naive duration overlap check (est. 14 chars/sec speech)
lines = sorted(s["lines"], key=lambda l: l.get("t", 0))
for i, l in enumerate(lines):
    for k in ["t", "voice", "who", "text"]:
        if k not in l: issues.append(f"line {i}: missing '{k}'")
    est = max(1.0, len(l.get("text", "")) / 14 + 0.5)
    end = l.get("t", 0) + est
    nxt = lines[i + 1].get("t", dur + 99) if i + 1 < len(lines) else dur + 99
    if end > nxt: warns.append(f"line {i} ('{l['voice']}') est. ends {end:.2f} > next line t {nxt:.2f} — verify with build_skit_audio (it measures real TTS)")
    if l.get("who") == "stickman" and l.get("mouth") is not True:
        warns.append(f"line {i}: stickman line without mouth:true — mouth will stay closed")

# policy guard (content-topics lanes): crude but cheap keyword tripwire
banned = re.compile(r"\b(election|vote|president|senate|war|killed|shooting|tragedy)\b", re.I)
for l in s["lines"]:
    if banned.search(l.get("text", "")): warns.append(f"POLICY: line text may trip political/tragedy filters: '{l['text'][:60]}…'")

print(f"validated: {len(s['lines'])} lines, {len(s['captions'])} captions, {len(beats)} beats, {dur}s")
for w in warns: print("WARN:", w)
if issues: print("\n".join("FAIL: " + i for i in issues)); sys.exit(1)
print("PASS" if not warns else "PASS (with warnings)")
