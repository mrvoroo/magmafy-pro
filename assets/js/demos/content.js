// Content & ads page: an AI photo studio (before / after), a seasonal content calendar,
// an ad preview studio with a budget planner and a filterable monthly report. Sample data.
import { h, icon, L, section, phone, onVisible, money, num, countTo, reduced, compareItems, showPair } from './kit.js';

const IMG = 'assets/img/f/';
const pic = (f, cls = '') => h('img', { src: IMG + f + '.webp', alt: '', class: cls, loading: 'lazy', decoding: 'async' });

const T = {
  demo: { ar: 'تجربة حية · بيانات توضيحية', en: 'Live demo · sample data' },
  studio: {
    eyebrow: { ar: 'استوديو الصور بالذكاء الاصطناعي', en: 'AI photo studio' },
    title: { ar: 'صورة جوال من المخزن، ومشهد يبيع.', en: 'A phone photo from the warehouse, a scene that sells.' },
    text: { ar: 'نحافظ على شكل القطعة وخامتها ولونها بالضبط، ونغيّر المكان والإضاءة فقط. اسحب الخط لتقارن.', en: 'We keep the piece’s exact shape, material and colour and change only the room and the light. Drag the line to compare.' },
    before: { ar: 'قبل · صورة جوال', en: 'Before · phone photo' },
    after: { ar: 'بعد · مشهد AI', en: 'After · AI scene' },
    ai: { ar: 'مشهد مولَّد بالذكاء الاصطناعي', en: 'AI-generated scene' },
    kept: { ar: ['نفس الشكل', 'نفس الخامة', 'نفس اللون', 'إفصاح واضح أنه AI'], en: ['Same shape', 'Same material', 'Same colour', 'Clearly labelled as AI'] },
    from: { ar: 'من صورة واحدة', en: 'From one photo' },
    out: { ar: ['منشورات', 'ريلز', 'ستوريز'], en: ['posts', 'reels', 'stories'] },
    vs: { ar: [['تصوير تقليدي', '3–5 أيام · 6,000+ ر.س'], ['استوديو Magmafy', '48 ساعة · جزء من الباقة']], en: [['Traditional shoot', '3–5 days · SAR 6,000+'], ['Magmafy studio', '48 hours · part of the plan']] },
    sl: { ar: 'مقارنة قبل وبعد', en: 'Before and after comparison' }
  },
  cal: {
    eyebrow: { ar: 'تقويم المحتوى', en: 'Content calendar' },
    title: { ar: 'شهر كامل من المحتوى، مخطط على المواسم.', en: 'A full month of content, planned around the seasons.' },
    text: { ar: 'مثال لشهر نوفمبر: تجهيز للجمعة البيضاء، ريلز ومنشورات وستوريز في أفضل أوقات النشر. اضغط على أي يوم لتشاهد المنشور.', en: 'A November example: warming up for White Friday, with reels, posts and stories at the best posting times. Tap any day to see the post.' },
    month: { ar: 'نوفمبر 2026', en: 'November 2026' },
    days: { ar: ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'], en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] },
    types: { ar: { reel: 'ريل', post: 'منشور', story: 'ستوري', ad: 'إعلان' }, en: { reel: 'Reel', post: 'Post', story: 'Story', ad: 'Ad' } },
    at: { ar: 'موعد النشر', en: 'Publish at' },
    empty: { ar: 'يوم بدون نشر: نرد على الرسائل ونحلّل النتائج.', en: 'No post today: we answer messages and review results.' }
  },
  media: {
    eyebrow: { ar: 'الإعلانات المدفوعة', en: 'Paid ads' },
    title: { ar: 'المنصة الصح، بالصيغة الصح.', en: 'The right platform, in the right format.' },
    text: { ar: 'في السعودية سناب شات وتيك توك وإنستجرام أقوى من أي مكان آخر. بدّل المنصة والصيغة، وجرّب مخطط الميزانية.', en: 'In Saudi Arabia, Snapchat, TikTok and Instagram are stronger than almost anywhere. Switch platform and format, and try the budget planner.' },
    formats: { ar: ['منشور', 'ستوري', 'فيديو'], en: ['Feed', 'Story', 'Video'] },
    sponsored: { ar: 'ممول', en: 'Sponsored' },
    adText: { ar: 'صالتك تستاهل تبدأ من جديد 🧡 كنبة «جوري» بـ 4 دفعات بدون فوائد، وتوصيل وتركيب مجاني في الرياض.', en: 'Your living room deserves a fresh start 🧡 The “Joury” sofa in 4 interest-free payments, with free delivery and assembly in Riyadh.' },
    cta: { ar: 'احجز زيارة', en: 'Book a visit' },
    budget: { ar: 'مخطط الميزانية', en: 'Budget planner' },
    monthly: { ar: 'الميزانية الشهرية', en: 'Monthly budget' },
    goal: { ar: 'الهدف', en: 'Goal' },
    goals: { ar: ['زيارات المعرض', 'رسائل واتساب', 'مبيعات المتجر'], en: ['Showroom visits', 'WhatsApp messages', 'Store sales'] },
    reach: { ar: 'الوصول المتوقع', en: 'Estimated reach' },
    results: { ar: 'النتائج المتوقعة', en: 'Estimated results' },
    disclaimer: { ar: 'حساب توضيحي مبني على متوسطات السوق السعودي، وليس ضمانًا للنتائج.', en: 'Illustrative estimate based on Saudi market averages, not a guarantee of results.' }
  },
  report: {
    eyebrow: { ar: 'التقرير الشهري', en: 'Monthly report' },
    title: { ar: 'نقيس الاستفسارات والزيارات، لا الإعجابات.', en: 'We measure enquiries and visits, not likes.' },
    text: { ar: 'كل شهر تستلم تقريرًا واضحًا: كم استفسارًا، كم زيارة للمعرض، كم طلبًا، وبكم كلّفت كل نتيجة. جرّب الفلاتر.', en: 'Every month you get a clear report: how many enquiries, showroom visits and orders, and what each result cost. Try the filters.' },
    period: { ar: 'الفترة', en: 'Period' },
    days: { ar: ['7 أيام', '30 يومًا', '90 يومًا'], en: ['7 days', '30 days', '90 days'] },
    channels: { ar: 'القنوات', en: 'Channels' },
    kpis: { ar: ['استفسارات', 'زيارات المعرض', 'طلبات', 'تكلفة الاستفسار'], en: ['Enquiries', 'Showroom visits', 'Orders', 'Cost / enquiry'] },
    byChannel: { ar: 'الاستفسارات حسب القناة', en: 'Enquiries by channel' },
    spend: { ar: 'الصرف', en: 'Spend' },
    sources: { ar: 'مصادر البيانات', en: 'Data sources' },
    auto: { ar: 'يصلك كل أحد تلقائيًا على البريد وواتساب', en: 'Sent automatically every Sunday by email and WhatsApp' }
  }
};

/* ---------------- 1. AI photo studio ---------------- */
function studio() {
  const items = compareItems();
  if (!items.length) return null;
  const before = h('img', { src: items[0].before, alt: '', loading: 'lazy', decoding: 'async' }), after = h('img', { src: items[0].after, alt: '', loading: 'lazy', decoding: 'async' });
  showPair(before, after, items[0]);
  const wrap = h('div', { class: 'jx-compare studio__compare', role: 'slider', tabindex: '0', 'aria-label': L(T.studio.sl), 'aria-valuemin': '0', 'aria-valuemax': '100', dir: 'ltr' },
    h('div', { class: 'jx-layer jx-layer--old' }, before),
    h('div', { class: 'jx-layer jx-layer--new' }, after, h('span', { class: 'jx-aimark' }, '✦ ' + L(T.studio.ai))),
    h('div', { class: 'jx-handle', 'aria-hidden': 'true' }, h('span', {}, '⟷')),
    h('span', { class: 'jx-ba jx-ba--l' }, L(T.studio.before)), h('span', { class: 'jx-ba jx-ba--r' }, L(T.studio.after)));
  let raf = 0, drag = false;
  const set = (p) => { p = Math.max(0, Math.min(100, p)); wrap.style.setProperty('--pos', p + '%'); wrap.setAttribute('aria-valuenow', String(Math.round(p))); };
  const fromX = (e) => { const r = wrap.getBoundingClientRect(); set(((e.clientX - r.left) / r.width) * 100); };
  wrap.addEventListener('pointerdown', (e) => { cancelAnimationFrame(raf); drag = true; wrap.setPointerCapture(e.pointerId); fromX(e); });
  wrap.addEventListener('pointermove', (e) => { if (drag) fromX(e); });
  wrap.addEventListener('pointerup', () => { drag = false; });
  wrap.addEventListener('keydown', (e) => {
    const v = Number(wrap.getAttribute('aria-valuenow'));
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); cancelAnimationFrame(raf); set(v + (e.key === 'ArrowRight' ? 5 : -5)); }
  });
  const intro = () => {
    if (reduced) { set(50); return; }
    const t0 = performance.now();
    const ease = (t) => 1 - Math.pow(1 - t, 3);
    const step = (now) => {
      const t = (now - t0) / 1000;
      if (t < 0.3) set(100); else if (t < 1.8) set(100 - 100 * ease((t - 0.3) / 1.5)); else set(50 * ease(Math.min(1, (t - 2) / 1)));
      if (t < 3 && wrap.isConnected) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  };
  const outs = [6, 3, 12].map(() => h('strong', {}, '0'));
  const count = () => [6, 3, 12].forEach((v, i) => { outs[i].dataset.v = 0; countTo(outs[i], v); });
  const tabs = h('div', { class: 'jx-chips', role: 'group' }, ...items.map((p, i) => {
    const b = h('button', { type: 'button', class: 'jx-chip', 'aria-pressed': String(i === 0) }, p.name);
    b.addEventListener('click', () => {
      [...tabs.children].forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      showPair(before, after, p);
      cancelAnimationFrame(raf); intro(); count();
    });
    return b;
  }));
  set(100);
  const box = h('div', { class: 'studio', 'data-reveal': '' },
    wrap,
    h('div', { class: 'studio__side panel' },
      items.length > 1 ? tabs : null,
      h('ul', { class: 'check-list' }, ...L(T.studio.kept).map((k) => h('li', {}, icon('check', 16), k))),
      h('p', { class: 'panel__title' }, L(T.studio.from)),
      h('div', { class: 'studio__outs' }, ...L(T.studio.out).map((o, i) => h('div', { class: 'kpi' }, outs[i], h('span', { class: 'kpi__label' }, o)))),
      h('ul', { class: 'studio__vs' }, ...L(T.studio.vs).map(([a, b], i) => h('li', { class: i ? 'is-us' : '' }, h('small', {}, a), h('b', {}, b))))));
  let done = false;
  onVisible(box, () => { if (!done) { done = true; intro(); count(); } });
  return section({ id: 'demo-studio', eyebrow: L(T.studio.eyebrow), title: L(T.studio.title), text: L(T.studio.text), badge: L(T.demo) }, box);
}

