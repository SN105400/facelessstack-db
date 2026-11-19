# Deploy runbook (W2 — needs GitHub + Cloudflare accounts)
1. GitHub: create repo `facelessstack-db`; push this repo (fleet does it after auth).
2. Cloudflare Dash → Pages → Connect to Git → pick the repo.
   Build command: `python3 scripts/build_site.py` (or pre-build commit) · Output dir: `site/`
3. Custom domain (optional, ~$10/yr): add in Pages settings.
4. Nightly flow after connect: fleet commits data → GitHub Action (or CF direct) rebuilds → site updates. No manual steps.
Verify after first deploy: pages HTTP 200, sitemap reachable, one tool page spot-checked against its source URL.
