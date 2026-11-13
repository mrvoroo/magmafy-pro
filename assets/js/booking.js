// Booking page: pick a meeting type, a day (Saturday to Thursday, Friday off), a time in
// Saudi time and Google Meet or Zoom, then leave your details. The request is sent through
// Web3Forms when an access key is set in the admin, otherwise it opens the visitor's mail app.
// Either way the visitor gets a Google Calendar link and an .ics file for the slot.
import { h, t, str, icon, settings, getLang, safeUrl } from './core.js';
import { socialLinks } from './layout.js';
import { track } from './analytics.js';
import { crmEndpoint, crmPost, crmBusySlots, getUtm, getReferrer, getReadiness } from './crm.js';

const arr = (v) => (Array.isArray(v) ? v : []);
const SLOTS = ['10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'];
const RIYADH_OFFSET = 3; // Saudi Arabia is UTC+3 all year (no daylight saving).
const DAYS_AHEAD = 60;
const DURATION = 30;
const LIMITS = { name: 100, email: 254, phone: 30, business: 150, link: 300, notes: 2000 };
const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[a-z]{2,}$/i;
const PHONE_RE = /^\+?[\d\s()-]{8,20}$/;
const pad = (n) => String(n).padStart(2, '0');
const clean = (v) => str(v).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim();

// "Today" as it is in Riyadh, whatever the visitor's own time zone is.
function riyadhNow() {
  const now = new Date();
  return new Date(now.getTime() + (now.getTimezoneOffset() + RIYADH_OFFSET * 60) * 60000);
}
const dayKey = (d) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
const slotToUTC = (d, slot) => { const [hh, mm] = slot.split(':').map(Number); return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), hh - RIYADH_OFFSET, mm)); };
const stamp = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

function fmtTime(slot) {
  const [hh, mm] = slot.split(':').map(Number);
  const h12 = ((hh + 11) % 12) + 1;
  const am = hh < 12;
  return getLang() === 'ar' ? h12 + ':' + pad(mm) + ' ' + (am ? 'ص' : 'م') : h12 + ':' + pad(mm) + ' ' + (am ? 'AM' : 'PM');
}
function localTime(d, slot) {
  const utc = slotToUTC(d, slot);
  return new Intl.DateTimeFormat(getLang() === 'ar' ? 'ar-u-nu-latn' : 'en-GB', { hour: 'numeric', minute: '2-digit' }).format(utc);
}
// Busy slots: real ones from Magmafy OS (sheet + team calendar) when it is connected.
// Without it, a deterministic pattern keeps the demo calendar looking lived-in.
let realBusy = null;
const busy = (d, slot) => {
  if (realBusy) return realBusy.has(slotToUTC(d, slot).toISOString());
  if (crmEndpoint()) return false; // connected but not loaded yet: the server re-checks every booking
  return ((d.getDate() * 7 + SLOTS.indexOf(slot) * 3 + d.getMonth()) % 9) === 0;
};