/* ---------------- 2. Content calendar ---------------- */
const POSTS = {
  2: ['reel', 'living-boho', '20:30', { ar: 'جولة 15 ثانية في ركن «بوهو» الجديد 🌿', en: 'A 15-second tour of the new “Boho” corner 🌿' }],
  4: ['post', 'living-cream', '21:00', { ar: '3 أفكار تخلّي صالتك أوسع بدون ما تغيّر الأثاث', en: '3 ideas to make your living room feel bigger without new furniture' }],
  6: ['story', 'chair-yellow', '22:00', { ar: 'استفتاء: أصفر ولا أخضر؟ 💛💚', en: 'Poll: yellow or green? 💛💚' }],
  9: ['reel', 'bed-velvet', '20:30', { ar: 'قبل وبعد: غرفة نوم عرسان بلمسة مخمل', en: 'Before & after: a newly-wed bedroom with a velvet touch' }],
  11: ['post', 'dining', '21:00', { ar: 'سفرة 8 أشخاص لعزايم الشتاء 🍽️', en: 'An 8-seat dining set for winter gatherings 🍽️' }],
  13: ['story', 'sofa-green', '22:00', { ar: 'خلف الكواليس: كيف نختار القماش', en: 'Behind the scenes: how we pick fabrics' }],
  16: ['reel', 'interior-sun', '20:30', { ar: 'شمس الصباح في صالة الرياض 🌤️', en: 'Morning sun in a Riyadh living room 🌤️' }],
  18: ['ad', 'living-soft', '19:00', { ar: 'إعلان تشويقي: الجمعة البيضاء قربت…', en: 'Teaser ad: White Friday is coming…' }],
  20: ['post', 'decor-corner', '21:00', { ar: 'ركن قهوة في 1 متر مربع ☕', en: 'A coffee corner in one square metre ☕' }],
  23: ['reel', 'living-teal', '20:30', { ar: 'العدّ التنازلي بدأ: 4 أيام على الجمعة البيضاء', en: 'Countdown: 4 days to White Friday' }],
  25: ['story', 'bed-hotel', '22:00', { ar: 'قائمة الانتظار: سجّل وأول من يعرف الأسعار', en: 'Waitlist: sign up and be first to see prices' }],
  27: ['ad', 'sofa-orange', '12:00', { ar: 'الجمعة البيضاء: حتى 30% وتقسيط بدون فوائد', en: 'White Friday: up to 30% off, interest-free instalments' }],
  28: ['story', 'living-green', '21:00', { ar: 'آخر القطع المتوفرة بالخصم ⏳', en: 'Last discounted pieces left ⏳' }],
  30: ['post', 'living-calm', '21:00', { ar: 'شكرًا لكم ❤️ صور بيوت عملائنا الجديدة', en: 'Thank you ❤️ photos from our customers’ new homes' }]
};

