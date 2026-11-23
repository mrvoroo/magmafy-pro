// Page renderers. Each one builds the <main> content for its data-page value.
import { h, t, str, icon, content, settings, legal, getLang, safeUrl, safeImage, splitWords, SERVICE_KEYS, SERVICE_PAGES } from './core.js';
import { JOURNEY_VIEWS, clientCard, exampleLabel } from './journey.js';
import { stepVisible } from './demos/kit.js';
import { SHOWCASES } from './showcase.js';
import { portfolioStage } from './portfolio.js';
import { bookingPage } from './booking.js';

const arr = (v) => (Array.isArray(v) ? v : []);


function heading({ eyebrow, title, accent, level = 'h2', id }) {
  return h('header', { class: 'section-head', 'data-reveal': '' },
    eyebrow ? h('p', { class: 'eyebrow' }, eyebrow) : null,
    h(level, { class: 'section-title', id },
      title, accent ? ' ' : null, accent ? h('span', { class: 'accent' }, accent) : null));
}

function button(label, href, variant = 'primary', withArrow = true) {
  return h('a', { class: 'btn btn--' + variant, href, 'data-magnetic': '' },
    h('span', { class: 'btn__label' }, label), withArrow ? icon('arrow', 18) : null);
}

/* ---------- Home ---------- */

function hero() {
  return h('section', { class: 'hero', id: 'hero', 'aria-labelledby': 'hero-title' },
    h('div', { class: 'container hero__inner' },
      h('p', { class: 'eyebrow hero__eyebrow' }, t('hero.eyebrow')),
      h('h1', { class: 'hero__title', id: 'hero-title' },
        h('span', { class: 'hero__line' }, ...splitWords(t('hero.title1'))),
        ' ', // the lines are display:block; the space keeps the text readable as one sentence
        h('span', { class: 'hero__line hero__line--accent' }, ...splitWords(t('hero.title2')))),
      h('p', { class: 'hero__text' }, t('hero.text')),
      h('div', { class: 'hero__actions' },
        button(t('hero.cta'), 'booking.html'),
        button(t('hero.cta2'), '#services', 'ghost', false)),
      h('ul', { class: 'hero__chips' }, ...arr(t('hero.chips')).map((c) => h('li', {}, h('b', { dir: 'ltr' }, c.value), h('span', {}, c.label))))),
    h('a', { class: 'scroll-cue', href: '#about' }, h('span', {}, t('hero.scroll')), h('span', { class: 'scroll-cue__line', 'aria-hidden': 'true' })));
}

// First paragraph stays visible; the rest opens with "Read more" (still in the HTML for search engines).
function aboutProse() {
  const [first, ...rest] = arr(t('about.paragraphs'));
  const more = h('div', { class: 'prose__more', id: 'about-more', hidden: true }, ...rest.map((p) => h('p', {}, p)));
  const prose = h('div', { class: 'prose' }, first ? h('p', { 'data-reveal': '' }, first) : null, more);
  if (!rest.length) return prose;
  const readMore = t('about.readMore') || 'اقرأ المزيد', readLess = t('about.readLess') || 'عرض أقل';
  const btn = h('button', { type: 'button', class: 'prose__toggle', 'aria-expanded': 'false', 'aria-controls': 'about-more' }, readMore);
  btn.addEventListener('click', () => {
    const open = btn.getAttribute('aria-expanded') !== 'true';
    btn.setAttribute('aria-expanded', String(open));
    btn.textContent = open ? readLess : readMore;
    more.hidden = !open;
  });
  prose.append(btn);
  return prose;
}

function about() {
  return h('section', { class: 'section about', id: 'about', 'data-shape': 'about' },
    h('div', { class: 'container about__grid' },
      h('div', {},
        heading({ eyebrow: t('about.eyebrow'), title: t('about.title'), accent: t('about.titleAccent') }),
        aboutProse(),
        h('div', { 'data-reveal': '' }, button(t('about.cta'), 'booking.html', 'ghost'))),
      h('ul', { class: 'stats' },
        ...arr(t('about.stats')).map((s) => h('li', { class: 'stat', 'data-reveal': '' },
          h('span', { class: 'stat__value' }, s.value),
          h('span', { class: 'stat__label' }, s.label))))));
}

