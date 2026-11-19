#!/usr/bin/env python3
"""FacelessStack DB — static site builder (W2 deploy simulation).
Builds site/ from data/profiles/*.json: index, per-tool pages, X-vs-Y comparisons.
Deploy target once accounts exist: Cloudflare Pages (commercial OK on free tier)."""
import json, os, glob, html, datetime

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = os.path.join(ROOT, "site")
profiles = []
for p in sorted(glob.glob(os.path.join(ROOT, "data/profiles/*.json"))):
    profiles.append(json.load(open(p)))
STAMP = datetime.datetime.now().strftime("%Y-%m-%d %H:%M")

CSS = """
body{margin:0;background:#070a16;color:#e8ecff;font-family:system-ui,sans-serif;line-height:1.5}
.wrap{max-width:960px;margin:0 auto;padding:24px 16px 60px}
a{color:#7fb0ff;text-decoration:none}a:hover{text-decoration:underline}
h1{font-size:1.7rem;margin:.2em 0}h2{margin:1.6em 0 .4em;font-size:1.2rem}
.meta{color:#8fa0c9;font-size:.85rem}
table{width:100%;border-collapse:collapse;font-size:.92rem}
th,td{text-align:left;padding:8px 10px;border-bottom:1px solid #1c2647}
th{color:#8fa0c9;font-weight:600;font-size:.8rem;text-transform:uppercase;letter-spacing:.05em}
.tag{display:inline-block;padding:2px 10px;border-radius:99px;background:#131b3a;color:#9fb4ff;font-size:.75rem}
.price{font-variant-numeric:tabular-nums}
footer{margin-top:48px;color:#5a6a95;font-size:.8rem;border-top:1px solid #1c2647;padding-top:16px}
.note{background:#101735;border:1px solid #1c2647;border-radius:8px;padding:10px 14px;font-size:.85rem;color:#a9b8e6}
"""

def page(title, body, rel=""):
    return f"""<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{html.escape(title)}</title><style>{CSS}</style></head><body>
<div class="wrap">{body}
<footer>FacelessStack DB — pricing data refreshed nightly · last build {STAMP} ·
<a href="{rel}index.html">index</a> · <a href="{rel}compare/index.html">comparisons</a> ·
<a href="{rel}about.html">methodology</a></footer></div></body></html>"""

def tier_rows(t):
    out = ""
    for x in t["tiers"]:
        m = x.get("monthly_usd"); a = x.get("annual_monthly_usd")
        mtxt = "custom" if m is None else (f"${m:g}/mo" if m else "Free")
        atxt = f" · ${a:g}/mo billed annually" if a is not None else ""
        n = f" — {x['notes']}" if x.get("notes") else ""
        out += f"<tr><td>{html.escape(x['name'])}</td><td class='price'>{mtxt}{atxt}</td><td>{html.escape(n or '')}</td></tr>\n"
    return out

def fmt_tool_row(p, rel):
    paid = [t for t in p["pricing"]["tiers"] if (t.get("monthly_usd") or 0) > 0]
    cheapest = min((t["monthly_usd"] for t in paid), default=None)
    cheapest = f"${cheapest:g}/mo" if cheapest is not None else "—"
    return (f"<tr><td><a href='{rel}tools/{p['slug']}.html'>{html.escape(p['name'])}</a></td>"
            f"<td><span class='tag'>{html.escape(p['category'])}</span></td>"
            f"<td class='price'>{cheapest}</td>"
            f"<td class='meta'>{p['pricing']['checked_at']}</td></tr>\n")

os.makedirs(os.path.join(SITE, "tools"), exist_ok=True)
os.makedirs(os.path.join(SITE, "compare"), exist_ok=True)

# index
rows = "".join(fmt_tool_row(p, "") for p in profiles)
body = f"""<h1>FacelessStack DB</h1>
<p class="meta">Pricing &amp; status of AI video / voice / creator tools — scraped nightly from public pricing pages, refreshed {STAMP}.</p>
<div class="note">Every row links to its source page. Price history is tracked nightly — the "what changed" feed is the point.</div>
<h2>Tools ({len(profiles)} tracked)</h2>
<table><tr><th>Tool</th><th>Category</th><th>From</th><th>Checked</th></tr>
{rows}</table>"""
open(os.path.join(SITE, "index.html"), "w").write(page("FacelessStack DB — creator-tool pricing, nightly", body))