function calendar() {
  const types = L(T.cal.types);
  const preview = h('div', { class: 'cal__preview', 'aria-live': 'polite' });
  const first = new Date(2026, 10, 1).getDay(); // weekday of 1 November 2026
  const cells = [];
  for (let i = 0; i < first; i++) cells.push(h('span', { class: 'cal__blank' }));
  const btns = [];
  for (let d = 1; d <= 30; d++) {
    const p = POSTS[d];
    const b = h('button', { type: 'button', class: 'cal__day' + (p ? ' has-' + p[0] : '') + (d === 27 ? ' is-peak' : ''), 'aria-pressed': 'false' },
      h('b', {}, String(d)), p ? h('small', {}, types[p[0]]) : null);
    b.addEventListener('click', () => show(d));
    btns[d] = b; cells.push(b);
  }
  function show(d) {
    btns.forEach((b, k) => b && b.setAttribute('aria-pressed', String(k === d)));
    const p = POSTS[d];
    if (!p) { preview.replaceChildren(h('p', { class: 'cal__empty' }, d + ' · ' + L(T.cal.empty))); return; }
    const [type, img, at, cap] = p;
    preview.replaceChildren(phone(h('div', { class: 'post cal__post cal__post--' + type },
      h('div', { class: 'post__head' }, h('span', { class: 'post__avatar cal__av' }, 'DL'), h('b', {}, 'dar.living'), h('small', {}, types[type])),
      h('div', { class: 'post__img' }, pic(img), type === 'reel' ? h('i', { class: 'ad__play' }, '▶') : null),
      h('p', { class: 'post__text' }, L(cap)),
      h('p', { class: 'cal__at' }, '🕘 ' + L(T.cal.at) + ' ', h('b', { dir: 'ltr' }, at)))));
  }
  show(9);
  const legend = h('div', { class: 'cal__legend' }, ...Object.keys(types).map((k) => h('span', { class: 'has-' + k }, h('i'), types[k])));
  const box = h('div', { class: 'cal', 'data-reveal': '' },
    h('div', { class: 'cal__board panel' },
      h('div', { class: 'cal__top' }, h('b', {}, L(T.cal.month)), legend),
      h('div', { class: 'cal__grid' }, ...L(T.cal.days).map((d) => h('span', { class: 'cal__dow' }, d)), ...cells)),
    preview);
  return section({ id: 'demo-calendar', eyebrow: L(T.cal.eyebrow), title: L(T.cal.title), text: L(T.cal.text), badge: L(T.demo) }, box);
}