function serviceCard(key) {
  const s = t('services.' + key) || {};
  return h('li', { class: 'svc-card', 'data-reveal': '', 'data-service': key, 'data-tilt': '' },
    h('a', { class: 'svc-card__link', href: SERVICE_PAGES[key] },
      h('span', { class: 'svc-card__glow', 'aria-hidden': 'true' }),
      h('span', { class: 'svc-card__top' },
        h('span', { class: 'svc-card__icon' }, icon(key, 26)),
        h('span', { class: 'svc-card__num' }, s.num)),
      h('span', { class: 'svc-card__title' }, s.title),
      h('span', { class: 'svc-card__tagline' }, s.tagline),
      key === 'content' && t('servicesIntro.flowPrice') ? h('span', { class: 'svc-card__price' }, t('servicesIntro.flowPrice')) : null,
      h('span', { class: 'svc-card__more' }, t('servicesIntro.more'), icon('arrow', 16))));
}

function services() {
  return h('section', { class: 'section services', id: 'services', 'data-shape': 'services' },
    h('div', { class: 'container' },
      heading({ eyebrow: t('servicesIntro.eyebrow'), title: t('servicesIntro.title') }),
      h('p', { class: 'lead', 'data-reveal': '' }, t('servicesIntro.text')),
      h('ul', { class: 'svc-grid' }, ...SERVICE_KEYS.map(serviceCard))));
}

function journeySection() {
  const j = t('journey') || {};
  // Hidden steps (admin → "رحلة العميل") are skipped; JOURNEY_VIEWS stays keyed by the original index.
  const all = arr(j.steps).map((s, k) => ({ ...s, k })).filter((s) => stepVisible(s.k));
  const steps = all;
  if (!steps.length) return null;
  let active = 0, timer = null, userPicked = false;
  const stage = h('div', { class: 'journey__stage', 'aria-live': 'polite' });
  const btns = steps.map((s, i) => {
    const b = h('button', { type: 'button', class: 'journey__step', role: 'tab', 'aria-selected': String(i === 0), id: 'jt-' + i, 'aria-controls': 'journey-panel' },
      h('span', { class: 'journey__num' }, String(i + 1).padStart(2, '0')),
      h('span', { class: 'journey__label' }, h('b', {}, s.title), h('small', {}, s.tag)),
      h('span', { class: 'journey__bar', 'aria-hidden': 'true' }, h('i')));
    b.addEventListener('click', () => { userPicked = true; stop(); show(i); });
    return b;
  });
  function show(i) {
    active = i;
    btns.forEach((b, k) => { b.setAttribute('aria-selected', String(k === i)); b.classList.toggle('is-done', k < i); });
    const s = steps[i];
    stage.replaceChildren(
      h('span', { class: 'journey__ex' }, exampleLabel()),
      h('div', { class: 'journey__visual' }, JOURNEY_VIEWS[s.k]()),
      h('div', { class: 'journey__copy', id: 'journey-panel', role: 'tabpanel', 'aria-labelledby': 'jt-' + i },
        h('span', { class: 'journey__tag' }, s.tag),
        h('h3', {}, s.title),
        h('p', {}, s.text)));
  }
  const stop = () => { clearInterval(timer); timer = null; root.classList.remove('is-auto'); };
  const start = () => {
    if (userPicked || timer || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    root.classList.add('is-auto');
    timer = setInterval(() => show((active + 1) % steps.length), 9000);
  };
  const root = h('section', { class: 'section journey', id: 'journey', 'data-shape': 'process' },
    h('div', { class: 'container' },
      heading({ eyebrow: j.eyebrow, title: j.title, accent: j.titleAccent }),
      h('div', { 'data-reveal': '' }, clientCard()),
      h('div', { class: 'journey__box', 'data-reveal': '' },
        h('div', { class: 'journey__steps', role: 'tablist' }, ...btns),
        stage),
      null));
  // Any interaction inside the showcase means the visitor is playing: stop auto-advancing.
  ['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach((ev) => stage.addEventListener(ev, () => { userPicked = true; stop(); }, { passive: true }));
  show(0);
  const io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()), { threshold: 0.3 });
  io.observe(root);
  return root;
}

