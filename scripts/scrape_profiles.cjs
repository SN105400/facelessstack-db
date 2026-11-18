'use strict';
// Batch-1 pricing-page scraper for FacelessStack DB.
// Compliance: logged-out public pages only, honest UA, 2000ms + jitter between requests,
// raw HTML gzipped to data/snapshots/ as provenance, no auth bypass, no retries on 403.
const { gzipSync } = require('node:zlib');
const { writeFileSync, readFileSync, existsSync, mkdirSync } = require('node:fs');
const { join, dirname } = require('node:path');

const ROOT = '/Users/gonza/.zcode/workspace/draft-95d0ee14-e8b5-4387-9557-381180dcb1dd';
const seed = JSON.parse(readFileSync(join(ROOT, 'data/tools-seed.json'), 'utf8'));
const BATCH = process.argv[2]
  ? process.argv[2].split(',')
  : ['invideo', 'pictory', 'fliki', 'heygen', 'elevenlabs', 'murf-ai', 'playht', 'submagic',
     'opusclip', 'veed', 'descript', 'creatify', 'klap', 'suno', 'vidiq'];

const UA = 'FacelessStackDB-research/0.1 (nightly-fleet data project; public pricing pages only)';
mkdirSync(join(ROOT, 'data/snapshots'), { recursive: true });
mkdirSync(join(ROOT, 'data/scrape-raw'), { recursive: true });

function htmlToText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>').replace(/&#\d+;/g, ' ').replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

function priceLines(text) {
  const out = [];
  const re = /[^.;]{0,90}(?:\$|USD\s|€|£)\s?\d[\d.,]*[^.;]{0,90}/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    const s = m[0].trim();
    if (/per month|\/mo\b|\/month|per year|\/yr\b|\/year|billed|annually|monthly|yearly|free|Free/i.test(s))
      out.push(s);
    if (out.length >= 40) break;
  }
  return out;
}

async function fetchPage(url) {
  const t0 = Date.now();
  try {
    const r = await fetch(url, { headers: { 'User-Agent': UA, 'Accept': 'text/html' }, redirect: 'follow' });
    const html = await r.text();
    return { status: r.status, html, ms: Date.now() - t0, finalUrl: r.url };
  } catch (e) {
    return { status: 0, html: '', ms: Date.now() - t0, err: e.message };
  }
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const summary = [];
  for (const slug of BATCH) {
    const tool = seed.tools.find(t => t.slug === slug);
    if (!tool) { summary.push({ slug, error: 'not in seed' }); continue; }
    const stamp = new Date().toISOString().slice(0, 10);
    const base = tool.url.replace(/\/$/, '');
    const candidates = [base + '/pricing', base + '/en/pricing', base].filter(u => true);
    let result = null;
    for (const url of candidates) {
      result = await fetchPage(url);
      summary.push({ slug, url, status: result.status, ms: result.ms, bytes: result.html.length, finalUrl: result.finalUrl || '', err: result.err || null });
      if (result.status === 200 && result.html.length > 5000) break;
      await sleep(1200);
    }
    if (result && result.status === 200 && result.html.length) {
      // provenance snapshot (gzipped raw HTML)
      const snap = join(ROOT, 'data/snapshots', `${slug}-${stamp}.html.gz`);
      writeFileSync(snap, gzipSync(Buffer.from(result.html)));
      // digest: pricing lines from BOTH tag-stripped text and raw html (embedded JSON)
      const lines = [...new Set([...priceLines(htmlToText(result.html)), ...priceLines(result.html.replace(/\\n|\\t/g, ' '))])];
      const digest = [
        `TOOL: ${tool.name} (${slug})`,
        `SOURCE: ${result.finalUrl || result.url}`,
        `FETCHED: ${new Date().toISOString()}  HTTP ${result.status}  ${result.html.length} bytes`,
        `PRICE LINES (${lines.length}):`,
        ...lines.map(l => '  - ' + l),
      ].join('\n');
      writeFileSync(join(ROOT, 'data/scrape-raw', `${slug}.txt`), digest);
    }
    await sleep(2000 + Math.random() * 800);   // rate limit + jitter
  }
  writeFileSync(join(ROOT, 'data/scrape-raw', `batch-${new Date().toISOString().slice(0, 10)}-summary.json`),
                JSON.stringify(summary, null, 2));
  console.log(JSON.stringify(summary, null, 1));
})();