export function bookingPage() {
  const b = t('booking') || {};
  const months = arr(b.months), dayNames = arr(b.dayNames), weekdays = arr(b.weekdays);
  const types = arr(b.types);
  const params = new URLSearchParams(location.search);
  const today = riyadhNow();
  today.setHours(0, 0, 0, 0);
  const last = new Date(today); last.setDate(last.getDate() + DAYS_AHEAD);

  const st = {
    type: types.some((x) => x.id === params.get('topic')) ? params.get('topic') : (types[0] && types[0].id),
    platform: 'meet', day: null, slot: null, view: new Date(today.getFullYear(), today.getMonth(), 1)
  };
  const openDay = (d) => d.getDay() !== 5 && d > today && d <= last; // Friday off, from tomorrow on
  const freeSlots = (d) => SLOTS.filter((s) => !busy(d, s));
  // Jump to next month when this one has fewer than three bookable days left.
  {
    let n = 0;
    const end = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    for (let k = today.getDate() + 1; k <= end; k++) if (openDay(new Date(today.getFullYear(), today.getMonth(), k))) n++;
    if (n < 3) st.view = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  }

  /* --- step 1: meeting type --- */
  const typeCards = types.map((x) => {
    const input = h('input', { type: 'radio', name: 'type', value: x.id, checked: x.id === st.type, class: 'bk-type__input' });
    input.addEventListener('change', () => { st.type = x.id; update(); });
    return h('label', { class: 'bk-type' }, input,
      h('span', { class: 'bk-type__icon' }, icon(x.icon || 'consulting', 22)),
      h('span', { class: 'bk-type__body' }, h('b', {}, x.title), h('small', {}, x.text)),
      h('span', { class: 'bk-type__dur' }, icon('clock', 14), x.duration));
  });

  /* --- step 2: calendar --- */
  const calTitle = h('b', { class: 'bk-cal__title', 'aria-live': 'polite' });
  const calGrid = h('div', { class: 'bk-cal__grid', role: 'grid', 'aria-label': b.pickDay });
  const prev = h('button', { type: 'button', class: 'bk-cal__nav', 'aria-label': b.prevMonth }, icon('arrow', 16));
  const next = h('button', { type: 'button', class: 'bk-cal__nav', 'aria-label': b.nextMonth }, icon('arrow', 16));
  prev.classList.add('is-prev');
  prev.addEventListener('click', () => { st.view = new Date(st.view.getFullYear(), st.view.getMonth() - 1, 1); drawCal(); });
  next.addEventListener('click', () => { st.view = new Date(st.view.getFullYear(), st.view.getMonth() + 1, 1); drawCal(); });

  function drawCal() {
    const y = st.view.getFullYear(), m = st.view.getMonth();
    calTitle.textContent = months[m] + ' ' + y;
    prev.disabled = y === today.getFullYear() && m <= today.getMonth();
    next.disabled = new Date(y, m + 1, 1) > last;
    const first = new Date(y, m, 1).getDay();
    const days = new Date(y, m + 1, 0).getDate();
    const cells = weekdays.map((w, i) => h('span', { class: 'bk-cal__wd' + (i === 5 ? ' is-off' : ''), role: 'columnheader' }, w));
    for (let i = 0; i < first; i++) cells.push(h('span', { class: 'bk-cal__pad', 'aria-hidden': 'true' }));
    for (let k = 1; k <= days; k++) {
      const d = new Date(y, m, k);
      const ok = openDay(d) && freeSlots(d).length > 0;
      const label = dayNames[d.getDay()] + ' ' + k + ' ' + months[m] + (ok ? '' : ' — ' + (d.getDay() === 5 ? b.friday : b.unavailable));
      const btn = h('button', { type: 'button', class: 'bk-cal__day' + (d.getDay() === 5 ? ' is-fri' : ''), disabled: !ok, 'aria-label': label, 'aria-pressed': String(!!st.day && dayKey(st.day) === dayKey(d)) }, String(k));
      if (dayKey(d) === dayKey(today)) btn.classList.add('is-today');
      btn.addEventListener('click', () => { st.day = d; st.slot = null; drawCal(); drawTimes(); update(); times.querySelector('button:not([disabled])')?.focus({ preventScroll: true }); });
      cells.push(btn);
    }
    calGrid.replaceChildren(...cells);
  }

  /* --- step 3: time + platform --- */
  const timesTitle = h('p', { class: 'bk-times__title' });
  const times = h('div', { class: 'bk-times', role: 'radiogroup', 'aria-label': b.pickTime });
  const localNote = h('p', { class: 'bk-note' });
  const differs = new Date().getTimezoneOffset() !== -RIYADH_OFFSET * 60;
  function drawTimes() {
    if (!st.day) {
      timesTitle.textContent = b.pickDayFirst;
      times.replaceChildren(...SLOTS.slice(0, 8).map(() => h('span', { class: 'bk-time is-ghost', 'aria-hidden': 'true' })));
      localNote.textContent = '';
      return;
    }
    timesTitle.textContent = b.timesFor + ' ' + dayNames[st.day.getDay()] + ' ' + st.day.getDate() + ' ' + months[st.day.getMonth()];
    times.replaceChildren(...SLOTS.map((s) => {
      const taken = busy(st.day, s);
      const btn = h('button', { type: 'button', role: 'radio', class: 'bk-time', disabled: taken, 'aria-checked': String(st.slot === s), 'aria-label': fmtTime(s) + (taken ? ' — ' + b.taken : '') }, h('span', { dir: 'ltr' }, fmtTime(s)));
      btn.addEventListener('click', () => { st.slot = s; drawTimes(); update(); });
      return btn;
    }));
    localNote.textContent = differs && st.slot ? b.yourTime + ': ' + localTime(st.day, st.slot) : '';
  }
  const platforms = [['meet', 'Google Meet'], ['zoom', 'Zoom']].map(([id, name]) => {
    const input = h('input', { type: 'radio', name: 'platform', value: id, checked: id === st.platform });
    input.addEventListener('change', () => { st.platform = id; update(); });
    return h('label', { class: 'bk-platform' }, input, h('span', { class: 'bk-platform__logo bk-platform__logo--' + id, 'aria-hidden': 'true' }, icon('video', 18)), h('b', {}, name));
  });

  /* --- step 4: details --- */
  const field = (id, label, input, hint) => h('div', { class: 'field' },
    h('label', { for: 'bk-' + id }, label), input,
    hint ? h('p', { class: 'field__hint' }, hint) : null,
    h('p', { class: 'field__error', id: 'bk-' + id + '-err', 'aria-live': 'polite' }));
  const input = (id, type, auto, req = true, extra = {}) => h('input', { id: 'bk-' + id, name: id, type, maxlength: String(LIMITS[id]), autocomplete: auto, required: req, 'aria-describedby': 'bk-' + id + '-err', ...extra });
  const notes = h('textarea', { id: 'bk-notes', name: 'notes', rows: '4', maxlength: String(LIMITS.notes), 'aria-describedby': 'bk-notes-err' });
  const consent = h('input', { id: 'bk-consent', name: 'consent', type: 'checkbox', required: true, 'aria-describedby': 'bk-consent-err' });

  const summary = h('div', { class: 'bk-summary', 'aria-live': 'polite' });
  const status = h('p', { class: 'form__status', role: 'status' });
  const submit = h('button', { type: 'submit', class: 'btn btn--primary btn--block' }, h('span', { class: 'btn__label' }, b.confirm), icon('arrow', 18));
  const stepEls = arr(b.steps).map((s, i) => h('li', { class: 'bk-steps__item' }, h('i', {}, String(i + 1)), h('span', {}, s)));

  const form = h('form', { class: 'bk-form', 'data-clarity-mask': 'True', novalidate: true },
    h('ol', { class: 'bk-steps', 'aria-hidden': 'true' }, ...stepEls),
    h('fieldset', { class: 'bk-block' },
      h('legend', {}, h('i', {}, '1'), b.typeHead),
      h('div', { class: 'bk-types' }, ...typeCards)),
    h('fieldset', { class: 'bk-block bk-block--when' },
      h('legend', {}, h('i', {}, '2'), b.whenHead),
      h('div', { class: 'bk-when' },
        h('div', { class: 'bk-cal' },
          h('div', { class: 'bk-cal__head' }, prev, calTitle, next),
          calGrid,
          h('p', { class: 'bk-note' }, icon('clock', 14), b.tzNote)),
        h('div', { class: 'bk-side' },
          timesTitle, times, localNote,
          h('p', { class: 'bk-label' }, b.platformHead),
          h('div', { class: 'bk-platforms' }, ...platforms)))),
    h('fieldset', { class: 'bk-block' },
      h('legend', {}, h('i', {}, '3'), b.detailsHead),
      h('div', { class: 'form__row' },
        field('name', b.fields.name, input('name', 'text', 'name')),
        field('email', b.fields.email, input('email', 'email', 'email'))),
      h('div', { class: 'form__row' },
        field('phone', b.fields.phone, input('phone', 'tel', 'tel', true, { dir: 'ltr', inputmode: 'tel', placeholder: '+966 5X XXX XXXX' })),
        field('business', b.fields.business, input('business', 'text', 'organization'))),
      field('link', b.fields.link, input('link', 'text', 'url', false, { dir: 'ltr', placeholder: 'instagram.com/… · www…' })),
      field('notes', b.fields.notes, notes),
      h('div', { class: 'field field--check' },
        consent,
        h('label', { for: 'bk-consent' }, b.consentBefore, ' ', h('a', { href: 'privacy.html', target: '_blank' }, b.consentLink), ' ', b.consentAfter),
        h('p', { class: 'field__error', id: 'bk-consent-err', 'aria-live': 'polite' }))),
    h('div', { class: 'hp', 'aria-hidden': 'true' }, h('label', { for: 'bk-website' }, 'Website'), h('input', { id: 'bk-website', name: 'website', type: 'text', tabindex: '-1', autocomplete: 'off' })),
    summary, submit, status,
    h('p', { class: 'form__note' }, b.note));

  const done = h('div', { class: 'bk-done', hidden: true, tabindex: '-1' });

  function typeTitle() { return (types.find((x) => x.id === st.type) || {}).title || ''; }
  function whenText() { return st.day && st.slot ? dayNames[st.day.getDay()] + ' ' + st.day.getDate() + ' ' + months[st.day.getMonth()] + ' ' + st.day.getFullYear() + ' · ' + fmtTime(st.slot) + ' ' + b.ksa : ''; }
  function update() {
    const ok = [!!st.type, !!st.day, !!st.slot, true];
    let cur = ok.indexOf(false); if (cur < 0) cur = 3;
    stepEls.forEach((el, i) => { el.classList.toggle('is-done', i < cur); el.classList.toggle('is-on', i === cur); });
    localNote.textContent = differs && st.day && st.slot ? b.yourTime + ': ' + localTime(st.day, st.slot) : '';
    summary.replaceChildren(
      h('span', { class: 'bk-summary__icon' }, icon('calendar', 18)),
      h('div', {},
        h('small', {}, b.summary),
        h('b', {}, typeTitle()),
        h('span', {}, whenText() || b.noSlotYet, whenText() ? ' · ' + (st.platform === 'zoom' ? 'Zoom' : 'Google Meet') : '')));
  }

  let lastSent = 0;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    const errors = {};
    for (const k of ['name', 'email', 'phone', 'business', 'link', 'notes']) {
      data[k] = clean(data[k]);
      if (['name', 'email', 'phone', 'business'].includes(k) && !data[k]) errors[k] = b.errors.required;
      else if (data[k].length > LIMITS[k]) errors[k] = b.errors.length;
    }
    if (!errors.email && !EMAIL_RE.test(data.email)) errors.email = b.errors.email;
    if (!errors.phone && !PHONE_RE.test(data.phone)) errors.phone = b.errors.phone;
    if (!consent.checked) errors.consent = b.errors.consent;
    for (const k of ['name', 'email', 'phone', 'business', 'consent']) {
      form.querySelector('#bk-' + k + '-err').textContent = errors[k] || '';
      form.querySelector('#bk-' + k).setAttribute('aria-invalid', errors[k] ? 'true' : 'false');
    }
    if (!st.day || !st.slot) {
      status.textContent = b.errors.slot;
      (st.day ? times : calGrid).querySelector('button:not([disabled])')?.focus();
      return;
    }
    const first = Object.keys(errors)[0];
    if (first) { status.textContent = ''; form.querySelector('#bk-' + first).focus(); return; }
    if (data.website) return; // bot filled the honeypot
    if (Date.now() - lastSent < 30000) return;

    const brand = settings.brand || 'Magmafy';
    const platform = st.platform === 'zoom' ? 'Zoom' : 'Google Meet';
    const when = whenText();
    const start = slotToUTC(st.day, st.slot), end = new Date(start.getTime() + DURATION * 60000);
    const subject = ('[' + brand + '] ' + b.mailSubject + ': ' + typeTitle() + ' · ' + when).replace(/[\r\n]+/g, ' ');
    const details = [typeTitle(), when, platform, data.name, data.business].join('\n');
    const lines = [
      [b.fields.type, typeTitle()], [b.fields.when, when], [b.fields.platform, platform],
      [b.fields.name, data.name], [b.fields.email, data.email], [b.fields.phone, data.phone],
      [b.fields.business, data.business], [b.fields.link, data.link], [b.fields.notes, data.notes]
    ].filter(([, v]) => v);

    const cfg = settings.form || {};
    const key = clean(cfg.accessKey);
    const endpoint = safeUrl(cfg.endpoint);
    let sent = false;
    let meetLink = '';
    if (crmEndpoint()) {
      submit.disabled = true;
      status.textContent = b.sending;
      const out = await crmPost('booking', {
        name: data.name, email: data.email, phone: data.phone, business: data.business, link: data.link, notes: data.notes,
        topic: st.type, meeting_type: typeTitle(), meeting_platform: platform, meeting_time_riyadh: when,
        meeting_start_utc: start.toISOString(), language: getLang(), utm: getUtm(), referrer: getReferrer(),
        page: location.pathname, readiness: getReadiness(), website: data.website || ''
      });
      submit.disabled = false;
      if (out.ok) {
        sent = true;
        meetLink = /^https:\/\/meet\.google\.com\//.test(str(out.meetLink)) ? out.meetLink : '';
      } else if (out.error === 'slot_taken' || out.error === 'bad_slot') {
        status.textContent = (b.errors && b.errors.slotTaken) || b.errors.slot;
        st.slot = null;
        const fresh = await crmBusySlots();
        if (fresh) realBusy = fresh;
        if (realBusy) realBusy.add(start.toISOString());
        drawCal(); drawTimes(); update();
        times.querySelector('button:not([disabled])')?.focus();
        return;
      }
    }
    if (!sent && key && endpoint.startsWith('https://') && !crmEndpoint()) {
      submit.disabled = true;
      status.textContent = b.sending;
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            access_key: key, subject, from_name: data.name, name: data.name, email: data.email, phone: data.phone,
            business: data.business, link: data.link, meeting_type: typeTitle(), meeting_platform: platform,
            meeting_time_riyadh: when, meeting_start_utc: start.toISOString(), notes: data.notes, language: getLang()
          })
        });
        const out = await res.json().catch(() => ({}));
        if (!res.ok || out.success === false) throw new Error('send failed');
        sent = true;
      } catch (_) {
        sent = false;
      } finally {
        submit.disabled = false;
      }
    }

    const to = clean(settings.bookingEmail || settings.email);
    const mailto = EMAIL_RE.test(to) ? 'mailto:' + encodeURIComponent(to) + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(lines.map(([k, v]) => k + ': ' + v).join('\n')) : '';
    if (!sent && !mailto) { status.textContent = b.errors.noEmail; return; }
    lastSent = Date.now();
    if (sent) track('generate_lead', { meeting_type: st.type, meeting_platform: platform, language: getLang() });

    // Calendar links for the visitor.
    const gcal = 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + encodeURIComponent(brand + ' · ' + typeTitle()) +
      '&dates=' + stamp(start) + '/' + stamp(end) + '&details=' + encodeURIComponent(details) + '&location=' + encodeURIComponent(platform);
    const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Magmafy//Booking//' + getLang().toUpperCase(), 'CALSCALE:GREGORIAN', 'BEGIN:VEVENT',
      'UID:' + Date.now() + '@magmafy', 'DTSTAMP:' + stamp(new Date()), 'DTSTART:' + stamp(start), 'DTEND:' + stamp(end),
      'SUMMARY:' + (brand + ' · ' + typeTitle()).replace(/[,;]/g, ' '), 'DESCRIPTION:' + details.replace(/\n/g, '\\n').replace(/[,;]/g, ' '),
      'LOCATION:' + platform, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    const icsLink = h('a', { class: 'btn btn--ghost', download: 'magmafy-meeting.ics' }, icon('calendar', 18), h('span', { class: 'btn__label' }, b.ics));
    icsLink.setAttribute('href', URL.createObjectURL(new Blob([ics], { type: 'text/calendar' })));
    const again = h('button', { type: 'button', class: 'btn btn--ghost' }, h('span', { class: 'btn__label' }, b.again));
    again.addEventListener('click', () => { done.hidden = true; form.hidden = false; form.reset(); st.day = st.slot = null; drawCal(); drawTimes(); update(); status.textContent = ''; form.scrollIntoView({ block: 'start' }); });

    done.replaceChildren(
      h('span', { class: 'bk-done__ok' }, icon('check', 34)),
      h('h2', {}, sent ? b.doneTitle : b.almostTitle),
      h('p', { class: 'bk-done__when' }, typeTitle(), h('br'), when, ' · ', platform),
      h('p', {}, sent ? b.doneText.replace('{email}', data.email) : b.mailText),
      h('div', { class: 'bk-done__actions' },
        sent ? null : h('a', { class: 'btn btn--primary', href: mailto }, icon('mail', 18), h('span', { class: 'btn__label' }, b.mailCta)),
        meetLink ? h('a', { class: 'btn btn--primary', href: meetLink, target: '_blank', rel: 'noopener noreferrer' }, icon('video', 18), h('span', { class: 'btn__label' }, b.meetLink || 'Google Meet')) : null,
        h('a', { class: 'btn btn--ghost', href: gcal, target: '_blank', rel: 'noopener noreferrer' }, icon('calendar', 18), h('span', { class: 'btn__label' }, b.gcal)),
        icsLink, again));
    form.hidden = true;
    done.hidden = false;
    done.focus({ preventScroll: true });
    done.scrollIntoView({ block: 'center', behavior: 'smooth' });
  });

  drawCal(); drawTimes(); update();
  crmBusySlots().then((set) => {
    if (!set) return;
    realBusy = set;
    if (st.day && st.slot && busy(st.day, st.slot)) st.slot = null;
    drawCal(); drawTimes(); update();
  });

  const info = [
    ['emailLabel', 'mail', settings.email, settings.email ? 'mailto:' + settings.email : ''],
    ['whatsappLabel', 'whatsapp', settings.whatsapp, settings.whatsapp ? 'https://wa.me/' + String(settings.whatsapp).replace(/[^\d]/g, '') : ''],
    ['addressLabel', 'pin', settings.address || t('contact.addressValue'), '']
  ];

  return [
    h('section', { class: 'hero hero--compact', 'aria-labelledby': 'bk-title' },
      h('div', { class: 'container hero__inner' },
        h('p', { class: 'eyebrow hero__eyebrow' }, b.eyebrow),
        h('h1', { class: 'hero__title', id: 'bk-title' }, h('span', { class: 'hero__line' }, ...str(b.title).split(/\s+/).map((w) => h('span', { class: 'word' }, h('span', { class: 'word__inner' }, w))))),
        h('p', { class: 'hero__text' }, b.text),
        h('ul', { class: 'hero__chips' }, ...arr(b.chips).map((c) => h('li', {}, h('b', {}, c.value), h('span', {}, c.label)))))),
    h('section', { class: 'section booking', 'data-shape': 'contact' },
      h('div', { class: 'container booking__grid' },
        h('div', { class: 'booking__main', 'data-reveal': '' }, form, done),
        h('aside', { class: 'booking__aside' },
          h('div', { class: 'bk-card', 'data-reveal': '' },
            h('h2', { class: 'bk-card__title' }, b.nextHead),
            h('ol', { class: 'bk-next' }, ...arr(b.nextSteps).map((s, i) => h('li', {}, h('i', {}, String(i + 1)), h('div', {}, h('b', {}, s.title), h('small', {}, s.text)))))),
          h('ul', { class: 'contact__info', 'data-reveal': '' },
            ...info.map(([label, ic, value, href]) => h('li', { class: 'contact__item' },
              h('span', { class: 'contact__icon' }, icon(ic, 20)),
              h('span', {},
                h('span', { class: 'contact__label' }, t('contact.' + label)),
                value ? (href ? h('a', { href, dir: ic === 'whatsapp' ? 'ltr' : null, target: href.startsWith('http') ? '_blank' : null, rel: href.startsWith('http') ? 'noopener noreferrer' : null }, value) : h('span', {}, value))
                  : h('span', { class: 'muted' }, t('contact.pending'))))),
            h('li', { class: 'contact__item contact__item--social' },
              h('span', { class: 'contact__label' }, t('contact.social')),
              socialLinks('contact__social'))))))
  ];
}

