# Deploy runbook — LIVE as of 2026-11-19
- Live URL: https://facelessstack-db.gonzalesisaac29.workers.dev
- Type: Cloudflare Worker + static assets (deployed via `npx wrangler deploy` from Workers Builds)
- Deploy flow: fleet commits data → push to main → Workers Builds auto-deploys (see toggle below)
- QC after each deploy (fleet): HTTP 200 on /, /tools/*.html (follow 307s to clean URLs), /sitemap.xml, /robots.txt; spot-check one price page vs source

## USER TOGGLE (one time, required for nightly auto-deploy)
The first build was "Manually deployed". In the Cloudflare dashboard:
  Workers & Pages → facelessstack-db → Settings → Builds & deployments →
  Deploy on push: enable (automatic deploys on commits to main).
Without this toggle, nightly pushes will NOT update the live site.

## Notes
- Cloudflare strips .html in URLs (307 → clean path) — expected, links work
- Custom domain (optional): Domains tab → add custom domain
- workers.dev subdomain + preview URLs are enabled by default (warnings in log are cosmetic)
