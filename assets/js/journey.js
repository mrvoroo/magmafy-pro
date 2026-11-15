// Homepage journey showcase: one example client, "Dar Living" (a small furniture showroom in
// Riyadh), followed through all six steps from a silent Instagram account to a busy showroom.
// Every step is a small live demo the visitor can play with.
import { h, icon, getLang, content } from './core.js';
import { money, num, sleep, reduced, compareItems, showPair, stepVisible, clientInfo } from './demos/kit.js';

const IMG = 'assets/img/f/';
const pic = (file, alt = '', cls = '') => h('img', { src: file.includes('/') ? file : IMG + file + '.webp', alt, class: cls, loading: 'lazy', decoding: 'async' });

const T = {
  ar: {
    client: { label: 'عميل توضيحي', name: 'دار ليفينج', desc: 'معرض أثاث عائلي صغير في الرياض منذ 2009. قطع جميلة وأسعار منافسة، لكن الحساب صامت والزوار من الحي فقط.', goal: 'الهدف: معرض مزدحم ومبيعات أونلاين في كل المملكة' },
    example: 'مثال: دار ليفينج · الرياض',
    s1: { now: 'اليوم', nowItems: ['312 متابع على إنستجرام', 'استفساران في الأسبوع', '0 زيارة معرض من السوشيال', 'آخر منشور قبل 23 يومًا'], who: 'العميل الحقيقي', next: 'الشخصية التالية', goal: 'الأهداف خلال 6 أشهر', goals: ['متجر أونلاين بعرض 3D خلال 6 أسابيع', '180 استفسارًا في الشهر', '60 زيارة معرض شهريًا'], plan: 'الخطة', planSteps: ['دراسة السوق', 'محتوى AI', 'متجر 3D', 'الرسائل', 'الإعلانات'],
      personas: [{ name: 'سارة ومحمد، 27', role: 'عرسان جدد · يجهّزون أول بيت', quote: 'نبي صالة شيك بميزانية معقولة، ونبي نشوف القطعة في بيت حقيقي قبل ما نقرر.' }, { name: 'أبو خالد، 44', role: 'عائلة تنتقل لفيلا جديدة', quote: 'أبي أأثث البيت كامل من مكان واحد، مع تقسيط وتركيب.' }, { name: 'ريم، 35', role: 'مديرة مكتب · تشتري لشركة', quote: 'أحتاج عرض سعر رسمي وتسليم سريع لـ 20 كرسي.' }],
      comp: 'المنافسون في الرياض', compRows: [['منافس أ', 'ينشر 3 مرات/أسبوع', 'يرد بعد 6 ساعات'], ['منافس ب', 'بدون موقع', 'لا يرد على التعليقات'], ['دار ليفينج + Magmafy', 'يوميًا', 'رد خلال دقائق']] },
    s2: { before: 'قبل · صورة جوال', after: 'بعد · مشهد AI', drag: 'اسحب الخط لتقارن', sl: 'مقارنة قبل وبعد', kept: ['نفس الشكل', 'نفس الخامة', 'نفس اللون'], ai: 'مشهد مولَّد بالذكاء الاصطناعي' },
    s3: { url: 'dar-living.sa', home: 'الرئيسية', shop: 'المتجر', heroT: 'بيتك الجديد يبدأ من هنا', heroP: 'أثاث مختار بعناية، توصيل وتركيب مجاني داخل الرياض.', toShop: 'تسوّق الآن', best: 'الأكثر طلبًا', add: 'أضف إلى السلة', added: 'تمت الإضافة ✓', visit: 'احجز زيارة لتجربتها', visitDone: 'تم حجز زيارتك السبت 5 م ✓', fabric: 'القماش', size: 'المقاس', back: '→ رجوع', cart: 'السلة', empty: 'سلتك فارغة.', sub: 'المجموع', ship: 'التوصيل والتركيب', free: 'مجاني', total: 'الإجمالي', checkout: 'إتمام الطلب', thanks: 'شكرًا لطلبك!', order: 'رقم الطلب', demo: 'تجربة توضيحية: لا يتم طلب أو دفع أي شيء.', again: 'متابعة التسوق', tabby: 'أو 4 دفعات بدون فوائد', view3d: '360° عرض', seats: ['3 مقاعد', 'مقعدين'] },
    s4: { trigger: 'جرّب رسالة جديدة', running: 'جارٍ…', flow: [['رسالة جديدة على إنستجرام', '«كم سعر الركنة؟» · {n}'], ['رد تلقائي خلال 40 ثانية', 'السعر + الكتالوج + خيارات التقسيط'], ['تأهيل العميل', 'المدينة: الرياض · الميزانية: 12–14 ألف'], ['حجز زيارة', 'السبت 5:00 م · فرع العليا'], ['تذكير على واتساب', '«ننتظرك بكرة الساعة 5 ☕»'], ['تحديث CRM', 'العميل ← «فرصة ساخنة»']], done: 'رسالة تمت معالجتها', saved: 'مواعيد محجوزة', manual: 'قبل الأتمتة: متوسط الرد 6 ساعات، ونصف الرسائل بدون رد.' },
    s5: { title: 'مساعد دار ليفينج', tag: 'AI', aiLabel: 'رد بالذكاء الاصطناعي', hello: 'أهلًا وسهلًا! أقدر أساعدك تلاقي القطعة المناسبة لبيتك 🛋️', note: 'تجربة توضيحية: الردود مُعدّة مسبقًا ومعلَّمة بأنها من الذكاء الاصطناعي.',
      qa: [['كم سعر الركنة؟', 'ركنة ليزي بوي بـ 12,900 ر.س، متوفرة بثلاثة ألوان، وتقدر تقسّطها على 4 دفعات بدون فوائد.', 0], ['توصلون جدة؟', 'إيه نعم، نوصّل لجدة والدمام خلال 5–7 أيام عمل، والتركيب مجاني.'], ['وين المعرض وإيش أوقاتكم؟', 'معرضنا في حي العليا بالرياض، من السبت للخميس 10 ص – 11 م، والجمعة من 4 م. تحب أحجز لك زيارة؟']],
      stats: [['3 ث', 'زمن الرد'], ['24/7', 'متاح دائمًا'], ['64%', 'أسئلة تُحل بدون موظف']] },
    s6: { month: 'الشهر بعد الإطلاق', followers: 'المتابعون', leads: 'استفسارات / شهر', visits: 'زيارات المعرض', cpl: 'تكلفة الاستفسار', ad: 'أول بيت؟ نجهّز صالتك كاملة', cta: 'احجز زيارة', sponsored: 'إعلان ممول', sample: 'أرقام توضيحية لمثال، وليست نتائج عميل حقيقي.' }
  },
  en: {
    client: { label: 'Example client', name: 'Dar Living', desc: 'A small family furniture showroom in Riyadh since 2009. Beautiful pieces, fair prices, but a silent account and visitors only from the neighbourhood.', goal: 'Goal: a busy showroom and online sales across the Kingdom' },
    example: 'Example: Dar Living · Riyadh',
    s1: { now: 'Today', nowItems: ['312 Instagram followers', '2 enquiries a week', '0 showroom visits from social', 'Last post 23 days ago'], who: 'The real customer', next: 'Next persona', goal: 'Goals in 6 months', goals: ['An online store with 3D in 6 weeks', '180 enquiries a month', '60 showroom visits a month'], plan: 'Plan', planSteps: ['Research', 'AI content', '3D store', 'DMs', 'Ads'],
      personas: [{ name: 'Sara & Mohammed, 27', role: 'Newly-weds · furnishing a first home', quote: 'We want a stylish living room on a sensible budget, and to see the piece in a real home before we decide.' }, { name: 'Abu Khalid, 44', role: 'Family moving to a new villa', quote: 'I want to furnish the whole house in one place, with instalments and assembly.' }, { name: 'Reem, 35', role: 'Office manager · buying for a company', quote: 'I need a formal quote and fast delivery for 20 chairs.' }],
      comp: 'Competitors in Riyadh', compRows: [['Competitor A', 'posts 3×/week', 'replies after 6 h'], ['Competitor B', 'no website', 'ignores comments'], ['Dar Living + Magmafy', 'daily', 'replies in minutes']] },
    s2: { before: 'Before · phone photo', after: 'After · AI scene', drag: 'Drag the line to compare', sl: 'Before and after comparison', kept: ['Same shape', 'Same material', 'Same colour'], ai: 'AI-generated scene' },
    s3: { url: 'dar-living.sa', home: 'Home', shop: 'Shop', heroT: 'Your new home starts here', heroP: 'Carefully chosen furniture, free delivery and assembly in Riyadh.', toShop: 'Shop now', best: 'Best sellers', add: 'Add to cart', added: 'Added ✓', visit: 'Book a visit to try it', visitDone: 'Visit booked: Saturday 5 PM ✓', fabric: 'Fabric', size: 'Size', back: '← Back', cart: 'Cart', empty: 'Your cart is empty.', sub: 'Subtotal', ship: 'Delivery & assembly', free: 'free', total: 'Total', checkout: 'Checkout', thanks: 'Thank you for your order!', order: 'Order no.', demo: 'Demo: nothing is ordered or paid.', again: 'Keep shopping', tabby: 'or 4 interest-free payments', view3d: '360° view', seats: ['3-seater', '2-seater'] },
    s4: { trigger: 'Try a new message', running: 'Running…', flow: [['New Instagram DM', '“How much is the recliner corner?” · {n}'], ['Auto-reply in 40 seconds', 'Price + catalogue + instalment options'], ['Lead qualified', 'City: Riyadh · Budget: SAR 12–14k'], ['Visit booked', 'Saturday 5:00 PM · Olaya branch'], ['WhatsApp reminder', '“See you tomorrow at 5 ☕”'], ['CRM updated', 'Customer → “hot lead”']], done: 'messages handled', saved: 'visits booked', manual: 'Before automation: replies took 6 hours on average, and half the messages went unanswered.' },
    s5: { title: 'Dar Living assistant', tag: 'AI', aiLabel: 'AI-generated reply', hello: 'Welcome! I can help you find the right piece for your home 🛋️', note: 'Demo: replies are prepared in advance and labelled as AI.',
      qa: [['How much is the recliner corner?', 'The Lazy Boy recliner corner is SAR 12,900, in three colours, and you can split it into 4 interest-free payments.', 0], ['Do you deliver to Jeddah?', 'Yes, we deliver to Jeddah and Dammam in 5–7 working days, with free assembly.'], ['Where is the showroom and when are you open?', 'Our showroom is in Olaya, Riyadh: Saturday to Thursday 10 AM – 11 PM, Friday from 4 PM. Shall I book you a visit?']],
      stats: [['3 s', 'reply time'], ['24/7', 'always on'], ['64%', 'questions solved without staff']] },
    s6: { month: 'Month after launch', followers: 'Followers', leads: 'Enquiries / month', visits: 'Showroom visits', cpl: 'Cost per enquiry', ad: 'First home? We furnish your whole living room', cta: 'Book a visit', sponsored: 'Sponsored', sample: 'Illustrative figures for an example, not real client results.' }
  }
};
const tx = () => T[getLang()] || T.ar;

