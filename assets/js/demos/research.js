// Market research page: a competitor scan by city and category, a mystery-shopper reply test,
// customer personas and a Saudi seasonal demand calendar. All numbers are sample data.
import { h, icon, L, section, onVisible, money, num, countTo, sleep, reduced } from './kit.js';

const T = {
  demo: { ar: 'تجربة حية · بيانات توضيحية', en: 'Live demo · sample data' },
  scan: {
    eyebrow: { ar: 'تحليل المنافسين', en: 'Competitor analysis' },
    title: { ar: 'سوقك كله في شاشة واحدة.', en: 'Your whole market on one screen.' },
    text: { ar: 'اختر المدينة والفئة. نقارن أسعار المنافسين وتقسيطهم ونشرهم وإعلاناتهم، والذكاء الاصطناعي يحدد أين الفرصة.', en: 'Pick a city and a category. We compare competitors’ prices, instalments, posting and ads, and the AI points to the gap.' },
    cities: { ar: ['الرياض', 'جدة', 'الدمام'], en: ['Riyadh', 'Jeddah', 'Dammam'] },
    cats: { ar: ['كنب ومجالس', 'غرف نوم', 'أثاث مكتبي'], en: ['Sofas & majlis', 'Bedrooms', 'Office'] },
    city: { ar: 'المدينة', en: 'City' }, cat: { ar: 'الفئة', en: 'Category' },
    kpis: { ar: ['منافسون مباشرون', 'متوسط السعر', 'يقدّمون تقسيطًا', 'إعلانات نشطة'], en: ['Direct competitors', 'Average price', 'Offer instalments', 'Active ads'] },
    cols: { ar: ['المنافس', 'السعر', 'تقسيط', 'نشر / أسبوع', 'زمن الرد'], en: ['Competitor', 'Price', 'Instalments', 'Posts / week', 'Reply time'] },
    price: { ar: 'تموضع الأسعار', en: 'Price positioning' },
    insight: { ar: 'فرصة', en: 'Opportunity' },
    you: { ar: 'متوسط السوق', en: 'Market average' }
  },
  spy: {
    eyebrow: { ar: 'العميل المتخفّي', en: 'Mystery shopper' },
    title: { ar: 'سألنا المنافسين: «كم السعر؟»', en: 'We asked competitors: “How much?”' },
    text: { ar: 'نراسل المنافسين كعميل عادي في وقت الذروة، ونقيس من يرد، متى، وكيف. هنا ترى المكسب قبل أن تبدأ.', en: 'We message competitors as an ordinary customer at peak time and measure who replies, when and how. You see the win before you start.' },
    ask: { ar: 'السلام عليكم، كم سعر الكنبة اللي بالصورة؟ وفيه تقسيط؟', en: 'Hi, how much is the sofa in the photo? Do you offer instalments?' },
    sent: { ar: 'أُرسلت الساعة 9:40 م · الخميس', en: 'Sent 9:40 PM · Thursday' },
    waiting: { ar: 'بانتظار الرد…', en: 'Waiting for a reply…' },
    none: { ar: 'لم يرد', en: 'No reply' },
    replies: { ar: ['«السعر في الخاص»', '«4,900 ريال، وفيه تابي 4 دفعات 👍»', '«تفضل المعرض»', '«متوفر، السعر 5,300 والتوصيل مجاني للرياض»'], en: ['“Price in DM”', '“SAR 4,900, Tabby in 4 payments 👍”', '“Visit the showroom”', '“In stock, SAR 5,300, free delivery in Riyadh”'] },
    result: { ar: 'النتيجة', en: 'Result' },
    summary: { ar: (r, s) => r + ' من 5 ردّوا، واثنان فقط ذكرا السعر. متوسط الرد ' + s + '. من يرد خلال 15 دقيقة يكسب العميل.', en: (r, s) => r + ' of 5 replied and only two gave a price. Average reply: ' + s + '. Whoever answers within 15 minutes wins the customer.' },
    replay: { ar: 'أعد الاختبار', en: 'Run again' }
  },
  persona: {
    eyebrow: { ar: 'شخصيات العملاء', en: 'Customer personas' },
    title: { ar: 'من يشتري منك فعلًا؟', en: 'Who actually buys from you?' },
    text: { ar: 'نبني شخصيات من بيانات حقيقية: أين يبحث العميل، ما ميزانيته، ما الذي يقنعه وما الذي يوقفه.', en: 'We build personas from real data: where the customer searches, their budget, what convinces them and what stops them.' },
    labels: { ar: ['الميزانية', 'أين يبحث', 'ما يقنعه', 'ما يوقفه', 'أفضل وقت', 'الرسالة التي تنجح'], en: ['Budget', 'Where they search', 'What convinces', 'What stops them', 'Best time', 'Message that works'] },
    items: [
      { ic: '💍', img: 'bed-velvet', ar: ['عرسان يجهّزون بيتهم', 'نورة وفهد، 26 سنة، الرياض', '15–35 ألف ر.س للبيت كامل', 'إنستجرام، بنترست، تيك توك', 'غرفة كاملة جاهزة، تقسيط بلا فوائد، توصيل وتركيب', 'لا يعرفون المقاسات، يخافون الألوان على الواقع', '9–11 م، الخميس والجمعة', '«جهّز غرفتك كاملة بـ 4 دفعات، ونركّبها لك»'], en: ['Newly-weds furnishing a home', 'Noura & Fahad, 26, Riyadh', 'SAR 15–35k for the whole home', 'Instagram, Pinterest, TikTok', 'Complete room sets, interest-free instalments, delivery and assembly', 'Unsure of sizes, worried colours look different in real life', '9–11 PM, Thursday and Friday', '“Furnish your whole room in 4 payments, assembled for you”'] },
      { ic: '🏡', img: 'living-cream', ar: ['عائلة تنتقل إلى فيلا', 'أم عبدالله، 41 سنة، جدة', '40–90 ألف ر.س', 'سناب شات، جوجل، زيارة المعرض', 'جودة الخامة، مجالس عربية بمقاس خاص، استشارة تصميم', 'مدة التصنيع الطويلة، عدم وضوح الضمان', '4–7 م، طوال الأسبوع', '«مجلسك بمقاسك خلال 3 أسابيع، مع استشارة مجانية في بيتك»'], en: ['A family moving into a villa', 'Umm Abdullah, 41, Jeddah', 'SAR 40–90k', 'Snapchat, Google, showroom visit', 'Fabric quality, custom-size Arabic majlis, design advice', 'Long production times, unclear warranty', '4–7 PM, all week', '“Your majlis made to measure in 3 weeks, with a free home consultation”'] },
      { ic: '🏢', img: 'office-hall', ar: ['مدير مشتريات لشركة', 'خالد، 35 سنة، الدمام', '60–250 ألف ر.س للمشروع', 'لينكدإن، جوجل، توصيات', 'عرض سعر سريع، فاتورة رسمية، تسليم في الموعد', 'عدم وجود ملف أعمال للشركات، الرد البطيء', '9 ص–1 م، الأحد إلى الأربعاء', '«عرض سعر خلال 24 ساعة، وتأثيث مكتبك قبل الافتتاح»'], en: ['A company procurement manager', 'Khalid, 35, Dammam', 'SAR 60–250k per project', 'LinkedIn, Google, referrals', 'Fast quote, formal invoice, on-time delivery', 'No B2B portfolio, slow replies', '9 AM–1 PM, Sunday to Wednesday', '“Quote within 24 hours, your office furnished before opening day”'] }
    ]
  },
  season: {
    eyebrow: { ar: 'تقويم المواسم', en: 'Seasonal calendar' },
    title: { ar: 'متى يشتري السعوديون الأثاث؟', en: 'When does Saudi Arabia buy furniture?' },
    text: { ar: 'الطلب يرتفع وينخفض مع المواسم. اضغط على أي شهر لترى الموسم والحملة التي نجهّزها قبلها بأسابيع.', en: 'Demand rises and falls with the seasons. Tap any month to see the season and the campaign we prepare weeks ahead.' },
    demand: { ar: 'مؤشر الطلب', en: 'Demand index' },
    prep: { ar: 'نبدأ التجهيز', en: 'We start preparing' },
    weeks: { ar: 'قبل 4–6 أسابيع', en: '4–6 weeks before' },
    months: [
      { ar: ['نوفمبر 2026', 'الجمعة البيضاء', 'خصومات وعروض محدودة الوقت، صفحات هبوط بعدّاد تنازلي وإعلانات إعادة استهداف.'], en: ['November 2026', 'White Friday', 'Discounts and time-limited offers, countdown landing pages and retargeting ads.'], v: 92 },
      { ar: ['ديسمبر', 'إجازة منتصف العام', 'العائلات تتسوق معًا: محتوى «جدّد صالتك قبل الضيوف» وزيارات المعرض.'], en: ['December', 'Mid-year school break', 'Families shop together: “refresh your living room before guests” content and showroom visits.'], v: 64 },
      { ar: ['يناير 2027', 'موسم الشتاء والكشتات', 'جلسات خارجية وأثاث حدائق ومجالس دافئة.'], en: ['January 2027', 'Winter & desert outings', 'Outdoor seating, garden furniture and cosy majlis.'], v: 48 },
      { ar: ['فبراير', 'يوم التأسيس ورمضان', 'يوم التأسيس 22 فبراير، ورمضان يبدأ تقريبًا 8 فبراير: سفرة رمضان والمجالس، والنشر بعد التراويح.'], en: ['February', 'Founding Day & Ramadan', 'Founding Day on 22 February and Ramadan from around 8 February: dining sets and majlis, posting after Taraweeh.'], v: 88 },
      { ar: ['مارس', 'عيد الفطر', 'تجهيز البيت للعيد قبل العشر الأواخر، والتوصيل قبل العيد هو الرسالة الأقوى.'], en: ['March', 'Eid al-Fitr', 'Getting the home Eid-ready before the last ten nights; delivery before Eid is the strongest message.'], v: 96 },
      { ar: ['أبريل', 'ما بعد العيد', 'هدوء نسبي: وقت ممتاز لبناء المحتوى وتجربة إعلانات جديدة بتكلفة أقل.'], en: ['April', 'After Eid', 'A quieter month: ideal for building content and testing new ads at lower cost.'], v: 42 },
      { ar: ['مايو', 'عيد الأضحى وبداية موسم الزواج', 'غرف النوم وأطقم العرسان، وعروض الباقات الكاملة.'], en: ['May', 'Eid al-Adha & wedding season begins', 'Bedrooms and newly-wed bundles, with complete package offers.'], v: 84 },
      { ar: ['يونيو', 'موسم الزواج', 'ذروة طلبات غرف النوم والتقسيط، والرد السريع على الرسائل يصنع الفرق.'], en: ['June', 'Wedding season', 'Peak for bedrooms and instalments; fast replies to messages make the difference.'], v: 90 },
      { ar: ['يوليو', 'الصيف والسفر', 'تراجع الزيارات: نركّز على المتجر الإلكتروني والطلب عن بُعد.'], en: ['July', 'Summer & travel', 'Fewer visits: we focus on the online store and remote ordering.'], v: 38 },
      { ar: ['أغسطس', 'العودة للمدارس', 'غرف الأطفال والمكاتب المنزلية.'], en: ['August', 'Back to school', 'Kids’ rooms and home offices.'], v: 58 },
      { ar: ['سبتمبر', 'اليوم الوطني', '23 سبتمبر: عروض اليوم الوطني ومحتوى بالهوية الوطنية.'], en: ['September', 'National Day', '23 September: National Day offers and content in national colours.'], v: 86 },
      { ar: ['أكتوبر', 'الموسم الجديد', 'إطلاق مجموعات الشتاء وموسم الرياض، وتجهيز حملة الجمعة البيضاء.'], en: ['October', 'New season', 'Launching winter collections and Riyadh Season, preparing the White Friday campaign.'], v: 72 }
    ]
  },
  road: {
    eyebrow: { ar: 'ماذا تستلم', en: 'What you receive' },
    title: { ar: '2–5 أيام عمل، وتقرير تبدأ العمل به غدًا.', en: '2–5 working days, and a report you can act on tomorrow.' },
    result: { ar: 'تستلم', en: 'You receive' },
    steps: {
      ar: [['جلسة اكتشاف', 'ساعة على Google Meet أو Zoom نفهم فيها نشاطك وأهدافك ومنافسيك.', 'ملخص الأهداف'], ['جمع البيانات', 'أسعار ومحتوى وإعلانات المنافسين، واختبار العميل المتخفّي.', 'قائمة المنافسين'], ['التحليل', 'شخصيات العملاء، الفجوات، والمواسم المناسبة لنشاطك.', 'خريطة الفرص'], ['العرض والخطة', 'اجتماع نعرض فيه التقرير وخطة 90 يومًا بالأولويات.', 'التقرير + خطة 90 يومًا']],
      en: [['Discovery call', 'One hour on Google Meet or Zoom to understand your business, goals and competitors.', 'Goals summary'], ['Data collection', 'Competitors’ prices, content and ads, plus the mystery-shopper test.', 'Competitor list'], ['Analysis', 'Personas, gaps and the right seasons for your business.', 'Opportunity map'], ['Presentation & plan', 'A meeting where we walk you through the report and a prioritised 90-day plan.', 'Report + 90-day plan']]
    },
    cta: { ar: 'احجز جلسة دراسة السوق', en: 'Book a market research call' }
  }
};

