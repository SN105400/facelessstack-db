# Sprint 2 — Niche Scouting Report
*Agent agent_a8875e24 · 2026-11-19 · ~232K tokens · user edge = N/A (not disclosed)*

Scoring: listee willingness-to-pay counted double (max 10), other criteria max 5 each → TOTAL /30. T = client-flagged candidate.

## Scored candidates

| Niche | wtp×2 | un-AI | data | gap | fresh | TOTAL |
|---|---|---|---|---|---|---|
| **1. Compute price-perf tracker (VPS/GPU-cloud/inference)** | 8 | 5 | 5 | 3 | 4 | **25** |
| **2. CDL/trade-school registry tracker (FMCSA TPR)** | 8 | 4 | 5 | 4 | 4 | **25** |
| 3. T. Faceless-channel/AI-video/TTS tool economy | 8 | 4 | 5 | 3 | 4 | **24** |
| 4. GLP-1 telehealth state×price×availability tracker | 6 | 5 | 4 | 4 | 5 | **24** |
| 5. Building-permit feed → contractor lead pages | 8 | 4 | 3 | 3 | 5 | **23** |
| 6. Freight carrier authority/safety data (FMCSA) | 6 | 4 | 5 | 3 | 5 | **23** |
| 7. eSIM plan price comparison | 6 | 5 | 5 | 2 | 4 | **22** |
| 8. AI job board (agent-infra roles) | 8 | 3 | 4 | 2 | 5 | **22** |
| 9. Notary/loan-signing agent directory | 8 | 3 | 4 | 4 | 2 | **21** |
| 10. Emergency vet open/closed + diversion status | 4 | 5 | 3 | 5 | 4 | **21** |
| 11. T. AI model/API pricing & capability tracker | 6 | 3 | 5 | 2 | 5 | **21** |
| 12. Supplement COA / third-party test registry | 6 | 4 | 4 | 3 | 3 | **20** |
| 13. Clinical trial status tracker | 4 | 4 | 5 | 3 | 4 | **20** |
| 14. Chrome extension quality directory | 4 | 3 | 5 | 3 | 4 | **19** |
| 15. Senior living / memory care directory | 10 | 2 | 3 | 2 | 2 | **19** |
| 16. T. MCP server / AI-agent tooling directory | 4 | 3 | 5 | 2 | 4 | **18** |
| 17. Campgrounds/RV parks | 6 | 3 | 3 | 2 | 2 | **16** — KILL |
| 18. EV charging station directory | 2 | 4 | 3 | 2 | 4 | **15** — KILL |

**Blunt kills:** Senior living — best listee WTP in local directories ($431 avg CPL) but Caring.com/A Place for Mom own it and facility facts are static. MCP directory — window closed: official registry ~48K servers, Glama ~111K, Smithery consolidated into Arcade; listees are OSS devs with no money. AI model pricing — saturated (Artificial Analysis, OpenRouter, LMArena, LLMStats); simple facts AI Overviews synthesize well. EV charging/campgrounds/clinical trials — listees don't pay; free dominant incumbents.

## Top-2 deep-dives

### 1. Compute price-per-performance tracker — 25/30
- **Data sources:** public pricing pages of ~25 non-hyperscaler providers (Hetzner, OVH, Vultr, Linode, Contabo, RackNerd, BuyVM, RunPod, Lambda, Vast.ai, TensorDock): SKU, vCPU/RAM/storage/bandwidth, region, hourly/monthly price, promo terms. LowEndBox/LowEndTalk RSS for promos. Public status pages for uptime history. Vast.ai's logged-out marketplace (thousands of live GPU listings, prices move hourly) = ideal nightly-refresh target.
- **Listee economics:** hosting is a proven pay-for-visibility niche — LowEndBox banners **$75/mo** (published rates); VPSBenchmarks sells Featured Provider subscriptions; 25–50% recurring affiliate commissions or $100+ CPAs are routine. Claim/enhance at $29/mo undercuts LEB with no sales calls. Price-history CSV extracts sell to analysts/procurement.
- **Incumbent gap:** VPSBenchmarks = manual benchmark blog; ServerHunter stale; LowEndBox = deals feed, not a structured DB. Nobody offers a live normalized cross-provider price-history DB with $/vCPU, $/GB, $/GFLOP. No funded player.
- **First-100 listings (wk 1–2):** scrape 25 providers nightly into D1 → normalize → compute $/unit metrics → flag promo expiries → generate 100 comparison pages ("cheapest 8GB VPS 2026", "Hetzner vs Contabo price history") + one Gumroad dataset extract.
- **Main risk:** price-only moat is copyable; affiliate programs may reject a zero-traffic site. Mitigate with price-history archives (unique, GEO-citable); apply to affiliates after traffic.