const BASE_PRODUCTS = [
  { id: 'layan', img: 'sofa-green', price: 12900, name: { ar: 'ركنة ليزي بوي', en: 'Lazy Boy Recliner Corner' }, note: { ar: 'مخمل رمادي مزرق · مقاعد قابلة للإمالة', en: 'Blue-grey fabric · reclining seats' }, fabrics: ['#3b4a63', '#6b6f78', '#8a5a3c'] },
  { id: 'sidra', img: 'sofa-leather', price: 5900, name: { ar: 'طاولة سفرة', en: 'Dining Table' }, note: { ar: 'سطح رخام طبيعي · 4 كراسي', en: 'Natural marble top · 4 chairs' }, fabrics: ['#d6bf98', '#8d8c86'] },
  { id: 'shams', img: 'chair-yellow', price: 1450, name: { ar: 'كرسي «شمس»', en: '“Shams” armchair' }, note: { ar: 'قماش بوكليه · أرجل معدن', en: 'Bouclé · metal legs' }, fabrics: ['#e2b33b', '#d6bf98', '#25335c'] },
  { id: 'najd', img: 'bed-velvet', price: 7900, name: { ar: 'سرير «نجد»', en: '“Najd” bed' }, note: { ar: 'مخمل رمادي · 180 × 200', en: 'Grey velvet · 180 × 200' }, fabrics: ['#9a9aa0', '#d9a3a6'] }
];
// The first two products are the first two before/after pairs from the admin (AI scene + the pair's own name).
const SHOWCASE_PAIRS = ((content.showcase && content.showcase.compare) || []).filter((p) => p && p.visible !== false && p.before && p.after);
const PRODUCTS = BASE_PRODUCTS.map((p, i) => {
  const pair = i < 2 ? SHOWCASE_PAIRS[i] : null;
  return pair ? { ...p, img: pair.after, name: { ar: (pair.name && pair.name.ar) || p.name.ar, en: (pair.name && pair.name.en) || p.name.en } } : p;
});
const loc = (v) => (typeof v === 'string' ? v : v[getLang()] || v.ar);
const setVar = (el, k, v) => { el.style.setProperty(k, v); return el; };

