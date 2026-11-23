// Portfolio page: eight sample projects shown one at a time. Scrolling pins the stage;
// each step a particle wave sweeps the current project out (alternating sides) and brings
// the next one in. Every mockup animates only while it is on screen.
import { h, getLang, isRTL } from './core.js';
import { svg, money, num, onVisible, reduced } from './demos/kit.js';
import { SHOWCASES } from './showcase.js';

const IMG = 'assets/img/f/';
const L = (d) => (d && typeof d === 'object' && !Array.isArray(d) ? d[getLang()] || d.ar : d);
const pic = (file, cls = '', alt = '') => h('img', { src: IMG + file + '.webp', alt, class: cls, loading: 'lazy', decoding: 'async' });
const live = (el, fn, ms) => { let tm; onVisible(el, () => { if (!reduced && !tm) { fn(); tm = setInterval(fn, ms); } }, () => { clearInterval(tm); tm = null; }); return el; };
const replay = (el, cls) => { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); };

const UI = {
  ar: { eyebrow: 'أعمالنا', scroll: 'مرّر للمشروع التالي', prev: 'المشروع السابق', next: 'المشروع التالي', sample: 'مشروع توضيحي', of: 'من' },
  en: { eyebrow: 'Work', scroll: 'Scroll for the next project', prev: 'Previous project', next: 'Next project', sample: 'Sample project', of: 'of' }
};

/* ---------- Device frames ---------- */
const browser = (url, body, cls = '') => h('div', { class: 'pf-browser ' + cls },
  h('div', { class: 'pf-browser__bar', dir: 'ltr' }, h('i'), h('i'), h('i'), h('span', {}, '🔒 ' + url)), body);
const phone = (body, cls = '') => h('div', { class: 'pf-phone ' + cls }, h('span', { class: 'pf-phone__notch' }), h('div', { class: 'pf-phone__screen' }, body));

/* ---------- Mockups ---------- */
function storyCampaign() {
  const t = L({ ar: { cta: 'احجز زيارة', sp: 'ممول', reach: 'الوصول', leads: 'استفسارات', ctr: 'نسبة النقر', cpl: 'تكلفة الاستفسار', camp: 'حملة · موسم الزواج', live: 'نشطة' }, en: { cta: 'Book a visit', sp: 'Sponsored', reach: 'Reach', leads: 'Enquiries', ctr: 'CTR', cpl: 'Cost / enquiry', camp: 'Campaign · wedding season', live: 'Live' } });
  const frames = ['living-boho', 'bed-velvet', 'dining', 'living-cream'];
  const pics = frames.map((f, i) => pic(f, 'pf-story__img' + (i ? '' : ' is-on')));
  const bars = frames.map(() => h('i', {}, h('b')));
  const story = phone(h('div', { class: 'pf-story' }, ...pics,
    h('div', { class: 'pf-story__bars' }, ...bars),
    h('div', { class: 'pf-story__head' }, h('span', { class: 'pf-story__av' }, 'BR'), h('b', {}, 'bayt.alreem'), h('small', {}, t.sp)),
    h('div', { class: 'pf-story__cta' }, '⌃', h('b', {}, t.cta))));
  const vals = { reach: 52400, leads: 138, ctr: 2.9, cpl: 26 };
  const cells = Object.keys(vals).map((k) => { const b = h('b'); return [k, b, h('div', { class: 'pf-am__kpi' }, h('small', {}, t[k]), b)]; });
  const paint = () => cells.forEach(([k, b]) => { b.textContent = k === 'ctr' ? num(vals[k], 1) + '%' : k === 'cpl' ? money(vals[k]) : num(vals[k]); });
  paint();
  const panel = h('div', { class: 'pf-am' },
    h('div', { class: 'pf-am__head' }, h('span', { class: 'pf-am__logo' }, '∞'), h('b', {}, t.camp), h('span', { class: 'pf-am__live' }, '● ' + t.live)),
    h('div', { class: 'pf-am__grid' }, ...cells.map((c) => c[2])),
    h('div', { class: 'pf-am__chart', dir: 'ltr' }, ...[30, 42, 38, 55, 61, 58, 72, 80, 77, 92].map((v) => { const i = h('i'); i.style.setProperty('--h', v + '%'); return i; })));
  let f = 0;
  const root = h('div', { class: 'pf-dual' }, story, panel);
  live(root, () => {
    pics.forEach((p, k) => p.classList.toggle('is-on', k === f));
    bars.forEach((b, k) => { b.classList.toggle('is-done', k < f); b.classList.toggle('is-run', k === f); if (k === f) replay(b, 'is-run'); });
    f = (f + 1) % frames.length;
    vals.reach += 380 + Math.round(Math.random() * 300); vals.leads += 1 + Math.round(Math.random() * 2);
    vals.ctr = Math.min(3.8, vals.ctr + 0.02); vals.cpl = Math.max(19, vals.cpl - (Math.random() < 0.3 ? 1 : 0));
    paint();
  }, 2400);
  return root;
}

