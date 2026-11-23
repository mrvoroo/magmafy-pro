// Websites & 3D page: a real 3D sofa configurator (WebGL), a 3D carousel of five working
// furniture websites, a website scope planner and the technical promises behind every site.
import { MINI_SITES } from './minisites.js';
import { h, icon, L, section, onVisible, num, countTo, reduced } from './kit.js';

const T = {
  demo: { ar: 'تجربة حية · تعمل في متصفحك', en: 'Live demo · runs in your browser' },
  cfg: {
    eyebrow: { ar: 'معرض ثلاثي الأبعاد', en: '3D showroom' },
    title: { ar: 'أدِر الكنبة، غيّر القماش، وشاهدها في صالتك.', en: 'Spin the sofa, change the fabric, see it in a room.' },
    text: { ar: 'نموذج 3D حقيقي يعمل على الجوال والكمبيوتر. هذا ما يراه عميلك في موقعك قبل أن يزور المعرض.', en: 'A real 3D model that runs on phones and computers. This is what your customer sees on your site before visiting the showroom.' },
    name: { ar: 'كنبة «فرانكي» المخمل', en: '“Frankie” velvet sofa' },
    brand: { ar: 'dar.living · مجموعة المخمل', en: 'dar.living · Velvet collection' },
    sub: { ar: 'قماش مخمل ناعم بلمعة حقيقية، أرجل معدنية، وتتحول لسرير. جرّب الألوان وشاهدها في صالة حقيقية بالنهار وبالليل.', en: 'Soft velvet with a real sheen, metal legs, converts into a bed. Try the colours and see it in a real room by day and by night.' },
    fabric: { ar: 'القماش', en: 'Fabric' }, legs: { ar: 'الأرجل', en: 'Legs' },
    rooms: { ar: ['استوديو', '☀ صالة نهارًا', '☾ صالة ليلًا'], en: ['Studio', '☀ Day room', '☾ Night room'] },
    roomLabel: { ar: 'خلفية العرض', en: 'Backdrop' },
    dims: { ar: '📏 المقاسات', en: '📏 Dimensions' },
    dimsList: { ar: [['العرض', 218], ['العمق', 89], ['الارتفاع', 81]], en: [['Width', 218], ['Depth', 89], ['Height', 81]] },
    cm: { ar: 'سم', en: 'cm' },
    hint: { ar: '⟲ اسحب للتدوير', en: '⟲ Drag to rotate' },
    badge: { ar: 'عرض 360 درجة', en: '360° view' },
    loading: { ar: 'جاري تحميل الكنبة…', en: 'Loading the sofa…' },
    canvas: { ar: 'عرض ثلاثي الأبعاد لكنبة يمكن تدويره', en: 'Rotatable 3D view of a sofa' },
    book: { ar: 'احجز زيارة لتجربتها', en: 'Book a visit to try it' },
    quote: { ar: 'اسأل عن التوفر', en: 'Ask about availability' },
    booked: { ar: '✓ في موقعك، هذا الزر يحجز زيارة للمعرض مباشرة: ', en: '✓ On your site, this button books a showroom visit directly: ' },
    quoted: { ar: '✓ يصل طلب «{s}» إلى فريق المبيعات على واتساب فورًا.', en: '✓ A request for “{s}” reaches your sales team on WhatsApp instantly.' }
  },
  design: {
    eyebrow: { ar: 'تصميم المواقع', en: 'Web design' },
    title: { ar: 'خمس علامات. خمسة مواقع جرّبها بنفسك.', en: 'Five brands. Five websites to try yourself.' },
    text: { ar: 'حرّك العرض وجرّب كل موقع هنا: مرّر، فلتر، اختر القماش، أضف للسلة، أو اطلب عرض سعر.', en: 'Spin the carousel and try each site right here: scroll, filter, pick a fabric, add to cart or request a quote.' },
    prev: { ar: 'التصميم السابق', en: 'Previous design' },
    next: { ar: 'التصميم التالي', en: 'Next design' }
  },
  scope: {
    eyebrow: { ar: 'مخطط نطاق الموقع', en: 'Website scope planner' },
    title: { ar: 'اختر ما يحتاجه موقعك، ونقول لك كم يأخذ.', en: 'Pick what your site needs, and we’ll tell you how long it takes.' },
    text: { ar: 'هذه نفس الأسئلة التي نراجعها في اجتماع نطاق الموقع. اختر المزايا وشاهد الصفحات والمدة المتوقعة.', en: 'These are the same questions we go through in a website scope meeting. Pick features and see the pages and the expected timeline.' },
    type: { ar: 'نوع الموقع', en: 'Site type' },
    types: { ar: ['موقع تعريفي', 'معرض أونلاين', 'متجر إلكتروني'], en: ['Brand site', 'Online showroom', 'Online store'] },
    features: { ar: 'المزايا', en: 'Features' },
    list: [
      { k: '3d', w: 2, ar: 'عرض 3D و360° للقطع', en: '3D & 360° product views', page: { ar: 'عارض 3D', en: '3D viewer' } },
      { k: 'wa', w: 0.5, ar: 'طلب السعر عبر واتساب', en: 'Price requests via WhatsApp', page: null, on: true },
      { k: 'visit', w: 1, ar: 'حجز زيارة المعرض', en: 'Showroom visit booking', page: { ar: 'حجز زيارة', en: 'Book a visit' }, on: true },
      { k: 'pay', w: 1.5, ar: 'دفع وتقسيط (مدى، Apple Pay، تابي، تمارا)', en: 'Payments & instalments (mada, Apple Pay, Tabby, Tamara)', page: { ar: 'السلة والدفع', en: 'Cart & checkout' } },
      { k: 'b2b', w: 1, ar: 'صفحة الشركات وطلب عرض سعر', en: 'Business page & quote requests', page: { ar: 'للشركات', en: 'For business' } },
      { k: 'blog', w: 1, ar: 'مدونة ومقالات SEO بالعربي', en: 'Blog & Arabic SEO articles', page: { ar: 'المدونة', en: 'Blog' } },
      { k: 'lp', w: 0.5, ar: 'صفحات هبوط للحملات', en: 'Campaign landing pages', page: { ar: 'صفحة حملة', en: 'Campaign page' } },
      { k: 'admin', w: 1, ar: 'لوحة تحكم لتعديل المحتوى', en: 'Admin panel to edit content', page: null }
    ],
    base: { ar: [['الرئيسية', 'من نحن', 'تواصل'], ['الرئيسية', 'المجموعات', 'صفحة القطعة', 'من نحن', 'تواصل'], ['الرئيسية', 'الأقسام', 'صفحة المنتج', 'حسابي', 'تواصل']], en: [['Home', 'About', 'Contact'], ['Home', 'Collections', 'Product page', 'About', 'Contact'], ['Home', 'Categories', 'Product page', 'My account', 'Contact']] },
    legal: { ar: ['الخصوصية', 'الشروط'], en: ['Privacy', 'Terms'] },
    pages: { ar: 'صفحات', en: 'pages' },
    weeks: { ar: 'أسابيع', en: 'weeks' },
    timeline: { ar: 'المدة المتوقعة', en: 'Expected timeline' },
    always: { ar: 'دائمًا ضمن الموقع: عربي وإنجليزي، سرعة عالية، متوافق مع الجوال، ونظام حماية البيانات الشخصية.', en: 'Always included: Arabic and English, fast loading, mobile-first, and PDPL-ready privacy.' },
    sitemap: { ar: 'خريطة الموقع', en: 'Sitemap' },
    cta: { ar: 'احجز اجتماع نطاق الموقع', en: 'Book a website scope meeting' },
    note: { ar: 'تقدير مبدئي. السعر والجدول النهائي نحدده معك في الاجتماع.', en: 'An early estimate. We confirm the final price and schedule with you in the meeting.' }
  },
  facts: {
    eyebrow: { ar: 'في كل موقع نبنيه', en: 'In every site we build' },
    title: { ar: 'سريع، عربي أولًا، وجاهز للبيع.', en: 'Fast, Arabic-first and ready to sell.' },
    items: {
      ar: [['عربي وإنجليزي', 'تصميم من اليمين لليسار من الأساس، لا ترجمة فوق تصميم أجنبي.'], ['أقل من ثانيتين', 'صور WebP وتحميل ذكي، والنماذج 3D لا تعمل إلا عند ظهورها.'], ['دفع سعودي', 'مدى وApple Pay وتابي وتمارا، أو ربط مع سلة وزد.'], ['PDPL', 'سياسة خصوصية وموافقة على ملفات الارتباط حسب نظام حماية البيانات الشخصية.']],
      en: [['Arabic & English', 'Right-to-left from the ground up, not a translation over a foreign layout.'], ['Under two seconds', 'WebP images and smart loading; 3D models only run when on screen.'], ['Saudi payments', 'mada, Apple Pay, Tabby and Tamara, or connected to Salla and Zid.'], ['PDPL', 'Privacy policy and cookie consent under the Personal Data Protection Law.']]
    }
  }
};