/* ---------------- 3. Ads studio + budget planner ---------------- */
const PLATFORMS = [
  { k: 'snap', n: 'Snapchat', sub: { ar: 'ستوري · إعلانات المجموعة', en: 'Story · Collection ads' }, c: '#feda75', share: [0.35, 0.3, 0.25], cpm: 9 },
  { k: 'meta', n: 'Instagram', sub: { ar: 'ريلز · ستوري · منشورات', en: 'Reels · Stories · Feed' }, c: '#d62976', share: [0.3, 0.35, 0.3], cpm: 14 },
  { k: 'tiktok', n: 'TikTok', sub: { ar: 'إعلانات Spark · فيديو', en: 'Spark Ads · In-feed' }, c: '#fa7e1e', share: [0.2, 0.2, 0.2], cpm: 8 },
  { k: 'google', n: 'Google', sub: { ar: 'البحث · خرائط · يوتيوب', en: 'Search · Maps · YouTube' }, c: '#4f5bd5', share: [0.15, 0.15, 0.25], cpm: 18 }
];

function media() {
  let plat = 0, fmt = 0;
  const ad = h('div', { class: 'ad' });
  function drawAd() {
    const p = PLATFORMS[plat];
    ad.className = 'ad ad--' + ['feed', 'story', 'reel'][fmt] + ' ad--' + p.k;
    ad.replaceChildren(
      h('div', { class: 'ad__top' }, h('span', { class: 'post__avatar cal__av' }, 'DL'), h('span', {}, h('b', {}, 'dar.living'), h('small', {}, L(T.media.sponsored) + ' · ' + p.n))),
      h('div', { class: 'ad__media' }, pic(fmt ? 'living-boho' : 'sofa-orange'), fmt ? h('i', { class: 'ad__play' }, '▶') : null),
      h('p', { class: 'ad__text' }, L(T.media.adText)),
      h('span', { class: 'ad__cta' }, L(T.media.cta), icon('arrow', 14)));
  }
  const platTabs = h('div', { class: 'media__plats', role: 'group' }, ...PLATFORMS.map((p, i) => {
    const b = h('button', { type: 'button', class: 'rep__chip', 'aria-pressed': String(i === 0) }, h('i'), p.n);
    b.querySelector('i').style.setProperty('--c', p.c);
    b.addEventListener('click', () => { plat = i; [...platTabs.children].forEach((x, k) => x.setAttribute('aria-pressed', String(k === i))); drawAd(); });
    return b;
  }));
  const fmtTabs = h('div', { class: 'seg seg--3', role: 'group' }, ...L(T.media.formats).map((f, i) => {
    const b = h('button', { type: 'button', class: 'seg__btn', 'aria-pressed': String(i === 0) }, f);
    b.addEventListener('click', () => { fmt = i; [...fmtTabs.children].forEach((x, k) => x.setAttribute('aria-pressed', String(k === i))); drawAd(); });
    return b;
  }));
  drawAd();

  const budget = h('input', { type: 'range', min: '3000', max: '60000', step: '1000', value: '12000', class: 'range', 'aria-label': L(T.media.monthly) });
  const budgetVal = h('strong', { class: 'planner__budget' });
  let goal = 0;
  const goalSeg = h('div', { class: 'seg seg--3', role: 'group', 'aria-label': L(T.media.goal) }, ...L(T.media.goals).map((g, i) => {
    const b = h('button', { type: 'button', class: 'seg__btn', 'aria-pressed': String(i === 0) }, g);
    b.addEventListener('click', () => { goal = i; [...goalSeg.children].forEach((x, k) => x.setAttribute('aria-pressed', String(k === i))); plan(); });
    return b;
  }));
  const alloc = h('div', { class: 'planner__alloc' });
  const reachEl = h('strong', { class: 'planner__reach', dir: 'ltr' });
  const resEl = h('strong', { class: 'planner__reach' });
  const COST = [140, 32, 260]; // SAR per visit / message / sale
  function plan() {
    const b = Number(budget.value);
    budgetVal.textContent = money(b);
    let reach = 0;
    alloc.replaceChildren(...PLATFORMS.map((p) => {
      const amt = b * p.share[goal];
      reach += (amt / p.cpm) * 1000 * 0.5;
      const bar = h('span', { class: 'rep__bar' }, h('i'));
      bar.firstChild.style.setProperty('--w', (p.share[goal] * 100 / 0.35).toFixed(1) + '%');
      bar.firstChild.style.setProperty('--c', p.c);
      return h('div', { class: 'rep__row' }, h('span', {}, p.n), bar, h('b', {}, money(Math.round(amt / 10) * 10)));
    }));
    const r = (x) => Math.round(x / 1000) * 1000;
    reachEl.textContent = num(r(reach * 0.8)) + ' – ' + num(r(reach * 1.2));
    const res = b / COST[goal];
    resEl.replaceChildren(h('span', { dir: 'ltr' }, num(Math.round(res * 0.75)) + ' – ' + num(Math.round(res * 1.2))), ' ' + L(T.media.goals)[goal].split(' ')[0]);
  }
  budget.addEventListener('input', plan);
  plan();

  const grid = h('ul', { class: 'plat-grid' }, ...PLATFORMS.map((p) => {
    const li = h('li', { class: 'plat', 'data-reveal': '', 'data-tilt': '' }, h('span', { class: 'plat__dot' }), h('b', {}, p.n), h('small', {}, L(p.sub)));
    li.querySelector('.plat__dot').style.setProperty('--c', p.c);
    return li;
  }));
  return section({ id: 'demo-media', eyebrow: L(T.media.eyebrow), title: L(T.media.title), text: L(T.media.text), badge: L(T.demo) },
    grid,
    h('div', { class: 'media', 'data-reveal': '' },
      h('div', { class: 'media__studio' }, platTabs, fmtTabs, h('div', { class: 'media__stage' }, ad)),
      h('div', { class: 'planner panel' },
        h('p', { class: 'panel__title' }, L(T.media.budget)),
        h('label', { class: 'planner__row' }, h('span', {}, L(T.media.monthly)), budgetVal),
        budget,
        h('p', { class: 'panel__title' }, L(T.media.goal)), goalSeg,
        alloc,
        h('div', { class: 'planner__result' }, h('small', {}, L(T.media.reach)), reachEl),
        h('div', { class: 'planner__result' }, h('small', {}, L(T.media.results)), resEl),
        h('p', { class: 'chat__privacy' }, L(T.media.disclaimer)))));
}