function darMark() {
  return h('span', { class: 'jx-mark', 'aria-hidden': 'true' }, 'DL');
}

/* ---------- 01 Market research board ---------- */
function board() {
  const s = tx().s1;
  let pi = 0;
  const persona = h('div', { class: 'jx-persona' });
  const renderP = () => {
    const p = s.personas[pi];
    persona.replaceChildren(
      h('div', { class: 'jx-persona__top' }, h('span', { class: 'jx-avatar' }, p.name[0]), h('div', {}, h('b', {}, p.name), h('small', {}, p.role))),
      h('q', {}, p.quote));
    persona.classList.remove('is-in'); void persona.offsetWidth; persona.classList.add('is-in');
  };
  const next = h('button', { type: 'button', class: 'jx-link' }, s.next + (getLang() === 'ar' ? ' ←' : ' →'));
  next.addEventListener('click', () => { pi = (pi + 1) % s.personas.length; renderP(); });
  renderP();
  return h('div', { class: 'jx jx--board' },
    h('div', { class: 'jx-col jx-col--now' }, h('h4', {}, s.now), h('ul', {}, ...s.nowItems.map((t) => h('li', {}, h('span', { class: 'jx-x' }, '✕'), t)))),
    h('div', { class: 'jx-col jx-col--who' }, h('h4', {}, s.who), persona, next),
    h('div', { class: 'jx-col jx-col--goal' }, h('h4', {}, s.goal), h('ul', {}, ...s.goals.map((t) => h('li', {}, icon('check', 14), t)))),
    h('div', { class: 'jx-comp' }, h('h4', {}, s.comp),
      h('ul', {}, ...s.compRows.map((r, i) => h('li', { class: i === 2 ? 'is-us' : '' }, h('b', {}, r[0]), h('span', {}, r[1]), h('span', {}, r[2]))))),
    h('div', { class: 'jx-plan' }, h('b', {}, s.plan), ...s.planSteps.map((p, i) => h('span', {}, h('i', {}, String(i + 1)), p))));
}