/* ---------------- 1. 3D configurator ---------------- */
function configurator() {
  const c = T.cfg;
  const canvas = h('canvas', { 'aria-label': L(c.canvas) });
  const loading = h('span', { class: 'cfg__loading' }, L(c.loading));
  const dims = h('div', { class: 'cfg__dims', 'aria-live': 'polite' }, ...L(c.dimsList).map(([a, v]) => h('span', {}, a + ' ', h('b', {}, String(v)), ' ' + L(c.cm))));
  const dimsBtn = h('button', { type: 'button', class: 'cfg__dimsbtn', 'aria-pressed': 'false' }, L(c.dims));
  dimsBtn.addEventListener('click', () => { const on = dimsBtn.getAttribute('aria-pressed') !== 'true'; dimsBtn.setAttribute('aria-pressed', String(on)); dims.classList.toggle('is-on', on); });
  const rooms = h('div', { class: 'cfg__rooms', role: 'radiogroup', 'aria-label': L(c.roomLabel) });
  const stage = h('div', { class: 'cfg__stage', dir: 'ltr' }, canvas, h('span', { class: 'cfg__hint', 'aria-hidden': 'true' }, L(c.hint)), h('span', { class: 'cfg__badge' }, L(c.badge)), loading,
    h('small', { class: 'cfg__credit' }, '3D model © Wayfair · CC BY 4.0'), rooms, dimsBtn, dims);
  const fabName = h('b');
  const swatches = h('div', { class: 'swatches', role: 'radiogroup', 'aria-label': L(c.fabric) });
  const legs = h('div', { class: 'jx-chips', role: 'radiogroup', 'aria-label': L(c.legs) });
  const toast = h('p', { class: 'cfg__toast', role: 'status' });
  const book = h('button', { type: 'button', class: 'btn btn--primary' }, L(c.book));
  const quote = h('button', { type: 'button', class: 'btn btn--ghost' }, L(c.quote));
  const box = h('div', { class: 'cfg', 'data-reveal': '' }, stage,
    h('div', { class: 'cfg__panel' },
      h('p', { class: 'cfg__brand' }, L(c.brand)), h('h3', {}, L(c.name)), h('p', { class: 'cfg__sub' }, L(c.sub)),
      h('div', { class: 'cfg__group' }, h('span', {}, L(c.fabric) + ': ', fabName), swatches),
      h('div', { class: 'cfg__group' }, h('span', {}, L(c.legs)), legs),
      h('div', { class: 'cfg__actions' }, book, quote), toast));

  let started = false;
  onVisible(box, async () => {
    if (started) return;
    started = true;
    const fallback = () => { stage.classList.add('is-fallback'); };
    let mod;
    try { mod = await import('./sofa3d.js'); } catch (e) { console.warn(e); loading.classList.add('is-done'); fallback(); return; }
    const { initSofa, FABRICS, LEGS } = mod;
    const ar = L({ ar: true, en: false });
    const nm = (x) => (ar ? x.name : x.en);
    let sofa, f = 0, l = 0;
    try { sofa = initSofa(canvas, { onLoad: (err) => { loading.classList.add('is-done'); if (err) fallback(); } }); } catch (e) { console.warn(e); loading.classList.add('is-done'); fallback(); }
    const radio = (group, i, label, onPick, color) => {
      const b = h('button', { type: 'button', role: 'radio', 'aria-checked': String(i === 0), 'aria-label': label, title: label }, color ? null : label);
      if (color) b.style.setProperty('--c', color);
      b.addEventListener('click', () => { [...group.children].forEach((x) => x.setAttribute('aria-checked', String(x === b))); onPick(); });
      group.append(b);
    };
    const render = () => { fabName.textContent = nm(FABRICS[f]); };
    FABRICS.forEach((x, i) => radio(swatches, i, nm(x), () => { f = i; sofa?.setFabric(i); render(); }, x.c));
    LEGS.forEach((x, i) => { radio(legs, i, nm(x), () => { l = i; sofa?.setLegs(i); }); legs.lastChild.className = 'jx-chip'; });
    ['studio', 'day', 'night'].forEach((k, i) => radio(rooms, i, L(c.rooms)[i], () => { stage.dataset.room = k; sofa?.setRoom(k); }));
    render();
    const summary = () => L(c.name) + ' · ' + nm(FABRICS[f]) + ' · ' + nm(LEGS[l]);
    book.addEventListener('click', () => { toast.textContent = L(c.booked) + summary(); });
    quote.addEventListener('click', () => { toast.textContent = L(c.quoted).replace('{s}', summary()); });
  });
  return section({ id: 'demo-3d', eyebrow: L(c.eyebrow), title: L(c.title), text: L(c.text), badge: L(T.demo) }, box);
}

