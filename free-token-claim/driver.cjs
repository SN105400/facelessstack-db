'use strict';
// ZCode free-token pack driver.
// Modes: status (default) = preview + balance; claim = claim any offered pack, then report balance summary.
// Runs under the ZCode binary: ELECTRON_RUN_AS_NODE=1 /Applications/ZCode.app/Contents/MacOS/ZCode driver.cjs [claim]
// No secret is ever printed.
const { createHash, createDecipheriv } = require('node:crypto');
const { resolve, join } = require('node:path');
const { AsyncEntry } = require(join(__dirname, 'keyring', 'index.js'));

const CRED_PATH = '/Users/gonza/.zcode/v2/credentials.json';
const SERVICE = 'ZCode Credential Encryption';
const DEVICE_MID = '0646915b-b731-4e41-8110-885d412a612b';
const BASE = 'https://zcode.z.ai';
const MODE = (process.argv[2] || 'status').toLowerCase();

function b64url(s) { return Buffer.from(s, 'base64url'); }

function decryptValue(enc, key) {
  if (!enc.startsWith('enc:v2:os:')) throw new Error('unexpected prefix: ' + enc.slice(0, 12));
  const rest = enc.slice('enc:v2:os:'.length);
  const colon = rest.indexOf(':');
  const keyId = rest.slice(0, colon);
  const [ivB, tagB, ctB] = rest.slice(colon + 1).split('.');
  const computedId = createHash('sha256').update(key).digest('hex').slice(0, 24);
  if (computedId !== keyId) throw new Error('key id mismatch');
  const d = createDecipheriv('aes-256-gcm', key, b64url(ivB));
  d.setAuthTag(b64url(tagB));
  return Buffer.concat([d.update(b64url(ctB)), d.final()]).toString('utf8');
}

function headers(token) {
  return {
    'Authorization': `Bearer ${token}`,
    'X-Device-Mid': DEVICE_MID,
    'X-Client-Language': 'en-US',
    'X-Client-Timezone': 'America/Los_Angeles',
    'X-Os-Category': 'macos',
    'X-Os-Version': '27.2.0',
    'X-ZCode-App-Version': '3.18.2',
    'X-Platform': 'darwin-arm64',
    'User-Agent': 'ZCode/3.18.2',
    'Accept': 'application/json',
  };
}

async function api(token, method, path, body) {
  const h = headers(token);
  if (body !== undefined) h['Content-Type'] = 'application/json';
  const r = await fetch(BASE + path, { method, headers: h, body: body === undefined ? undefined : JSON.stringify(body) });
  const text = await r.text();
  let json = null;
  try { json = JSON.parse(text); } catch {}
  return { status: r.status, json, text };
}

function summarizeBalance(data) {
  const lines = [];
  const fmt = ts => ts ? new Date(ts * 1000).toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }) : '?';
  for (const b of (data.balances || [])) {
    lines.push(`  plan=${b.plan_id} remaining=${b.remaining_units}/${b.total_units} (${b.show_name}) expires=${fmt(b.expires_at)}`);
  }
  if (!lines.length) lines.push('  (no active balances)');
  return lines.join('\n');
}

(async () => {
  const account = createHash('sha256').update(resolve(CRED_PATH)).digest('hex');
  const entry = new AsyncEntry(SERVICE, account, { linux: { store: 'secret-service' } });
  let password;
  try {
    password = await entry.getPassword();
  } catch (e) {
    console.log('KEYRING READ FAILED:', e && e.message ? e.message : e);
    process.exit(1);
  }
  const key = Buffer.from(password, 'base64url');
  password = '';
  if (key.length !== 32) { console.log('KEY LENGTH MISMATCH:', key.length); process.exit(1); }

  const creds = require(CRED_PATH);
  let token;
  try {
    token = decryptValue(creds['zcodejwttoken'], key);
  } catch (e) {
    console.log('DECRYPT FAILED:', e && e.message ? e.message : e);
    process.exit(1);
  }

  if (MODE === 'claim') {
    const p = await api(token, 'GET', '/api/v1/zcode-plan/billing/preview?app_version=3.18.2&platform=darwin-arm64');
    if (p.status !== 200) {
      console.log(`CLAIM CHECK FAILED: preview HTTP ${p.status}: ${(p.text || '').slice(0, 300)}`);
      process.exit(1);
    }
    const plans = (p.json && p.json.data && Array.isArray(p.json.data.plans)) ? p.json.data.plans : [];
    if (!plans.length) {
      console.log('NOTHING TO CLAIM: preview returned no claimable packs.');
    } else {
      for (const plan of plans) {
        const pid = plan.plan_id;
        if (!pid) continue;
        const c = await api(token, 'POST', '/api/v1/zcode-plan/billing/claim', { plan_id: pid });
        const ok = c.status === 200 && c.json && c.json.code === 0;
        console.log(`${ok ? 'CLAIMED' : 'CLAIM FAILED'} plan_id=${pid} HTTP ${c.status} code=${c.json && c.json.code} msg=${(c.json && c.json.msg) || (c.text || '').slice(0, 200)}`);
      }
    }
    const b = await api(token, 'GET', '/api/v1/zcode-plan/billing/balance?app_version=3.18.2');
    if (b.status === 200 && b.json && b.json.data) {
      console.log('BALANCE SUMMARY:');
      console.log(summarizeBalance(b.json.data));
    } else {
      console.log(`BALANCE CHECK FAILED: HTTP ${b.status}`);
    }
    return;
  }

  // status mode (full detail for debugging)
  for (const path of ['/api/v1/zcode-plan/billing/preview?app_version=3.18.2&platform=darwin-arm64',
                      '/api/v1/zcode-plan/billing/balance?app_version=3.18.2']) {
    const r = await api(token, 'GET', path);
    console.log(`\n===== GET ${path} -> HTTP ${r.status} =====`);
    if (r.json) console.log(JSON.stringify(r.json, null, 2).slice(0, 7000));
    else console.log((r.text || '').slice(0, 1000));
  }
})();
