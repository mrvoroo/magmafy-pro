// Header, navigation, footer and the cookie-settings dialog shared by every page.
import { h, t, icon, settings, getLang, safeUrl, LANGS, SERVICE_KEYS, SERVICE_PAGES } from './core.js';
import { openSettings } from './consent.js';

const SOCIAL = [['instagram', 'Instagram'], ['tiktok', 'TikTok'], ['snapchat', 'Snapchat'], ['x', 'X'], ['linkedin', 'LinkedIn'], ['whatsapp', 'WhatsApp']];

// Social icons are always shown; without a link they render as quiet placeholders.
export function socialLinks(cls = 'footer__social') {
  const links = { ...(settings.social || {}) };
  const wa = String(settings.whatsapp || '').replace(/[^\d]/g, '');
  if (wa && !links.whatsapp) links.whatsapp = 'https://wa.me/' + wa;
  return h('ul', { class: cls }, ...SOCIAL.map(([k, name]) => {
    const url = safeUrl(links[k]);
    return h('li', {}, url && url.startsWith('https://')
      ? h('a', { class: 'social-btn', href: url, target: '_blank', rel: 'noopener noreferrer', 'aria-label': name }, icon(k, 20))
      : h('span', { class: 'social-btn is-soon', role: 'img', 'aria-label': name + ' – ' + t('contact.soon'), title: name + ' – ' + t('contact.soon') }, icon(k, 20)));
  }));
}

const NAV = [
  { key: 'home', href: 'index.html', page: 'home' },
  { key: 'about', href: 'index.html#about', page: null },
  ...SERVICE_KEYS.map((k) => ({ key: k, href: SERVICE_PAGES[k], page: k, service: true })),
  { key: 'portfolio', href: 'portfolio.html', page: 'portfolio' },
  { key: 'contact', href: 'booking.html', page: 'contact' }
];

// The Magmafy "M" logo (raster, transparent corners).
function logoMark() {
  return h('img', { class: 'brand__mark', src: 'assets/img/logo-mark.webp', width: '34', height: '34', alt: '', decoding: 'async' });
}

export function brandMark() {
  return h('span', { class: 'brand', dir: 'ltr' },
    logoMark(),
    h('span', { class: 'brand__name' }, settings.brand || 'Magmafy'),
    settings.brandSuffix ? h('span', { class: 'brand__suffix' }, settings.brandSuffix) : null);
}

export function renderHeader(page, onLang) {
  const header = document.getElementById('site-header');
  header.replaceChildren();

  const links = NAV.filter((n) => n.key !== 'contact').map((item) => h('li', {},
    h('a', {
      class: 'nav__link' + (item.service ? ' nav__link--service' : ''),
      href: item.href,
      'aria-current': item.page === page ? 'page' : null,
      'data-service': item.service ? item.key : null
    }, t('nav.' + item.key))));

  const langSwitch = h('div', { class: 'lang', role: 'group', 'aria-label': t('nav.langLabel') },
    ...LANGS.map((l) => {
      const b = h('button', { type: 'button', class: 'lang__btn', 'aria-pressed': String(l === getLang()), lang: l }, l === 'ar' ? 'AR' : 'EN');
      b.addEventListener('click', () => l !== getLang() && onLang(l));
      return b;
    }));

  const burger = h('button', {
    type: 'button', class: 'burger', 'aria-expanded': 'false', 'aria-controls': 'menu-panel', 'aria-label': t('nav.menu')
  }, h('span'), h('span'), h('span'));

  // The side menu ("three lines") puts the four specialties front and centre.
  const panel = h('div', { class: 'menu-panel', id: 'menu-panel', hidden: true },
    h('div', { class: 'menu-panel__inner container' },
      h('div', { class: 'menu-panel__main' },
        h('p', { class: 'eyebrow' }, t('nav.specialties')),
        h('ul', { class: 'spec-list' },
          ...SERVICE_KEYS.map((k) => {
            const s = t('services.' + k) || {};
            return h('li', {},
              h('a', { class: 'spec', href: SERVICE_PAGES[k], 'data-service': k, 'aria-current': page === k ? 'page' : null },
                h('span', { class: 'spec__num' }, s.num),
                h('span', { class: 'spec__icon' }, icon(k, 28)),
                h('span', { class: 'spec__text' },
                  h('span', { class: 'spec__title' }, s.title),
                  h('span', { class: 'spec__tagline' }, s.tagline)),
                h('span', { class: 'spec__arrow' }, icon('arrow', 22))));
          }))),
      h('div', { class: 'menu-panel__side' },
        h('p', { class: 'eyebrow' }, t('nav.more')),
        h('ul', { class: 'menu-panel__links' },
          ...NAV.filter((n) => !n.service).map((item) => h('li', {},
            h('a', { href: item.href, 'aria-current': item.page === page ? 'page' : null }, t('nav.' + item.key))))),
        h('ul', { class: 'menu-panel__legal' },
          h('li', {}, h('a', { href: 'privacy.html' }, t('footer.privacy'))),
          h('li', {}, h('a', { href: 'terms.html' }, t('footer.terms')))))));

  let lastFocus = null;
  const setOpen = (open) => {
    if (open === header.classList.contains('is-open')) return;
    header.classList.toggle('is-open', open);
    document.documentElement.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', t(open ? 'nav.close' : 'nav.menu'));
    if (open) {
      panel.hidden = false;
      lastFocus = document.activeElement;
      requestAnimationFrame(() => panel.classList.add('is-visible'));
      setTimeout(() => panel.querySelector('a')?.focus({ preventScroll: true }), 50);
    } else {
      panel.classList.remove('is-visible');
      setTimeout(() => { if (!header.classList.contains('is-open')) panel.hidden = true; }, 450);
      lastFocus?.focus?.({ preventScroll: true });
    }
  };
  burger.addEventListener('click', () => setOpen(!header.classList.contains('is-open')));
  panel.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
  header._onKey && document.removeEventListener('keydown', header._onKey);
  header._onKey = (e) => {
    if (e.key === 'Escape') setOpen(false);
    if (e.key === 'Tab' && header.classList.contains('is-open')) {
      // Keep focus inside the open menu (burger + panel).
      const items = [burger, ...panel.querySelectorAll('a')];
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  };
  document.addEventListener('keydown', header._onKey);

  header.append(
    h('a', { class: 'skip', href: '#main' }, t('nav.skip')),
    h('div', { class: 'header__bar' },
      h('a', { class: 'header__brand', href: 'index.html', 'aria-label': (settings.brand || 'Magmafy') + ' – ' + t('nav.home') }, brandMark()),
      h('nav', { class: 'nav', 'aria-label': t('nav.home') }, h('ul', { class: 'nav__list' }, ...links)),
      h('div', { class: 'header__tools' }, langSwitch,
        h('a', { class: 'btn btn--primary btn--sm header__cta', href: 'booking.html', 'data-magnetic': '' }, icon('calendar', 16), h('span', { class: 'btn__label' }, t('nav.book'))),
        burger)),
    panel);

  header._onScroll && window.removeEventListener('scroll', header._onScroll);
  header._onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 24);
  window.addEventListener('scroll', header._onScroll, { passive: true });
  header._onScroll();
  document.documentElement.classList.remove('menu-open');
}