/* ---------------- 2. 3D website carousel ---------------- */
function designCarousel() {
  const SITES = MINI_SITES, n = SITES.length;
  let index = 0, drag = null, auto = null, userTook = false;
  const ring = h('div', { class: 'carousel__ring' });
  const panels = SITES.map((s, i) => {
    const p = h('figure', { class: 'carousel__panel', 'data-i': String(i) }, s.build());
    p.addEventListener('click', () => { if (!p.classList.contains('is-active')) { stopAuto(); let d = i - (((index % n) + n) % n); if (d > n / 2) d -= n; if (d < -n / 2) d += n; go(index + d); } });
    ring.append(p);
    return p;
  });
  const caption = h('p', { class: 'carousel__caption', 'aria-live': 'polite' });
  const prev = h('button', { type: 'button', class: 'icon-btn', 'aria-label': L(T.design.prev) }, icon('arrow', 18));
  const next = h('button', { type: 'button', class: 'icon-btn', 'aria-label': L(T.design.next) }, icon('arrow', 18));
  const dots = h('div', { class: 'carousel__dots' }, ...SITES.map((s, i) => {
    const d = h('button', { type: 'button', class: 'dot', 'aria-label': s.name });
    d.addEventListener('click', () => go(i));
    return d;
  }));
  const stage = h('div', { class: 'carousel', tabindex: '0', role: 'group', 'aria-roledescription': 'carousel', 'aria-label': L(T.design.eyebrow), dir: 'ltr' }, ring);
  function layout() {
    const w = stage.clientWidth;
    const pw = Math.min(600, w * (w < 700 ? 0.86 : 0.62));
    stage.style.setProperty('--pw', pw + 'px');
    stage.style.setProperty('--radius', Math.round((pw / 2) / Math.tan(Math.PI / n)) + 40 + 'px');
    panels.forEach((p, i) => p.style.setProperty('--a', (i * 360 / n) + 'deg'));
    render();
  }
  function render(extra = 0) {
    ring.style.setProperty('--rot', (-index * 360 / n + extra) + 'deg');
    const active = ((index % n) + n) % n;
    panels.forEach((p, i) => { p.classList.toggle('is-active', i === active); p.inert = i !== active; p.dir = document.documentElement.dir; });
    [...dots.children].forEach((d, i) => d.setAttribute('aria-current', i === active ? 'true' : 'false'));
    caption.textContent = SITES[active].name + ' · ' + L(SITES[active].tag);
  }
  function go(i) { index = i; render(); }
  prev.addEventListener('click', () => { index--; render(); });
  next.addEventListener('click', () => { index++; render(); });
  stage.addEventListener('keydown', (e) => { if (e.key === 'ArrowLeft') { index--; render(); } if (e.key === 'ArrowRight') { index++; render(); } });
  const stopAuto = () => { clearInterval(auto); auto = null; userTook = true; };
  stage.addEventListener('pointerdown', (e) => {
    stopAuto();
    if (e.target.closest('.carousel__panel.is-active')) return;
    drag = { x: e.clientX, moved: 0 }; stage.setPointerCapture(e.pointerId); ring.classList.add('is-drag');
  });
  stage.addEventListener('pointermove', (e) => { if (drag) { drag.moved = e.clientX - drag.x; render(drag.moved * 0.25); } });
  const end = () => { if (!drag) return; index += Math.round(-drag.moved / (stage.clientWidth * 0.25)); drag = null; ring.classList.remove('is-drag'); render(); };
  stage.addEventListener('pointerup', end);
  stage.addEventListener('pointercancel', end);
  stage.addEventListener('pointerenter', stopAuto);
  stage.addEventListener('wheel', stopAuto, { passive: true });
  window.addEventListener('resize', layout);
  requestAnimationFrame(layout);
  if (!reduced) onVisible(stage, () => { if (!userTook) auto ||= setInterval(() => { index++; render(); }, 4200); }, () => { clearInterval(auto); auto = null; });
  return section({ id: 'demo-design', eyebrow: L(T.design.eyebrow), title: L(T.design.title), text: L(T.design.text), badge: L(T.demo) },
    h('div', { class: 'carousel-wrap', 'data-reveal': '' }, stage, h('div', { class: 'carousel__controls' }, prev, caption, next), dots));
}