function marketReport() {
  const t = L({
    ar: { title: 'تقرير المنافسين · أكتوبر 2026', cities: ['الرياض', 'جدة', 'الدمام'], cols: ['المنافس', 'سعر كنبة 3 مقاعد', 'نشر أسبوعي', 'زمن الرد'], gap: 'الفرص', gaps: ['لا أحد يعرض 3D', 'الرد بطيء بعد 9 م', 'محتوى العرسان ضعيف'], you: 'أنت' },
    en: { title: 'Competitor report · October 2026', cities: ['Riyadh', 'Jeddah', 'Dammam'], cols: ['Competitor', '3-seat sofa price', 'Posts / week', 'Reply time'], gap: 'Opportunities', gaps: ['Nobody offers 3D', 'Slow replies after 9 PM', 'Weak content for newly-weds'], you: 'You' }
  });
  const data = [
    [['A', 4900, 3, '6h'], ['B', 6200, 5, '2h'], ['C', 3800, 1, '1d'], [t.you, 5400, 7, '15m']],
    [['A', 5300, 4, '3h'], ['B', 4100, 2, '9h'], ['C', 6900, 6, '1h'], [t.you, 5400, 7, '15m']],
    [['A', 4500, 2, '5h'], ['B', 5800, 3, '4h'], ['C', 3900, 4, '12h'], [t.you, 5400, 7, '15m']]
  ];
  const tabs = t.cities.map((c, i) => h('span', { class: i ? '' : 'is-on' }, c));
  const body = h('tbody');
  const bars = h('div', { class: 'pf-rep__bars' });
  const draw = (ci) => {
    tabs.forEach((x, k) => x.classList.toggle('is-on', k === ci));
    const rows = data[ci];
    const max = Math.max(...rows.map((r) => r[1]));
    body.replaceChildren(...rows.map((r, i) => h('tr', { class: i === 3 ? 'is-you' : '' }, h('td', {}, r[0]), h('td', {}, money(r[1])), h('td', {}, String(r[2])), h('td', { dir: 'ltr' }, r[3]))));
    bars.replaceChildren(...rows.map((r, i) => { const b = h('span', { class: i === 3 ? 'is-you' : '' }, h('i'), h('small', {}, r[0])); b.style.setProperty('--h', (r[1] / max) * 100 + '%'); return b; }));
    replay(bars, 'is-run');
  };
  draw(0);
  const root = browser('report.magmafy.com', h('div', { class: 'pf-rep' },
    h('div', { class: 'pf-rep__head' }, h('b', {}, t.title), h('div', { class: 'pf-rep__tabs' }, ...tabs)),
    h('div', { class: 'pf-rep__row' },
      h('table', { class: 'pf-rep__table' }, h('thead', {}, h('tr', {}, ...t.cols.map((c) => h('th', {}, c)))), body),
      bars),
    h('div', { class: 'pf-rep__gaps' }, h('small', {}, t.gap), ...t.gaps.map((g) => h('span', {}, '✦ ' + g)))), 'pf-browser--dark');
  let k = 0;
  live(root, () => { draw(k % 3); k++; }, 2600);
  return root;
}