/* ---------- 02 AI content: phone photo vs. AI scene ---------- */
function aiCompare() {
  const s = tx().s2;
  const items = compareItems();
  if (!items.length) return h('div', { class: 'jx jx--brand' });
  let cur = 0;
  const before = h('img', { src: items[0].before, alt: '', loading: 'lazy', decoding: 'async' }), after = h('img', { src: items[0].after, alt: '', loading: 'lazy', decoding: 'async' });
  showPair(before, after, items[0]);
  const wrap = h('div', { class: 'jx-compare', role: 'slider', tabindex: '0', 'aria-label': s.sl, 'aria-valuemin': '0', 'aria-valuemax': '100', dir: 'ltr' },
    h('div', { class: 'jx-layer jx-layer--old' }, before),
    h('div', { class: 'jx-layer jx-layer--new' }, after, h('span', { class: 'jx-aimark' }, '✦ ' + s.ai)),
    h('div', { class: 'jx-handle', 'aria-hidden': 'true' }, h('span', {}, '⟷')),
    h('span', { class: 'jx-ba jx-ba--l' }, s.before), h('span', { class: 'jx-ba jx-ba--r' }, s.after));
  let raf = 0;
  // --pos is measured from the left edge; the "after" scene is revealed on the right of the line.
  const set = (p) => { p = Math.max(0, Math.min(100, p)); setVar(wrap, '--pos', p + '%'); wrap.setAttribute('aria-valuenow', String(Math.round(p))); };
  const fromX = (e) => { const r = wrap.getBoundingClientRect(); set(((e.clientX - r.left) / r.width) * 100); };
  let drag = false;
  wrap.addEventListener('pointerdown', (e) => { cancelAnimationFrame(raf); drag = true; wrap.setPointerCapture(e.pointerId); fromX(e); });
  wrap.addEventListener('pointermove', (e) => { if (drag) fromX(e); });
  wrap.addEventListener('pointerup', () => { drag = false; });
  wrap.addEventListener('keydown', (e) => {
    const v = Number(wrap.getAttribute('aria-valuenow'));
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); cancelAnimationFrame(raf); set(v + (e.key === 'ArrowRight' ? 5 : -5)); }
  });
  const intro = () => {
    if (reduced) { set(50); return; }
    set(100);
    const t0 = performance.now();
    const ease = (t) => 1 - Math.pow(1 - t, 3);
    const step = (now) => {
      const t = (now - t0) / 1000;
      if (t < 0.4) set(100);
      else if (t < 1.9) set(100 - 100 * ease((t - 0.4) / 1.5));
      else if (t < 3.2) set(50 * ease(Math.min(1, (t - 2.2) / 1)));
      if (t < 3.2 && wrap.isConnected) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  };
  const tabs = items.map((p, i) => {
    const b = h('button', { type: 'button', class: 'jx-chip', 'aria-pressed': String(i === 0) }, p.name);
    b.addEventListener('click', () => {
      if (cur === i) return;
      cur = i;
      tabs.forEach((x, k) => x.setAttribute('aria-pressed', String(k === i)));
      showPair(before, after, p);
      cancelAnimationFrame(raf); intro();
    });
    return b;
  });
  intro();
  return h('div', { class: 'jx jx--brand' },
    tabs.length > 1 ? h('div', { class: 'jx-chips jx-chips--center' }, ...tabs) : null,
    wrap,
    h('p', { class: 'jx-hint' }, '↔ ', s.drag),
    h('div', { class: 'jx-kept' }, ...s.kept.map((k) => h('span', {}, icon('check', 14), k))));
}

