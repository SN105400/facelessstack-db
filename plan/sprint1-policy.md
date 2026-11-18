# Sprint 1 report — Senior Platform-Policy & Risk Analyst persona
*Agent agent_8f1f4002 · 2026-11-18 · ~221K tokens*

## Green-light paths
- **Data/directory site on first-party data.** Google's spam policy bans "scaled content abuse" — pages "generated for the primary purpose of manipulating search rankings" — but does not ban AI- or data-driven sites. A directory built on data you collect yourself, with original comparison/analysis per page, is squarely compliant. AdSense approves such sites if original, navigable, with privacy policy.
- **Gumroad digital products (datasets, templates, extensions).** AI-made products are allowed; only reselling "AI services" (access to AI tools) is prohibited. Fees: 10% + $0.50 direct sales, 30% + $0.50 via Discover; **$100 payout minimum**; sole-proprietor friendly.
- **Paddle as merchant of record.** 5% + $0.50, all-inclusive tax handling; accepts individuals/sole proprietors — no registered business needed. Note: **Lemon Squeezy closed to new merchants Nov 16, 2026** (Stripe wind-down; payments end Mar 31, 2027) — do not build on it.
- **MCP servers on the official registry.** Free, publish-first-moderate-later; namespace = reverse-DNS tied to your own domain.
- **One distinct, genuinely useful extension** on Chrome Web Store (new account-first appeals process since April 2026) or VS Code Marketplace — provided metadata is unique and functionality is real.

## Yellow
- **AdSense/editorial pages written by the fleet.** Allowed only with meaningful human oversight and added value; trigger to avoid: mass unedited pages "without adding value for users" — that exact phrasing is a named scaled-abuse example.
- **Scraped-data republication.** Logged-out scraping of public data survived 2024's *Meta v. Bright Data* (no contract from browsewrap ToS) and *X Corp v. Bright Data*. But: logged-in scraping is contractually bound, platforms are pivoting to paid data licensing, and compilations with sufficient selection/arrangement can carry a thin copyright even where raw facts don't. Cite sources; don't copy verbatim creative expression.
- **Figma/Framer marketplaces.** Paid plugins need approved-creator status and pass manual moderation; AI-generated asset spam will be weeded out.
- **Aggressive nightly scraping.** Legal at logged-out/public, but platforms do IP-ban and pursue logged-in/ToS-circumvention patterns.

## Red
- **Doorway/programmatic pages**: near-duplicate pages per city/keyword; multiple near-identical sites hiding fleet scale → manual action.
- **Site reputation abuse** (parasite SEO) — manual action outside the EEA.
- **Repeated/near-identical extensions or keyword-stuffed "AI" listings** — automated spam detection removes items and flags the publisher; AI-branded listings get extra scrutiny after the late-2025 malicious-fake-extension wave.
- **Multiple or replacement accounts.** AdSense allows one publisher account per person; post-ban account creation gets linked and closed — and weakens your original appeal.
- **Logged-in scraping** (any account you hold) and LinkedIn private/profile-gated data — hiQ shields only *public* data from CFAA, not you from contract claims.
- **Gumroad "AI services" resales; Lemon Squeezy for new signups.**

## Compliance playbook (nightly fleet rules)
1. **Logged-out, public-only scraping.** Never use accounts to collect; never bypass auth, IP blocks, or rate limits. Respect robots.txt and 429s.
2. **Rate discipline:** cap per-host at ~1 request/2–3s, jitter, exponential backoff, cache aggressively — re-scrape deltas nightly, not full corpora.
3. **Value-add gate:** every generated page must contain first-party data plus original analysis a user can't get elsewhere; no page-per-keyword variants, no near-duplicate interlinked sites.
4. **One account per platform, one identity, one payment method** — never multi-account; keep every listing's copy distinct; export backups of all assets weekly so any single ban is survivable.
5. **Provenance log:** record source URL, timestamp, and method for every dataset row; prefer official APIs/CC-licensed data where offered; disclose data-collection methodology publicly (it's also your AI-citation moat).

## Sources
- https://developers.google.com/search/docs/essentials/spam-policies
- https://developers.google.com/search/blog/2023/02/google-search-and-ai-content
- https://support.google.com/adsense/answer/48182
- https://developer.chrome.com/docs/webstore/program-policies/ · https://developer.chrome.com/blog/cws-new-appeals-process
- https://code.visualstudio.com/api/working-with-extensions/publishing-extension · https://github.com/microsoft/vscode-vsce/issues/1102
- https://gumroad.com/help/article/13-getting-paid · https://venturelab360.com/gumroad-ai-generated-content-policy
- https://www.lemonsqueezy.com/blog/saying-goodbye-to-lemon-squeezy · https://www.creem.io/blog/paddle-vs-lemon-squeezy
- https://modelcontextprotocol.io/registry/terms-of-service
- https://www.quinnemanuel.com/client-alerts/significant-decision-for-web-scraping-industry/
- https://help.figma.com · https://www.framer.com/developers/publishing
