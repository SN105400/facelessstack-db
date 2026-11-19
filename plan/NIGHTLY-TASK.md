# NIGHTLY-TASK.md — Standing spec for the nightly work automation

This file is the self-contained brief the nightly automation follows (it runs in a separate chat session with no conversation memory — it reads this file first, at the absolute path below).

**Workspace (absolute):** `/Users/gonza/.zcode/workspace/draft-95d0ee14-e8b5-4387-9557-381180dcb1dd/`
**Current phase:** **EXECUTION — FacelessStack DB** (niche chosen 2026-11-19, Option A)

## Operating rules (always)
0. **All commands run from the workspace absolute path above** — `cd` there first (relative paths in this spec assume it; your session's default cwd may differ).
1. Read, in order: this file → `<workspace>/ROADMAP.md` (source of truth for current week's work) → `plan/sprint1-policy.md` (compliance playbook — BINDING) → `data/tools-seed.json` (tool list + schema).
2. Hard stop: **begin wrapping up by 08:30 local (UTC+8)** — nothing mid-flight at 09:00 token expiry. Commit artifacts + write the nightly report before then.
3. Concurrency: max 3 parallel model calls. Weeknights = deep/sequential lanes; weekends = parallel fan-out (idempotent, checkpointed tasks only).
4. Compliance playbook is fleet law: logged-out public pages only, ~1 request/2–3s per host with jitter + backoff, respect robots.txt and 429s, value-add gate, one account per platform, provenance log (source URL + timestamp for every data row).
5. Never print or persist decrypted credentials/tokens. Free-token claiming is now a **launchd LaunchAgent (`com.facelessstack.claim`)** running `scripts/claim_cron.sh` — fully LLM-independent, fires 00:05/08:05/12:05/19:05/21:05 local, log at `logs/claim.log`. Do not touch `free-token-claim/` or any billing API; DO tail the last 5 lines of `logs/claim.log` into the nightly report (claim status is now observable there). If the log shows repeated KEYRING/DECRYPT failures, flag it as a blocker.
6. Every night produces a **committed artifact** (data rows, pages, code, or a decision doc). If blocked, the artifact is a written analysis of the blocker + proposed fix.
7. Video content tasks use the proven studio pipeline: write canvas/HTML animation → render in in-app browser → **offline encode via WebCodecs (VideoEncoder VP9 + `webm-muxer@5` CDN) with explicit timestamps → POST to `studio/serve.py` (127.0.0.1:8787, must be running: `python3 studio/serve.py` from the workspace)**. Native `tab.recording` and `MediaRecorder` are dead ends — do not use. **Encode with the page loaded as `?static=1`** (a live rAF loop interleaving with deterministic draws produced a corrupt mux once, 2026-11-19). **QC by playback, not seeking:** `studio/serve.py` lacks HTTP Range support so seeking snaps to 0 — verify by `v.play()` + timed screenshots, and foreground the pane first (`browser.capabilities.get('visibility').set(true)` — backgrounded video-only media gets power-paused). `serve.py` accepts `POST /upload?name=studio/<file>.webm`. QC gate (all three, via `drawAt()` + pixel sampling, reference: `studio/ribbon-flow-v2.html` + `studio/qc.html`): (a) **seamlessness** — pixel diff frame(0) vs frame(loopLen) ≤ 1% (compare pixels via getImageData, NOT toDataURL strings — float noise gives false negatives); (b) **perceptible motion** — pixel diff between frames ≥1s apart ≥ 3%, and ≥ 8% between distant (half-loop) frames (lesson 2026-11-19: v1 had 240 distinct frames but only ~3% uniform diff — visually read as a still image; fix was phase-shifted sin+cos components — pure integer harmonics all return to start at the half-loop — plus asymmetric textures and a monotonic comet sweep); (c) **adjacent-frame smoothness** — no >25% jumps between consecutive 1s samples.
8. **Storage hygiene (every night, mandatory):** run `python3 scripts/hygiene.py` (dry-run) → review → `--apply` before wrapping up. Retention: renders keep newest 5 + <14 days (they're re-renderable from code — disposable), nightly reports >45d gzip to `plan/archive/`, snapshots >180d deleted, scratch files purged, 1.5 GB workspace cap warning. `.gitignore` keeps media/binaries out of git. Include the hygiene line in the nightly report.

## Phase: EXECUTION — nightly loop
1. Read `ROADMAP.md` current week → pick the next unfinished milestone item (work top-down; check `CHANGELOG.md` and the latest `plan/nightly-*.md` for state).
2. Execute via 3 lanes: Lane 1 = flagship build (scraping/enrichment per ROADMAP), Lane 2 = site code/content fixes, Lane 3 = **skit production line per `plan/SKIT-PIPELINE.md`** once its prerequisites exist (SFX/music synthesis demo + scene library v1 in `studio/scenes/`); until then Lane 3 builds those prerequisites. DB core work always has priority if the night is short.
3. Data rules: one JSON/MD record per tool in `data/` following `data/tools-seed.json` schema; every row gets `source_url`, `scraped_at`, `verified` fields. Pricing pages change often — re-verify flagged-stale rows before adding new ones.
4. Commit everything (conventional commits) **and push**: `git push origin main` — the deploy key at `~/.zcode/secrets/facelessstack_deploy_key` is already authorized on github.com/SN105400/facelessstack-db; if push needs it, prefix with `GIT_SSH_COMMAND="ssh -i /Users/gonza/.zcode/secrets/facelessstack_deploy_key -o IdentitiesOnly=yes"`.
5. Append `CHANGELOG.md` + write `plan/nightly-YYYYMMDD.md` (what was produced, blockers, tomorrow's queue).
6. Sunday: retrospective — evaluate kill criteria honestly from `ROADMAP.md`, update roadmap, write `plan/retrospective-YYYYMMDD.md`.

## Report format (every night, ≤10 lines)
`YYYY-MM-DD — phase | produced: <artifacts> | tokens: <est> | blockers: <or none> | next: <queue head>`

## Current queue (starts here)
- W1 milestone: taxonomy finalization + first 50 verified tool profiles (scrape pricing pages of the tools in `data/tools-seed.json`, rate-limited)
- Site scaffold: static site generator layout (`site/` in workspace) ready for Cloudflare Pages
