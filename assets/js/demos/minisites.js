// Five small but working furniture websites for the 3D carousel on the Websites page.
// Each one scrolls inside its frame and reacts to clicks (cart, filters, quote, quiz, shop the look).
import { h, L, money } from './kit.js';

const IMG = 'assets/img/f/';
const img = (f, cls = '') => h('img', { src: IMG + f + '.webp', alt: '', class: cls, loading: 'lazy', decoding: 'async' });

function shell(s, ...body) {
  const count = h('b', { class: 'ms__count' }, '0');
  const toast = h('div', { class: 'ms__toast', role: 'status' });
  const scroll = h('div', { class: 'ms__scroll', tabindex: '0' }, ...body.map((b) => (typeof b === 'function' ? b({ count, toast }) : b)));
  return h('div', { class: 'ms ms--' + s.key },
    h('div', { class: 'ms__bar', dir: 'ltr' }, h('i'), h('i'), h('i'), h('span', {}, s.url)),
    h('nav', { class: 'ms__nav' }, h('b', { class: 'ms__logo' }, s.name), h('span', { class: 'ms__links' }, ...L(s.links).map((l) => h('span', {}, l))), h('span', { class: 'ms__cart' }, s.cartIcon || '🛒', ' ', count)),
    scroll, toast);
}
const say = (ctx, text) => { ctx.toast.textContent = text; ctx.toast.classList.remove('is-in'); void ctx.toast.offsetWidth; ctx.toast.classList.add('is-in'); };
const bump = (ctx, n = 1) => { ctx.count.textContent = String(Number(ctx.count.textContent) + n); ctx.count.classList.remove('is-bump'); void ctx.count.offsetWidth; ctx.count.classList.add('is-bump'); };
const hero = (file, kicker, title, cta) => h('header', { class: 'ms__hero' }, img(file), h('div', {}, h('small', {}, kicker), h('h4', {}, title), cta ? h('span', { class: 'ms__btn' }, cta) : null));
const foot = (txt) => h('footer', { class: 'ms__foot' }, txt);
const pills = (labels, start, onPick) => {
  const g = h('div', { class: 'ms__pills' }, ...labels.map((x, i) => {
    const b = h('button', { type: 'button', 'aria-pressed': String(i === start) }, x);
    b.addEventListener('click', () => { [...g.children].forEach((y) => y.setAttribute('aria-pressed', String(y === b))); onPick(i); });
    return b;
  }));
  return g;
};

const ADDED = { ar: 'أُضيفت للسلة', en: 'Added to cart' };
const LEGAL = { ar: 'الخصوصية · الشروط · سجل تجاري', en: 'Privacy · Terms · CR' };

/* 1 · DAR LIVING – sofas with fabric choice */
function darLiving() {
  const s = { key: 'stride', name: 'DAR LIVING', url: 'dar-living.sa', links: { ar: ['كنب', 'مجالس', 'عروض'], en: ['Sofas', 'Majlis', 'Offers'] } };
  const items = [['sofa-green', { ar: 'كنبة «ليان»', en: '“Layan” sofa' }, 6900], ['sofa-grey', { ar: 'كنبة «غيم»', en: '“Ghaim” sofa' }, 4800], ['sofa-leather', { ar: 'كنبة «سدرة»', en: '“Sidra” sofa' }, 8400], ['sofa-orange', { ar: 'كنبة «جوري»', en: '“Joury” sofa' }, 5200]];
  const fabrics = L({ ar: ['مخمل', 'كتان', 'جلد'], en: ['Velvet', 'Linen', 'Leather'] });
  return shell(s,
    hero('living-teal', L({ ar: 'وصل حديثًا', en: 'Just arrived' }), L({ ar: 'جلستك تبدأ من هنا', en: 'Your corner starts here' }), L({ ar: 'تسوّق الآن', en: 'Shop now' })),
    h('h5', {}, L({ ar: 'الأكثر مبيعًا', en: 'Bestsellers' })),
    (ctx) => h('div', { class: 'ms__grid' }, ...items.map(([f, n, p]) => {
      let fab = 0;
      const sizes = h('div', { class: 'ms__sizes' }, ...fabrics.map((z, i) => {
        const b = h('button', { type: 'button', 'aria-pressed': String(i === fab) }, z);
        b.addEventListener('click', () => { fab = i; [...sizes.children].forEach((x) => x.setAttribute('aria-pressed', String(x === b))); });
        return b;
      }));
      const add = h('button', { type: 'button', class: 'ms__add' }, '+ ' + L({ ar: 'السلة', en: 'Cart' }));
      add.addEventListener('click', () => { bump(ctx); say(ctx, '✓ ' + L(n) + ' · ' + fabrics[fab] + ' – ' + L(ADDED)); });
      return h('div', { class: 'ms__card' }, img(f), h('b', {}, L(n)), h('span', {}, money(p)), sizes, add);
    })),
    h('div', { class: 'ms__banner' }, L({ ar: '🚚 توصيل وتركيب مجاني في الرياض · تقسيط 4 دفعات', en: '🚚 Free delivery & assembly in Riyadh · 4 instalments' })),
    foot('© Dar Living · ' + L(LEGAL)));
}