/* ---------- 03 Online showroom ---------- */
function miniShop() {
  const s = tx().s3;
  const st = { page: 'home', product: null, fabric: 0, size: 0, cart: [], order: 2381 };
  const view = h('div', { class: 'jx-shop__view' });
  const count = h('b', { class: 'jx-shop__count' }, '0');
  const priceOf = (p, size) => (size ? Math.round(p.price * 0.78 / 10) * 10 : p.price);
  const items = () => st.cart.reduce((n, c) => n + c.qty, 0);
  const sum = () => st.cart.reduce((n, c) => n + c.price * c.qty, 0);
  const nav = (label, page) => { const b = h('button', { type: 'button', 'data-p': page }, label); b.addEventListener('click', () => go(page)); return b; };
  const navHome = nav(s.home, 'home'), navShop = nav(s.shop, 'shop');
  const cartBtn = h('button', { type: 'button', class: 'jx-shop__cartbtn', 'aria-label': s.cart }, icon('sofa', 16), count);
  cartBtn.addEventListener('click', () => go('cart'));
  const brand = h('button', { type: 'button', class: 'jx-shop__brand', 'aria-label': 'Dar Living' }, darMark(), h('b', {}, 'DAR LIVING'));
  brand.addEventListener('click', () => go('home'));
  const updateCount = () => { count.textContent = String(items()); cartBtn.classList.remove('is-bump'); void cartBtn.offsetWidth; cartBtn.classList.add('is-bump'); };
  const btn = (label, fn, cls = 'jx-btn') => { const b = h('button', { type: 'button', class: cls }, label); b.addEventListener('click', fn); return b; };

  const card = (p) => {
    const b = h('button', { type: 'button', class: 'jx-pcard' }, pic(p.img, ''), h('b', {}, loc(p.name)), h('small', {}, loc(p.note)), h('span', {}, money(p.price)));
    b.addEventListener('click', () => { st.product = p; st.fabric = 0; st.size = 0; go('product'); });
    return b;
  };
  const chips = (list, key, onPick, swatch) => h('div', { class: 'jx-chips' }, ...list.map((l, i) => {
    const c = h('button', { type: 'button', class: 'jx-chip' + (swatch ? ' jx-chip--sw' : ''), 'aria-pressed': String(st[key] === i), 'aria-label': swatch ? s.fabric + ' ' + (i + 1) : null }, swatch ? setVar(h('i'), '--sw', l) : l);
    c.addEventListener('click', () => { st[key] = i; onPick(); });
    return c;
  }));

  const pages = {
    home: () => [
      h('div', { class: 'jx-shop__hero' }, pic('living-teal', ''), h('div', {}, h('h5', {}, s.heroT), h('p', {}, s.heroP), btn(s.toShop, () => go('shop')))),
      h('h6', {}, s.best), h('div', { class: 'jx-grid' }, card(PRODUCTS[0]), card(PRODUCTS[1]))],
    shop: () => [h('h6', {}, s.shop), h('div', { class: 'jx-grid' }, ...PRODUCTS.map(card))],
    product: () => {
      const p = st.product;
      const price = h('span', { class: 'jx-price' }, money(priceOf(p, st.size)));
      const photo = pic(p.img, loc(p.name), 'jx-product__img');
      const add = btn(s.add, () => {
        const pr = priceOf(p, st.size);
        const key = p.id + st.fabric + st.size;
        const ex = st.cart.find((c) => c.key === key);
        if (ex) ex.qty++; else st.cart.push({ key, p, price: pr, qty: 1, info: s.seats[st.size] + ' · ' + s.fabric + ' ' + (st.fabric + 1) });
        updateCount();
        add.textContent = s.added; add.disabled = true;
        setTimeout(() => { if (add.isConnected) { add.textContent = s.add; add.disabled = false; } }, 1100);
      });
      const visit = btn(s.visit, () => { visit.textContent = s.visitDone; visit.disabled = true; }, 'jx-btn jx-btn--ghost');
      return [btn(s.back, () => go('shop'), 'jx-link'), h('div', { class: 'jx-product' },
        h('div', { class: 'jx-product__media' }, setVar(photo, '--tint', p.fabrics[st.fabric]), setVar(h('span', { class: 'jx-product__tint' }), '--tint', p.fabrics[st.fabric]), h('span', { class: 'jx-360' }, s.view3d)),
        h('div', {}, h('h5', {}, loc(p.name)), h('small', {}, loc(p.note)), price, h('small', { class: 'jx-tabby' }, s.tabby + ': ' + money(Math.round(priceOf(p, st.size) / 4))),
          h('p', { class: 'jx-lbl' }, s.fabric), chips(p.fabrics, 'fabric', render, true),
          h('p', { class: 'jx-lbl' }, s.size), chips(s.seats, 'size', render),
          add, visit))];
    },
    cart: () => {
      if (!st.cart.length) return [h('h6', {}, s.cart), h('p', { class: 'jx-empty' }, s.empty)];
      const sub = sum();
      const rows = st.cart.map((c) => {
        const minus = btn('−', () => { c.qty--; if (!c.qty) st.cart.splice(st.cart.indexOf(c), 1); updateCount(); render(); }, '');
        const plus = btn('+', () => { c.qty++; updateCount(); render(); }, '');
        return h('li', {}, pic(c.p.img, '', 'jx-cart__img'), h('div', {}, h('b', {}, loc(c.p.name)), h('small', {}, c.info)), h('span', { class: 'jx-qty' }, minus, String(c.qty), plus), h('span', {}, money(c.price * c.qty)));
      });
      return [h('h6', {}, s.cart), h('ul', { class: 'jx-cart' }, ...rows),
        h('dl', { class: 'jx-sum' }, h('dt', {}, s.sub), h('dd', {}, money(sub)), h('dt', {}, s.ship), h('dd', {}, s.free), h('dt', {}, s.total), h('dd', {}, h('b', {}, money(sub)))),
        btn(s.checkout, () => go('thanks'))];
    },
    thanks: () => {
      const id = st.order++;
      st.cart = []; count.textContent = '0';
      return [h('div', { class: 'jx-thanks' }, h('span', { class: 'jx-thanks__ok' }, icon('check', 28)), h('h5', {}, s.thanks), h('p', {}, s.order + ' #DL-' + id), h('small', {}, s.demo), btn(s.again, () => go('shop')))];
    }
  };
  function render() {
    view.replaceChildren(...pages[st.page]().flat());
    [navHome, navShop].forEach((b) => b.setAttribute('aria-current', String(b.dataset.p === st.page || (st.page === 'product' && b.dataset.p === 'shop'))));
  }
  function go(page) { st.page = page; render(); view.scrollTop = 0; }
  render();
  return h('div', { class: 'jx jx--shop' },
    h('div', { class: 'jx-browser' },
      h('div', { class: 'jx-browser__bar' }, h('i'), h('i'), h('i'), h('span', { dir: 'ltr' }, '🔒 ' + s.url)),
      h('div', { class: 'jx-shop' }, h('nav', { class: 'jx-shop__nav' }, brand, h('div', {}, navHome, navShop, cartBtn)), view)),
    h('p', { class: 'jx-hint' }, s.demo));
}