/* ---------------- 3. Scope planner ---------------- */
function scope() {
  const s = T.scope;
  let type = 1;
  const on = new Set(s.list.filter((x) => x.on).map((x) => x.k));
  const pagesEl = h('strong', {}, '0'), weeksEl = h('strong', {}, '0');
  const map = h('div', { class: 'scope__map' });
  const bar = h('div', { class: 'scope__bar', 'aria-hidden': 'true' });
  const seg = h('div', { class: 'seg seg--3', role: 'group', 'aria-label': L(s.type) }, ...L(s.types).map((t, i) => {
    const b = h('button', { type: 'button', class: 'seg__btn', 'aria-pressed': String(i === type) }, t);
    b.addEventListener('click', () => { type = i; [...seg.children].forEach((x) => x.setAttribute('aria-pressed', String(x === b))); calc(); });
    return b;
  }));
  const list = h('ul', { class: 'sec__list scope__list' }, ...s.list.map((f, i) => {
    const input = h('input', { type: 'checkbox', id: 'scope-' + i, checked: on.has(f.k) });
    input.addEventListener('change', () => { input.checked ? on.add(f.k) : on.delete(f.k); calc(); });
    return h('li', {}, input, h('label', { for: 'scope-' + i }, h('span', { class: 'sec__box', 'aria-hidden': 'true' }, icon('check', 14)), L(f)));
  }));
  function calc() {
    const feats = s.list.filter((f) => on.has(f.k));
    const pages = [...L(s.base)[type], ...feats.filter((f) => f.page).map((f) => L(f.page)), ...L(s.legal)];
    const weeks = [2, 3, 4][type] + feats.reduce((a, f) => a + f.w, 0) * 0.6;
    const lo = Math.max(2, Math.floor(weeks)), hi = Math.ceil(weeks + 1);
    countTo(pagesEl, pages.length);
    weeksEl.textContent = num(lo) + '–' + num(hi) + ' ' + L(s.weeks);
    map.replaceChildren(...pages.map((p, i) => h('span', { class: i === 0 ? 'is-home' : '' }, p)));
    const phases = L({ ar: ['التصميم', 'البرمجة', 'المحتوى', 'الإطلاق'], en: ['Design', 'Build', 'Content', 'Launch'] });
    const w = [0.3, 0.4, 0.2, 0.1];
    bar.replaceChildren(...phases.map((p, i) => { const x = h('span', {}, h('small', {}, p)); x.style.setProperty('--w', w[i] * 100 + '%'); return x; }));
  }
  calc();
  const box = h('div', { class: 'scope', 'data-reveal': '' },
    h('div', { class: 'scope__form panel' }, h('p', { class: 'panel__title' }, L(s.type)), seg, h('p', { class: 'panel__title' }, L(s.features)), list),
    h('div', { class: 'scope__out planner' },
      h('div', { class: 'scope__kpis' }, h('div', { class: 'kpi' }, h('span', { class: 'kpi__label' }, L(s.pages)), pagesEl), h('div', { class: 'kpi' }, h('span', { class: 'kpi__label' }, L(s.timeline)), weeksEl)),
      bar,
      h('p', { class: 'panel__title' }, L(s.sitemap)), map,
      h('p', { class: 'scope__always' }, icon('shield', 16), L(s.always)),
      h('a', { class: 'btn btn--primary', href: 'booking.html?topic=website' }, L(s.cta), icon('arrow', 16)),
      h('p', { class: 'chat__privacy' }, L(s.note))));
  return section({ id: 'demo-scope', eyebrow: L(s.eyebrow), title: L(s.title), text: L(s.text), badge: L(T.demo) }, box);
}

function facts() {
  return section({ id: 'web-facts', eyebrow: L(T.facts.eyebrow), title: L(T.facts.title) },
    h('ul', { class: 'facts' }, ...L(T.facts.items).map(([a, b]) => h('li', { class: 'fact', 'data-reveal': '' }, h('b', {}, a), h('p', {}, b)))));
}

export function mount(container) {
  container.replaceChildren(configurator(), designCarousel(), scope(), facts());
}
