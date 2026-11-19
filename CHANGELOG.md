# CHANGELOG — FacelessStack DB

## 2026-11-20 (night 3, pulled forward inline)
- data: **52 verified tool profiles** (was 15) — batch-3 static scrape (26: zebracat, pika, luma, speechify, cartesia, kokoro, happyscribe, zubtitle, captions, munch, 2short, kapwing, wisecut, jasper, copy-ai, buffer, metricool, blotato, post-bridge, ideogram, midjourney, leonardo, photoroom, soundraw, 1of10, outlierkit) + browser render pass (11: fliki, murf-ai, veed, publer, tubebuddy, wellsaid-labs, chatgpt, claude, epidemic-sound, kling-ai, canva). W1 "profiles → 50" exit hit early.
- feat: scene library v1 (`studio/scenes/`) — walk/talk/wave/sit/jump rigs + shock/jealous/deadpan/facepalm reacts, props, backgrounds, captions, grain/vignette; smoke-test page; README.
- feat: SKIT-003 "Everyone's faceless now" (18.24s) — first SceneLib consumer; QC PASS all six angles; packaged to `studio/ready-to-post/20261120-faceless-meta/`.
- fix: robots.txt pre-check + crawl-delay honored in `scripts/scrape_profiles.cjs` (sprint1-policy rule 1).
- data finds: lovo.ai **site down** ("deployment temporarily paused"); play.ht unreachable (and playht.com is a squatted affiliate-redirect domain — do not scrape); geo-priced PHP displays on fliki/chatgpt/canva/tubebuddy recorded with USD equivalents.
- site rebuilt: 55 tool pages, 45 comparison pages, index + sitemap.