/* ---------------- 1. Competitor scan ---------------- */
const BASE = [[5400, 1], [4900, 1], [6800, 0], [3900, 1], [5900, 0], [4400, 1]];
const POSTS = [[6, 25], [3, 240], [1, 1440], [5, 120], [2, null], [4, 360]];
const ago = (m) => (m == null ? '—' : m < 60 ? m + L({ ar: ' د', en: ' min' }) : m < 1440 ? m / 60 + L({ ar: ' س', en: ' h' }) : m / 1440 + L({ ar: ' يوم', en: ' day' }));
const MUL = [[1, 1.9, 4.6], [1.08, 2.1, 4.1], [0.94, 1.7, 3.8]];
const COUNT = [[14, 11, 6], [11, 9, 5], [7, 6, 4]];

function scan() {
  const cities = L(T.scan.cities), cats = L(T.scan.cats), kn = L(T.scan.kpis);
  let city = 0, cat = 0;
  const kpi = kn.map(() => h('strong', {}, '0'));
  const rows = h('tbody');
  const bars = h('div', { class: 'rep__bars' });
  const ins = h('p');
  const seg = (labels, onPick, label) => {
    const g = h('div', { class: 'seg seg--3', role: 'group', 'aria-label': label }, ...labels.map((x, i) => {
      const b = h('button', { type: 'button', class: 'seg__btn', 'aria-pressed': String(i === 0) }, x);
      b.addEventListener('click', () => { [...g.children].forEach((y) => y.setAttribute('aria-pressed', String(y === b))); onPick(i); calc(); });
      return b;
    }));
    return g;
  };
  const INS = {
    ar: [['منافس واحد فقط يرد خلال ساعة. الرد السريع وحده يكسبك أغلب العملاء.', 'لا أحد يعرض القطع بتقنية 3D أو 360°. هذه فرصتك للتميز.', 'أغلبهم ينشر صور كتالوج. محتوى «الغرفة كاملة» شبه غائب.'], ['المنافسون يعتمدون على العروض فقط. محتوى العرسان وتقسيط الغرفة الكاملة فرصة مفتوحة.', 'نصف المنافسين بلا موقع، والطلب كله عبر الرسائل.', 'إعلانات سناب شات قليلة رغم أن جمهورك عليه.'], ['لا أحد يقدّم ملف أعمال للشركات. صفحة B2B واحدة تفتح لك السوق.', 'عروض الأسعار تتأخر أيامًا. عرض خلال 24 ساعة يكسب الصفقة.', 'لينكدإن غير مستخدم تقريبًا في هذه الفئة.']],
    en: [['Only one competitor replies within an hour. Fast replies alone win most customers.', 'Nobody shows pieces in 3D or 360°. That is your edge.', 'Most post catalogue photos. “Complete room” content is almost missing.'], ['Competitors rely on discounts only. Newly-wed content and whole-room instalments are wide open.', 'Half the competitors have no website; everything happens in DMs.', 'Few Snapchat ads, although your audience is there.'], ['Nobody offers a B2B portfolio. One business page opens the market.', 'Quotes take days. A 24-hour quote wins the deal.', 'LinkedIn is barely used in this category.']]
  };
  let tick = 0;
  function calc() {
    const m = MUL[city][cat];
    const list = BASE.map(([p, inst], i) => ({ n: String.fromCharCode(65 + i), p: Math.round(p * m / 50) * 50, inst: (inst + city + cat + i) % 3 !== 0, posts: Math.max(1, POSTS[i][0] - cat), reply: ago(POSTS[(i + city) % 6][1]), ads: (i + cat) % 2 === 0 }));
    const avg = list.reduce((a, x) => a + x.p, 0) / list.length;
    countTo(kpi[0], COUNT[city][cat]);
    countTo(kpi[1], avg, { format: (v) => money(Math.round(v / 10) * 10) });
    countTo(kpi[2], list.filter((x) => x.inst).length / list.length * 100, { format: (v) => Math.round(v) + '%' });
    countTo(kpi[3], list.filter((x) => x.ads).length * (3 + city) + cat);
    rows.replaceChildren(...list.map((x) => h('tr', {},
      h('td', {}, x.n), h('td', {}, money(x.p)), h('td', {}, x.inst ? '✓' : '—'), h('td', {}, String(x.posts)), h('td', {}, x.reply))));
    const max = Math.max(...list.map((x) => x.p));
    bars.replaceChildren(...[...list, { n: L(T.scan.you), p: avg, you: true }].map((x) => {
      const bar = h('span', { class: 'rep__bar' }, h('i'));
      bar.firstChild.style.setProperty('--w', (x.p / max * 100).toFixed(1) + '%');
      bar.firstChild.style.setProperty('--c', x.you ? '#feda75' : '#d62976');
      return h('div', { class: 'rep__row' }, h('span', {}, x.n), bar, h('b', {}, money(Math.round(x.p / 10) * 10)));
    }));
    ins.textContent = L(INS)[cat][tick++ % 3];
  }
  const box = h('div', { class: 'report', 'data-reveal': '' },
    h('div', { class: 'rep__sources' },
      h('p', { class: 'panel__title' }, L({ ar: 'مصادر البيانات', en: 'Data sources' })),
      h('ul', {}, ...['Instagram', 'Snapchat', 'TikTok', 'Google Maps', 'Meta Ad Library', L({ ar: 'زيارات ميدانية', en: 'Field visits' })].map((s) => h('li', {}, h('i', { class: 'online' }), s))),
      h('div', { class: 'rep__pipe', 'aria-hidden': 'true' }, h('span'), h('span'), h('span'))),
    h('div', { class: 'report__canvas' },
      h('div', { class: 'report__filters' },
        h('div', {}, h('p', { class: 'panel__title' }, L(T.scan.city)), seg(cities, (i) => { city = i; }, L(T.scan.city))),
        h('div', {}, h('p', { class: 'panel__title' }, L(T.scan.cat)), seg(cats, (i) => { cat = i; }, L(T.scan.cat)))),
      h('div', { class: 'report__kpis' }, ...kn.map((n, i) => h('div', { class: 'kpi' }, h('span', { class: 'kpi__label' }, n), kpi[i]))),
      h('div', { class: 'report__grid' },
        h('div', { class: 'panel' }, h('p', { class: 'panel__title' }, L(T.scan.price)), bars),
        h('div', { class: 'panel rep__table-wrap' }, h('table', { class: 'rep__table' },
          h('thead', {}, h('tr', {}, ...L(T.scan.cols).map((x) => h('th', { scope: 'col' }, x)))), rows))),
      h('div', { class: 'insight insight--wide' }, h('span', { class: 'ai-tag' }, L(T.scan.insight)), ins)));
  calc();
  return section({ id: 'demo-scan', eyebrow: L(T.scan.eyebrow), title: L(T.scan.title), text: L(T.scan.text), badge: L(T.demo) }, box);
}

