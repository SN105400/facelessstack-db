#!/usr/bin/env python3
"""Batch-4 profile builder: in-app-browser render pass (2026-11-19 ~16:00Z).

Method: logged-out Chromium (IAB), per-host single page load, domSnapshot /
innerText extraction, screenshots only where prices render as images (canva).
No auth, no payment walls. Provenance digests written to data/scrape-raw/<slug>-render.txt.
Geo-priced sites (PH IP) recorded in their displayed currency with USD equivalents."""
import json, os

ROOT = '/Users/gonza/.zcode/workspace/draft-95d0ee14-e8b5-4387-9557-381180dcb1dd'
DAY = '2026-11-19'
SEEN = '2026-11-19T16:00-16:55Z'

seed = json.load(open(f'{ROOT}/data/tools-seed.json'))
seedmap = {t['slug']: t for t in seed['tools']}

def T(name, monthly, annual=None, notes=None):
    d = {'name': name, 'monthly_usd': monthly}
    if annual is not None: d['annual_monthly_usd'] = annual
    if notes: d['notes'] = notes
    return d

# slug: (currency, source_url, tiers, pricing_notes, verified, extra_status_note)
D = {
 'fliki': ('PHP', 'https://fliki.ai/pricing', [
    T('Free', 0, notes='5 min/mo free audio+video generation'),
    T('Basic', 449, notes='60 credits/mo; ~USD 7.7'),
    T('Standard', 1669, notes='180 credits/mo; ~USD 28.5'),
    T('Premium', 5199, notes='600 credits/mo; ~USD 89')],
    'Geo-priced PHP (PH IP); FAQ claims USD listing but site renders PHP from this region. '
    'Black Friday: 50% off annual Standard & Premium (code FLIKIBFCM50).', True, None),
 'murf-ai': ('USD', 'https://murf.ai/pricing', [
    T('API — pay-as-you-go', None, notes='TTS $0.01/1k chars (Falcon 2.1), $0.03/1k (studio TTS); '
      'STT $0.12/hr; voice changer $0.10/min; translation $0.02/1k chars; $10 free API credits')],
    'Public page now shows API pricing only; consumer/studio subscription tiers are behind the '
    'app (Enterprise section only on page).', True, None),
 'veed': ('USD', 'https://www.veed.io/pricing', [
    T('Tier 1', 20, 10, '500 credits/mo ~125 AI videos, per user; yearly billed rate'),
    T('Pro', 44, 21, '1,500 credits/mo ~375 AI videos, per user'),
    T('Enterprise', None, notes='custom AI credits')],
    'Monthly $20/$44, yearly $10/$21 per user/mo. First tier name cut off in snapshot '
    '(recorded as "Tier 1").', True, None),
 'publer': ('USD', 'https://publer.io/pricing', [
    T('Free', 0, notes='limited scheduling; X/Twitter requires paid plan'),
    T('Professional', 5, 4), T('Business', 10, 8),
    T('Enterprise', None, notes='volume discounts')],
    'Yearly = 20% discount.', True, None),
 'tubebuddy': ('USD', 'https://www.tubebuddy.com/pricing', [
    T('Pro', 4.5, 3.6), T('RisingStarBuddy (Star)', None, notes='price not captured in snapshot'),
    T('Legend', 28.99, 23.19)],
    'Creator-license packages (individuals only, eligibility rules apply). USD charged; '
    'PHP estimates shown from PH IP (Pro ₱286.62/₱229.30, Legend ₱1846/₱1477).', True, None),
 'wellsaid-labs': ('USD', 'https://wellsaidlabs.com/pricing', [], 
    'No public self-serve pricing as of 2026-11-19 — /pricing redirects to product marketing; '
    'platform pivoted to enterprise voiceover production (teams, approvals, MCP/Producer).', True, None),
 'chatgpt': ('PHP', 'https://openai.com/chatgpt/pricing/', [
    T('Free', 0), T('Go', 300, notes='~USD 5.4/mo'),
    T('Plus', 1100, notes='~USD 19.5/mo'),
    T('Pro', 6490, notes='~USD 115/mo')],
    'Geo-priced PHP (PH IP); USD not displayed from this region. Go is a newer mid tier.', True, None),
 'claude': ('USD', 'https://www.anthropic.com/pricing', [
    T('Free', 0), T('Pro', 20, 17, '$200 billed up front annually; $20 monthly'),
    T('Max 5x', 100, notes='5x Pro usage + $100/mo API credits'),
    T('Max 20x', 200, notes='10x Pro usage + $200/mo API credits')],
    'Team & Enterprise and API tabs priced separately (not captured).', True, None),
 'epidemic-sound': ('USD', 'https://www.epidemicsound.com/pricing/', [
    T('Personal', 5.99, notes='billed $71.88 yearly'),
    T('Commercial', 11.99, notes='billed $143.88 yearly'),
    T('Commercial Plus', 28.99, notes='billed $347.88 yearly')],
    'Yearly billing (default toggle, save up to 60%); monthly rates not captured. '
    '250,000 monthly credits on all plans; 30-day free trial offer.', True, None),
 'kling-ai': ('USD', 'https://kling.ai/app/membership/membership-plan', [
    T('Standard', 8.8, notes='$6.5/mo first 3 months (35% off), $10 anchor shown; 100 credits = $0.98'),
    T('Pro', 32.56, notes='$24/mo first 3 months, $37 anchor shown; 100 credits = $0.80'),
    T('Premier', None, notes='$207 first 3 months; continuation rate not captured')],
    'Intro-then-regular structure is ambiguously worded on page; recorded as displayed. '
    'klingai.com geo-redirects to /cn/; global pricing lives at kling.ai/app membership page.', True, None),
 'canva': ('PHP', 'https://www.canva.com/pricing/', [
    T('Free', 0), T('Pro', 300, notes='~USD 5.3/mo; ₱150 first 3 months (50% off promo)'),
    T('Business', 420, notes='~USD 7.4/mo; ₱210 first 3 months'),
    T('Enterprise', None, notes='custom quote')],
    'Prices rendered as images — read via screenshot. Geo-priced PHP (PH IP); '
    'yearly billing saves from 16%. Seed estimate (~$15 Pro) did not match PH-region display.', True, None),
 'lovo-genny': ('USD', 'https://lovo.ai/pricing', [],
    'SITE DOWN: lovo.ai returns "This deployment is temporarily paused (sin1::fhpj4-...)" '
    'as of 2026-11-19T16:50Z — hosting-level outage, pricing unverifiable. Re-check next nightly.', False, 'site-down'),
 'playht': ('USD', 'https://play.ht/', [],
    'UNREACHABLE: play.ht fails DNS/network from both node fetch and in-app Chromium '
    '(2026-11-19). playht.com redirects to an affiliate/squatter domain (1xlite-54515.pro...) '
    '— do not scrape that host. Remedy: retry from a different network/DNS resolver.', False, 'unreachable'),
 'vizard': ('USD', 'https://vizard.ai/pricing', [], 
    'Promo-ambiguous page (Creator/Business shown as "$0 billed yearly" under 50% OFF); '
    'not verifiable without account-context pricing. Kept unverified.', False, None),
}

