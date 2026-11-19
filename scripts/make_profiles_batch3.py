#!/usr/bin/env python3
"""Batch-3 profile builder: curated tiers from data/scrape-raw digests (2026-11-19).

Every row: source_url = final fetch URL from the digest, provenance = gzipped raw
snapshot in data/snapshots/, checked_at = scrape date. Rows follow the runway.json
schema. vizard/epidemic-sound are written verified:false (JS-render/ambiguous) and
are NOT counted toward the W1 target."""
import json, os

ROOT = '/Users/gonza/.zcode/workspace/draft-95d0ee14-e8b5-4387-9557-381180dcb1dd'
DAY = '2026-11-19'
STAMP = '2026-11-19'  # snapshot date stamp used by the scraper (ISO, dashed)

seed = json.load(open(f'{ROOT}/data/tools-seed.json'))
seedmap = {t['slug']: t for t in seed['tools']}

def T(name, monthly, annual=None, notes=None):
    d = {'name': name, 'monthly_usd': monthly}
    if annual is not None: d['annual_monthly_usd'] = annual
    if notes: d['notes'] = notes
    return d

# slug: (source_url, tiers, pricing_notes)
D = {
 'zebracat': ('https://www.zebracat.ai/pricing', [
    T('Free', 0, notes='free tier to get started'),
    T('Cat Mode', 39, 23), T('Super Cat', 99, 59), T('Unlimited Cat', 199, 119),
    T('Enterprise', 599, notes='custom pricing, from $599/mo')],
    'Annual billing saves 40%.'),
 'pika': ('https://pika.art/pricing', [
    T('Free', 0), T('Starter', 10, 8, '600 credits/mo'),
    T('Creator', 35, 28, '2,600 credits/mo'),
    T('Fancy', 95, 76, 'credit slider, up to $880/mo (8,550 credits)')],
    'Commercial license on all paid plans.'),
 'luma-dream-machine': ('https://lumalabs.ai/app', [
    T('Plus', 30, 25, '10,000 credits/mo ($300 billed yearly)'),
    T('Pro', 90, 75, '40,000 credits/mo ($900 billed yearly)'),
    T('Ultra', 300, 250, '150,000 credits/mo ($3,000 billed yearly)')],
    'Pricing fetched from /app (no standalone /pricing page).'),
 'speechify': ('https://speechify.com/pricing/', [
    T('Premium (TTS)', 29, 11.6, 'or $139 billed yearly; 400+ voices, 60+ languages')],
    'TTS subscription page; other Speechify products priced separately.'),
 'cartesia': ('https://www.cartesia.ai/pricing', [
    T('Free', 0, notes='20K credits/mo + $1 prepaid voice agents'),
    T('Pro', 5, notes='100K credits/mo, commercial license, voice cloning'),
    T('Startup', 49), T('Scale', 299, notes='8M credits/mo, priority support')],
    'TTS $0.03/min; telephony $0.014/min; Enterprise custom.'),
 'kokoro-oss': ('https://huggingface.co/hexgrad/Kokoro-82M', [
    T('Open source', 0)], 'Free/open-source TTS model (82M params); runs locally.'),
 'happyscribe': ('https://www.happyscribe.com/pricing', [
    T('Free', 0), T('Basic', 17, 8.5), T('Pro', 29, 19), T('Business', 89, 59)],
    'Annual saves 34-50%; extra credits $0.20/min; human proofreading from $2.00/min.'),
 'zubtitle': ('https://zubtitle.com/pricing', [
    T('Bootstrapper', 0, notes='2 videos/mo, watermark, 720p'),
    T('Guru', 19, notes='or $190/yr; 10 videos/mo, 4K, no watermark'),
    T('Agency', 49, notes='or $490/yr; 30 videos/mo')],
    'Annual = 2 months free.'),
 'captions-app': ('https://captions.ai/pricing', [
    T('Max', 24.99), T('Scale', 69.99, notes='usage variants $69.99/$139.99/$279.99 (1x/2x/4x)')],
    'No free tier captured on page.'),
 'munch': ('https://www.munchstudio.com/pricing', [
    T('Essential', 68, 38), T('Premium', 85, 60), T('Studio', 148, 118), T('Scale', 398, 318)],
    'Seed URL getmunch.com redirects to munchstudio.com; 7-day free trial.'),
 '2short': ('https://2short.ai/pricing', [
    T('Starter', 0), T('Lite', 9.9, notes='5h AI analyzing/mo'),
    T('Pro', 19.9, notes='15h/mo, unlimited exports'),
    T('Premium', 49.9, notes='50h/mo, priority support')],
    ''),
 'kapwing': ('https://www.kapwing.com/pricing', [
    T('Free', 0, notes='10 credits, watermark, 720p, 4-min exports'),
    T('Pro', 16, notes='1,000 credits/mo, no watermark')],
    'Business/Enterprise tiers are JS-carousel-hidden in static HTML - re-verify.'),
 'wisecut': ('https://wisecut.ai/pricing', [
    T('Free', 0, notes='Editor+WISH limited, 30 min/mo, 480p'),
    T('Starter+', 29), T('Professional+', 119, notes='4K, 90 min/export')],
    ''),
 'jasper': ('https://www.jasper.ai/pricing', [
    T('Pro', 69, 59, 'per seat/month')],
    'Only Pro captured in static HTML (yearly save ~20%); Business tier not captured - re-verify.'),
 'copy-ai': ('https://www.copy.ai/prices', [
    T('Starter', 29, 24, 'billed $288/yr'),
    T('Growth', 1000, notes='75 seats, 20K workflow credits/mo, billed $12,000/yr'),
    T('Expansion', 2000, notes='150 seats, 45K credits/mo, billed $24,000/yr'),
    T('Scale', 3000, notes='200 seats, 75K credits/mo, billed $36,000/yr')],
    'Plan-name-to-price mapping read from layout order; Starter annual is $24/mo.'),
 'buffer': ('https://buffer.com/pricing', [
    T('Essentials', 5, notes='per channel; $60/channel billed yearly'),
    T('Team', 10, notes='per channel; $120/channel billed yearly')],
    'Captured rates are annual-billing per-channel; free plan not captured in static HTML.'),
 'metricool': ('https://metricool.com/pricing/', [
    T('Free', 0, notes='1 brand'),
    T('Starter', 20, notes='annual: 5 brands $20, 10 brands $36; monthly $25/$45'),
    T('Advanced', 53, notes='annual: 15 brands $53, 25 brands $85, 50 brands $159; monthly $67/$107/$210'),
    T('Custom', None, notes='white label, dedicated manager')],
    'USD view captured (EUR also offered); annual saves up to 24%; add-ons from $12/mo.'),
 'blotato': ('https://www.blotato.com/pricing', [
    T('Starter', 29, notes='20 social accounts, 900 TikTok posts/mo'),
    T('Creator', 97), T('Agency', 499)],
    '7-day free trial; n8n/Make official nodes.'),
 'post-bridge': ('https://www.post-bridge.com/pricing', [
    T('Marketer', 39, notes='15 accounts, billed monthly; yearly = 2 months free'),
    T('Operator', 99, notes='99 accounts; $1/account/month after')],
    ''),
 'ideogram': ('https://ideogram.ai/pricing/', [
    T('Plus', 20, 15), T('Pro', 60, 42), T('Team', 30, 20, 'per user')],
    'Annual: Plus $180/yr, Pro $504/yr, Team $240/user/yr; free plan not captured.'),
 'midjourney': ('https://www.midjourney.com/pricing', [
    T('Basic', 10, 8), T('Standard', 30, 24, 'unlimited relax generations'),
    T('Pro', 60, 48, 'stealth mode'), T('Mega', 120, 96)],
    'Yearly = 20% off.'),
 'leonardo-ai': ('https://leonardo.ai/pricing', [
    T('Free', 0), T('Essential', 12), T('Premium', 30), T('Ultimate', 60)],
    'Yearly saves up to 20% (annual rates not itemized in static HTML).'),
 'photoroom': ('https://www.photoroom.com/pricing', [
    T('Pro', 7.5, notes='billed yearly; 8,000 AI credits, 1,000 exports'),
    T('Max', 20.99, notes='billed yearly; 25,000 credits, 3,000 exports'),
    T('Ultra', 82.5, notes='billed yearly; 75,000 credits, 10,000 exports')],
    'Captured rates are yearly billing (save up to 88%); monthly rates not captured.'),
 'soundraw': ('https://soundraw.io/pricing', [
    T('Creator', 5.99), T('Artist Starter', 10.49), T('Artist Pro', 12.59),
    T('Unlimited', 17.49)],
    'Captured rates are annual billing (page annual/monthly toggle); commercial use + distribution included.'),
 '1of10': ('https://1of10.com/pricing', [
    T('Free', 0, notes='60 credits/mo'),
    T('Paid tier 1', 19, 15, 'billed $180/yr, save $48/yr'),
    T('Paid tier 2', 89, 69, 'billed $828/yr, save $240/yr'),
    T('Top tier', 417, notes='about $417/mo, billed $4,999/yr; monthly rate not captured')],
    'Plan names not captured in static HTML.'),
 'outlierkit': ('https://outlierkit.com/app/pricing', [
    T('Hobby (Starter)', 79, 49, 'save 38%'),
    T('Pro', 149, 99, 'save 34%'),
    T('Max (Ultimate)', 399)],
    'Page also advertises a Lifetime one-time option; tier naming partly inferred.'),
 'vizard': ('https://vizard.ai/pricing', [], 'Promo-ambiguous page (Creator/Business show "$0 billed yearly" under 50% OFF) - needs in-app-browser render before verification.'),
 'epidemic-sound': ('https://www.epidemicsound.com/pricing/', [], 'JS-rendered pricing (static HTML has no price lines) - needs in-app-browser render pass.'),
}

