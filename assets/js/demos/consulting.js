// Consulting page: the three meeting types, a growth readiness check with a radar chart,
// an ad-budget leak finder and a 90-day plan. Every result links to booking.
import { h, icon, L, section, svg } from './kit.js';
import { getLang } from '../core.js';
import { saveReadiness, crmPost } from '../crm.js';
import { track } from '../analytics.js';

const T = {
  demo: { ar: 'تجربة حية · بيانات توضيحية', en: 'Live demo · sample data' },
  types: {
    eyebrow: { ar: 'أنواع الاجتماعات', en: 'Meeting types' },
    title: { ar: 'اختر الاجتماع المناسب، والباقي علينا.', en: 'Pick the right meeting; we handle the rest.' },
    text: { ar: 'كل الاجتماعات على Google Meet أو Zoom، من السبت إلى الخميس. تختار اليوم والوقت بنفسك.', en: 'All meetings run on Google Meet or Zoom, Saturday to Thursday. You choose the day and time.' },
    items: [
      { topic: 'research', i: 'research', ar: ['دراسة السوق', '30 دقيقة', ['نفهم نشاطك ومدينتك ومنافسيك', 'نحدد أسئلة الدراسة', 'تستلم عرضًا خلال 48 ساعة']], en: ['Market research', '30 minutes', ['We learn your business, city and competitors', 'We define the research questions', 'You get a proposal within 48 hours']] },
      { topic: 'website', i: 'websites', ar: ['نطاق الموقع', '30 دقيقة', ['نراجع الصفحات والمزايا معك', 'نقرر: 3D، متجر، حجز زيارة', 'تستلم نطاقًا وجدولًا زمنيًا مكتوبًا']], en: ['Website scope', '30 minutes', ['We go through pages and features together', 'We decide: 3D, store, visit booking', 'You get a written scope and timeline']] },
      { topic: 'general', i: 'consulting', ar: ['استشارة عامة', '30 دقيقة', ['نراجع حساباتك وإعلاناتك الحالية', 'نحدد أكبر 3 فرص للنمو', 'تطلع بخطوات واضحة حتى لو ما اشتغلنا معًا']], en: ['General consultation', '30 minutes', ['We review your accounts and current ads', 'We name your 3 biggest growth chances', 'You leave with clear steps, even if we don’t work together']] }
    ],
    book: { ar: 'احجز هذا الاجتماع', en: 'Book this meeting' },
    free: { ar: 'مجاني', en: 'Free' }
  },
  check: {
    eyebrow: { ar: 'فحص جاهزية النمو', en: 'Growth readiness check' },
    title: { ar: 'أين يقف معرضك اليوم؟', en: 'Where does your showroom stand today?' },
    text: { ar: 'ست أسئلة، دقيقة واحدة. تحصل على درجتك وأهم ثلاث خطوات تبدأ بها.', en: 'Six questions, one minute. You get your score and the three steps to start with.' },
    axes: { ar: ['السوق', 'المحتوى', 'الإعلانات', 'الموقع', 'الرد', 'القياس'], en: ['Market', 'Content', 'Ads', 'Website', 'Replies', 'Tracking'] },
    qs: {
      ar: ['هل تعرف أسعار منافسيك وعروضهم في مدينتك؟', 'كم مرة تنشر محتوى جديدًا بجودة عالية؟', 'هل إعلاناتك موجّهة لجمهور محدد بهدف واضح؟', 'هل يستطيع العميل رؤية القطع وطلب السعر من موقعك؟', 'كم يأخذ فريقك للرد على رسالة «كم السعر؟»', 'هل تعرف كم استفسارًا وزيارة جاءت من كل إعلان؟'],
      en: ['Do you know your competitors’ prices and offers in your city?', 'How often do you post new, high-quality content?', 'Are your ads aimed at a defined audience with a clear goal?', 'Can customers view pieces and request a price on your website?', 'How long does your team take to answer “how much?”', 'Do you know how many enquiries and visits came from each ad?']
    },
    answers: { ar: ['لا', 'قليلًا', 'غالبًا', 'نعم تمامًا'], en: ['No', 'A little', 'Mostly', 'Fully'] },
    question: { ar: 'سؤال', en: 'Question' },
    back: { ar: 'رجوع', en: 'Back' },
    result: { ar: 'درجة جاهزيتك', en: 'Your readiness score' },
    levels: { ar: ['بداية الطريق', 'أساس موجود', 'جاهز للنمو', 'متقدم'], en: ['Getting started', 'A foundation', 'Ready to grow', 'Advanced'] },
    next: { ar: 'أهم ثلاث خطوات لك', en: 'Your top three steps' },
    recs: {
      ar: ['دراسة سوق سريعة لمدينتك وفئتك: الأسعار والعروض والفجوات.', 'محتوى AI أسبوعي من صور جوالك، على تقويم المواسم.', 'حملة واحدة بهدف واحد (زيارات أو رسائل) بدل التعزيز العشوائي.', 'موقع أو معرض أونلاين فيه عرض 3D وزر واتساب وحجز زيارة.', 'رد تلقائي فوري على التعليقات والرسائل مع السعر والتقسيط.', 'ربط الإعلانات بالواتساب والمتجر وتقرير شهري بتكلفة كل نتيجة.'],
      en: ['A quick market study of your city and category: prices, offers, gaps.', 'Weekly AI content from your phone photos, on the seasonal calendar.', 'One campaign with one goal (visits or messages) instead of random boosts.', 'A website or online showroom with 3D, a WhatsApp button and visit booking.', 'Instant automatic replies to comments and DMs with price and instalments.', 'Connect ads to WhatsApp and the store, with a monthly cost-per-result report.']
    },
    talk: { ar: 'ناقش النتيجة معنا', en: 'Discuss your result' },
    restart: { ar: 'أعد الفحص', en: 'Start again' }
  },
  leak: {
    eyebrow: { ar: 'مراجعة الإعلانات', en: 'Ad account review' },
    title: { ar: 'أين تضيع ميزانيتك الإعلانية؟', en: 'Where is your ad budget leaking?' },
    text: { ar: 'علّم ما ينطبق على إعلاناتك الحالية. هذه أكثر الأخطاء التي نجدها في حسابات المعارض.', en: 'Tick what applies to your current ads. These are the mistakes we find most often in showroom accounts.' },
    items: {
      ar: [['نعزّز المنشورات بزر «ترويج» فقط', 18], ['نستهدف المملكة كلها بدل مدن التوصيل', 16], ['لا نتتبّع الرسائل والزيارات من الإعلان', 20], ['نفس الإعلان يعمل منذ أكثر من شهر', 12], ['الإعلان يوجّه للصفحة الرئيسية لا لصفحة القطعة', 10], ['لا نرد على الرسائل بعد 9 مساءً', 14], ['لا نعيد استهداف من زار الموقع أو تفاعل', 10]],
      en: [['We only use the “Boost” button', 18], ['We target the whole Kingdom instead of delivery cities', 16], ['We don’t track messages and visits from ads', 20], ['The same ad has run for over a month', 12], ['Ads send people to the homepage, not the product', 10], ['We don’t answer messages after 9 PM', 14], ['We don’t retarget site visitors or engagers', 10]]
    },
    waste: { ar: 'هدر تقديري من الميزانية', en: 'Estimated budget waste' },
    levels: { ar: ['حسابك في حالة جيدة', 'هدر متوسط يمكن إصلاحه', 'هدر كبير: أصلحه قبل أي زيادة في الميزانية'], en: ['Your account looks healthy', 'Moderate waste, easy to fix', 'Heavy waste: fix it before spending more'] },
    first: { ar: 'ابدأ بـ', en: 'Fix first' },
    none: { ar: 'ممتاز. الخطوة التالية: اختبار محتوى جديد كل أسبوعين.', en: 'Great. Next step: test new creative every two weeks.' }
  },
  road: {
    eyebrow: { ar: 'خطة 90 يومًا', en: '90-day plan' },
    title: { ar: 'من الاجتماع الأول إلى نتائج تقيسها.', en: 'From the first meeting to results you can measure.' },
    result: { ar: 'النتيجة', en: 'Outcome' },
    steps: {
      ar: [['الأسبوع 1', 'اجتماع الاستشارة ومراجعة الحسابات والإعلانات.', 'قائمة الأولويات'], ['الأسابيع 2–4', 'إصلاح الأساسيات: الاستهداف، التتبّع، الرد التلقائي.', 'هدر أقل من اليوم الأول'], ['الشهر 2', 'محتوى AI جديد وحملات بهدف واحد واضح.', 'استفسارات أكثر بتكلفة أقل'], ['الشهر 3', 'قياس، تحسين، وخطة الربع القادم.', 'تقرير نتائج وخطة نمو']],
      en: [['Week 1', 'Consultation meeting and a review of accounts and ads.', 'A priority list'], ['Weeks 2–4', 'Fix the basics: targeting, tracking, automatic replies.', 'Less waste from day one'], ['Month 2', 'New AI content and campaigns with one clear goal.', 'More enquiries at lower cost'], ['Month 3', 'Measure, improve and plan the next quarter.', 'Results report and growth plan']]
    }
  }
};