/* ---------------- 4. Monthly report ---------------- */
function report() {
  const CH = [
    { k: 'snap', n: 'Snapchat', c: '#feda75', base: [210, 64, 21, 3600] },
    { k: 'ig', n: 'Instagram', c: '#d62976', base: [180, 58, 24, 4100] },
    { k: 'tt', n: 'TikTok', c: '#fa7e1e', base: [150, 31, 11, 2600] },
    { k: 'g', n: 'Google', c: '#4f5bd5', base: [90, 47, 18, 3300] }
  ];
  const on = new Set(CH.map((c) => c.k));
  const factor = [0.24, 1, 3.1];
  let period = 1;
  const names = L(T.report.kpis);
  const kpi = names.map(() => h('strong', {}, '0'));
  const bars = h('div', { class: 'rep__bars' });
  const rows = h('tbody');
  const chips = h('div', { class: 'rep__chips', role: 'group', 'aria-label': L(T.report.channels) }, ...CH.map((c) => {
    const b = h('button', { type: 'button', class: 'rep__chip', 'aria-pressed': 'true' }, h('i'), c.n);
    b.querySelector('i').style.setProperty('--c', c.c);
    b.addEventListener('click', () => { if (on.has(c.k) && on.size > 1) on.delete(c.k); else on.add(c.k); b.setAttribute('aria-pressed', String(on.has(c.k))); calc(); });
    return b;
  }));
  const per = h('div', { class: 'seg seg--3', role: 'group', 'aria-label': L(T.report.period) }, ...L(T.report.days).map((d, i) => {
    const b = h('button', { type: 'button', class: 'seg__btn', 'aria-pressed': String(i === 1) }, d);
    b.addEventListener('click', () => { period = i; [...per.children].forEach((x, k) => x.setAttribute('aria-pressed', String(k === i))); calc(); });
    return b;
  }));
  function calc() {
    const f = factor[period], act = CH.filter((c) => on.has(c.k));
    const sum = (i) => act.reduce((a, c) => a + c.base[i] * f, 0);
    countTo(kpi[0], sum(0)); countTo(kpi[1], sum(1)); countTo(kpi[2], sum(2));
    countTo(kpi[3], sum(3) / sum(0), { format: (v) => money(v) });
    const max = Math.max(...CH.map((c) => c.base[0] * f));
    bars.replaceChildren(...CH.map((c) => {
      const v = on.has(c.k) ? c.base[0] * f : 0;
      const bar = h('span', { class: 'rep__bar' }, h('i'));
      bar.firstChild.style.setProperty('--w', (v / max * 100).toFixed(1) + '%');
      bar.firstChild.style.setProperty('--c', c.c);
      return h('div', { class: 'rep__row' + (on.has(c.k) ? '' : ' is-off') }, h('span', {}, c.n), bar, h('b', {}, num(Math.round(v))));
    }));
    rows.replaceChildren(...act.map((c) => h('tr', {}, h('td', {}, c.n), h('td', {}, money(Math.round(c.base[3] * f))), h('td', {}, num(Math.round(c.base[0] * f))), h('td', {}, num(Math.round(c.base[1] * f))), h('td', {}, money(c.base[3] / c.base[0])))));
  }
  calc();
  const box = h('div', { class: 'report', 'data-reveal': '' },
    h('div', { class: 'rep__sources' },
      h('p', { class: 'panel__title' }, L(T.report.sources)),
      h('ul', {}, ...['Snapchat Ads', 'Meta Ads', 'TikTok Ads', 'Google Ads', L({ ar: 'سلة / زد', en: 'Salla / Zid' }), 'WhatsApp Business'].map((s) => h('li', {}, h('i', { class: 'online' }), s))),
      h('div', { class: 'rep__pipe', 'aria-hidden': 'true' }, h('span'), h('span'), h('span'))),
    h('div', { class: 'report__canvas' },
      h('div', { class: 'report__filters' }, h('div', {}, h('p', { class: 'panel__title' }, L(T.report.channels)), chips), h('div', {}, h('p', { class: 'panel__title' }, L(T.report.period)), per)),
      h('div', { class: 'report__kpis' }, ...names.map((n, i) => h('div', { class: 'kpi' }, h('span', { class: 'kpi__label' }, n), kpi[i]))),
      h('div', { class: 'report__grid' },
        h('div', { class: 'panel' }, h('p', { class: 'panel__title' }, L(T.report.byChannel)), bars),
        h('div', { class: 'panel rep__table-wrap' }, h('table', { class: 'rep__table' },
          h('thead', {}, h('tr', {}, ...['', L(T.report.spend), names[0], names[1], names[3]].map((x) => h('th', { scope: 'col' }, x)))), rows))),
      h('p', { class: 'report__auto' }, icon('mail', 16), L(T.report.auto))));
  return section({ id: 'demo-report', eyebrow: L(T.report.eyebrow), title: L(T.report.title), text: L(T.report.text), badge: L(T.demo) }, box);
}

export function mount(container) {
  container.replaceChildren(...[studio(), calendar(), media(), report()].filter(Boolean));
}
