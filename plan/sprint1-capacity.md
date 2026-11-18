# Sprint 1 report — Senior AI-Product Engineer persona
*Agent agent_54cd4d74 · 2026-11-18 · ~94K tokens*

## Capacity math

**Assumptions:** productive window ≈ 8h before the 09:00 expiry → 3 lanes × 480 min = **24 lane-hours/weekday night** (~40 on weekends). Agentic call ≈ 30–90s → wall-clock ceiling ≈ **1,000–1,500 calls/night**. Monthly budget: 22×300M + 4×500M ≈ **8.6B tokens** ≈ 270 "32M heavy session"-equivalents. Key finding: **concurrency × latency, not token budget, is the binding constraint** for agentic work; tokens only bind for batched generation.

| Type | Unit economics | Nightly (weekday) | Monthly |
|---|---|---|---|
| (a) Long-form articles 2–5K words | ~10–25 calls, 10–15 min lane-time, 100–300K tokens (research inflates input) | **100–150** (wall-clock bound; ~1,500 token-bound) | **~3,000–3,500** |
| (b) Code: feature-PRs w/ tests+docs | 2–10M tokens, 30–90 min lane-time | **20–40 small PRs**, or 1–2 medium builds | **~600–800 PRs** (~25–30 medium builds) |
| (c) Data curation (clean/enrich) | 1–2K tokens/record; batch 20–50/call at 15–30s | **80–150K records** (wall-clock bound; ~200K token-bound) | **~2.5–4.5M records** |
| (d) Mixed (60/30/10 lane split) | — | ~40–60 articles + 5–10 PRs + 20–30K records | ~1,000 art. + ~150 PRs + ~600K records |

A 32M-token heavy session takes ~3–4 lane-hours, so a night fits **6–8 heavy sessions** — token math (300M/32M ≈ 9) and wall-clock converge, which validates the model.

## Free-tier fit (Nov 2026 limits)

| Service | Free limit | Content site | Small API | Ext. backend | Breaks at |
|---|---|---|---|---|---|
| Cloudflare Pages | unlimited static bandwidth; 500 builds/mo, 1 concurrent | yes | — | — | >500 builds/mo (batch deploys) |
| Cloudflare Workers | 100K req/day, 10ms CPU | — | yes | yes | >100K req/day; CPU-heavy work |
| Vercel Hobby | 100GB bandwidth, 1M fn invocations, 4 CPU-h/mo; **hard-pauses on exceed** | yes | marginal | yes | >1M invocations; pauses, doesn't bill |
| GitHub Pages | 100GB/mo soft, 1GB repo | yes | — | — | ~1M pageviews/mo |
| GitHub Actions | public repos: unlimited min; private: 2,000 min/mo | CI yes (public) | — | — | private cron >~65 min/day |
| Supabase | 500MB DB, 5GB egress/mo, 2 projects, **pauses after 7d inactivity** | — | marginal | yes | >5GB egress; nightly writes keep it alive |
| Neon | 1GB/project, 100 CU-h/project/mo, scale-to-zero | — | yes (low traffic) | yes | sustained >0.1 CU avg or >1GB data |
| Cloudflare R2 | 10GB, 1M writes / 10M reads/mo, zero egress | yes | yes | yes | >10M reads/mo |
| Cloudflare D1 | 5M rows read/day, 100K rows written/day, 500MB/db | — | yes | yes | >100K writes/day |

**Verdict:** all three archetypes (content site, small API, extension backend) run at $0 — static-first on Pages/GitHub Pages, Workers+R2+D1 for the API. Avoid Vercel for anything spiky: exceeding limits pauses deployments rather than degrading gracefully. Note: Vercel Hobby is also non-commercial by contract.

## Maintenance load (leftover budget for new work)

1. **Static content / data curation — ~90% left.** Deploys are free CI; maintenance = weekend refresh passes (~5–10%).
2. **Content library — ~80–85%.** Monthly staleness refresh; weekend fan-out absorbs it.
3. **Browser extension — ~75–80%.** Low average, spiky: browser releases and store-review rejections demand emergency nights.
4. **Small API — ~50–70%.** Monitoring, triage, dependency bumps eat 30–50%.
5. **DB-backed app / SaaS-shaped — ~30–50%.** Migrations, auth, security, uptime dominate production.

Rule of thumb: every project should be "flat files + cron" by default; adding a live database roughly doubles the maintenance tax.

## Pipeline shape

- **Weeknights (24 lane-hours):** Lane 1 = flagship deep build (single-threaded, 3–6h, the 32M-class work); Lane 2 = maintenance/QA of existing assets (1–2h), then a second product task; Lane 3 = long batch (curation or content) running all night. Final 30–60 min: packaging, commits, deploy, morning report. Nothing starts after ~07:30 that can't finish by 09:00.
- **Weekends (40 lane-hours):** parallel fan-out — corpus-wide refreshes, dataset backfills, refactors, regression suites. Only idempotent, parallelizable, checkpointed tasks (a crash at 08:00 must not lose the night).
- **Human-review gates (morning, ~15 min):** (1) flagship build PR before production deploy; (2) anything mutating published content or API contracts; (3) dependency/infra changes; (4) dataset schema changes; (5) weekly hosting-limits dashboard check. Everything else auto-merges to **staging only**, promoted after review.

## Sources
- https://developers.cloudflare.com/workers/platform/limits/ · https://developers.cloudflare.com/workers/platform/pricing/
- https://developers.cloudflare.com/pages/platform/limits/
- https://developers.cloudflare.com/r2/pricing/ · https://developers.cloudflare.com/d1/platform/limits/ · https://developers.cloudflare.com/d1/platform/pricing/
- https://vercel.com/docs/plans/hobby · https://vercel.com/docs/limits
- https://docs.github.com/en/actions/concepts/billing-and-usage
- https://supabase.com/pricing · https://supabase.com/docs/guides/platform/going-into-prod
- https://neon.com/pricing
