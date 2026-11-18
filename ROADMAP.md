# ROADMAP — Faceless-Stack Data Layer ("working name: FacelessStack DB")
*Chosen 2026-11-19 (Option A). Source of truth for nightly work. Compliance playbook (`plan/sprint1-policy.md`) is binding.*

**The product:** a structured, nightly-refreshed data layer for the faceless-channel/creator-tools economy — ~200 tools (video gen, TTS/voice, subtitles, schedulers, editing automation…) with pricing, status (alive/dead/price-changed), alternatives, and programmatic comparison/"X vs Y" pages. NOT a submissions directory. Money: recurring affiliate programs (Pictory 20–50%, InVideo 50%, HeyGen 30%, Creatify 25%, ElevenLabs 22%×12mo) + vendor featured spots ($99–149/mo from M5–6) + dataset extracts (Gumroad).

## Weekly milestones

**W1 (now) — Data foundation**
- Finalize taxonomy + tool list (~200 targets, seeded in `data/tools-seed.json`)
- Nightly scrape runs: ~50 profiles/night with verified pricing (public pricing pages, rate-limited)
- Site scaffold code ready (static-first; Cloudflare Pages + D1/R2 target)
- Exit: ≥100 verified tool profiles in `data/`, scaffold builds locally

**W2 — 200 profiles + site live**
- Reach 200 profiles; generate 100 comparison/"X vs Y" pages from the data
- Deploy live (requires user accounts — see below); sitemap + schema markup
- Submit to 50–100 free directories (backlinks); Product Hunt draft
- Exit: site live at a real URL, 100 pages indexed-submittable

**W3 — Affiliate activation + freshness engine**
- Apply: Pictory, InVideo, HeyGen, Creatify, ElevenLabs (+PartnerStack/Reditus)
- Price-history tracking v1: nightly diffs, public "pricing changes" feed page
- First 5 animated explainers from the dataset (studio pipeline) — reach engine starts
- Exit: ≥3 affiliate approvals, feed page live, first videos published

**W4 — Distribution push**
- Launch: Product Hunt + Reddit data story ("I tracked 200 AI video tools nightly — what changed") in r/aitubers, r/NewTubers etc.
- GEO/schema hardening; weekly "what changed in AI video tools" post cadence
- Exit: ≥1 traffic spike ≥500 visits; affiliate links live on all profiles

**W5 — Monetization prep**
- Click analytics per tool/page; pitch kit (one-pager with real numbers)
- Dataset extract v1 on Gumroad (price-history CSV pack)
- Vendor shortlist: 20 vendors ranked by ICP fit
- Exit: pitch kit + extract live, analytics showing per-tool clicks

**W6 — First revenue + honest review**
- Pitch 10–20 vendors for $99–149/mo spots
- Full metrics review vs kill criteria; decide: double down / adjust / dataset-sale pivot
- Exit: ≥1 vendor conversation or ≥3 affiliate conversions documented

## Kill criteria (agreed upfront — evaluated Sundays + W6)
- **Day 120 gate:** <1,500 visits AND <$150/mo → pivot to selling the dataset (newsletters/listicle authors) — do NOT build a second directory
- **W4 gate:** zero affiliate approvals AND <500 visits → reposition as pure dataset/compare content, delay directory UI
- **Infra:** 2 consecutive failed nights → freeze new work, fix fleet
- **Policy:** any platform strike → 48h freeze + compliance audit

## User actions (only you can do these)
1. **GitHub account** (free) — site repo + Actions for nightly deploys
2. **Cloudflare account** (free) — Pages/D1/R2
3. W5: Gumroad account; W6+: vendor outreach happens via your name (compliance: one identity)
4. Optional: ~$10/yr domain (better branding/citations; free subdomain acceptable to start)
5. **New chat for the nightly work automation** — paste: "Create the nightly automation described in /Users/gonza/.zcode/workspace/draft-95d0ee14-e8b5-4387-9557-381180dcb1dd/plan/NIGHTLY-TASK.md — recurring daily at 21:30 local."

## Token budget mapping
Nightly: Lane 1 scraping/enrichment (~150–200K), Lane 2 site code/content (~30–80K), Lane 3 comparison-page generation (~50–100K). Weekends (500M): full-corpus refresh + batch page generation. Maintenance load stays ~10–20% — most budget goes to new profiles/pages.
