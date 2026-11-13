// Cookie consent in line with Saudi PDPL consent rules (and GDPR-style best practice):
// - nothing optional runs before an explicit opt-in,
// - "Necessary only" is offered as prominently as "Accept all",
// - the choice can be changed or withdrawn at any time (footer link),
// - the record expires after 12 months.
// Optional scripts must check MGConsent.has('statistics' | 'marketing') before loading.
import { h, t } from './core.js';
import { analyticsServices } from './analytics.js';

const KEY = 'mg-consent';
const VERSION = 1;
const MAX_AGE = 365 * 24 * 60 * 60 * 1000;
const CATS = ['necessary', 'statistics', 'marketing'];
// Categories with services actually in use.
// statistics: the anonymous growth-readiness result and the analytics tools run only after opt-in.
const inUse = () => ({ statistics: ['Magmafy OS (Google Apps Script)', ...analyticsServices()], marketing: [] });

const listeners = new Set();
let record = read();

function read() {
  try {
    const r = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (r && r.v === VERSION && Date.now() - r.ts < MAX_AGE) return r;
  } catch (_) { /* ignore */ }
  return null;
}

function write(choice) {
  record = { v: VERSION, ts: Date.now(), necessary: true, statistics: !!choice.statistics, marketing: !!choice.marketing };
  try { localStorage.setItem(KEY, JSON.stringify(record)); } catch (_) { /* storage blocked */ }
  listeners.forEach((fn) => fn({ ...record }));
}

export const consent = {
  has: (cat) => cat === 'necessary' || !!(record && record[cat]),
  decided: () => !!record,
  onChange: (fn) => listeners.add(fn)
};
window.MGConsent = Object.freeze({ has: consent.has, onChange: consent.onChange });

let banner = null;

function legalLinks() {
  return h('p', { class: 'consent__links' },
    h('a', { href: 'privacy.html' }, t('cookies.privacyLink')), ' · ',
    h('a', { href: 'terms.html' }, t('cookies.termsLink')));
}

export function showBanner() {
  if (banner || record) return;
  const reject = h('button', { type: 'button', class: 'btn btn--ghost consent__btn' }, t('cookies.rejectAll'));
  const settingsBtn = h('button', { type: 'button', class: 'consent__more' }, t('cookies.settings'));
  const accept = h('button', { type: 'button', class: 'btn btn--ghost consent__btn' }, t('cookies.acceptAll'));
  banner = h('section', { class: 'consent', role: 'region', 'aria-label': t('cookies.title') },
    h('div', { class: 'consent__body' },
      h('h2', { class: 'consent__title' }, t('cookies.title')),
      h('p', {}, t('cookies.banner')),
      legalLinks()),
    h('div', { class: 'consent__actions' }, reject, accept, settingsBtn));
  reject.addEventListener('click', () => { write({}); closeBanner(); });
  accept.addEventListener('click', () => { write({ statistics: true, marketing: true }); closeBanner(); });
  settingsBtn.addEventListener('click', () => openSettings());
  document.body.append(banner);
  requestAnimationFrame(() => banner.classList.add('is-in'));
}

function closeBanner() {
  if (!banner) return;
  const b = banner;
  banner = null;
  b.classList.remove('is-in');
  setTimeout(() => b.remove(), 400);
}

let dialog = null;
export function openSettings() {
  dialog?.remove();
  const state = { statistics: consent.has('statistics'), marketing: consent.has('marketing') };
  const status = h('p', { class: 'dialog__status', role: 'status' });
  const rows = CATS.map((cat) => {
    const locked = cat === 'necessary';
    const input = h('input', { type: 'checkbox', role: 'switch', id: 'c-' + cat, checked: locked || state[cat], disabled: locked });
    input.addEventListener('change', () => { state[cat] = input.checked; });
    const note = locked ? t('cookies.alwaysOn') : (inUse()[cat].length ? inUse()[cat].join(', ') : t('cookies.notUsed'));
    return h('div', { class: 'consent__cat' },
      h('div', { class: 'consent__cat-head' },
        h('label', { for: 'c-' + cat }, t('cookies.cats.' + cat + '.title')),
        h('span', { class: 'switch' }, input, h('span', { class: 'switch__ui', 'aria-hidden': 'true' }))),
      h('p', {}, t('cookies.cats.' + cat + '.text')),
      h('p', { class: 'consent__note' }, note));
  });
  const reject = h('button', { type: 'button', class: 'btn btn--ghost btn--sm' }, t('cookies.rejectAll'));
  const save = h('button', { type: 'button', class: 'btn btn--ghost btn--sm' }, t('cookies.save'));
  const accept = h('button', { type: 'button', class: 'btn btn--ghost btn--sm' }, t('cookies.acceptAll'));
  const close = h('button', { type: 'button', class: 'dialog__x', 'aria-label': t('cookies.close') }, '×');
  dialog = h('dialog', { class: 'dialog consent-dialog', 'aria-labelledby': 'consent-title' },
    close,
    h('h2', { id: 'consent-title', class: 'dialog__title' }, t('cookies.title')),
    h('p', {}, t('cookies.text')),
    ...rows,
    legalLinks(),
    status,
    h('div', { class: 'dialog__actions' }, reject, save, accept));
  const done = (choice) => { write(choice); status.textContent = t('cookies.saved'); closeBanner(); setTimeout(() => dialog?.close(), 500); };
  reject.addEventListener('click', () => done({}));
  save.addEventListener('click', () => done(state));
  accept.addEventListener('click', () => done({ statistics: true, marketing: true }));
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => { dialog.remove(); dialog = null; });
  document.body.append(dialog);
  dialog.showModal();
}

export function refreshBanner() {
  // Re-render in the new language if it is still open.
  if (banner) { banner.remove(); banner = null; showBanner(); }
}