export function renderFooter() {
  const footer = document.getElementById('site-footer');
  footer.replaceChildren();

  const cookieBtn = h('button', { type: 'button', class: 'footer__link footer__btn' }, t('footer.cookies'));
  cookieBtn.addEventListener('click', openSettings);

  const year = new Date().getFullYear();
  const brand = settings.brand || 'Magmafy';
  const contact = [
    settings.email ? h('li', {}, h('a', { class: 'footer__link', href: 'mailto:' + settings.email }, settings.email)) : null,
    settings.phone ? h('li', {}, h('a', { class: 'footer__link', href: 'tel:' + settings.phone.replace(/[^\d+]/g, ''), dir: 'ltr' }, settings.phone)) : null,
    h('li', { class: 'footer__link footer__where' }, settings.address || t('contact.addressValue'))
  ];

  footer.append(
    h('div', { class: 'footer__glow', 'aria-hidden': 'true' }),
    h('div', { class: 'container footer__grid' },
      h('div', { class: 'footer__brand' },
        h('a', { href: 'index.html', class: 'header__brand', 'aria-label': brand }, brandMark()),
        h('p', { class: 'footer__tagline' }, t('footer.tagline')),
        h('a', { class: 'btn btn--ghost btn--sm', href: 'booking.html' }, icon('calendar', 16), h('span', { class: 'btn__label' }, t('nav.book')))),
      h('div', {},
        h('h2', { class: 'footer__head' }, t('footer.explore')),
        h('ul', { class: 'footer__list' },
          ...SERVICE_KEYS.map((k) => h('li', {}, h('a', { class: 'footer__link', href: SERVICE_PAGES[k] }, t('nav.' + k)))),
          h('li', {}, h('a', { class: 'footer__link', href: 'portfolio.html' }, t('nav.portfolio'))),
          h('li', {}, h('a', { class: 'footer__link', href: 'booking.html' }, t('nav.contact'))))),
      h('div', {},
        h('h2', { class: 'footer__head' }, t('footer.legal')),
        h('ul', { class: 'footer__list' },
          h('li', {}, h('a', { class: 'footer__link', href: 'privacy.html' }, t('footer.privacy'))),
          h('li', {}, h('a', { class: 'footer__link', href: 'terms.html' }, t('footer.terms'))),
          h('li', {}, h('a', { class: 'footer__link', href: 'accessibility.html' }, t('footer.accessibility'))),
          h('li', {}, cookieBtn))),
      h('div', {},
        h('h2', { class: 'footer__head' }, t('footer.social')),
        h('ul', { class: 'footer__list footer__contact' }, ...contact),
        socialLinks())),
    h('div', { class: 'container footer__bottom' },
      h('p', {}, '© ' + year + ' ' + brand + '. ' + t('footer.rights')),
      h('p', { class: 'footer__made', lang: 'en', dir: 'ltr' }, 'Made by Magmafy')));
}