/* ---------------- 1. Meeting types ---------------- */
function types() {
  return section({ id: 'cons-types', eyebrow: L(T.types.eyebrow), title: L(T.types.title), text: L(T.types.text) },
    h('ul', { class: 'pillars' }, ...T.types.items.map((p, i) => {
      const [title, dur, list] = L(p);
      return h('li', { class: 'pillar', 'data-reveal': '', 'data-tilt': '' },
        h('span', { class: 'pillar__glow', 'aria-hidden': 'true' }),
        h('div', { class: 'pillar__top' }, h('span', { class: 'pillar__icon' }, icon(p.i, 26)), h('span', { class: 'pillar__num' }, '0' + (i + 1))),
        h('h3', {}, title),
        h('p', { class: 'pillar__meta' }, icon('clock', 14), ' ' + dur + ' · ', icon('video', 14), ' Meet / Zoom · ' + L(T.types.free)),
        h('ul', { class: 'pillar__list' }, ...list.map((x) => h('li', {}, icon('check', 16), x))),
        h('a', { class: 'btn btn--ghost btn--sm pillar__cta', href: 'booking.html?topic=' + p.topic }, L(T.types.book), icon('arrow', 14)));
    })));
}

/* ---------------- 2. Readiness check ---------------- */
function radar(values, axes) {
  const cx = 160, cy = 150, R = 110, n = axes.length;
  const pt = (i, r) => [cx + Math.sin((i / n) * Math.PI * 2) * r, cy - Math.cos((i / n) * Math.PI * 2) * r];
  const s = svg('svg', { viewBox: '0 0 320 300', class: 'radar', role: 'img', 'aria-label': axes.map((a, i) => a + ' ' + Math.round(values[i] * 100) + '%').join(', ') });
  [0.25, 0.5, 0.75, 1].forEach((k) => s.append(svg('polygon', { points: axes.map((_, i) => pt(i, R * k).join(',')).join(' '), class: 'radar__ring' })));
  axes.forEach((a, i) => {
    const [x, y] = pt(i, R);
    s.append(svg('line', { x1: cx, y1: cy, x2: x, y2: y, class: 'radar__axis' }));
    const [lx, ly] = pt(i, R + 22);
    s.append(svg('text', { x: lx, y: ly + 4, 'text-anchor': 'middle', class: 'radar__label' }, document.createTextNode(a)));
  });
  const poly = svg('polygon', { points: axes.map((_, i) => pt(i, 0).join(',')).join(' '), class: 'radar__shape' });
  s.append(poly);
  const target = axes.map((_, i) => pt(i, Math.max(0.08, values[i]) * R).join(',')).join(' ');
  requestAnimationFrame(() => requestAnimationFrame(() => poly.setAttribute('points', target)));
  return s;
}