/* 2 · BAYT ALREEM – bedrooms with filters */
function baytAlreem() {
  const s = { key: 'maison', name: 'BAYT ALREEM', url: 'baytalreem.sa', cartIcon: '🛏', links: { ar: ['غرف النوم', 'العرسان', 'المعرض'], en: ['Bedrooms', 'Newly-weds', 'Showroom'] } };
  const items = [['bed-velvet', { ar: 'غرفة «مخمل»', en: '“Velvet” bedroom' }, 14900, 'modern'], ['bed-classic', { ar: 'غرفة «قصر»', en: '“Qasr” bedroom' }, 18500, 'classic'], ['bed-hotel', { ar: 'غرفة «فندقية»', en: '“Hotel” bedroom' }, 12400, 'modern'], ['interior-classic', { ar: 'غرفة «تراث»', en: '“Heritage” bedroom' }, 16800, 'classic']];
  const cats = [['all', { ar: 'الكل', en: 'All' }], ['modern', { ar: 'مودرن', en: 'Modern' }], ['classic', { ar: 'كلاسيك', en: 'Classic' }]];
  return shell(s,
    hero('bed-hotel', L({ ar: 'موسم الزواج 2027', en: 'Wedding season 2027' }), L({ ar: 'غرفتكم الأولى، كاملة', en: 'Your first room, complete' }), L({ ar: 'اكتشف', en: 'Discover' })),
    (ctx) => {
      const grid = h('div', { class: 'ms__grid' });
      const draw = (c) => grid.replaceChildren(...items.filter((x) => c === 'all' || x[3] === c).map(([f, n, p]) => {
        const heart = h('button', { type: 'button', class: 'ms__heart', 'aria-pressed': 'false', 'aria-label': '♡' }, '♡');
        heart.addEventListener('click', () => { const on = heart.getAttribute('aria-pressed') !== 'true'; heart.setAttribute('aria-pressed', String(on)); heart.textContent = on ? '♥' : '♡'; });
        const add = h('button', { type: 'button', class: 'ms__add' }, L({ ar: 'احجز الغرفة', en: 'Reserve' }));
        add.addEventListener('click', () => { bump(ctx); say(ctx, '✓ ' + L(n) + ' · ' + L({ ar: '4 دفعات × ', en: '4 × ' }) + money(Math.round(p / 4))); });
        return h('div', { class: 'ms__card' }, h('div', { class: 'ms__imgwrap' }, img(f), heart), h('b', {}, L(n)), h('span', {}, money(p)), add);
      }));
      const tabs = h('div', { class: 'ms__tabs' }, ...cats.map(([k, l], i) => {
        const b = h('button', { type: 'button', 'aria-pressed': String(i === 0) }, L(l));
        b.addEventListener('click', () => { [...tabs.children].forEach((x) => x.setAttribute('aria-pressed', String(x === b))); draw(k); });
        return b;
      }));
      draw('all');
      return h('div', {}, tabs, grid);
    },
    foot('© Bayt Alreem · ' + L(LEGAL)));
}

