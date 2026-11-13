// Entry point: renders the page for <body data-page>, wires up motion and the 3D backdrop.
import { getLang, setLang, isRTL, reducedMotion, SERVICE_KEYS, urlLang, langUrl } from './core.js';
import { renderHeader, renderFooter } from './layout.js';
import { renderPage, pageTitle } from './pages.js';
import { createWorld } from './world.js';
import { showBanner, refreshBanner } from './consent.js';
import { captureUtm } from './crm.js';
import { initAnalytics } from './analytics.js';

// A returning English visitor on an Arabic address (or ?lang=en) is sent to the matching address.
if (getLang() !== urlLang()) location.replace(langUrl(getLang()));

captureUtm();
initAnalytics();

const page = document.body.dataset.page || 'home';
const reduced = reducedMotion();
const gsap = window.gsap;
const ScrollTrigger = window.ScrollTrigger;
const desktop = () => window.matchMedia('(min-width: 900px)').matches;
let world = null;

function render() {
  document.documentElement.lang = getLang();
  document.documentElement.dir = isRTL() ? 'rtl' : 'ltr';
  document.title = pageTitle(page);
  renderHeader(page, (l) => {
    setLang(l);
    if (l !== urlLang()) { location.assign(langUrl(l)); return; }
    rerender();
  });
  const main = document.getElementById('main');
  main.replaceChildren(...[renderPage(page)].flat());
  renderFooter();
}

async function mountDemos() {
  const slot = document.getElementById('demos');
  if (!slot || !SERVICE_KEYS.includes(page)) return;
  try {
    const mod = await import('./demos/' + page + '.js');
    mod.mount(slot);
  } catch (err) {
    console.error(err);
  }
}

async function rerender() {
  ScrollTrigger?.getAll().forEach((st) => st.kill());
  render();
  refreshBanner();
  await mountDemos();
  initInteractions();
  initMotion();
  ScrollTrigger?.refresh();
}

/* ---------- 3D scene choreography ---------- */

function sceneFor(name) {
  const d = desktop();
  // The hero shape sits beside the copy: on the left in Arabic (RTL), on the right in English.
  const side = d ? (isRTL() ? -2.6 : 2.6) : 0;
  const flip = isRTL() ? -1 : 1;
  const table = {
    hero: { shape: page === 'home' ? 'volcano' : (SERVICE_KEYS.includes(page) ? page : page === 'contact' ? 'ring' : 'galaxy'), x: side, y: d ? -0.1 : 1.4, scale: d ? 1 : 0.78, opacity: d ? 0.95 : 0.5 },
    about: { shape: 'galaxy', x: d ? 2.8 * flip : 0, y: 0, scale: 1, opacity: 0.55 },
    services: { shape: 'volcano', x: 0, y: 0, scale: 1.3, opacity: 0.28 },
    process: { shape: 'ring', x: d ? -3 * flip : 0, y: 0, scale: 1, opacity: 0.45 },
    why: { shape: 'consulting', x: d ? 3 * flip : 0, y: 0, scale: 1, opacity: 0.45 },
    portfolio: { shape: 'galaxy', x: 0, y: 0, scale: 1.2, opacity: 0.3 },
    contact: { shape: 'ring', x: d ? -3.2 * flip : 0, y: 0, scale: 0.9, opacity: 0.4 },
    cta: { shape: 'volcano', x: 0, y: 0, scale: 0.75, opacity: 0.7 },
    legal: { shape: 'core', x: d ? 3.6 * flip : 0, y: 0, scale: 0.8, opacity: 0.18 }
  };
  if (SERVICE_KEYS.includes(name)) return { shape: name, x: 0, y: 0, scale: 1.25, opacity: 0.3 };
  return table[name] || table.legal;
}

// Components can steer the backdrop directly (e.g. the portfolio wave).
window.addEventListener('mg:scene', (e) => { if (world && e.detail) world.morph(e.detail.shape, e.detail); });

// Home hero: click / tap anywhere that is not a control and the particles
// burst ("boom") and re-form as the next shape.
const PLAY_SHAPES = ['websites', 'research', 'globe', 'galaxy', 'saturn', 'volcano'];
const TAP_HINT = { ar: '✦ اضغط على البركان وشوف التحوّل', en: '✦ Click the volcano – watch it transform' };
let playIndex = -1;
document.addEventListener('click', (e) => {
  if (page !== 'home' || !world) return;
  const hero = e.target.closest('.hero');
  if (!hero || e.target.closest('a, button, input, select, textarea, label')) return;
  playIndex = (playIndex + 1) % PLAY_SHAPES.length;
  world.burst();
  world.morph(PLAY_SHAPES[playIndex], sceneFor('hero'));
  hero.querySelector('.hero-tap')?.classList.add('is-used');
});
function addTapHint() {
  const hero = document.querySelector('.hero');
  if (page !== 'home' || !hero || reduced) return;
  const lang = document.documentElement.lang || 'ar';
  const hint = document.createElement('span');
  hint.className = 'hero-tap';
  hint.setAttribute('aria-hidden', 'true');
  hint.textContent = TAP_HINT[lang] || TAP_HINT.ar;
  hero.append(hint);
}

function applyScene(name) {
  if (!world) return;
  const s = sceneFor(name);
  world.morph(s.shape, s);
}

/* ---------- Motion ---------- */