function whySection() {
  const icons = ['target', 'spark', 'layers', 'shield'];
  return h('section', { class: 'section why', id: 'why', 'data-shape': 'why' },
    h('div', { class: 'container' },
      heading({ eyebrow: t('why.eyebrow'), title: t('why.title'), accent: t('why.titleAccent') }),
      h('ul', { class: 'why-grid' },
        ...arr(t('why.items')).map((it, i) => h('li', { class: 'why-card', 'data-reveal': '', 'data-tilt': '' },
          h('span', { class: 'why-card__icon' }, icon(icons[i % icons.length], 24)),
          h('h3', {}, it.title),
          h('p', {}, it.text))))));
}

// Third-party figures, each shown next to its source. Items without a url get the source as text only.
function marketSection() {
  const m = t('market') || {};
  const items = arr(m.items);
  if (!items.length) return null;
  return h('section', { class: 'section market', id: 'market', 'data-shape': 'why' },
    h('div', { class: 'container' },
      heading({ eyebrow: m.eyebrow, title: m.title }),
      h('ul', { class: 'market-grid' },
        ...items.map((it) => {
          const url = /^https:\/\//.test(str(it.url)) ? it.url : '';
          return h('li', { class: 'market-card', 'data-reveal': '' },
            h('span', { class: 'market-card__value', dir: 'ltr' }, it.value),
            h('p', { class: 'market-card__text' }, it.text),
            h('p', { class: 'market-card__source' },
              m.sourceLabel ? m.sourceLabel + ' ' : null,
              url ? h('a', { href: url, target: '_blank', rel: 'noopener noreferrer' }, it.source) : it.source));
        })),
      m.note ? h('p', { class: 'market__note', 'data-reveal': '' }, m.note) : null));
}

function projectCard(p, i) {
  const loc = (p && p[getLang()]) || {};
  const img = safeImage(p.image);
  const url = safeUrl(p.url);
  const live = SHOWCASES[p.demo];
  const cover = live ? live() : img
    ? h('img', { class: 'project__img', src: img, alt: loc.title || '', loading: 'lazy', decoding: 'async', width: '1200', height: '750' })
    : h('div', { class: 'project__placeholder project__placeholder--' + (i % 3), 'aria-hidden': 'true' },
      h('span', {}, str(loc.title).slice(0, 2).toUpperCase() || 'MG'));
  const body = [
    h('div', { class: 'project__frame' },
      h('span', { class: 'project__dots', 'aria-hidden': 'true' }, h('i'), h('i'), h('i')),
      cover),
    h('div', { class: 'project__body' },
      loc.label ? h('span', { class: 'project__label' }, loc.label) : null,
      h('h3', { class: 'project__title' }, loc.title),
      loc.text ? h('p', { class: 'project__text' }, loc.text) : null,
      h('ul', { class: 'tags' }, ...arr(p.tags).map((tag) => h('li', {}, tag))),
      url ? h('span', { class: 'project__visit' }, t('portfolio.visit'), icon('arrow', 16)) : null)
  ];
  return h('li', { class: 'project', 'data-reveal': '', 'data-tilt': '' },
    url ? h('a', { class: 'project__link', href: url, target: url.startsWith('http') ? '_blank' : null, rel: url.startsWith('http') ? 'noopener noreferrer' : null }, ...body)
      : h('div', { class: 'project__link' }, ...body));
}

function portfolioPreview() {
  return h('section', { class: 'section portfolio-preview', id: 'portfolio', 'data-shape': 'portfolio' },
    h('div', { class: 'container' },
      heading({ eyebrow: t('portfolio.eyebrow'), title: t('portfolio.title') }),
      h('ul', { class: 'projects' }, ...arr(content.projects).slice(0, 3).map(projectCard)),
      h('div', { class: 'center', 'data-reveal': '' }, button(t('portfolio.all'), 'portfolio.html', 'ghost'))));
}