# per-tool pages
for p in profiles:
    body = f"""<h1>{html.escape(p['name'])} pricing</h1>
<p class="meta">{html.escape(p['category'])} · checked {p['pricing']['checked_at']} ·
<a href="{p['pricing']['source_url']}" rel="nofollow">source page ↗</a> · <a href="../index.html">← all tools</a></p>
<table><tr><th>Plan</th><th>Price</th><th>Notes</th></tr>
{tier_rows(p['pricing'])}</table>
<div class="note">Methodology: logged-out public pricing page scrape; provenance snapshot {p['provenance'].split('/')[-1]}.
Affiliate disclosure: outbound links may be affiliate links.</div>"""
    open(os.path.join(SITE, "tools", f"{p['slug']}.html"), "w").write(page(f"{p['name']} pricing — FacelessStack DB", body, "../"))

# comparison pages for verified pairs (same-category pairs)
by_cat = {}
for p in profiles: by_cat.setdefault(p["category"], []).append(p)
comparisons = 0
for cat, ps in by_cat.items():
    for i in range(len(ps) - 1):
        a, b = ps[i], ps[i + 1]
        rows = ""
        for name, p in ((a["name"], a), (b["name"], b)):
            for t in p["pricing"]["tiers"]:
                m = t.get("monthly_usd")
                rows += f"<tr><td>{html.escape(name)}</td><td>{html.escape(t['name'])}</td><td class='price'>{'custom' if m is None else f'${m:g}/mo'}</td></tr>\n"
        body = f"""<h1>{html.escape(a['name'])} vs {html.escape(b['name'])} — pricing compared</h1>
<p class="meta">{html.escape(cat)} · data checked {a['pricing']['checked_at']} / {b['pricing']['checked_at']} · nightly refresh</p>
<table><tr><th>Tool</th><th>Plan</th><th>Price</th></tr>
{rows}</table>
<div class="note">Raw numbers only — both tools' full tier lists below:
<a href="../tools/{a['slug']}.html">{a['name']} ↗</a> · <a href="../tools/{b['slug']}.html">{b['name']} ↗</a></div>"""
        fn = f"{a['slug']}-vs-{b['slug']}.html"
        open(os.path.join(SITE, "compare", fn), "w").write(page(f"{a['name']} vs {b['name']} pricing", body, "../"))
        comparisons += 1

# compare index
links = "".join(f"<li><a href='{f}'>{html.escape(f.replace('.html','').replace('-',' ').replace(' vs ', ' vs '))}</a></li>"
                for f in sorted(os.listdir(os.path.join(SITE, "compare"))) if f.endswith(".html"))
open(os.path.join(SITE, "compare", "index.html"), "w").write(
    page("Comparisons", f"<h1>Tool vs tool</h1><ul>{links}</ul>", "../"))

# about/methodology
open(os.path.join(SITE, "about.html"), "w").write(page("Methodology", """<h1>Methodology</h1>
<p>Data is collected from public, logged-out pricing pages at most once per day per provider (rate-limited, robots.txt respected).
Every row stores its source URL and fetch timestamp. Prices are reproduced as displayed — currency USD unless stated.
This site is independent and unaffiliated with any listed vendor; outbound links may be affiliate links.
Corrections: open an issue on the repository.</p>""", ""))

# sitemap + robots
urls = ["index.html", "about.html", "compare/index.html"] + [f"tools/{p['slug']}.html" for p in profiles] + \
       [f"compare/{f}" for f in sorted(os.listdir(os.path.join(SITE, 'compare'))) if f.endswith('.html')]
open(os.path.join(SITE, "sitemap.xml"), "w").write(
    '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    "".join(f"<url><loc>https://EXAMPLE.facelessstack.pages.dev/{u}</loc></url>\n" for u in urls) + "</urlset>")
open(os.path.join(SITE, "robots.txt"), "w").write("User-agent: *\nAllow: /\nSitemap: /sitemap.xml\n")

# deploy runbook (W2, once accounts exist)
open(os.path.join(SITE, "DEPLOY.md"), "w").write("""# Deploy runbook (W2 — needs GitHub + Cloudflare accounts)
1. GitHub: create repo `facelessstack-db`; push this repo (fleet does it after auth).
2. Cloudflare Dash → Pages → Connect to Git → pick the repo.
   Build command: `python3 scripts/build_site.py` (or pre-build commit) · Output dir: `site/`
3. Custom domain (optional, ~$10/yr): add in Pages settings.
4. Nightly flow after connect: fleet commits data → GitHub Action (or CF direct) rebuilds → site updates. No manual steps.
Verify after first deploy: pages HTTP 200, sitemap reachable, one tool page spot-checked against its source URL.
""")
print(f"site build: {len(profiles)} tool pages, {comparisons} comparison pages, index + about + sitemap + deploy runbook")