function initMotion() {
  addTapHint();
  const hero = document.querySelector('.hero');
  if (hero) hero.dataset.shape = page.match(/terms|privacy|accessibility|notfound/) ? 'legal' : 'hero';
  applyScene(hero ? hero.dataset.shape : 'legal');

  if (!gsap || !ScrollTrigger || reduced) return;
  gsap.registerPlugin(ScrollTrigger);

  document.querySelectorAll('[data-shape]').forEach((el) => {
    ScrollTrigger.create({
      trigger: el, start: 'top 55%', end: 'bottom 55%',
      onToggle: (self) => self.isActive && applyScene(el.dataset.shape)
    });
  });

  const words = gsap.utils.toArray('.hero .word__inner');
  if (words.length) {
    gsap.from(words, { yPercent: 115, rotate: 4, duration: 1.1, ease: 'expo.out', stagger: 0.06, delay: 0.15 });
    gsap.from('.hero__eyebrow, .hero__text, .hero__actions, .back-link, .scroll-cue', {
      y: 24, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: 0.08, delay: 0.45
    });
  }

  document.querySelectorAll('[data-pf-stage]').forEach((el) => el.initScroll?.(ScrollTrigger));

  if (document.querySelector('[data-reveal]')) ScrollTrigger.batch('[data-reveal]', {
    start: 'top 88%',
    once: true,
    onEnter: (els) => gsap.fromTo(els, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out', stagger: 0.08, overwrite: true })
  });
  if (document.querySelector('[data-reveal]')) gsap.set('[data-reveal]', { opacity: 0 });
  ScrollTrigger.refresh();
  // Anything already in view should be shown immediately.
  document.querySelectorAll('[data-reveal]').forEach((el) => {
    if (el.getBoundingClientRect().top < window.innerHeight * 0.88) gsap.to(el, { opacity: 1, y: 0, duration: 0.8, delay: 0.3 });
  });

  const fill = document.querySelector('.timeline__fill');
  if (fill) {
    gsap.fromTo(fill, { scaleY: 0 }, {
      scaleY: 1, ease: 'none',
      scrollTrigger: { trigger: '.timeline', start: 'top 70%', end: 'bottom 60%', scrub: true }
    });
  }

  gsap.utils.toArray('.section-title').forEach((title) => {
    gsap.fromTo(title, { backgroundPositionX: '100%' }, {
      backgroundPositionX: '0%', ease: 'none',
      scrollTrigger: { trigger: title, start: 'top 90%', end: 'top 40%', scrub: true }
    });
  });
}

/* ---------- Micro-interactions ---------- */

function initInteractions() {
  const fine = window.matchMedia('(pointer: fine)').matches;

  document.querySelectorAll('.svc-card').forEach((card) => {
    const key = card.dataset.service;
    const enter = () => world && world.morph(key, { opacity: 0.65, scale: 1.2, x: 0 });
    const leave = () => applyScene('services');
    card.addEventListener('pointerenter', enter);
    card.addEventListener('focusin', enter);
    card.addEventListener('pointerleave', leave);
    card.addEventListener('focusout', leave);
  });

  document.querySelectorAll('.nav__link--service, .spec').forEach((link) => {
    link.addEventListener('pointerenter', () => world && world.morph(link.dataset.service));
    link.addEventListener('pointerleave', () => applyScene(document.querySelector('.hero') ? 'hero' : 'legal'));
  });

  if (!fine || reduced) return;

  document.querySelectorAll('[data-tilt]').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      el.style.setProperty('--rx', ((0.5 - py) * 8).toFixed(2) + 'deg');
      el.style.setProperty('--ry', ((px - 0.5) * 10).toFixed(2) + 'deg');
      el.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
      el.style.setProperty('--my', (py * 100).toFixed(1) + '%');
    });
    el.addEventListener('pointerleave', () => {
      el.style.setProperty('--rx', '0deg');
      el.style.setProperty('--ry', '0deg');
    });
  });

  document.querySelectorAll('[data-magnetic]').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--tx', ((e.clientX - r.left - r.width / 2) * 0.25).toFixed(1) + 'px');
      el.style.setProperty('--ty', ((e.clientY - r.top - r.height / 2) * 0.35).toFixed(1) + 'px');
    });
    el.addEventListener('pointerleave', () => {
      el.style.setProperty('--tx', '0px');
      el.style.setProperty('--ty', '0px');
    });
  });
}

function initCursor() {
  if (!window.matchMedia('(pointer: fine)').matches || reduced) return;
  const glow = document.createElement('div');
  glow.className = 'cursor-glow';
  glow.setAttribute('aria-hidden', 'true');
  document.body.append(glow);
  let x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y;
  window.addEventListener('pointermove', (e) => { x = e.clientX; y = e.clientY; }, { passive: true });
  (function loop() {
    cx += (x - cx) * 0.12; cy += (y - cy) * 0.12;
    glow.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
    requestAnimationFrame(loop);
  })();
}

/* ---------- Boot ---------- */

function hidePreloader() {
  const pre = document.getElementById('preloader');
  if (!pre) return;
  pre.classList.add('is-done');
  setTimeout(() => pre.remove(), 900);
}

render();
await mountDemos();
document.documentElement.classList.add('js');
const canvas = document.getElementById('world');
if (canvas) world = createWorld(canvas, { reduced });
initInteractions();
initMotion();
initCursor();
if (location.hash) {
  const target = document.querySelector(location.hash.replace(/[^#\w-]/g, ''));
  if (target) setTimeout(() => target.scrollIntoView(), 60);
}
(document.fonts ? document.fonts.ready : Promise.resolve()).then(() => {
  // Keep the intro visible long enough to be seen (~1.6s total), never longer.
  setTimeout(hidePreloader, reduced ? 0 : Math.max(350, 1600 - performance.now()));
  setTimeout(showBanner, reduced ? 0 : 900);
  ScrollTrigger?.refresh();
});