/* ---------- 04 DMs to appointments ---------- */
function automation() {
  const s = tx().s4;
  let n = 1, done = 0, running = false;
  const nodes = s.flow.map(([t], i) => h('li', { class: 'jx-flow__n' }, h('span', { class: 'jx-flow__ic' }, String(i + 1)), h('div', {}, h('b', {}, t), h('small', {}, '…'))));
  const doneEl = h('b', {}, '0'), savedEl = h('b', {}, '0');
  const go = h('button', { type: 'button', class: 'jx-btn' }, '▶ ' + s.trigger);
  const fill = (i) => s.flow[i][1].replace('{n}', '@user_' + (340 + n));
  async function run() {
    if (running) return;
    running = true; go.disabled = true; go.textContent = s.running;
    nodes.forEach((x) => x.classList.remove('is-on'));
    for (let i = 0; i < nodes.length; i++) {
      await sleep(reduced ? 0 : 520);
      if (!root.isConnected) return;
      nodes[i].querySelector('small').textContent = fill(i);
      nodes[i].classList.add('is-on');
    }
    done++; n++;
    doneEl.textContent = String(done); savedEl.textContent = String(Math.ceil(done * 0.7));
    running = false; go.disabled = false; go.textContent = '▶ ' + s.trigger;
  }
  go.addEventListener('click', run);
  const root = h('div', { class: 'jx jx--auto' },
    h('ol', { class: 'jx-flow' }, ...nodes),
    h('div', { class: 'jx-auto__side' }, go,
      h('div', { class: 'jx-kpi' }, doneEl, h('small', {}, s.done)),
      h('div', { class: 'jx-kpi' }, savedEl, h('small', {}, s.saved)),
      h('p', { class: 'jx-hint' }, s.manual)));
  setTimeout(run, 500);
  return root;
}