/* ---------------- 2. Mystery shopper ---------------- */
function spy() {
  // minutes until each competitor replies (null = never) and which reply text they send
  const plan = [[38, 0], [12, 1], [null], [95, 2], [7, 3]];
  const fmt = (m) => (m < 60 ? m + (L({ ar: ' د', en: ' min' })) : Math.floor(m / 60) + L({ ar: ' س ', en: ' h ' }) + (m % 60) + L({ ar: ' د', en: ' min' }));
  const rows = plan.map((_, i) => {
    const time = h('b', { class: 'spy__time', dir: 'ltr' }, '0');
    const msg = h('p', { class: 'spy__msg' }, L(T.spy.waiting));
    const li = h('li', { class: 'spy__row' }, h('span', { class: 'spy__av' }, String.fromCharCode(65 + i)), h('div', {}, h('small', {}, L({ ar: 'منافس ', en: 'Competitor ' }) + String.fromCharCode(65 + i)), msg), time);
    return { li, time, msg };
  });
  const sum = h('p', { class: 'spy__sum' });
  const replay = h('button', { type: 'button', class: 'btn btn--ghost btn--sm' }, L(T.spy.replay));
  let playing = false;
  async function play() {
    if (playing) return;
    playing = true; replay.disabled = true; sum.textContent = '';
    rows.forEach((r) => { r.li.className = 'spy__row'; r.msg.textContent = L(T.spy.waiting); r.time.textContent = '0'; });
    const total = 120, stepMs = reduced ? 1 : 45;
    for (let m = 0; m <= total; m += 2) {
      rows.forEach((r, i) => {
        const [at, txt] = plan[i];
        if (r.li.classList.contains('is-done')) return;
        if (at != null && m >= at) { r.li.classList.add('is-done', at <= 15 ? 'is-fast' : 'is-slow'); r.msg.textContent = L(T.spy.replies)[txt]; r.time.textContent = fmt(at); }
        else r.time.textContent = fmt(m);
      });
      await sleep(stepMs);
    }
    rows.forEach((r, i) => { if (plan[i][0] == null) { r.li.classList.add('is-none'); r.msg.textContent = L(T.spy.none); r.time.textContent = '—'; } });
    const got = plan.filter((p) => p[0] != null);
    sum.replaceChildren(h('b', {}, L(T.spy.result) + ': '), L(T.spy.summary)(got.length, fmt(Math.round(got.reduce((a, p) => a + p[0], 0) / got.length))));
    playing = false; replay.disabled = false;
  }
  replay.addEventListener('click', play);
  const box = h('div', { class: 'spy', 'data-reveal': '' },
    h('div', { class: 'spy__ask' }, h('span', { class: 'ai-tag' }, L(T.spy.eyebrow)), h('p', { class: 'bubble bubble--user' }, L(T.spy.ask)), h('small', {}, L(T.spy.sent))),
    h('ol', { class: 'spy__list' }, ...rows.map((r) => r.li)),
    h('div', { class: 'spy__foot' }, sum, replay));
  let done = false;
  onVisible(box, () => { if (!done) { done = true; play(); } });
  return section({ id: 'demo-spy', eyebrow: L(T.spy.eyebrow), title: L(T.spy.title), text: L(T.spy.text), badge: L(T.demo) }, box);
}