### 2. CDL / trade-school registry tracker — 25/30
- **Data sources:** FMCSA Training Provider Registry (tpr.fmcsa.dot.gov) — every approved ELDT/CDL school with status churn (FMCSA removed ~3,000 noncompliant providers Dec 2025 → verified status-verification demand). State DMV approved-school lists. School public pages for tuition/start dates (absence of published tuition is itself un-AI-able row data).
- **Listee economics:** CDL recruiting is a paid-lead market — median **$26.86/application** (BoostPoint), exclusive leads $8–12, agency-qualified $40–80; schools charge $3–7K tuition so one enrollment pays for a year of $29/mo.
- **Incumbent gap:** no structured nationwide CDL-school directory fusing TPR status + tuition + start dates; incumbents are content sites + bare state PDFs. The Dec-2025 removal wave created urgent "is this school still TPR-registered?" demand.
- **First-100 listings (wk 1–2):** TPR records for TX, CA, FL, PA, GA → enrich from school pages → metro pages ("CDL schools in Dallas — TPR-verified, updated nightly") + Gumroad extract for recruiters.
- **Main risk:** TPR search is interactive, no bulk export — pagination must respect robots/ToS. Tuition coverage 30–50%. Needs school outreach (a sales motion the compute tracker doesn't need).

## Verdict

**Build #1: the compute price-per-performance tracker.** The only candidate where every part fits a $0-capital solo operator: fully logged-out public data, nightly freshness is intrinsic (promos, GPU marketplace prices), zero sales motion (affiliates + featured listings, both proven at $75/mo+ in this exact channel), GEO-citable price-history tables. Runner-up #3 (faceless/AI-video tools, 24/30) is the strongest client-flagged candidate — AI tool vendors demonstrably pay $49–497 per listing (TAAFT/Futurepedia/Toolify) and 25–50% recurring affiliates — same site stack, natural second asset, not a replacement. Verdict changers: (1) revenue-per-listing over volume + tolerance for outreach → CDL schools (also 25/30); (2) if affiliate approval proves hard at zero traffic → GLP-1 tracker (24/30) has the highest un-AI-ability/freshness but carries YMYL/regulatory weight. **Do not build the MCP or model-pricing directories — those windows are shut.**

## Sources
- [TAAFT get-featured](https://theresanaiforthat.com/get-featured) · [TAAFT $347 featured-post ROI thread](https://www.reddit.com/r/SideProject/comments/1m9b6ba/i_submitted_a_paid_post_347_on_theres_an_ai_for) · [Toolify submit](https://toolify.ai/submit)
- [LowEndBox advertising ($75/mo banners)](https://lowendbox.com/advertise) · [VPSBenchmarks featured providers](https://www.vpsbenchmarks.com)
- [FMCSA Training Provider Registry](https://tpr.fmcsa.dot.gov) · [ELDT rule](https://www.fmcsa.dot.gov/registration/commercial-drivers-license/entry-level-driver-training-eldt) · [BoostPoint CDL lead costs](https://boostpoint.com/industries-trucking/truck-driver-leads)
- [AI video tool affiliate commissions](https://futureproofmarketer.com/best-ai-video-tools) · [Blotato faceless-tools roundup](https://www.blotato.com/blog/ai-tools-faceless-content)
- [Cora GLP-1 2026 industry report](https://www.trycora.io/blog/cora-2026-glp1-industry-report) · [eSIMDB (270 brands, affiliate model)](https://esimdb.com)
- [Carrier411 ($99/mo vetting)](https://www.carrier411.com) · [Artificial Analysis](https://artificialanalysis.ai) · [Glama State of MCP 2025](https://glama.ai/blog/2025-12-07) · [Notary Rotary paid listings](https://www.notaryrotary.com) · [ConsumerLab brand-paid testing](https://www.consumerlab.com/about)