function commentAutomation() {
  const t = L({ ar: { cap: 'جديد: كنبة «جوري» البرتقالية 🧡 متوفرة بالمعرض ومع التقسيط.', c: [['nouf.home', 'كم سعرها؟ 😍'], ['abu_faisal', 'السعر لو سمحت'], ['lama.decor', 'فيه لون ثاني؟']], dm: 'هلا نوف! كنبة «جوري» بـ 5,200 ر.س، وتقدرين تقسطينها على 4 دفعات. تبين أحجز لك زيارة السبت؟ 🧡', auto: 'رد تلقائي', sent: 'تم الإرسال خلال 2 ث' }, en: { cap: 'New: the orange “Joury” sofa 🧡 in the showroom now, with instalments.', c: [['nouf.home', 'How much is it? 😍'], ['abu_faisal', 'Price please'], ['lama.decor', 'Other colours?']], dm: 'Hi Nouf! The “Joury” sofa is SAR 5,200, payable in 4 instalments. Shall I book you a visit on Saturday? 🧡', auto: 'Automatic reply', sent: 'Sent in 2 s' } });
  const comments = t.c.map(([u, c]) => h('li', {}, h('span', { class: 'pf-ig__av pf-ig__av--txt' }, u[0].toUpperCase()), h('p', {}, h('b', {}, u + ' '), c)));
  const post = phone(h('div', { class: 'pf-ig' },
    h('div', { class: 'pf-ig__head' }, h('span', { class: 'pf-ig__ring' }, h('span', { class: 'pf-ig__av pf-ig__av--txt' }, 'BR')), h('b', {}, 'bayt.alreem')),
    pic('sofa-orange', 'pf-ig__photo'),
    h('div', { class: 'pf-ig__actions' }, '♡  💬  ➤'),
    h('p', { class: 'pf-ig__cap' }, h('b', {}, 'bayt.alreem '), t.cap),
    h('ul', { class: 'pf-ig__comments' }, ...comments)));
  const dm = h('div', { class: 'pf-dm__msg' }, h('small', {}, '⚡ ' + t.auto), t.dm);
  const sent = h('small', { class: 'pf-dm__sent' }, '✓ ' + t.sent);
  const chat = phone(h('div', { class: 'pf-dm' },
    h('div', { class: 'pf-dm__head' }, h('span', { class: 'pf-ig__av pf-ig__av--txt' }, 'N'), h('b', {}, 'nouf.home')),
    h('div', { class: 'pf-dm__user' }, t.c[0][1]), dm, sent), 'pf-phone--sm');
  const root = h('div', { class: 'pf-dual pf-dual--phones' }, post, chat);
  let k = 0;
  live(root, () => {
    comments.forEach((c, i) => c.classList.toggle('is-new', i === k % comments.length));
    replay(dm, 'is-in'); replay(sent, 'is-in');
    k++;
  }, 3200);
  return root;
}

function shopTheLook() {
  const t = L({ ar: { hero: 'صالة دافئة تحضن العيلة كلها.', add: 'أضف للسلة', shop: 'تسوّق الإطلالة' }, en: { hero: 'A warm living room for the whole family.', add: 'Add to cart', shop: 'Shop the look' } });
  const spots = [['s/sofa-leather', { ar: 'كنبة «سدرة»', en: '“Sidra” sofa' }, 8400, 52, 66], ['s/lamp', { ar: 'أباجورة «نور»', en: '“Noor” lamp' }, 690, 88, 40], ['s/chair-yellow', { ar: 'كرسي «شمس»', en: '“Shams” chair' }, 1450, 14, 62], ['s/stool', { ar: 'طاولة «رمل»', en: '“Raml” side table' }, 420, 72, 78]];
  const dots = spots.map(([, , , x, y]) => { const d = h('span', { class: 'pf-spot' }); d.style.setProperty('left', x + '%'); d.style.setProperty('top', y + '%'); return d; });
  const card = h('div', { class: 'pf-home__card' });
  const root = browser('maskan-home.sa', h('div', { class: 'pf-home' },
    h('nav', {}, h('b', {}, 'MASKAN'), h('span', {}, t.shop)),
    h('div', { class: 'pf-home__room', dir: 'ltr' }, pic('living-soft'), ...dots, card),
    h('div', { class: 'pf-home__copy' }, h('h4', {}, t.hero))));
  let k = 0;
  live(root, () => {
    const i = k % spots.length, [f, n, p, x, y] = spots[i];
    dots.forEach((d, j) => d.classList.toggle('is-on', j === i));
    card.replaceChildren(pic(f), h('div', {}, h('b', {}, L(n)), h('small', {}, money(p)), h('span', {}, t.add)));
    card.style.setProperty('left', Math.min(x, 58) + '%'); card.style.setProperty('top', Math.max(6, y - 44) + '%');
    replay(card, 'is-in');
    k++;
  }, 2200);
  return root;
}