function faqSection() {
  const f = t('faq') || {};
  return h('section', { class: 'section faq', id: 'faq', 'data-shape': 'contact' },
    h('div', { class: 'container faq__grid' },
      h('div', {},
        heading({ eyebrow: f.eyebrow, title: f.title, accent: f.titleAccent }),
        h('p', { class: 'lead faq__lead', 'data-reveal': '' }, f.text),
        h('div', { 'data-reveal': '' }, button(f.cta, 'booking.html', 'ghost'))),
      h('div', { class: 'faq__list' },
        ...arr(f.items).map((it, i) => h('details', { class: 'faq__item', 'data-reveal': '', open: i === 0 },
          h('summary', {}, h('span', {}, it.q), h('i', { 'aria-hidden': 'true' })),
          h('p', {}, it.a))))));
}

function ctaBand() {
  return h('section', { class: 'section cta-band', 'data-shape': 'cta' },
    h('div', { class: 'container' },
      h('div', { class: 'cta-band__card', 'data-reveal': '' },
        h('h2', { class: 'section-title' }, t('portfolio.nextTitle')),
        button(t('portfolio.nextCta'), 'booking.html'))));
}

/* ---------- Service pages ---------- */

// Which meeting type the booking page should preselect for each service.
const SERVICE_TOPIC = { research: 'research', websites: 'website', content: 'general', consulting: 'general' };

function servicePage(key) {
  const s = t('services.' + key) || {};
  const idx = SERVICE_KEYS.indexOf(key);
  const nextKey = SERVICE_KEYS[(idx + 1) % SERVICE_KEYS.length];
  const next = t('services.' + nextKey) || {};
  return [
    h('section', { class: 'hero hero--service', 'aria-labelledby': 'svc-title' },
      h('div', { class: 'container hero__inner' },
        h('a', { class: 'back-link', href: 'index.html#services' }, '← ', t('servicePage.back')),
        h('p', { class: 'eyebrow hero__eyebrow' }, s.num + ' — ' + str(s.tagline)),
        h('h1', { class: 'hero__title', id: 'svc-title' }, h('span', { class: 'hero__line hero__line--accent' }, ...splitWords(s.title))),
        h('p', { class: 'hero__text' }, s.intro),
        h('div', { class: 'hero__actions' },
          button(t('servicePage.cta'), 'booking.html?topic=' + (SERVICE_TOPIC[key] || 'general')),
          button(t('servicePage.portfolio'), 'portfolio.html', 'ghost', false)))),
    h('div', { class: 'demos', id: 'demos', 'data-shape': key }),
    h('section', { class: 'section', 'data-shape': key },
      h('div', { class: 'container' },
        heading({ title: t('servicePage.includes') }),
        h('ul', { class: 'feature-grid' },
          ...arr(s.items).map((item, i) => h('li', { class: 'feature', 'data-reveal': '', 'data-tilt': '' },
            h('span', { class: 'feature__num' }, String(i + 1).padStart(2, '0')),
            h('span', { class: 'feature__icon' }, icon('check', 20)),
            h('p', {}, item)))))),
    h('section', { class: 'section next-svc' },
      h('div', { class: 'container' },
        h('a', { class: 'next-svc__link', href: SERVICE_PAGES[nextKey], 'data-reveal': '' },
          h('span', { class: 'eyebrow' }, t('servicePage.next')),
          h('span', { class: 'next-svc__title' }, next.num + ' ', next.title),
          icon('arrow', 36)))),
    ctaBand()
  ];
}

/* ---------- Portfolio ---------- */

function portfolioPage() {
  return [
    h('section', { class: 'hero hero--compact', 'aria-labelledby': 'pf-title' },
      h('div', { class: 'container hero__inner' },
        h('p', { class: 'eyebrow hero__eyebrow' }, t('portfolio.eyebrow')),
        h('h1', { class: 'hero__title', id: 'pf-title' }, h('span', { class: 'hero__line' }, ...splitWords(t('portfolio.title')))),
        h('p', { class: 'hero__text' }, t('portfolio.text')))),
    portfolioStage(),
    ctaBand()
  ];
}

/* ---------- Legal ---------- */

