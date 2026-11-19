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

// ---- robots.txt gate (sprint1-policy rule 1) ------------------------------
// Prefix matching only (no * / $ rule wildcards) — conservative: any matching
// Disallow wins over shorter Allow. Missing robots.txt (4xx) = allow; unreachable
// = allow but logged. Crawl-delay is honored on top of our own rate limit.
const robotsCache = new Map();
const UA_TOKEN = UA.toLowerCase().split('/')[0];

function parseRobots(txt) {
  const groups = []; let cur = null;
  for (const raw of txt.split(/\r?\n/)) {
    const line = raw.replace(/#.*$/, '').trim();
    const m = line.match(/^(user-agent|disallow|allow|crawl-delay)\s*:\s*(.*)$/i);
    if (!m) continue;
    const k = m[1].toLowerCase(), v = m[2].trim();
    if (k === 'user-agent') {
      if (cur && cur.rules.length) { groups.push(cur); cur = null; }
      if (!cur) cur = { uas: [], rules: [], delay: null };
      cur.uas.push(v.toLowerCase());
    } else if (cur) {
      if (k === 'crawl-delay') cur.delay = parseFloat(v) || null;
      else cur.rules.push({ type: k, path: v });
    }
  }
  if (cur) groups.push(cur);
  const mine = groups.filter(g => g.uas.includes(UA_TOKEN) || g.uas.includes(UA.toLowerCase()));
  const star = groups.filter(g => g.uas.includes('*'));
  const g = mine.length ? mine[0] : (star.length ? star[0] : null);
  return g ? { rules: g.rules, delay: g.delay } : { rules: [], delay: null };
}

function robotsVerdict(rules, path) {
  let best = null, bestLen = -1;
  for (const r of rules) {
    if (r.path === '') continue;                       // empty Disallow = allow all
    if (path.startsWith(r.path) && r.path.length > bestLen) { bestLen = r.path.length; best = r.type; }
  }
  return best !== 'disallow';
}

async function robotsAllowed(url) {
  const u = new URL(url);
  if (!robotsCache.has(u.origin)) {
    let parsed = { rules: [], delay: null }, note = 'missing';
    try {
      const r = await fetch(u.origin + '/robots.txt', { headers: { 'User-Agent': UA } });
      if (r.ok) { parsed = parseRobots(await r.text()); note = 'parsed'; }
      else if (r.status >= 500) { note = 'robots-5xx'; }
      else note = 'no-robots-' + r.status;
    } catch (e) { note = 'robots-unreachable'; }
    robotsCache.set(u.origin, { ...parsed, note });
    await sleep(1200);
  }
  const c = robotsCache.get(u.origin);
  return { allowed: robotsVerdict(c.rules, u.pathname + u.search), crawlDelay: c.delay, note: c.note };
}

(async () => {
  const summary = [];
  for (const slug of BATCH) {
    const tool = seed.tools.find(t => t.slug === slug);
    if (!tool) { summary.push({ slug, error: 'not in seed' }); continue; }
    const stamp = new Date().toISOString().slice(0, 10);
    const base = tool.url.replace(/\/$/, '');
    const candidates = [base + '/pricing', base + '/en/pricing', base].filter(u => true);
    const candAllowed = [];
    for (const url of candidates) candAllowed.push({ url, ...(await robotsAllowed(url)) });
    if (!candAllowed.some(c => c.allowed)) {
      summary.push({ slug, robots: 'disallowed-all-candidates', base, note: candAllowed[0].note });
      await sleep(1500);
      continue;
    }
    const delayMs = Math.max(...candAllowed.map(c => c.crawlDelay || 0), 0) * 1000;
    let result = null;
    for (const { url, allowed } of candAllowed) {
      if (!allowed) { summary.push({ slug, url, robots: 'disallowed', note: candAllowed[0].note }); continue; }
      result = await fetchPage(url);
      summary.push({ slug, url, status: result.status, ms: result.ms, bytes: result.html.length, finalUrl: result.finalUrl || '', err: result.err || null });
      if (result.status === 200 && result.html.length > 5000) break;
      await sleep(Math.max(1200, delayMs));
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
    await sleep(2000 + delayMs + Math.random() * 800);   // rate limit + robots crawl-delay + jitter
  }
  writeFileSync(join(ROOT, 'data/scrape-raw', `batch-${new Date().toISOString().slice(0, 10)}-summary.json`),
                JSON.stringify(summary, null, 2));
  console.log(JSON.stringify(summary, null, 1));
})();
