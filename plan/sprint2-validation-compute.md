# Sprint 2 validation — Compute price-perf tracker audit
*Agent agent_62a33559 · 2026-11-19 · ~1.0M tokens (deep audit)*

## Demand
Verified keyword data (Keysearch public VPS-keyword database): "vps server" 22,200/mo; "virtual server" 14,800; "virtual private server" 6,600; "best vps" 4,400; "buy vps" 2,900; "vps price" 2,400. Head terms ≈ 50–60K/mo; price/comparison modifiers ≈ 10K/mo. Tool divergence is huge (±50% caveat). No public volume for "gpu cloud pricing" terms. Demand spikes around price *changes* are proven: "Hetzner Prices increase 30-40%" hit **553 points on Hacker News** (Feb 2026); Modal price-raise thread Nov 2026. Audience: r/devops ~510–630K, r/selfhosted ~870K, r/VPS ~29K. High intent, low volume.

## Affiliate mechanics & approval reality
| Provider | Program | Payout | Catch |
|---|---|---|---|
| Vultr | In-house | Up to $100/qualified referral (30+ days active) | "up to" = tiered, likely ~$30 typical |
| DigitalOcean | Impact | 10% of referred spend for 12 months | Reviewed application; silent 30 days = rejected; **empty sites routinely declined** |
| Contabo | CJ/Awin | €20–250 flat one-time | CJ deactivates after 6 months no-commission |
| RunPod | PartnerStack | 3–5% for 6 months in **credits**; cash 10% only after **25 qualified referrals** | No cash until proven |
| Vast.ai | In-console | 3% of spend, lifetime | Simple, open |
| Hetzner | Referral | **€10 account credit — not cash** | Flagship "cheap" provider pays $0 |
| Lambda | — | None self-serve | — |
| TensorDock | — | **No program** | — |

**Reality: half the catalog is unmonotizable at launch** (Hetzner, Lambda, TensorDock pay nothing; RunPod credits-only until proven; DO rejects empty sites).

## Proof of money
- **diskprices.com** — single-page price table, Amazon affiliate — documented **$5K/mo** (Medium Dec 2023; HN 153 pts). Thread caveat: "the website isn't the money maker. It's the backlinks… it still takes years to accumulate links."
- **EC2Instances.info** — acquired by Vantage (Feb 2021) as top-of-funnel.
- **GetDeploying.com** — GPU price index monetized via provider sponsorships/featured listings → validates the $29/mo featured idea.
- LowEndBox/LowEndTalk: 20+ years, ads from $75/mo. **ServerHunter (89K offers) discloses no revenue; VPSBenchmarks none** — incumbents appear modest, not rich.

## Cold start
**Generic "Show HN: price tracker" launches are dead** — 2025–2026 GPU-price-tracker Show HNs earn 1–5 points (Gpuinstances.net 3 pts Jul 2026; GPU Hour 3 pts Aug 2026) vs ServerHunter's 174 in 2019. What works: **data stories, not tools** — the Hetzner price-increase thread (553 pts), Disk Prices data pages (363/170/155 pts across 2020–2025). Playbook: publish "I tracked 25 compute providers nightly for 90 days" as a data story; seed r/VPS, r/selfhosted, r/devops; get price-history tables cited by industry blogs. GEO/AI-citation: plausible but unproven — upside, not plan.

## Failure modes
1. **Google demotes this archetype**: HouseFresh −91% in March 2024 core update; affiliate comparison sites fell 20–60%.
2. **Affiliate churn**: CJ 6-month deactivation; Impact declines small partners; RunPod 25-referral gate.
3. **Catalog gaps**: best-value providers (Hetzner/Lambda/TensorDock) pay nothing.
4. **Maintenance**: nightly scraping of 25 providers = continuous breakage. Cloudorado abandoned ~2021; recent HN trackers abandoned within weeks.
5. **Saturation**: ≥8 GPU price trackers launched on HN since mid-2025.

## 6-month model
Traffic M1 200 → M6 6,000/mo (SEO hype haircut 50% for HCU risk); 2% CTR to providers, 4% trial, 40% qualify; ~$40/qualification blended; featured listings $29/mo from M5–6.

| Month | Visitors | Affiliate $ | Listings $ | Total |
|---|---|---|---|---|
| 1 | 200 | $0–30 | 0 | ~$15 |
| 2 | 500 | $30–80 | 0 | ~$50 |
| 3 | 1,200 | $60–150 | 0 | ~$100 |
| 4 | 2,500 | $100–250 | 0 | ~$175 |
| 5 | 4,000 | $150–350 | $29 | ~$275 |
| 6 | 6,000 | $200–450 | $29–58 | ~$400 |

Cumulative M1–6: **~$700–1,000**. M6 run-rate ~$400/mo. $1–2K/mo requires months 9–18 of compounding links.

## Verdict
**Client doubt justified on timeline, not on model.** Viable as a 12–24 month compounding side project with plausible $1–3K/mo outcome — not a 6-month business. Only as a low-cost experiment with the data-story cold-start playbook.

## Sources
keysearch.co/top-keywords/virtual-server-hosting-keywords · practicalecommerce.com (keyword tool divergence) · news.ycombinator.com/item?id=47120145 (Hetzner 553 pts) · id=50343399 (Modal) · reddgrow.ai/prowlo.com (subreddit stats) · getdeploying.com/runpod-vs-vast-ai · vultr.com/company/referral-program · digitalocean.com/affiliates · contabo.com/en-us/affiliate-program · runpod.io/referral-and-affiliate-program · docs.vast.ai · Hetzner Docs referral FAQ · lambda.com/partners · tensordock.com/who-we-are/our-ethos · medium.com/@petervoica + news.ycombinator.com/item?id=39066480 (diskprices) · vantage.sh/blog/vantage-has-acquired-ec2instances-info · getdeploying.com · lowendbox.com/advertise · serverhunter.com + indiehackers.com/ServerHunter · HN Algolia (GPU tracker launches) · searchengineland.com/review-site-google-traffic-affiliate-seo-content-440143 (HouseFresh) · cloudorado.com