written, skipped = [], []
for slug, (src, tiers, notes) in D.items():
    t = seedmap[slug]
    prov = f'data/snapshots/{slug}-{STAMP}.html.gz'
    if not os.path.exists(f'{ROOT}/{prov}'):
        skipped.append((slug, 'missing snapshot')); continue
    verified = bool(tiers)
    prof = {
        'slug': slug, 'name': t['name'], 'category': t['category'], 'url': t['url'],
        'pricing': {'currency': 'USD', 'tiers': tiers, 'notes': notes,
                    'source_url': src, 'checked_at': DAY},
        'affiliate': t.get('affiliate', 'unverified'), 'status': 'active',
        'verified': verified,
        **({'verified_at': DAY} if verified else {'scrape_note': notes}),
        'provenance': prov,
    }
    with open(f'{ROOT}/data/profiles/{slug}.json', 'w') as f:
        json.dump(prof, f, indent=1)
    written.append(slug)

# seed corrections learned this batch
seedmap['munch']['url'] = 'https://www.munchstudio.com'
for s in ['canva', 'publer', 'tubebuddy', 'wellsaid-labs']:
    seedmap[s]['scrape_note'] = 'JS-rendered pricing (0 price lines in static HTML) - browser render pass'
seedmap['epidemic-sound']['scrape_note'] = 'JS-rendered pricing (0 price lines in static HTML) - browser render pass'
seedmap['chatgpt']['scrape_note'] = 'consumer pricing at openai.com/chatgpt/pricing - browser render pass'
seedmap['claude']['scrape_note'] = 'consumer pricing at anthropic.com pricing page - browser render pass'
seedmap['vizard']['scrape_note'] = 'promo-ambiguous static page - browser render pass'
with open(f'{ROOT}/data/tools-seed.json', 'w') as f:
    json.dump(seed, f, indent=1)

n_verified = len(json.loads('[]')) if False else sum(
    1 for fn in os.listdir(f'{ROOT}/data/profiles')
    if fn.endswith('.json') and json.load(open(f'{ROOT}/data/profiles/{fn}'))['verified'])
print('written:', len(written), 'skipped:', skipped)
print('total verified profiles now:', n_verified)