/* ---------------- 3. Personas ---------------- */
function personas() {
  const labels = L(T.persona.labels);
  const stage = h('div', { class: 'persona__stage', 'aria-live': 'polite' });
  const tabs = T.persona.items.map((p, i) => {
    const d = L(p);
    const b = h('button', { type: 'button', class: 'persona__tab', role: 'tab', 'aria-selected': String(i === 0) }, h('span', {}, p.ic), h('b', {}, d[0]));
    b.addEventListener('click', () => show(i));
    return b;
  });
  function show(i) {
    tabs.forEach((b, k) => b.setAttribute('aria-selected', String(k === i)));
    const p = T.persona.items[i], d = L(p);
    stage.replaceChildren(h('article', { class: 'persona__card' },
      h('div', { class: 'persona__media' }, h('img', { src: 'assets/img/f/' + p.img + '.webp', alt: '', loading: 'lazy' }), h('div', {}, h('small', {}, p.ic + ' ' + d[0]), h('h3', {}, d[1]))),
      h('dl', { class: 'persona__facts' }, ...labels.map((l, k) => h('div', { class: k === 5 ? 'is-key' : '' }, h('dt', {}, l), h('dd', {}, d[k + 2]))))));
  }
  show(0);
  return section({ id: 'demo-persona', eyebrow: L(T.persona.eyebrow), title: L(T.persona.title), text: L(T.persona.text), badge: L(T.demo) },
    h('div', { class: 'persona', 'data-reveal': '' }, h('div', { class: 'persona__tabs', role: 'tablist' }, ...tabs), stage));
}

