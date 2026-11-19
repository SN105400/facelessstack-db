# SKIT-PIPELINE.md — Daily skit production line (Faceless comedy lane, Page 1)

Nightly content line producing 3 ready-to-post reels. Runs as Lane 3 alongside FacelessStack DB core work. Genre: everyday comedy + AI/tech satire (see `content-topics.md` genre framework — political content never enters this pipeline).

## Nightly flow

**1. TREND SWEEP (≤30 min, shared across skits)**
- Sources: Google Trends rising queries, Reddit rising posts in target subs, platform reels trends, tech/news cycles (AI-tool drama = on-brand).
- Classify each candidate: trend-chasing vs evergreen (target mix ≈ 30/70 — evergreen compounds, trends spike).
- Output: 8–12 candidate topics with a one-line hook each, logged to `plan/skit/trends-YYYYMMDD.md`.

**2. TOP-3 SELECT**
- Score each candidate 1–5: viral potential, policy safety (comedy lane — no politics, no tragedy), scene-library coverage (can existing rigs render it?), freshness.
- Top 3 only, with one-line rationale each.

**3. SCRIPT PER SKIT (template-locked)**
- Beat structure: hook (≤2s, visual + first caption), setup, beat, punchline, hard end (no CTA begging).
- Deliverables per script: beat list with timings, caption text (≤2 lines per beat), SFX cues, estimated duration 15–45s.
- Weak scripts are discarded at this stage (cheaper than animation rework).

**4. GENERATE (productized 2026-11-20 — one JSON per skit, three commands total)**
- Write `studio/scripts/<name>.json` (declarative: lines with voice/who/mouth, captions, beats with pose names, sfx cues, duration).
- `python3 scripts/build_skit_audio.py <name>` — TTS voices (`say`), procedural SFX, mix at scripted offsets, **overflow warnings** (catches timing bugs the hand-built skits never surfaced).
- Load `studio/skit_template.html?name=<name>&encode=1` — the **self-encoding template** (JSON-driven pose library: talk-phone/shock/facepalm/think/walk-away/wave + captions + RMS mouth sync) renders all frames, encodes VP9 + Opus, uploads to `ready-to-post/` and sets `window.__done`. No manual evaluate steps.
- QC gate per rule 7 + playback check on `studio/qc.html?src=...`.

**5. QC ALL ANGLES (gate per skit — all six, no skipping)**
| Angle | Check |
|---|---|
| Animation | motion thresholds pass, seamlessness ≤1%, pose sanity at keyframes (screenshots) |
| Story | all beats present and timed, persona consistent, zero policy violations (no politics/tragedy/controversy) |
| Voice | audio track present, sync drift <100ms vs caption beats, intelligible, no clipping |
| Music/SFX | SFX fire on cue, music level ≤ voice, no distortion |
| Caption | spelling, sync with voice, ≤2 lines on screen, readable at 540px width |
| Platform | 9:16, ≤60s, valid VP9/WebM (+ MP4 conversion when added), file ≤50MB |

**6. VERDICT (matrix)**
- **PASS** (all angles) → `studio/ready-to-post/YYYYMMDD-<slug>/`: video + caption.txt + hashtags.txt + first-comment.txt.
- **MINOR-FIX** (cosmetic: typo, SFX level, caption timing) → auto-fix + re-QC once.
- **REDO** (structural: broken animation, bad punchline, sync drift) → rework; **max 2 redos per skit** → otherwise discard and log the lesson in `plan/skit/lessons.md`.
- Posting is **manual by the user** in the morning (identity + compliance stay with the human): open `ready-to-post/`, publish as Reel, done (~5 min). The fleet never logs into Facebook.

## Budget & schedule
- **Skit line budget: ≤20M tokens/night — user-approved ceiling (2026-11-19). A ceiling, not a target**: typical spend 3–8M; spend beyond that must visibly buy quality, never padding.
  - Trend sweep ≤300K (deeper source sweep than baseline)
  - Scripts: 3 skits × **3 draft variants each**, best-of picked (~500K–1M)
  - Generation + **A/B hook variants** (2 renders per skit where the punchline could land two ways) (~5–10M)
  - QC: full 6-angle pass + full playback review per skit (~2–5M)
  - **Redo cap raised: 4 per skit** (from 2), each redo re-runs the full QC gate
  - Surplus after the line completes → **scene library expansion** (new rigs, props, expressions) — budget flows to capability, never to padding
- FacelessStack DB core (Lanes 1–2): ≤2M/night typical (scraping is cheap); spend flows to enrichment depth on heavy nights.
- **Accountability (mandatory):** the nightly report lists actual tokens per skit and which angle the spend improved; the Sunday retrospective correlates spend vs reel views and tunes the budget down if marginal millions stop buying marginal quality.

## Prerequisites before skit night 1
- (a) SFX/music synthesis demo (procedural WebAudio), (b) scene library v1 (6 rigs) in `studio/scenes/`, (c) ready-to-post folder automation, (d) FB Page in professional mode (user).

## Posting cadence target once running
- 3 reels/day from each night's output, one lane (comedy) until metrics say otherwise.