function readiness() {
  const c = T.check, qs = L(c.qs), axes = L(c.axes), answers = L(c.answers);
  const vals = [];
  const stage = h('div', { class: 'quiz__stage', 'aria-live': 'polite' });
  const bar = h('span', { class: 'quiz__progress' }, h('i'));
  function ask(i) {
    bar.firstChild.style.setProperty('--w', (i / qs.length * 100) + '%');
    const opts = h('div', { class: 'quiz__opts' }, ...answers.map((a, k) => {
      const b = h('button', { type: 'button', class: 'quiz__opt' }, h('span', { class: 'quiz__dots', 'aria-hidden': 'true' }, ...[0, 1, 2, 3].map((d) => h('i', { class: d <= k ? 'on' : '' }))), a);
      b.addEventListener('click', () => { vals[i] = (k + 1) / 4; i + 1 < qs.length ? ask(i + 1) : result(); });
      return b;
    }));
    const back = i ? h('button', { type: 'button', class: 'quiz__back' }, L(c.back)) : null;
    back?.addEventListener('click', () => ask(i - 1));
    stage.replaceChildren(h('div', { class: 'quiz__q' },
      h('p', { class: 'eyebrow' }, L(c.question) + ' ' + (i + 1) + ' / ' + qs.length + ' · ' + axes[i]),
      h('h3', {}, qs[i]), opts, back));
    if (i) stage.querySelector('.quiz__opt')?.focus({ preventScroll: true });
  }
  function result() {
    bar.firstChild.style.setProperty('--w', '100%');
    const score = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length * 100);
    const level = L(c.levels)[Math.min(3, Math.floor(score / 26))];
    // Keep the result for the booking form and record it (anonymously) in Magmafy OS.
    const readinessResult = { score, level, answers: vals.slice(), at: Date.now() };
    saveReadiness(readinessResult);
    track('readiness_completed', { score, level });
    if (window.MGConsent && window.MGConsent.has('statistics')) crmPost('readiness', { readiness: readinessResult, language: getLang() });
    const recs = vals.map((v, i) => [v, i]).sort((a, b) => a[0] - b[0]).slice(0, 3).map(([, i]) => L(c.recs)[i]);
    const restart = h('button', { type: 'button', class: 'btn btn--ghost btn--sm' }, L(c.restart));
    restart.addEventListener('click', () => { vals.length = 0; ask(0); });
    stage.replaceChildren(h('div', { class: 'quiz__result' },
      h('div', { class: 'quiz__score' }, h('small', {}, L(c.result)), h('strong', {}, String(score)), h('span', { class: 'quiz__level' }, level), radar(vals, axes)),
      h('div', {},
        h('p', { class: 'panel__title' }, L(c.next)),
        h('ol', { class: 'quiz__recs' }, ...recs.map((r) => h('li', {}, r))),
        h('div', { class: 'quiz__actions' }, h('a', { class: 'btn btn--primary btn--sm', href: 'booking.html?topic=general' }, L(c.talk), icon('arrow', 16)), restart))));
  }
  ask(0);
  return section({ id: 'demo-readiness', eyebrow: L(c.eyebrow), title: L(c.title), text: L(c.text), badge: L(T.demo) },
    h('div', { class: 'quiz', 'data-reveal': '' }, bar, stage));
}