/* 3 · NUKHBA OFFICE – B2B quote request */
function nukhba() {
  const s = { key: 'lumi', name: 'Nukhba Office', url: 'nukhba-office.sa', cartIcon: '📋', links: { ar: ['المكاتب', 'المشاريع', 'عرض سعر'], en: ['Offices', 'Projects', 'Quote'] } };
  const menu = { desk: [['office-hall', { ar: 'مكاتب مفتوحة', en: 'Open-plan desks' }, 2400]], lounge: [['office-lounge', { ar: 'جلسات انتظار', en: 'Lounge seating' }, 5600], ['chair-black', { ar: 'كرسي «تنفيذي»', en: '“Executive” chair' }, 1900]], cafe: [['loft-cafe', { ar: 'ركن القهوة', en: 'Coffee corner' }, 7800]] };
  const names = { desk: { ar: 'مكاتب', en: 'Desks' }, lounge: { ar: 'استقبال', en: 'Reception' }, cafe: { ar: 'استراحة', en: 'Break room' } };
  return shell(s,
    hero('office-lounge', L({ ar: 'الرياض · الدمام · جدة', en: 'Riyadh · Dammam · Jeddah' }), L({ ar: 'مكتبك جاهز قبل الافتتاح', en: 'Your office ready before opening day' }), null),
    (ctx) => {
      const list = h('div', { class: 'ms__menu' });
      const draw = (k) => list.replaceChildren(...menu[k].map(([f, n, p]) => h('div', { class: 'ms__dish' }, img(f), h('b', {}, L(n)), h('span', {}, L({ ar: 'من ', en: 'from ' }) + money(p)))));
      const keys = Object.keys(menu);
      const tabs = pills(keys.map((k) => L(names[k])), 0, (i) => draw(keys[i]));
      tabs.className = 'ms__tabs';
      draw('desk');
      let staff = 20, day = 0;
      const g = h('b', {}, '20');
      const minus = h('button', { type: 'button', 'aria-label': '−' }, '−'), plus = h('button', { type: 'button', 'aria-label': '+' }, '+');
      minus.addEventListener('click', () => { staff = Math.max(5, staff - 5); g.textContent = String(staff); });
      plus.addEventListener('click', () => { staff = Math.min(300, staff + 5); g.textContent = String(staff); });
      const days = L({ ar: ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء'], en: ['Sun', 'Mon', 'Tue', 'Wed'] });
      const dp = pills(days, 0, (i) => { day = i; });
      const book = h('button', { type: 'button', class: 'ms__btn ms__btn--full' }, L({ ar: 'اطلب عرض سعر', en: 'Request a quote' }));
      book.addEventListener('click', () => { bump(ctx); say(ctx, '✓ ' + L({ ar: 'طلب عرض لـ ', en: 'Quote request for ' }) + staff + L({ ar: ' موظف · زيارة ', en: ' staff · visit ' }) + days[day] + L({ ar: ' · الرد خلال 24 ساعة', en: ' · reply within 24 h' })); });
      return h('div', {}, h('h5', {}, L({ ar: 'الحلول', en: 'Solutions' })), tabs, list,
        h('div', { class: 'ms__book' }, h('h5', {}, L({ ar: 'عرض سعر للشركات', en: 'Business quote' })),
          h('div', { class: 'ms__guests' }, L({ ar: 'عدد الموظفين', en: 'Staff' }), minus, g, plus), dp, book));
    },
    foot('© Nukhba Office · ' + L(LEGAL)));
}

/* 4 · MASKAN – style quiz */
function maskan() {
  const s = { key: 'glow', name: 'maskan', url: 'maskan-home.sa', links: { ar: ['المجموعات', 'اختبار الذوق', 'من نحن'], en: ['Collections', 'Style quiz', 'About'] } };
  const items = { boho: ['living-boho', { ar: 'طقم «بوهو»', en: '“Boho” set' }, 9800], calm: ['living-calm', { ar: 'طقم «هدوء»', en: '“Calm” set' }, 11200], classic: ['living-dark', { ar: 'طقم «ملكي»', en: '“Royal” set' }, 15400] };
  const types = [[{ ar: 'دافئ وطبيعي', en: 'Warm & natural' }, 'boho'], [{ ar: 'بسيط وهادئ', en: 'Simple & calm' }, 'calm'], [{ ar: 'فخم وكلاسيكي', en: 'Rich & classic' }, 'classic']];
  const card = (ctx, k) => {
    const [f, n, p] = items[k];
    const add = h('button', { type: 'button', class: 'ms__add' }, '+');
    add.addEventListener('click', () => { bump(ctx); say(ctx, '✓ ' + L(n) + ' – ' + L(ADDED)); });
    return h('div', { class: 'ms__card ms__card--row' }, img(f), h('div', {}, h('b', {}, L(n)), h('span', {}, money(p))), add);
  };
  return shell(s,
    hero('living-calm', L({ ar: 'بيت يشبهك', en: 'A home like you' }), L({ ar: 'وش ذوقك؟ نختار لك', en: 'What’s your style? We’ll pick for you' }), null),
    (ctx) => {
      const out = h('div', { class: 'ms__quizout' }, card(ctx, 'calm'));
      const chips = pills(types.map(([l]) => L(l)), 1, (i) => { out.replaceChildren(card(ctx, types[i][1])); out.classList.remove('is-in'); void out.offsetWidth; out.classList.add('is-in'); });
      return h('div', { class: 'ms__quiz' }, h('h5', {}, L({ ar: 'اختبار الذوق: وش يناسب صالتك؟', en: 'Style quiz: what suits your living room?' })), chips, out,
        h('h5', {}, L({ ar: 'كل المجموعات', en: 'All collections' })), ...Object.keys(items).map((k) => card(ctx, k)));
    },
    foot('© maskan · ' + L(LEGAL)));
}

/* 5 · NOOR DECOR – shop the look */
function noor() {
  const s = { key: 'nord', name: 'NOOR DECOR', url: 'noordecor.sa', links: { ar: ['الصالات', 'الإضاءة', 'الديكور'], en: ['Living', 'Lighting', 'Decor'] } };
  const spots = [['chair-yellow', { ar: 'كرسي «شمس»', en: '“Shams” chair' }, 1450, 16, 64], ['lamp', { ar: 'أباجورة «نور»', en: '“Noor” lamp' }, 690, 74, 32], ['stool', { ar: 'طاولة «رمل»', en: '“Raml” table' }, 420, 56, 74], ['sofa-green', { ar: 'كنبة «ليان»', en: '“Layan” sofa' }, 6900, 40, 58]];
  return shell(s,
    (ctx) => {
      const pop = h('div', { class: 'ms__pop' });
      const dots = spots.map(([f, n, p, x, y]) => {
        const d = h('button', { type: 'button', class: 'ms__spot', 'aria-label': L(n) });
        d.style.setProperty('left', x + '%'); d.style.setProperty('top', y + '%');
        d.addEventListener('click', () => {
          const add = h('button', { type: 'button', class: 'ms__add' }, '+ ' + L({ ar: 'السلة', en: 'Cart' }));
          add.addEventListener('click', () => { bump(ctx); say(ctx, '✓ ' + L(n) + ' – ' + L(ADDED)); });
          pop.replaceChildren(img(f), h('div', {}, h('b', {}, L(n)), h('span', {}, money(p)), add));
          pop.style.setProperty('left', Math.min(x, 55) + '%'); pop.style.setProperty('top', Math.max(4, y - 44) + '%');
          pop.classList.add('is-in');
        });
        return d;
      });
      return h('div', { class: 'ms__room', dir: 'ltr' }, img('living-green'), ...dots, pop, h('small', { class: 'ms__roomhint' }, L({ ar: '● اضغط النقاط · تسوّق الإطلالة', en: '● Tap the dots · shop the look' })));
    },
    h('h5', {}, L({ ar: 'وصل حديثًا', en: 'New in' })),
    (ctx) => h('div', { class: 'ms__grid ms__grid--3' }, ...[['lamp', { ar: 'أباجورة «نور»', en: '“Noor” lamp' }, 690], ['stool', { ar: 'طاولة «رمل»', en: '“Raml” table' }, 420], ['chair-black', { ar: 'كرسي «ليل»', en: '“Layl” chair' }, 1290]].map(([f, n, p]) => {
      const add = h('button', { type: 'button', class: 'ms__add' }, '+');
      add.addEventListener('click', () => { bump(ctx); say(ctx, '✓ ' + L(n) + ' – ' + L(ADDED)); });
      return h('div', { class: 'ms__card' }, img(f), h('b', {}, L(n)), h('span', {}, money(p)), add);
    })),
    foot('© Noor Decor · ' + L(LEGAL)));
}

export const MINI_SITES = [
  { name: 'Dar Living', tag: { ar: 'متجر كنب مع اختيار القماش', en: 'Sofa store with fabric choice' }, build: darLiving },
  { name: 'Bayt Alreem', tag: { ar: 'غرف نوم العرسان مع التقسيط', en: 'Newly-wed bedrooms with instalments' }, build: baytAlreem },
  { name: 'Nukhba Office', tag: { ar: 'أثاث مكتبي مع طلب عرض سعر', en: 'Office furniture with quote requests' }, build: nukhba },
  { name: 'maskan', tag: { ar: 'متجر مع اختبار الذوق', en: 'Store with a style quiz' }, build: maskan },
  { name: 'Noor Decor', tag: { ar: 'ديكور · تسوّق الإطلالة', en: 'Decor · shop the look' }, build: noor }
];