/* ---------- 05 AI assistant ---------- */
function aiChat() {
  const s = tx().s5;
  const log = h('div', { class: 'jx-chat__log' });
  const add = (cls, ...kids) => { const m = h('div', { class: 'jx-msg ' + cls }, ...kids); log.append(m); log.scrollTop = log.scrollHeight; return m; };
  add('is-bot', s.hello);
  let busy = false;
  async function ask(q, a, pi) {
    if (busy) return;
    busy = true; chips.forEach((c) => { c.disabled = true; });
    add('is-user', q);
    const typing = add('is-bot is-typing', h('i'), h('i'), h('i'));
    await sleep(reduced ? 0 : 900);
    if (!log.isConnected) return;
    typing.classList.remove('is-typing');
    typing.replaceChildren(h('small', {}, '✦ ' + s.aiLabel), a);
    if (pi != null) {
      const p = PRODUCTS[pi];
      typing.append(h('div', { class: 'jx-msg__prod' }, pic(p.img, ''), h('div', {}, h('b', {}, loc(p.name)), h('small', {}, money(p.price)))));
    }
    log.scrollTop = log.scrollHeight;
    busy = false; chips.forEach((c) => { c.disabled = false; });
  }
  const chips = s.qa.map(([q, a, pi]) => { const c = h('button', { type: 'button', class: 'jx-chip' }, q); c.addEventListener('click', () => ask(q, a, pi)); return c; });
  setTimeout(() => ask(...s.qa[0]), 700);
  return h('div', { class: 'jx jx--ai' },
    h('div', { class: 'jx-chat' },
      h('div', { class: 'jx-chat__head' }, darMark(), h('b', {}, s.title), h('span', { class: 'jx-aitag' }, s.tag)),
      log,
      h('div', { class: 'jx-chips jx-chips--q' }, ...chips)),
    h('div', { class: 'jx-stats' }, ...s.stats.map(([v, l]) => h('div', {}, h('b', {}, v), h('small', {}, l)))),
    h('p', { class: 'jx-hint' }, s.note));
}