/* ---------------- 3. Budget leak finder ---------------- */
function leak() {
  const items = L(T.leak.items);
  const state = items.map((_, i) => i === 0 || i === 2 || i === 5);
  const gauge = h('div', { class: 'gauge gauge--leak' }, h('span', { class: 'gauge__fill' }), h('strong', { class: 'gauge__num' }));
  const level = h('p', { class: 'gauge__level' });
  const prio = h('p', { class: 'sec__prio' });
  const list = h('ul', { class: 'sec__list' }, ...items.map(([label], i) => {
    const input = h('input', { type: 'checkbox', id: 'leak-' + i, checked: state[i] });
    input.addEventListener('change', () => { state[i] = input.checked; draw(); });
    return h('li', {}, input, h('label', { for: 'leak-' + i }, h('span', { class: 'sec__box', 'aria-hidden': 'true' }, icon('check', 14)), label));
  }));
  function draw() {
    const pct = Math.min(60, Math.round(items.reduce((a, [, w], i) => a + (state[i] ? w : 0), 0) * 0.6));
    gauge.style.setProperty('--p', Math.round(pct / 60 * 100));
    gauge.querySelector('.gauge__num').textContent = pct + '%';
    const lv = pct < 12 ? 2 : pct < 30 ? 1 : 0;
    gauge.dataset.level = String(lv);
    level.textContent = L(T.leak.levels)[2 - lv];
    const open = items.map((x, i) => [x, i]).filter(([, i]) => state[i]).sort((a, b) => b[0][1] - a[0][1]);
    prio.replaceChildren(open.length ? h('span', {}, h('b', {}, L(T.leak.first) + ': '), open[0][0][0]) : L(T.leak.none));
  }
  draw();
  return section({ id: 'demo-leak', eyebrow: L(T.leak.eyebrow), title: L(T.leak.title), text: L(T.leak.text), badge: L(T.demo) },
    h('div', { class: 'sec', 'data-reveal': '' }, list, h('div', { class: 'sec__side' }, h('small', { class: 'sec__cap' }, L(T.leak.waste)), gauge, level, prio)));
}

/* ---------------- 4. 90-day plan ---------------- */
function roadmap() {
  return section({ id: 'cons-road', eyebrow: L(T.road.eyebrow), title: L(T.road.title) },
    h('ol', { class: 'road' }, ...L(T.road.steps).map(([a, b, c], i) => h('li', { class: 'road__step', 'data-reveal': '' },
      h('span', { class: 'road__num' }, '0' + (i + 1)), h('h3', {}, a), h('p', {}, b),
      h('p', { class: 'road__out' }, h('small', {}, L(T.road.result)), c)))));
}

export function mount(container) {
  container.replaceChildren(types(), readiness(), leak(), roadmap());
}
