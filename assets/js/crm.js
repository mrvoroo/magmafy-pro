// Link between the website and Magmafy OS (Google Apps Script + Google Sheet).
// - Remembers where the visitor came from (UTM) for this browser session only.
// - Keeps the growth-readiness result so it travels with the booking.
// - Talks to the Apps Script web app with "simple" requests (text/plain), which
//   avoids a CORS preflight that Apps Script cannot answer.
import { settings, str } from './core.js';

const UTM_KEY = 'mg-utm';
const SESSION_KEY = 'mg-session';
const READY_KEY = 'mg-readiness';
const TIMEOUT = 25000;

const ss = {
  get(k) { try { return sessionStorage.getItem(k); } catch (_) { return null; } },
  set(k, v) { try { sessionStorage.setItem(k, v); } catch (_) { /* storage blocked */ } }
};

/** The Apps Script /exec URL, when one is set in the admin (Settings → booking form → endpoint). */
export function crmEndpoint() {
  const url = str((settings.form || {}).endpoint).trim();
  return /^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(url) ? url : '';
}

export function sessionId() {
  let id = ss.get(SESSION_KEY);
  if (!id) {
    const rnd = (window.crypto && crypto.getRandomValues) ? Array.from(crypto.getRandomValues(new Uint32Array(2)), (n) => n.toString(36)).join('') : Math.random().toString(36).slice(2);
    id = 's-' + Date.now().toString(36) + '-' + rnd;
    ss.set(SESSION_KEY, id);
  }
  return id;
}

/** Call once per page load: keeps the first UTM tags of the visit. */
export function captureUtm() {
  const p = new URLSearchParams(location.search);
  const utm = {};
  ['source', 'medium', 'campaign', 'content', 'term'].forEach((k) => { const v = p.get('utm_' + k); if (v) utm[k] = v.slice(0, 120); });
  if (p.get('fbclid')) utm.source = utm.source || 'meta';
  if (p.get('gclid')) utm.source = utm.source || 'google';
  if (p.get('ttclid')) utm.source = utm.source || 'tiktok';
  if (p.get('ScCid')) utm.source = utm.source || 'snapchat';
  if (Object.keys(utm).length && !ss.get(UTM_KEY)) ss.set(UTM_KEY, JSON.stringify(utm));
  if (!ss.get('mg-ref') && document.referrer && !document.referrer.startsWith(location.origin)) ss.set('mg-ref', document.referrer.slice(0, 300));
}

export function getUtm() { try { return JSON.parse(ss.get(UTM_KEY) || '{}'); } catch (_) { return {}; } }
export function getReferrer() { return ss.get('mg-ref') || ''; }

export function saveReadiness(result) { ss.set(READY_KEY, JSON.stringify(result)); }
export function getReadiness() { try { return JSON.parse(ss.get(READY_KEY) || 'null'); } catch (_) { return null; } }

async function withTimeout(promise) {
  let timer;
  const timeout = new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('timeout')), TIMEOUT); });
  try { return await Promise.race([promise, timeout]); } finally { clearTimeout(timer); }
}

/** POST an action to Magmafy OS. Resolves to the JSON reply, or { ok:false } on any failure. */
export async function crmPost(action, data) {
  const url = crmEndpoint();
  if (!url) return { ok: false, error: 'no_endpoint' };
  try {
    const res = await withTimeout(fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action, session: sessionId(), ...data })
    }));
    return await res.json();
  } catch (_) {
    return { ok: false, error: 'network' };
  }
}