function growthDashboard() {
  const t = L({ ar: { title: 'المبيعات والتسويق', kpi: [['المبيعات', 412000, 'sar'], ['الطلبات', 96, ''], ['زيارات المعرض', 214, ''], ['استفسارات', 640, '']], src: 'المصادر: سلة · Meta · Snapchat · TikTok', ch: ['Snapchat', 'Instagram', 'TikTok', 'Google'] }, en: { title: 'Sales & marketing', kpi: [['Sales', 412000, 'sar'], ['Orders', 96, ''], ['Showroom visits', 214, ''], ['Enquiries', 640, '']], src: 'Sources: Salla · Meta · Snapchat · TikTok', ch: ['Snapchat', 'Instagram', 'TikTok', 'Google'] } });
  const kp = t.kpi.map(([l, v, u]) => { const b = h('b', {}, '0'); return [b, v, u, h('div', { class: 'pf-bi__kpi' }, h('small', {}, l), b, h('em', { dir: 'ltr' }, '▲ ' + (8 + (v % 17)) + '%'))]; });
  const pts = [14, 22, 19, 30, 28, 41, 38, 52, 49, 63, 70, 78].map((v, i) => [i * 30, 100 - v]);
  const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0] + ',' + p[1]).join(' ');
  const line = svg('path', { d, fill: 'none', stroke: '#fa7e1e', 'stroke-width': 2.5, pathLength: 100, class: 'pf-bi__line' });
  const area = svg('path', { d: d + ' L330,100 L0,100 Z', fill: 'url(#pfbi)', class: 'pf-bi__area' });
  const chart = svg('svg', { viewBox: '0 0 330 100', preserveAspectRatio: 'none', class: 'pf-bi__chart' },
    svg('defs', {}, svg('linearGradient', { id: 'pfbi', x1: 0, x2: 0, y1: 0, y2: 1 }, svg('stop', { offset: '0', 'stop-color': '#d62976', 'stop-opacity': '.4' }), svg('stop', { offset: '1', 'stop-color': '#d62976', 'stop-opacity': '0' }))), area, line);
  const share = [38, 29, 21, 12];
  const root = browser('app.magmafy.com/reports', h('div', { class: 'pf-bi' },
    h('aside', {}, h('b', {}, '▲ Magmafy'), ...['▦', '◔', '⚑', '⚙'].map((x, i) => h('span', { class: i ? '' : 'is-on' }, x))),
    h('div', { class: 'pf-bi__main' },
      h('div', { class: 'pf-bi__head' }, h('b', {}, t.title), h('small', {}, t.src)),
      h('div', { class: 'pf-bi__kpis' }, ...kp.map((k) => k[3])),
      h('div', { class: 'pf-bi__row' }, h('div', { dir: 'ltr' }, chart),
        h('ul', { class: 'pf-bi__share' }, ...t.ch.map((c, i) => { const li = h('li', {}, h('small', {}, c), h('span', {}, h('i')), h('b', {}, share[i] + '%')); li.style.setProperty('--w', share[i] + '%'); return li; }))))), 'pf-browser--dark');
  live(root, () => {
    replay(root, 'is-run');
    kp.forEach(([b, v, u]) => {
      const t0 = performance.now();
      const step = (now) => { const p = Math.min(1, (now - t0) / 1200); const e = 1 - Math.pow(1 - p, 3); b.textContent = u === 'sar' ? money(Math.round(v * e)) : num(v * e); if (p < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    });
  }, 7000);
  return root;
}

function landingPage() {
  const t = L({ ar: { tag: 'الجمعة البيضاء', h: 'خصومات حتى 30% على غرف النوم', sub: '72 ساعة فقط · تقسيط بدون فوائد', d: 'يوم', hr: 'ساعة', m: 'دقيقة', s: 'ثانية', name: 'الاسم', ph: 'رقم الجوال', cta: 'احجز عرضك', ok: '✓ تم! سنتواصل معك على واتساب', leads: 'طلب اليوم' }, en: { tag: 'White Friday', h: 'Up to 30% off bedrooms', sub: '72 hours only · interest-free instalments', d: 'days', hr: 'hrs', m: 'min', s: 'sec', name: 'Name', ph: 'Mobile', cta: 'Claim the offer', ok: '✓ Done! We’ll reach you on WhatsApp', leads: 'requests today' } });
  const nums = [h('b', {}, '02'), h('b', {}, '14'), h('b', {}, '37'), h('b', {}, '09')];
  const units = [t.d, t.hr, t.m, t.s];
  const ok = h('div', { class: 'pf-lp__ok' }, t.ok);
  const count = h('b', {}, '184');
  const root = browser('dar-living.sa/white-friday', h('div', { class: 'pf-lp' },
    pic('bed-hotel', 'pf-lp__bg'),
    h('div', { class: 'pf-lp__copy' },
      h('span', { class: 'pf-lp__tag' }, t.tag), h('h4', {}, t.h), h('p', {}, t.sub),
      h('div', { class: 'pf-lp__timer', dir: 'ltr' }, ...nums.map((n, i) => h('span', {}, n, h('small', {}, units[i])))),
      h('div', { class: 'pf-lp__form' }, h('span', {}, t.name), h('span', { dir: 'ltr' }, '+966 5• ••• ••••'), h('b', {}, t.cta)),
      h('small', { class: 'pf-lp__count' }, '🔥 ', count, ' ', t.leads)),
    ok));
  let sec = 2 * 86400 + 14 * 3600 + 37 * 60 + 9, n = 184, k = 0;
  live(root, () => {
    sec--; k++;
    const v = [Math.floor(sec / 86400), Math.floor(sec / 3600) % 24, Math.floor(sec / 60) % 60, sec % 60];
    nums.forEach((el, i) => { el.textContent = String(v[i]).padStart(2, '0'); });
    if (k % 4 === 0) { n++; count.textContent = String(n); replay(ok, 'is-in'); }
  }, 1000);
  return root;
}

const wrapCover = (fn, url, cls) => browser(url, fn(), cls);

/* ---------- Projects ---------- */
const PROJECTS = [
  { brand: 'Dar Living', view: () => wrapCover(SHOWCASES.showroom, 'dar-living.sa', 'pf-browser--cover'), tags: ['3D', 'WebGL', 'WhatsApp', 'AR/EN'],
    ar: ['معرض أثاث ثلاثي الأبعاد', 'موقع 3D', 'العميل يُدير الكنبة، ويغيّر القماش، ويحجز زيارة المعرض أو يطلب السعر على واتساب بضغطة. وحجوزات الزيارة تصل من مدن المملكة كلها.'],
    en: ['3D furniture showroom', '3D website', 'Customers spin the sofa, switch the fabric and book a visit or ask for a price on WhatsApp in one tap, with bookings from cities across the Kingdom.'] },
  { brand: 'Bayt Alreem', view: storyCampaign, tags: ['Instagram', 'Stories', 'Meta Ads'],
    ar: ['حملة ستوري لموسم الزواج', 'إعلانات', 'ستوريز بصور AI لغرف كاملة، موجّهة للعرسان في الرياض وجدة، ولوحة متابعة تُظهر الاستفسارات وتكلفتها مباشرة.'],
    en: ['Wedding-season story campaign', 'Ads', 'Stories with AI room scenes aimed at newly-weds in Riyadh and Jeddah, with a live board of enquiries and their cost.'] },
  { brand: 'Magmafy Research', view: marketReport, tags: ['Research', 'Pricing', 'Competitors'],
    ar: ['تقرير منافسين لثلاث مدن', 'دراسة السوق', 'أسعار ونشر وزمن رد المنافسين في الرياض وجدة والدمام، مع الفجوات التي نكسب منها وخطة 90 يومًا.'],
    en: ['Competitor report for three cities', 'Market research', 'Competitors’ prices, posting and reply times in Riyadh, Jeddah and Dammam, with the gaps to win and a 90-day plan.'] },
  { brand: 'Bayt Alreem', view: commentAutomation, tags: ['Instagram', 'DMs', 'Automation'],
    ar: ['من تعليق إلى موعد زيارة', 'أتمتة الرسائل', 'أحد يكتب «كم السعر؟» تحت المنشور، فيصله الرد مع خيارات التقسيط وموعد الزيارة في الخاص خلال ثانيتين.'],
    en: ['From a comment to a showroom visit', 'DM automation', 'Someone asks “price?” under a post and gets the price, instalments and a visit slot by DM within two seconds.'] },
  { brand: 'Maskan', view: shopTheLook, tags: ['Store', 'Shop the look', 'UX'],
    ar: ['متجر «تسوّق الإطلالة»', 'متجر إلكتروني', 'اضغط على القطعة داخل صورة الغرفة وأضفها للسلة مباشرة: إلهام ومتجر في مكان واحد.'],
    en: ['“Shop the look” store', 'Online store', 'Tap a piece inside the room photo and add it to the cart: inspiration and store in one place.'] },
  { brand: 'Nukhba Office', view: () => wrapCover(SHOWCASES.ads, 'ads.magmafy.com', 'pf-browser--cover pf-browser--dark'), tags: ['Snapchat', 'LinkedIn', 'B2B'],
    ar: ['حملة أثاث مكتبي للشركات', 'إعلانات B2B', 'استهداف مدراء المشتريات ورواد الأعمال على سناب ولينكدإن، وكل استفسار يُتابع حتى زيارة المعرض.'],
    en: ['Office furniture campaign for companies', 'B2B ads', 'Targeting procurement managers and founders on Snapchat and LinkedIn, with every enquiry followed up to the showroom visit.'] },
  { brand: 'Dar Living', view: landingPage, tags: ['Landing page', 'White Friday', 'Leads'],
    ar: ['صفحة هبوط للجمعة البيضاء', 'صفحة هبوط', 'عرض واضح، عدّاد تنازلي ونموذج من حقلين: الطلبات تصل مباشرة إلى واتساب فريق المبيعات.'],
    en: ['White Friday landing page', 'Landing page', 'A clear offer, a countdown and a two-field form: requests go straight to the sales team on WhatsApp.'] },
  { brand: 'Magmafy Reports', view: growthDashboard, tags: ['Salla', 'Meta', 'Snapchat', 'Reports'],
    ar: ['لوحة المبيعات والتسويق', 'التقارير', 'المتجر والإعلانات والزيارات في لوحة واحدة: المبيعات والقنوات وتكلفة كل نتيجة في نظرة.'],
    en: ['Sales & marketing dashboard', 'Reporting', 'Store, ads and visits on one board: sales, channels and cost per result at a glance.'] },
  { brand: 'Bayt Alreem', view: () => wrapCover(SHOWCASES.social, 'instagram.com/bayt.alreem', 'pf-browser--cover'), tags: ['Instagram', 'AI Reels', 'Content'],
    ar: ['محتوى إنستجرام بالذكاء الاصطناعي', 'محتوى', 'صور جوال تحوّلت إلى شبكة منشورات متناسقة وريلز موسمية، والمتابعون والحفظ يرتفعون كل أسبوع.'],
    en: ['AI Instagram content', 'Content', 'Phone photos turned into a consistent grid and seasonal reels, with followers and saves rising every week.'] }
];

export function portfolioStage() {
  const ui = L(UI);
  const n = PROJECTS.length;
  const rtl = isRTL();
  const slides = PROJECTS.map((p, i) => {
    const [title, cat, text] = L({ ar: p.ar, en: p.en });
    return h('article', { class: 'pf-slide' + (i === 0 ? ' is-active' : ''), 'aria-roledescription': 'slide', 'aria-label': (i + 1) + ' ' + ui.of + ' ' + n + ': ' + p.brand },
      h('div', { class: 'pf-info' },
        h('span', { class: 'pf-num' }, String(i + 1).padStart(2, '0'), h('small', {}, ' / ' + n)),
        h('span', { class: 'pf-cat' }, cat + ' · ' + ui.sample),
        h('h2', { class: 'pf-title' }, h('b', {}, p.brand), h('span', {}, title)),
        h('p', { class: 'pf-text' }, text),
        h('ul', { class: 'tags' }, ...p.tags.map((t) => h('li', {}, t)))),
      h('div', { class: 'pf-device' }, p.view()));
  });
  const dots = slides.map((_, i) => h('button', { type: 'button', class: 'pf-dot', 'aria-label': String(i + 1), 'aria-current': String(i === 0) }));
  const prev = h('button', { type: 'button', class: 'pf-nav pf-nav--prev', 'aria-label': ui.prev }, rtl ? '→' : '←');
  const next = h('button', { type: 'button', class: 'pf-nav pf-nav--next', 'aria-label': ui.next }, rtl ? '←' : '→');
  const bar = h('i');
  const stage = h('div', { class: 'pf-stage' },
    h('div', { class: 'pf-slides' }, ...slides),
    h('div', { class: 'pf-controls' }, prev, h('div', { class: 'pf-dots' }, ...dots), next),
    h('div', { class: 'pf-progress', 'aria-hidden': 'true' }, bar),
    h('p', { class: 'pf-hint' }, '↓ ' + ui.scroll));
  const section = h('section', { class: 'pf', 'aria-label': ui.eyebrow }, stage);

  let cur = 0, st = null;
  function show(i, fromScroll) {
    i = Math.max(0, Math.min(n - 1, i));
    if (i === cur) return;
    const forward = i > cur;
    const dir = cur % 2 === 0 ? 1 : -1; // wave alternates sides
    const old = slides[cur], nu = slides[i];
    slides.forEach((s) => s.classList.remove('is-leaving', 'to-right', 'to-left', 'from-right', 'from-left'));
    old.classList.remove('is-active');
    old.classList.add('is-leaving', dir > 0 ? 'to-right' : 'to-left');
    nu.classList.add(dir > 0 ? 'from-left' : 'from-right');
    void nu.offsetWidth;
    nu.classList.add('is-active');
    requestAnimationFrame(() => nu.classList.remove('from-left', 'from-right'));
    setTimeout(() => old.classList.remove('is-leaving', 'to-right', 'to-left'), 900);
    window.dispatchEvent(new CustomEvent('mg:scene', { detail: { shape: 'wave', x: dir * (forward ? 2.4 : -2.4), y: 0, scale: 1.25, opacity: 0.85 } }));
    cur = i;
    dots.forEach((d, k) => d.setAttribute('aria-current', String(k === i)));
    bar.style.setProperty('transform', 'scaleX(' + (i + 1) / n + ')');
    if (!fromScroll && st) window.scrollTo({ top: st.start + ((st.end - st.start) * i) / (n - 1), behavior: reduced ? 'auto' : 'smooth' });
  }
  bar.style.setProperty('transform', 'scaleX(' + 1 / n + ')');
  prev.addEventListener('click', () => show(cur - 1));
  next.addEventListener('click', () => show(cur + 1));
  dots.forEach((d, i) => d.addEventListener('click', () => show(i)));
  stage.addEventListener('keydown', (e) => {
    const fwd = rtl ? 'ArrowLeft' : 'ArrowRight', back = rtl ? 'ArrowRight' : 'ArrowLeft';
    if (e.key === fwd) show(cur + 1);
    if (e.key === back) show(cur - 1);
  });

  // Scroll-driven pinning once GSAP is ready (main.js calls this after registering ScrollTrigger).
  section.initScroll = (ScrollTrigger) => {
    if (!ScrollTrigger || reduced) return;
    st = ScrollTrigger.create({
      trigger: section, pin: stage, start: 'top top', end: () => '+=' + window.innerHeight * 0.8 * (n - 1),
      snap: { snapTo: 1 / (n - 1), duration: { min: 0.2, max: 0.6 }, delay: 0.05, ease: 'power1.inOut' },
      onUpdate: (self) => show(Math.round(self.progress * (n - 1)), true),
      onEnter: () => window.dispatchEvent(new CustomEvent('mg:scene', { detail: { shape: 'wave', x: 0, y: 0, scale: 1.25, opacity: 0.7 } }))
    });
  };
  section.dataset.pfStage = '';
  return section;
}