/* ---------------- 4. Seasonal calendar ---------------- */
function seasons() {
  const months = T.season.months;
  const info = h('div', { class: 'season__info', 'aria-live': 'polite' });
  const cols = months.map((m, i) => {
    const b = h('button', { type: 'button', class: 'season__col', 'aria-pressed': 'false', 'aria-label': L(m)[0] + ' · ' + L(m)[1] },
      h('span', { class: 'season__bar' }, h('i')), h('small', {}, L(m)[0].split(' ')[0]));
    b.querySelector('i').style.setProperty('--h', m.v + '%');
    if (m.v >= 84) b.classList.add('is-peak');
    b.addEventListener('click', () => pick(i));
    return b;
  });
  function pick(i) {
    cols.forEach((c, k) => c.setAttribute('aria-pressed', String(k === i)));
    const [mon, name, text] = L(months[i]);
    const num_ = h('strong', {}, '0');
    info.replaceChildren(
      h('small', {}, mon), h('h3', {}, name), h('p', {}, text),
      h('div', { class: 'season__meta' },
        h('span', {}, h('small', {}, L(T.season.demand)), num_),
        h('span', {}, h('small', {}, L(T.season.prep)), h('b', {}, L(T.season.weeks)))));
    countTo(num_, months[i].v, { format: (v) => Math.round(v) + ' / 100' });
  }
  pick(4);
  const box = h('div', { class: 'season', 'data-reveal': '' }, h('div', { class: 'season__chart' }, ...cols), info);
  onVisible(box, () => box.classList.add('is-live'));
  return section({ id: 'demo-season', eyebrow: L(T.season.eyebrow), title: L(T.season.title), text: L(T.season.text), badge: L(T.demo) }, box);
}

/* ---------------- 5. Deliverables ---------------- */
function roadmap() {
  return section({ id: 'research-road', eyebrow: L(T.road.eyebrow), title: L(T.road.title) },
    h('ol', { class: 'road' }, ...L(T.road.steps).map(([a, b, c], i) => h('li', { class: 'road__step', 'data-reveal': '' },
      h('span', { class: 'road__num' }, '0' + (i + 1)), h('h3', {}, a), h('p', {}, b),
      h('p', { class: 'road__out' }, h('small', {}, L(T.road.result)), c)))),
    h('div', { class: 'center demo__cta', 'data-reveal': '' }, h('a', { class: 'btn btn--primary', href: 'booking.html?topic=research' }, L(T.road.cta), icon('arrow', 16))));
}

export function mount(container) {
  container.replaceChildren(scan(), spy(), personas(), seasons(), roadmap());
}
