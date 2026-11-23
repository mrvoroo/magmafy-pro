// Booking page: a 3-step "problem first" wizard.
//   1. Your problem   (pick one or more pain points; we choose the service, not the visitor)
//   2. Your showroom  (branches, average piece price, ads tried before)
//   3. Contact        (name, showroom/brand, optional link, note and best time)
// A side panel builds a preliminary plan from the answers as they come in. Old links with ?topic=… simply land on step 1.
import { h, t, str, icon, settings, getLang, splitWords } from './core.js';
import { socialLinks } from './layout.js';

const arr = (v) => (Array.isArray(v) ? v : []);
const LIMITS = { name: 50, business: 60, link: 200, note: 300, time: 80 };
const clean = (v) => str(v).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').replace(/\s+/g, ' ').trim();
const fill = (s, vars) => str(s).replace(/\{(\w+)\}/g, (_, k) => (k in vars ? vars[k] : ''));

export function bookingPage() {
  const b = t('booking') || {};
  const f = b.fields || {};
  const err = b.errors || {};
  const problems = arr(b.problems), branches = arr(b.branches), tickets = arr(b.tickets), tried = arr(b.tried);
  const stepNames = arr(b.steps);
  const TOTAL = 3;
  const st = { step: 0, problems: [], branches: '', ticket: '', tried: '' };
  const byId = (list, id) => list.find((x) => x.id === id) || null;

  /* ---------- option cards (native inputs, so keyboard and screen readers just work) ---------- */
  function option(name, type, item, onChange) {
    const input = h('input', { type, name, value: item.id, class: 'bk-opt__input' });
    input.addEventListener('change', () => { onChange(input); render(); });
    return h('label', { class: 'bk-opt' + (type === 'radio' ? ' bk-opt--radio' : '') }, input,
      h('span', { class: 'bk-opt__mark', 'aria-hidden': 'true' }),
      h('span', { class: 'bk-opt__title' }, item.title || item.label),
      item.sub ? h('span', { class: 'bk-opt__sub' }, item.sub) : null);
  }
  const group = (legend, hint, cards, extra = '') => h('fieldset', { class: 'bk-group' + extra },
    h('legend', { class: 'bk-group__legend' }, legend),
    hint ? h('p', { class: 'bk-group__hint' }, hint) : null,
    h('div', { class: 'bk-opts' }, ...cards));

  const problemCards = problems.map((p) => option('problems', 'checkbox', p, (i) => {
    st.problems = i.checked ? [...st.problems, p.id] : st.problems.filter((x) => x !== p.id);
  }));
  const radios = (name, list, key) => list.map((x) => option(name, 'radio', x, () => { st[key] = x.id; }));

  /* ---------- step 3 fields ---------- */
  const field = (id, label, control, counter) => h('div', { class: 'field' },
    h('label', { for: 'bk-' + id }, label), control,
    counter || null,
    h('p', { class: 'field__error', id: 'bk-' + id + '-err', 'aria-live': 'polite' }));
  const input = (id, auto, required, extra = {}) => h('input', {
    id: 'bk-' + id, name: id, type: 'text', maxlength: String(LIMITS[id]), autocomplete: auto,
    required, 'aria-describedby': 'bk-' + id + '-err', ...extra
  });
  const note = h('textarea', { id: 'bk-note', name: 'note', rows: '3', maxlength: String(LIMITS.note), placeholder: f.notePlaceholder || '', 'aria-describedby': 'bk-note-err bk-note-count' });
  const noteCount = h('p', { class: 'field__hint bk-count', id: 'bk-note-count', 'aria-live': 'off' });
  const syncCount = () => { noteCount.replaceChildren(h('span', { dir: 'ltr' }, note.value.length + ' / ' + LIMITS.note)); };
  note.addEventListener('input', syncCount);
  syncCount();

  /* ---------- the three panes ---------- */
  const heads = [b.problemsHead, b.branchesHead, b.contactHead].map((txt, i) =>
    h('h2', { class: 'bk-pane__title', id: 'bk-step-' + (i + 1), tabindex: '-1' }, h('i', { 'aria-hidden': 'true' }, String(i + 1)), h('span', {}, txt)));
  const panes = [
    h('div', { class: 'bk-pane', role: 'group', 'aria-labelledby': 'bk-step-1' }, heads[0],
      group(b.problemsHead, b.problemsHint, problemCards, ' bk-group--bare')),
    h('div', { class: 'bk-pane', role: 'group', 'aria-labelledby': 'bk-step-2', hidden: true }, heads[1],
      group(b.branchesHead, b.branchesHint, radios('branches', branches, 'branches'), ' bk-group--bare'),
      group(b.ticketHead, b.ticketHint, radios('ticket', tickets, 'ticket')),
      tried.length ? group(b.triedHead, '', radios('tried', tried, 'tried')) : null),
    h('div', { class: 'bk-pane', role: 'group', 'aria-labelledby': 'bk-step-3', hidden: true }, heads[2],
      b.contactHint ? h('p', { class: 'bk-group__hint' }, b.contactHint) : null,
      h('div', { class: 'form__row' },
        field('name', f.name, input('name', 'name', true)),
        field('business', f.business, input('business', 'organization', true))),
      field('link', f.link, input('link', 'url', false, { dir: 'ltr', inputmode: 'url', placeholder: 'instagram.com/… · www…' })),
      field('note', f.note, note, noteCount),
      field('time', f.time, input('time', 'off', false, { placeholder: f.timePlaceholder || '' })),
      h('p', { class: 'bk-consent' }, b.consentBefore, ' ', h('a', { href: 'privacy.html', target: '_blank' }, b.consentLink), ' ', b.consentAfter))
  ];
  // The legend repeats the step title for screen readers; the visible title is the h2.
  panes[0].querySelector('legend').classList.add('sr-only');
  panes[1].querySelector('legend').classList.add('sr-only');

  /* ---------- progress, navigation ---------- */
  const chips = stepNames.map((s, i) => h('li', { class: 'bk-chip' }, h('i', {}, String(i + 1)), h('span', {}, s)));
  const counter = h('p', { class: 'bk-progress__label' });
  const bar = h('span', { class: 'bk-progress__bar' });
  const progress = h('div', { class: 'bk-progress', role: 'progressbar', 'aria-valuemin': '1', 'aria-valuemax': String(TOTAL) }, bar);
  const status = h('p', { class: 'form__status bk-status', role: 'status' });
  const back = h('button', { type: 'button', class: 'btn btn--ghost' }, h('span', { class: 'btn__label' }, b.back));
  const next = h('button', { type: 'submit', class: 'btn btn--primary' }, h('span', { class: 'btn__label' }, b.next), icon('arrow', 18));
  const finish = h('button', { type: 'submit', class: 'btn btn--primary bk-finish' }, icon('whatsapp', 18), h('span', { class: 'btn__label' }, b.finish));
  const restart = h('button', { type: 'button', class: 'btn btn--ghost btn--sm bk-restart' }, h('span', { class: 'btn__label' }, b.restart));

  const form = h('form', { class: 'bk-form', 'data-clarity-mask': 'True', novalidate: true },
    h('div', { class: 'bk-head' }, h('ol', { class: 'bk-chips' }, ...chips), counter, progress),
    ...panes,
    h('div', { class: 'hp', 'aria-hidden': 'true' }, h('label', { for: 'bk-website' }, 'Website'), h('input', { id: 'bk-website', name: 'website', type: 'text', tabindex: '-1', autocomplete: 'off' })),
    status,
    h('div', { class: 'bk-nav' }, back, next, finish, restart),
    h('p', { class: 'form__note' }, b.note));
  const done = h('div', { class: 'bk-done', hidden: true, tabindex: '-1' });

  /* ---------- live plan panel ---------- */
  const planBody = h('div', { class: 'bk-plan__body' });
  const plan = h('aside', { class: 'bk-plan', 'aria-labelledby': 'bk-plan-title' },
    h('h2', { class: 'bk-plan__title', id: 'bk-plan-title' }, icon('spark', 18), h('span', {}, b.planTitle)),
    h('p', { class: 'bk-plan__note' }, b.planNote),
    planBody);
  const block = (title, items, ordered) => h('div', { class: 'bk-plan__block' }, h('h3', {}, title),
    h(ordered ? 'ol' : 'ul', { class: ordered ? 'bk-plan__next' : '' }, ...items));
  function drawPlan() {
    const help = problems.filter((p) => st.problems.includes(p.id)).flatMap((p) => arr(p.help));
    const fit = [byId(branches, st.branches), byId(tickets, st.ticket), byId(tried, st.tried)].filter((x) => x && x.plan).map((x) => x.plan);
    if (!help.length && !fit.length) { planBody.replaceChildren(h('p', { class: 'bk-plan__empty' }, b.planEmpty)); return; }
    planBody.replaceChildren(...[
      help.length ? block(b.planDo, help.map((x) => h('li', {}, x))) : null,
      fit.length ? block(b.planFit, fit.map((x) => h('li', {}, x))) : null,
      block(b.planNext, arr(b.nextSteps).map((s) => h('li', {}, h('b', {}, s.title), h('small', {}, s.text))), true)
    ].filter(Boolean));
  }

  /* ---------- render & step logic ---------- */
  function render() {
    panes.forEach((p, i) => { p.hidden = i !== st.step; });
    chips.forEach((c, i) => {
      c.classList.toggle('is-done', i < st.step);
      c.classList.toggle('is-on', i === st.step);
      if (i === st.step) c.setAttribute('aria-current', 'step'); else c.removeAttribute('aria-current');
    });
    counter.textContent = fill(b.stepOf, { n: st.step + 1, total: TOTAL });
    progress.setAttribute('aria-valuenow', String(st.step + 1));
    progress.setAttribute('aria-valuetext', counter.textContent);
    bar.style.setProperty('--p', String((st.step + 1) / TOTAL));
    back.hidden = st.step === 0;
    next.hidden = st.step === TOTAL - 1;
    finish.hidden = st.step !== TOTAL - 1;
    restart.hidden = st.step === 0 && !st.problems.length;
    drawPlan();
  }
  function go(to) {
    st.step = Math.max(0, Math.min(TOTAL - 1, to));
    status.textContent = '';
    render();
    heads[st.step].focus({ preventScroll: true });
    const top = form.getBoundingClientRect().top;
    if (top < 0) form.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }
  back.addEventListener('click', () => go(st.step - 1));
  restart.addEventListener('click', reset);

  function stepError() {
    if (st.step === 0 && !st.problems.length) return [err.problems, panes[0].querySelector('input')];
    if (st.step === 1 && (!st.branches || !st.ticket)) return [err.showroom, panes[1].querySelector(st.branches ? 'input[name="ticket"]' : 'input[name="branches"]')];
    return null;
  }

  function readContact() {
    const data = {};
    const errors = {};
    for (const k of ['name', 'business', 'link', 'note', 'time']) {
      data[k] = clean(form.querySelector('#bk-' + k).value);
      if ((k === 'name' || k === 'business') && !data[k]) errors[k] = err.required;
      else if (data[k].length > LIMITS[k]) errors[k] = err.length;
      form.querySelector('#bk-' + k + '-err').textContent = errors[k] || '';
      form.querySelector('#bk-' + k).setAttribute('aria-invalid', errors[k] ? 'true' : 'false');
    }
    return { data, first: Object.keys(errors)[0] };
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const bad = stepError();
    if (bad) { status.textContent = bad[0]; bad[1]?.focus(); return; }
    if (st.step < TOTAL - 1) { go(st.step + 1); return; }

    const { first } = readContact();
    if (first) { status.textContent = ''; form.querySelector('#bk-' + first).focus(); return; }
    if (form.querySelector('#bk-website').value) return; // a bot filled the honeypot
    status.textContent = '';
  });

  function reset() {
    form.reset();
    Object.assign(st, { step: 0, problems: [], branches: '', ticket: '', tried: '' });
    form.querySelectorAll('.field__error').forEach((p) => { p.textContent = ''; });
    form.querySelectorAll('[aria-invalid]').forEach((x) => x.setAttribute('aria-invalid', 'false'));
    syncCount();
    done.hidden = true;
    form.hidden = false;
    go(0);
  }

  render();

  const info = [
    ['emailLabel', 'mail', settings.email, settings.email ? 'mailto:' + settings.email : ''],
    ['whatsappLabel', 'whatsapp', settings.whatsapp, settings.whatsapp ? 'https://wa.me/' + String(settings.whatsapp).replace(/[^\d]/g, '') : ''],
    ['addressLabel', 'pin', settings.address || t('contact.addressValue'), '']
  ];

  return [
    h('section', { class: 'hero hero--compact', 'aria-labelledby': 'bk-title' },
      h('div', { class: 'container hero__inner' },
        h('p', { class: 'eyebrow hero__eyebrow' }, b.eyebrow),
        h('h1', { class: 'hero__title', id: 'bk-title' }, h('span', { class: 'hero__line' }, ...splitWords(b.title))),
        h('p', { class: 'hero__text' }, b.text),
        b.price ? h('p', { class: 'hero__price' }, b.price) : null,
        h('ul', { class: 'hero__chips' }, ...arr(b.chips).map((c) => h('li', {}, h('b', {}, c.value), h('span', {}, c.label)))))),
    h('section', { class: 'section booking', 'data-shape': 'contact' },
      h('div', { class: 'container' },
        h('div', { class: 'bk-shell' },
          h('div', { class: 'booking__main', 'data-reveal': '' }, form, done),
          plan),
        h('ul', { class: 'contact__info bk-contact', 'data-reveal': '' },
          ...info.map(([label, ic, value, href]) => h('li', { class: 'contact__item' },
            h('span', { class: 'contact__icon' }, icon(ic, 20)),
            h('span', {},
              h('span', { class: 'contact__label' }, t('contact.' + label)),
              value ? (href ? h('a', { href, dir: ic === 'whatsapp' ? 'ltr' : null, target: href.startsWith('http') ? '_blank' : null, rel: href.startsWith('http') ? 'noopener noreferrer' : null }, value) : h('span', {}, value))
                : h('span', { class: 'muted' }, t('contact.pending'))))),
          h('li', { class: 'contact__item contact__item--social' },
            h('span', { class: 'contact__label' }, t('contact.social')),
            socialLinks('contact__social')))))
  ];
}