/* ---------- 06 Ads & results ---------- */
function growth() {
  const s = tx().s6;
  const D = { fol: [312, 1240, 2650, 4300, 6380, 8640], leads: [24, 48, 79, 112, 150, 186], visits: [6, 14, 25, 38, 52, 64], cpl: [46, 38, 31, 27, 23, 21] };
  const kpi = (label) => { const v = h('b'); return [v, h('div', { class: 'jx-kpi' }, v, h('small', {}, label))]; };
  const [fV, fK] = kpi(s.followers), [lV, lK] = kpi(s.leads), [vV, vK] = kpi(s.visits), [cV, cK] = kpi(s.cpl);
  const bars = D.leads.map((o, i) => setVar(h('span', { class: 'jx-bar' }, h('i'), h('small', {}, String(i + 1))), '--h', (o / 186) * 100 + '%'));
  const range = h('input', { type: 'range', min: '1', max: '6', step: '1', value: '1', 'aria-label': s.month });
  const mLabel = h('b', {}, '1');
  const set = (m) => {
    const i = m - 1;
    mLabel.textContent = String(m);
    fV.textContent = num(D.fol[i]); lV.textContent = num(D.leads[i]);
    vV.textContent = num(D.visits[i]); cV.textContent = money(D.cpl[i]);
    bars.forEach((b, k) => b.classList.toggle('is-on', k <= i));
  };
  range.addEventListener('input', () => { auto = false; set(Number(range.value)); });
  set(1);
  let auto = !reduced;
  (async () => { for (let m = 2; m <= 6 && auto; m++) { await sleep(650); if (!auto || !range.isConnected) return; range.value = String(m); set(m); } })();
  return h('div', { class: 'jx jx--growth' },
    h('div', { class: 'jx-ad' },
      h('div', { class: 'jx-ad__head' }, darMark(), h('div', {}, h('b', {}, 'dar.living'), h('small', {}, s.sponsored))),
      h('div', { class: 'jx-ad__img' }, pic('living-cream', ''), h('p', {}, s.ad)),
      h('div', { class: 'jx-ad__cta' }, h('span', { dir: 'ltr' }, 'dar-living.sa'), h('b', {}, s.cta))),
    h('div', { class: 'jx-dash' },
      h('label', { class: 'jx-month' }, h('span', {}, s.month, ': ', mLabel), range),
      h('div', { class: 'jx-kpis' }, fK, lK, vK, cK),
      h('div', { class: 'jx-bars', dir: 'ltr' }, ...bars),
      h('p', { class: 'jx-hint' }, s.sample)));
}

export const JOURNEY_VIEWS = [board, aiCompare, miniShop, automation, aiChat, growth];

export function clientCard() {
  const info = clientInfo();
  if (!info.visible) return null;
  const c = { ...tx().client, ...Object.fromEntries(Object.entries(info.text).filter(([, v]) => v)) };
  const first = compareItems()[0];
  const thumb = (src, cls) => h('span', { class: cls }, h('img', { src, alt: '', loading: 'lazy', decoding: 'async' }));
  return h('div', { class: 'jx-client' },
    h('div', { class: 'jx-client__logos', 'aria-hidden': 'true' },
      thumb(info.thumbBefore || (first && first.before) || IMG + 'living-green.webp', 'jx-client__pic is-before'),
      h('span', { class: 'jx-client__arrow' }, getLang() === 'ar' ? '←' : '→'),
      thumb(info.thumbAfter || (first && first.after) || IMG + 'living-green.webp', 'jx-client__pic')),
    h('div', {}, h('small', {}, c.label), h('p', {}, h('b', {}, c.name), ' – ', c.desc), h('p', { class: 'jx-client__goal' }, c.goal)));
}
export const exampleLabel = () => clientInfo().text.example || tx().example;
