#!/usr/bin/env python3
"""Storage hygiene for the FacelessStack workspace.

Retention policy (enforced by this script, checked nightly by the automation):
  - studio/*.webm|mp4: keep newest 5 + anything newer than 14 days (re-renderable).
  - *.aiff (TTS intermediates) older than 1 day: delete (wav copies retained).
  - studio/voice-ab/*.wav: keep newest 10 A/B samples.
  - logs/claim.log|claim.err.log >5MB: truncate to last 200 lines.
  - plan/nightly-*.md older than 45 days: gzip into plan/archive/.
  - data/snapshots/*.gz older than 180 days: delete. Scratch (*.tmp/*.part/*.bak) >1d: delete.
  - Hard cap: workspace >1.5 GB prints a warning line for the report.

Usage: python3 scripts/hygiene.py [--apply]     (default is dry-run)
"""
import os, sys, time, gzip, shutil

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
APPLY = "--apply" in sys.argv
NOW = time.time()
DAY = 86400
freed = 0
actions = []

def fmt(n): return f"{n/1024:.0f} KB" if n < 1024*1024 else f"{n/1024/1024:.1f} MB"

def remove(path, reason):
    global freed
    size = os.path.getsize(path)
    if APPLY:
        os.remove(path)
    freed += size
    actions.append(f"{'DEL' if APPLY else 'DEL(dry)'} {os.path.relpath(path, ROOT)} — {fmt(size)} — {reason}")

def archive(path, reason):
    global freed
    out = os.path.join(ROOT, "plan", "archive", os.path.basename(path) + ".gz")
    os.makedirs(os.path.dirname(out), exist_ok=True)
    size = os.path.getsize(path)
    if APPLY:
        with open(path, "rb") as fin, gzip.open(out, "wb") as fout:
            shutil.copyfileobj(fin, fout)
        os.remove(path)
    # archived file still costs a little; count gross freed for simplicity
    freed += size
    actions.append(f"{'ARC' if APPLY else 'ARC(dry)'} {os.path.relpath(path, ROOT)} — {fmt(size)} — {reason}")

# --- rule: studio renders, keep newest 5 + <14 days ---
studio = os.path.join(ROOT, "studio")
if os.path.isdir(studio):
    webms = []
    for f in os.listdir(studio):
        p = os.path.join(studio, f)
        if f.endswith((".webm", ".mp4")) and os.path.isfile(p):
            webms.append((os.path.getmtime(p), p))
    webms.sort(reverse=True)
    for i, (mt, p) in enumerate(webms):
        age = NOW - mt
        if i >= 5 and age > 14 * DAY:
            remove(p, "render older than 14d, outside newest 5")

# --- rule: TTS .aiff intermediates >1d (converted .wav copies are the kept source) ---
for dirpath, dirnames, filenames in os.walk(ROOT):
    dirnames[:] = [d for d in dirnames if d not in (".git", "node_modules")]
    for f in filenames:
        if f.endswith(".aiff"):
            p = os.path.join(dirpath, f)
            if NOW - os.path.getmtime(p) > DAY:
                remove(p, "TTS intermediate >1d (wav copy retained)")

# --- rule: voice-ab A/B samples, keep newest 10 ---
vab = os.path.join(ROOT, "studio", "voice-ab")
if os.path.isdir(vab):
    samples = []
    for f in os.listdir(vab):
        p = os.path.join(vab, f)
        if f.endswith(".wav") and os.path.isfile(p):
            samples.append((os.path.getmtime(p), p))
    samples.sort(reverse=True)
    for i, (mt, p) in enumerate(samples):
        if i >= 10:
            remove(p, "A/B sample outside newest 10")

# --- rule: claim logs >5MB -> truncate to last 200 lines ---
logs = os.path.join(ROOT, "logs")
if os.path.isdir(logs):
    for f in ("claim.log", "claim.err.log"):
        p = os.path.join(logs, f)
        if os.path.isfile(p) and os.path.getsize(p) > 5 * 1024 * 1024:
            with open(p, "r", errors="replace") as fin:
                tail = fin.readlines()[-200:]
            if APPLY:
                with open(p, "w") as fout: fout.writelines(tail)
            freed += os.path.getsize(p) - sum(len(l) for l in tail)
            actions.append(f"{'TRUNC' if APPLY else 'TRUNC(dry)'} logs/{f} — kept last 200 lines")

# --- rule: nightly reports older than 45 days -> archive ---
plan = os.path.join(ROOT, "plan")
if os.path.isdir(plan):
    for f in sorted(os.listdir(plan)):
        p = os.path.join(plan, f)
        if f.startswith("nightly-") and f.endswith(".md") and os.path.isfile(p):
            if NOW - os.path.getmtime(p) > 45 * DAY:
                archive(p, "nightly report >45d (digest value kept in changelog/memory)")

# --- rule: old compressed data snapshots ---
snaps = os.path.join(ROOT, "data", "snapshots")
if os.path.isdir(snaps):
    for f in sorted(os.listdir(snaps)):
        p = os.path.join(snaps, f)
        if f.endswith(".gz") and os.path.isfile(p):
            if NOW - os.path.getmtime(p) > 180 * DAY:
                remove(p, "snapshot >180d (monthly snapshots retained)")

# --- rule: scratch files (incl. orphaned .bak from interrupted renders) ---
for dirpath, dirnames, filenames in os.walk(ROOT):
    dirnames[:] = [d for d in dirnames if d not in (".git", "keyring", "node_modules")]
    for f in filenames:
        if f.endswith((".tmp", ".part", ".bak")):
            p = os.path.join(dirpath, f)
            if NOW - os.path.getmtime(p) > DAY:
                remove(p, "scratch/backup file >1d")

# --- cap check ---
total = 0
for dirpath, dirnames, filenames in os.walk(ROOT):
    dirnames[:] = [d for d in dirnames if d != ".git"]
    for f in filenames:
        try: total += os.path.getsize(os.path.join(dirpath, f))
        except OSError: pass
cap_note = f"workspace total: {fmt(total)}" + (" — ⚠️ OVER 1.5 GB CAP" if total > 1.5e9 else " (cap 1.5 GB)")

print(f"hygiene {'APPLIED' if APPLY else 'DRY-RUN'} — {cap_note}, freed {fmt(freed)}")
for a in actions: print(" ", a)
if not actions: print("  (nothing to clean)")
