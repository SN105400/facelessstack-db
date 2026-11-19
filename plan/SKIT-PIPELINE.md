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

**4. GENERATE**
- Compose skits from the **SCENE LIBRARY** (`studio/scenes/` — reusable rigs: walk, talk, react, jump, sit, wave + props; built once, extended weekly). Never bespoke-animate from scratch when a library piece exists.
- Voice: `say` → `afconvert` → WebCodecs Opus. SFX: procedural WebAudio. Captions: burned in from script text. Mouth sync: audio RMS envelope.
- Render offline (WebCodecs, `?static=1`), QC gate per `NIGHTLY-TASK.md` rule 7 (seamlessness ≤1%, motion thresholds, playback check).

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
- ≤1.2M tokens/night for the whole 3-skit line (trend sweep ~50K, scripts ~150K, generation/QC ~1M).
- Prerequisite build nights (before skit night 1): (a) SFX/music synthesis demo, (b) scene library v1 (6 rigs), (c) ready-to-post folder automation.
- Posting cadence target once running: 3 reels/day from each night's output, 1 lane (comedy) until metrics say otherwise.

## Metrics that decide the lane's future (Sundays)
- Per-reel: views, avg watch %, shares. Lane verdict after 2 weeks: if median reel <200 views and best reel <1,000 → tighten hooks/characters; if a format clearly outperforms → double down on that format family.