function legalShell(title, ...children) {
  return h('section', { class: 'section legal' },
    h('div', { class: 'container container--narrow' },
      h('h1', { class: 'legal__title' }, title),
      t('legalPages.bindingNote') ? h('p', { class: 'notice' }, t('legalPages.bindingNote')) : null,
      ...children));
}

function sections(list) {
  return arr(list).map((s) => h('section', { class: 'legal__block' },
    h('h2', {}, s.h), ...arr(s.p).map((p) => h('p', {}, p))));
}

// Company details block (Saudi e-commerce rules: trade name, CR number, contact).
function companyBlock() {
  const L = (k) => str(legal[k]).trim();
  const rows = [
    ['company', L('company')], ['crNumber', L('crNumber')],
    ['address', [L('street'), L('city'), L('country')].filter(Boolean).join('، ')],
    ['email', L('email')], ['phone', L('phone')]
  ].filter(([, v]) => v);
  const complete = L('company') && L('crNumber') && L('email');
  return h('section', { class: 'legal__block legal__company' },
    h('h2', {}, t('legalPages.companyHead')),
    complete ? null : h('p', { class: 'notice' }, t('legalPages.pendingNote')),
    h('dl', { class: 'legal__dl' }, ...rows.flatMap(([k, v]) => [
      h('dt', {}, t('legalPages.fields.' + k)),
      h('dd', {}, k === 'email' ? h('a', { href: 'mailto:' + v }, v) : k === 'phone' ? h('a', { href: 'tel:' + v.replace(/[^\d+]/g, ''), dir: 'ltr' }, v) : v)])));
}

function termsPage() {
  return legalShell(t('legalPages.termsTitle'),
    h('p', { class: 'legal__lead' }, t('legalPages.termsLead')),
    companyBlock(),
    ...sections(t('terms')),
    h('p', { class: 'muted' }, t('legalPages.updated') + ': ' + str(content.meta && content.meta.updated)));
}

function privacyPage() {
  return legalShell(t('legalPages.privacyTitle'),
    ...sections(t('privacy')),
    legal.hosting ? h('p', { class: 'muted' }, t('legalPages.hosting') + ': ' + legal.hosting) : null,
    h('p', { class: 'muted' }, t('legalPages.updated') + ': ' + str(content.meta && content.meta.updated)));
}

function accessibilityPage() {
  return legalShell(t('legalPages.accessibilityTitle'), ...sections(t('accessibility')));
}

function notFoundPage() {
  return h('section', { class: 'hero hero--compact' },
    h('div', { class: 'container hero__inner' },
      h('p', { class: 'eyebrow' }, '404'),
      h('h1', { class: 'hero__title' }, h('span', { class: 'hero__line' }, t('notFound.title'))),
      h('p', { class: 'hero__text' }, t('notFound.text')),
      h('div', { class: 'hero__actions' }, button(t('notFound.cta'), 'index.html'))));
}

const TITLES = {
  home: () => (settings.brand || 'Magmafy') + ' — ' + t('meta.homeTitle'),
  portfolio: () => t('nav.portfolio'),
  contact: () => t('nav.contact'),
  terms: () => t('legalPages.termsTitle'),
  privacy: () => t('legalPages.privacyTitle'),
  accessibility: () => t('legalPages.accessibilityTitle'),
  notfound: () => t('notFound.title')
};

export function pageTitle(page) {
  const brand = (settings.brand || 'Magmafy') + (settings.brandSuffix ? ' ' + settings.brandSuffix : '');
  if (page === 'home') return TITLES.home();
  const name = SERVICE_KEYS.includes(page) ? t('services.' + page + '.title') : (TITLES[page] || (() => ''))();
  return name + ' — ' + brand;
}

export function renderPage(page) {
  switch (page) {
    case 'home': return [hero(), about(), services(), journeySection(), whySection(), marketSection(), portfolioPreview(), faqSection(), ctaBand()];
    case 'portfolio': return portfolioPage();
    case 'contact': return bookingPage();
    case 'terms': return termsPage();
    case 'privacy': return privacyPage();
    case 'accessibility': return accessibilityPage();
    case 'notfound': return notFoundPage();
    default: return SERVICE_KEYS.includes(page) ? servicePage(page) : notFoundPage();
  }
}
