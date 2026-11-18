# Sprint 1 report — Senior Bootstrapped-Founder persona
*Agent agent_b4775b8d · 2026-11-18 · ~314K tokens*

## Candidates

**1. Niche directory + paid listings (with dataset upsell)** — top pick
- **$0-verified: YES.** Cloudflare Pages/Workers + D1 free tier allows commercial use (100k req/day); only real cost is a ~$10/yr domain.
- **Fleet fit: PERFECT.** The scarce input in directories is inventory: 3,000+ enriched, structured listings. 300M tokens/night can generate, clean, and categorize that inventory continuously. Nightly agents can also do outreach drafts and dedupe/curation.
- **First dollar: 1–3 months.** Seed free listings, then email/listee-upsell "claimed" listings at $9.99–$29/mo. 100 claimed listings ≈ $1,000/mo (late-2025 directory benchmarks: small directories $500–$5,000/mo year one — hype-inflated; haircut to $0–$800/mo realistically months 1–6).
- **Killer risk: distribution.** Google sandbox = 3–6 months before rankings; AI Overviews answer "best X tools" queries directly (51.5% of queries now show one). Survives only with a genuinely un-AI-answerable niche (pricing data, statuses, comparisons-by-the-row).

**2. Micro-SaaS utility on free tiers**
- **$0-verified: YES** on Cloudflare (commercial OK) + Supabase free (caveat: pauses after 1 week idle); **NO** on Vercel Hobby (non-commercial by contract).
- **Fleet fit: GOOD.** Nightly agents build, test, fix, write docs/changelog, triage issues. But tokens can't acquire users — distribution is on you.
- **First dollar: 2–6 months.** Realistic revenue: r/SaaS poll (~200 founders) median **$400 MRR, 23% at $0**; Freemius puts profitable micro-SaaS median at ~$4,200/mo; median **14 months to $5K MRR**. Best as a *spin-off* of #1 (the directory's search/monitoring tool sold separately).
- **Killer risk: discoverability with no audience and no ad budget; free-tier scale cliffs if it works.**

**3. Digital product factory (Gumroad, not Etsy)**
- **$0-verified: YES** on Gumroad ($0/mo; 10% + $0.50 direct, 30% if sold via Discover). **KILLED on Etsy**: AI-generated patterns/recipes/guides and bot-generated listings are now banned; real-photo proof required.
- **Fleet fit: HIGH on production, ZERO on demand.** Tokens produce infinite templates/toolkits; that's also why pricing collapses. Without an audience, Discover's 30% is your only traffic.
- **First dollar: days–weeks possible (fastest of all), but sellers report ~6.5 months average to first dollar; credible solo reports cluster at $0–$2k/mo after a year.**
- **Killer risk: no moat — your $9 template competes with everyone else's identical AI output.**

**4. Curated dataset / data product (AI-training-adjacent)**
- **$0-verified: PARTIAL.** Listing on Datarade/Kaggle/api.market is free, but sales cycles are enterprise-slow for a no-name solo seller.
- **Fleet fit: EXCELLENT.** Cleaning, labeling, enriching, and documenting datasets is pure token labor — the fleet's comparative advantage over human sellers.
- **First dollar: 2–6 months;** individual seller evidence is thin (hundreds to low-thousands/mo, no verified median). AI-training-data demand ($3.59B market, 2025) is the tailwind.
- **Killer risk: trust/proof-of-quality — buyers won't wire money for a dataset nobody has vouched for.**

**5. Open-source + sponsorships — KILL as income**
- 60% of maintainers earn **nothing**; donation share is *falling* (13%→10%, Tidelift 2024). Median outcome ≈ beer money. Use OSS as marketing for #2/#3, not as the revenue line.

**6. Newsletter / research channel — supporting actor, not the play**
- $0 (beehiiv free tier/Substack). Fleet fit HIGH for production, ZERO for subscriber acquisition. Sponsor CPM median ~$58: 2,000 subs ≈ **$50–115 per send**. First dollar typically 4–8 months. Value = flywheel that sells #1–#3.

## Persona verdict

**Top pick: the directory/dataset hybrid (#1), with one micro-SaaS (#2) extracted from its tooling in month 3+.** It's the only model where the token fleet converts directly into *inventory that businesses themselves pay to be part of* — demand is built into the artifact, so you don't need an audience, Google's mercy, or ad spend. First dollar comes from listees, not readers.

**Would NOT do:** AdSense/affiliate content sites (AI Overviews in 51.5% of queries; 50–90% RPM collapses); Etsy digital products (explicit ban territory); OSS sponsorship as revenue; newsletter as primary business.

## Sources
- https://oxdpr.com/google-ai-overviews-website-traffic
- https://advantrise.com/adsense-in-2026-rpms-crashed-ai-took-the-clicks-and-publishers-are-leaving
- https://www.etsy.com/seller-handbook/article/1522733284810
- https://www.reddit.com/r/Etsy/comments/1xckrqb/etsy_is_finally_cracking_down_on_ai
- https://gumroad.com/pricing
- https://developers.cloudflare.com/workers/platform/pricing
- https://api.market
- Tidelift/Sonar "State of the Open Source Maintainer" 2024 — tidelift.com
- r/SaaS founder MRR polls + Freemius 2025 micro-SaaS median data (survivor-bias caveats per SaasRanger)
- Directory benchmarks (thewebio.com, HivePress blog, Nov 2025) — marketing-inflated, haircut accordingly
