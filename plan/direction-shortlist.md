# Direction Shortlist — Sprint 1 Synthesis (2026-11-18)

Four senior-expert personas researched independently (reports in `sprint1-*.md`). This is the synthesis: scoring, the converged recommendation, kill criteria, and what Sprint 2 must decide.

> **⚠️ REVISED 2026-11-19 after deep validation audits** (`sprint2-validation-compute.md`, `sprint2-validation-faceless.md`): the original recommendation (#1 compute tracker) is **demoted** — its audit showed half the provider catalog pays $0 at launch (Hetzner = credit-only, Lambda/TensorDock = no program), RunPod pays no cash until 25 referrals, DO/Impact rejects empty sites, generic price-tracker launches are dead on HN (1–5 points), Google demotes this archetype, and the realistic trajectory is ~$400/mo at month 6 ($1–3K/mo only after 12–24 months). The **client's doubt was justified**. The revised recommendation is the **faceless-stack structured data layer** (niche #3 in its narrow validated form: ~200 tools, nightly pricing/status data, comparison + X-vs-Y pages; NOT a general submissions directory — that variant is shut). Validated trajectory: $100–400/mo by M3–4 (recurring affiliates: Pictory 50%, InVideo 50%, ElevenLabs 22%×12mo, all low-barrier), **$500–1,500/mo at M6**, kill criteria <1,500 visits and <$150/mo by day 120 → pivot to selling the dataset. CDL schools (#2) remain validated-but-untouched (needs outreach). Full audit reports: `sprint2-validation-*.md`; Sprint 2 scoring: `sprint2-niches.md`.

## Scoring matrix (1–5)

| Candidate | $0 capital | Token-fleet absorption | First-dollar speed | Maintenance load | Policy risk | Defensibility | Total /30 |
|---|---|---|---|---|---|---|---|
| **A. Niche directory + paid claimed listings + dataset upsell** | 5 | 5 | 3 (1–3 mo) | 4 (~90% budget left) | 4 (green-light w/ playbook) | 4 (proprietary dataset compounds) | **25** |
| B. Software-artifact marketplace factory (extensions/MCP/templates) | 5 | 4 | 2 (57% earn $0) | 4 | 3 (spam scrutiny) | 3 | 21 |
| C. Pure dataset/data product | 5 | 5 | 2 (enterprise cycles, trust barrier) | 4 | 3 | 4 | 23 |
| D. Content site / AdSense / affiliate prose | 5 | 3 | 1 (RPM crash, zero-click) | 3 | 2 (scaled-content abuse) | 1 | 15 |
| E. Micro-SaaS pure-play | 4 | 3 | 2 (median $400 MRR @ 14 mo) | 2 (maintenance trap) | 3 | 3 | 17 |

## The recommendation: **A, assembled from all four reports**

A single **niche data/directory asset** in a vertical that is genuinely un-AI-answerable (row-level pricing data, statuses, availability, per-item comparisons — things AI Overviews can't synthesize), built and maintained nightly by the token fleet:

1. **Core asset (from founder + policy):** thousands of structured, enriched listings on free-tier static hosting (Cloudflare Pages + D1/R2). Businesses **pay to claim/enhance listings** ($9.99–29/mo) — first dollar comes from *listees, not readers*. Demand is built into the artifact.
2. **Distribution layer (from distribution expert):** the same data powers GEO-citable comparison/calculator pages (built to be *cited by* AI answer engines, not to win blue links) + 1–2 marketplace artifacts per week (VS Code extension / MCP server / Chrome extension derived from the asset's tooling) linking back to the site + Product Hunt launches.
3. **Product layer (from founder):** dataset extracts sold via Gumroad (10% + $0.50; $100 payout min) / Datarade once trust exists; **Paddle** as merchant of record if direct payments are needed. Micro-SaaS spin-off (monitoring/search tooling) only in month 3+ — not first.
4. **Compliance (from policy analyst):** the 5-rule playbook in `sprint1-policy.md` is binding fleet law — logged-out public scraping only, rate discipline, value-add gate, one account per platform, provenance log.

**Why this wins:** it's the only model where nightly token burn converts directly into inventory businesses pay to join; data curation is the fleet's highest-yield work (~90% budget left after maintenance); policy footing is clean with the playbook; and the dataset compounds into defensibility.

## Kill criteria (agreed before we start)
- **Week 6:** 0 claimed listings AND <$50 dataset sales → kill the niche, re-run Sprint 2 (niche change, not model change).
- **Listee outreach:** 200 contacts, 0 replies in 4 weeks → niche willingness-to-pay wrong → re-niche.
- **Infra:** 2 consecutive nightly pipeline failures → freeze content, fix fleet first.
- **Policy:** any manual action / listing removal → 48h freeze + compliance audit vs `sprint1-policy.md`.
- **Spend sanity:** if maintenance exceeds 30% of nightly budget for 2 weeks → scope the asset down.

## Honest risks (uncut)
- Google sandbox: expect 3–6 months before meaningful rankings; the directory must not *depend* on Google (outreach + GEO + marketplaces carry the early months).
- One ~$10/yr domain is the only spend recommended; a free subdomain path exists if you insist on literal $0 (weaker branding/citations).
- Directory revenue benchmarks are marketing-inflated; realistic months 1–6: **$0–800/mo**, month 6+: $500–1,000+/mo if the niche has paying listees.
- Niche selection is now THE critical variable — the model only works where listees have money + motive.

## Sprint 2 (next): Niche selection
Produce 10–20 scored niche candidates. Scoring criteria (from all four personas):
1. **Listee willingness-to-pay** — does the niche contain businesses with marketing budgets that benefit from being listed? (weight highest)
2. **Un-AI-answerability** — row-level facts AI Overviews can't synthesize (prices, statuses, availability).
3. **Logged-out public data accessibility** — buildable within the compliance playbook.
4. **Competition gap** — no dominant incumbent directory; AI Overviews weak on it.
5. **Freshness demand** — data changes often enough that nightly updates are a moat.
6. **Your edge** — user's domain knowledge/interests (still unanswered).

Output: `plan/sprint2-niches.md` with a ranked table + top-2 deep-dives → user picks one → 6-week ROADMAP.