written = []
for slug, (cur, src, tiers, notes, verified, status_note) in D.items():
    t = seedmap[slug]
    digest = [
        f'TOOL: {t["name"]} ({slug}) — BROWSER RENDER PASS',
        f'SOURCE: {src}',
        f'FETCHED: {SEEN} (logged-out in-app Chromium, domSnapshot/screenshot extract)',
        'LINES:',
        *[f'  - {ln}' for ln in (notes or '').split('. ') if ln],
    ]
    with open(f'{ROOT}/data/scrape-raw/{slug}-render.txt', 'w') as f:
        f.write('\n'.join(digest) + '\n')
    prof = {
        'slug': slug, 'name': t['name'], 'category': t['category'], 'url': t['url'],
        'pricing': {'currency': cur, 'tiers': tiers, 'notes': notes,
                    'source_url': src, 'checked_at': DAY},
        'affiliate': t.get('affiliate', 'unverified'),
        'status': status_note or 'active',
        'verified': verified,
        **({'verified_at': DAY} if verified else {'scrape_note': notes}),
        'provenance': f'data/scrape-raw/{slug}-render.txt (browser render pass {SEEN})',
    }
    with open(f'{ROOT}/data/profiles/{slug}.json', 'w') as f:
        json.dump(prof, f, indent=1)
    written.append(slug)

n_verified = sum(1 for fn in os.listdir(f'{ROOT}/data/profiles') if fn.endswith('.json')
                 and json.load(open(f'{ROOT}/data/profiles/{fn}'))['verified'])
print('written:', len(written))
print('total verified profiles now:', n_verified)
