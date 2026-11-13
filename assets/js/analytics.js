// Statistics tools: Google Analytics 4 and Microsoft Clarity.
// - Nothing loads until the visitor opts in to the "statistics" category (see consent.js).
// - If they withdraw later, collection stops and the tools' cookies are removed.
// - The IDs live in content/site-content.js → settings.analytics (editable from /admin/).
//   With no IDs set, this module does nothing.
import { settings, str } from './core.js';

const cfg = settings.analytics || {};
const clean = (v) => str(v).trim();
const GA_ID = /^G-[A-Z0-9]{6,14}$/.test(clean(cfg.ga4)) ? clean(cfg.ga4) : '';
const CLARITY_ID = /^[a-z0-9]{8,12}$/.test(clean(cfg.clarity)) ? clean(cfg.clarity) : '';

/** Names of the statistics tools that are actually configured (shown in the privacy settings). */
export const analyticsServices = () => [GA_ID && 'Google Analytics', CLARITY_ID && 'Microsoft Clarity'].filter(Boolean);

// The page CSP uses Trusted Types, so external script URLs go through one named, allow-listed policy.
const SCRIPT_ORIGINS = new Set(['https://www.googletagmanager.com', 'https://www.clarity.ms']);
let policy = null;
try {
  if (window.trustedTypes) {
    policy = window.trustedTypes.createPolicy('mg-analytics', {
      createScriptURL: (u) => {
        const url = new URL(u, location.href);
        if (!SCRIPT_ORIGINS.has(url.origin)) throw new TypeError('script origin not allowed');
        return url.href;
      }
    });
  }
} catch (_) { /* policy blocked: loading below fails safely */ }

function loadScript(src) {
  const s = document.createElement('script');
  s.async = true;
  s.src = policy ? policy.createScriptURL(src) : src;
  document.head.append(s);
}

let active = false;
let gaStarted = false;
let clarityStarted = false;

function startGA() {
  window['ga-disable-' + GA_ID] = false;
  if (gaStarted) {
    window.gtag('consent', 'update', { analytics_storage: 'granted' });
    return;
  }
  gaStarted = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() { window.dataLayer.push(arguments); };
  window.gtag('consent', 'default', { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
  window.gtag('consent', 'update', { analytics_storage: 'granted' });
  window.gtag('js', new Date());
  window.gtag('config', GA_ID, { allow_google_signals: false, allow_ad_personalization_signals: false, cookie_expires: 31536000 });
  loadScript('https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA_ID));
}

function startClarity() {
  if (!clarityStarted) {
    clarityStarted = true;
    window.clarity = window.clarity || function clarity() { (window.clarity.q = window.clarity.q || []).push(arguments); };
    loadScript('https://www.clarity.ms/tag/' + encodeURIComponent(CLARITY_ID));
  }
  window.clarity('consentv2', { ad_Storage: 'denied', analytics_Storage: 'granted' });
}

function expireCookies(match) {
  const host = location.hostname;
  const domains = ['', host, '.' + host, '.' + host.replace(/^www\./, '')];
  document.cookie.split(';').forEach((c) => {
    const name = c.split('=')[0].trim();
    if (!match.test(name)) return;
    domains.forEach((d) => { document.cookie = name + '=; Max-Age=0; path=/' + (d ? '; domain=' + d : ''); });
  });
}

function stop() {
  if (GA_ID) {
    window['ga-disable-' + GA_ID] = true;
    try { window.gtag?.('consent', 'update', { analytics_storage: 'denied' }); } catch (_) { /* ignore */ }
  }
  if (CLARITY_ID) {
    try { window.clarity?.('consentv2', { ad_Storage: 'denied', analytics_Storage: 'denied' }); } catch (_) { /* ignore */ }
  }
  expireCookies(/^(_ga|_ga_.+|_gid|_clck|_clsk)$/);
}

/** Sends a custom event to the tools that are running. A no-op without consent. */
export function track(name, params = {}) {
  if (!active) return;
  try {
    if (GA_ID && window.gtag) window.gtag('event', name, params);
    if (CLARITY_ID && window.clarity) window.clarity('event', name);
  } catch (_) { /* never break the page for analytics */ }
}

// One delegated listener: contact and booking clicks (the actions that matter to the agency).
function watchClicks() {
  document.addEventListener('click', (e) => {
    const a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    const href = a.getAttribute('href') || '';
    let name = '';
    if (href.startsWith('mailto:')) name = 'click_email';
    else if (href.startsWith('tel:')) name = 'click_phone';
    else if (/^https:\/\/(wa\.me|api\.whatsapp\.com|wa\.link)\//.test(href)) name = 'click_whatsapp';
    else if (/(^|\/)booking(\.html)?([?#]|$)/.test(href)) name = 'click_book_cta';
    if (name) track(name, { link_text: (a.textContent || '').trim().slice(0, 60), page_path: location.pathname });
  }, true);
}

export function initAnalytics() {
  if (!GA_ID && !CLARITY_ID) return;
  const apply = () => {
    const consented = !!(window.MGConsent && window.MGConsent.has('statistics'));
    if (consented && !active) {
      active = true;
      try { if (GA_ID) startGA(); if (CLARITY_ID) startClarity(); } catch (_) { /* blocked by an extension or CSP */ }
    } else if (!consented && active) {
      active = false;
      stop();
    }
  };
  watchClicks();
  apply();
  if (window.MGConsent) window.MGConsent.onChange(apply);
}
