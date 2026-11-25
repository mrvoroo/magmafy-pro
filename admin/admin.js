// Magmafy admin: edits content/site-content.js and commits it to GitHub.
// Authentication is GitHub itself (a fine-grained token limited to this repo),
// so there is no password, server or database here that could be attacked.
// The token lives in memory (optionally sessionStorage for this tab only).

const CONTENT_PATH = 'content/site-content.js';
const PREFIX = 'window.MG_CONTENT = ';
const SESSION_KEY = 'mg-admin-session';
const MAX_TEXT = 5000;
const MAX_IMAGE = 1.5 * 1024 * 1024;

const app = document.getElementById('app');
const state = { owner: 'mrvoroo', repo: 'magmafy-pro', branch: 'main', token: '', sha: null, data: null, dirty: false, offline: false, section: 'journey' };

/* ---------- DOM helper (no innerHTML anywhere) ---------- */
function h(tag, attrs = {}, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v === true ? '' : String(v));
  }
  for (const c of kids.flat(Infinity)) if (c != null && c !== false) el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  return el;
}

/* ---------- Encoding ---------- */
const b64encode = (str) => {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin);
};
const b64decode = (b64) => new TextDecoder().decode(Uint8Array.from(atob(b64.replace(/\s/g, '')), (c) => c.charCodeAt(0)));

function parseContent(src) {
  const body = src.trim();
  if (!body.startsWith(PREFIX)) throw new Error('صيغة الملف غير متوقعة.');
  return JSON.parse(body.slice(PREFIX.length).replace(/;\s*$/, ''));
}
const serialize = (data) => PREFIX + JSON.stringify(data, null, 2) + ';\n';

/* ---------- GitHub API ---------- */
async function gh(path, opts = {}) {
  const res = await fetch('https://api.github.com/repos/' + encodeURIComponent(state.owner) + '/' + encodeURIComponent(state.repo) + path, {
    ...opts,
    headers: { Accept: 'application/vnd.github+json', Authorization: 'Bearer ' + state.token, 'X-GitHub-Api-Version': '2022-11-28', ...(opts.headers || {}) }
  });
  if (!res.ok) {
    const msg = res.status === 401 ? 'التوكن غير صالح أو منتهي.' : res.status === 403 ? 'لا توجد صلاحية (التوكن يحتاج «Contents: Read and write»).' : res.status === 404 ? 'المستودع أو الفرع أو الملف غير موجود.' : res.status === 409 ? 'تعارض في التعديلات، أعد التحميل.' : 'خطأ من GitHub ' + res.status;
    throw new Error(msg);
  }
  return res.json();
}

async function loadRemote() {
  const file = await gh('/contents/' + CONTENT_PATH + '?ref=' + encodeURIComponent(state.branch));
  state.sha = file.sha;
  state.data = parseContent(b64decode(file.content));
}

async function saveRemote() {
  const content = serialize(state.data);
  const out = await gh('/contents/' + CONTENT_PATH, {
    method: 'PUT',
    body: JSON.stringify({ message: 'Update content (Magmafy admin)', content: b64encode(content), sha: state.sha, branch: state.branch })
  });
  state.sha = out.content.sha;
  return out.commit.html_url;
}

// Resizes (max 1400px wide) and re-encodes as WebP in the browser, so a phone photo of several MB
// becomes a ~100-250KB file and the site stays fast. Falls back to the original if anything fails.
async function toWebp(file, maxW = 1400, quality = 0.8) {
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, maxW / bmp.width);
    const c = document.createElement('canvas');
    c.width = Math.round(bmp.width * scale); c.height = Math.round(bmp.height * scale);
    c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
    const blob = await new Promise((res) => c.toBlob(res, 'image/webp', quality));
    return blob && blob.type === 'image/webp' ? new File([blob], file.name.replace(/\.[^.]+$/, '') + '.webp', { type: 'image/webp' }) : file;
  } catch (_) { return file; }
}

async function uploadImage(input, { webp = false, base = '' } = {}) {
  let file = input;
  if (!/^image\/(png|jpeg|webp|avif)$/.test(file.type)) throw new Error('الصيغ المسموحة: PNG أو JPG أو WebP أو AVIF.');
  if (webp && (file.type !== 'image/webp' || file.size > 400 * 1024)) file = await toWebp(file);
  if (file.size > MAX_IMAGE) throw new Error('حجم الصورة أكبر من 1.5 ميجابايت.');
  const ext = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/avif': 'avif' }[file.type];
  const name = (base || file.name.replace(/\.[^.]+$/, '')).toLowerCase().replace(/[^a-z0-9-]+/g, '-').slice(0, 40) || 'image';
  const path = 'assets/uploads/' + name + '-' + Date.now().toString(36) + '.' + ext;
  const buf = new Uint8Array(await file.arrayBuffer());
  let bin = '';
  for (let i = 0; i < buf.length; i += 0x8000) bin += String.fromCharCode(...buf.subarray(i, i + 0x8000));
  await gh('/contents/' + path, { method: 'PUT', body: JSON.stringify({ message: 'Upload image (Magmafy admin)', content: btoa(bin), branch: state.branch }) });
  return path;
}

/* ---------- Validation ---------- */
const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
function validate(data) {
  const problems = [];
  const walk = (v, path) => {
    if (typeof v === 'string') {
      if (v.length > MAX_TEXT) problems.push(path + ': طويل جدًا (الحد ' + MAX_TEXT + ' حرف)');
      const key = path.split('.').pop();
      // i18n holds UI labels ("Email", "Link"), so format rules only apply to data fields.
      if (path.startsWith('i18n.')) return;
      if (/^(url|endpoint|linkedin|instagram|facebook|tiktok|x|snapchat|pinterest)$/.test(key) && v && !/^https:\/\/[^\s"'<>]+$/.test(v) && !(key === 'url' && /^[\w\-./]+$/.test(v))) problems.push(path + ': يجب أن يبدأ بـ https://');
      if (/^(image|before|after|thumbBefore|thumbAfter)$/.test(key) && v && !/^assets\/[\w\-./]+\.(png|jpe?g|webp|avif|svg)$/i.test(v)) problems.push(path + ': مسار الصورة يجب أن يكون داخل assets/');
      if (key === 'whatsapp' && v && !/^\+?[\d\s-]{8,18}$/.test(v)) problems.push(path + ': رقم واتساب غير صالح (مثال: +966509209446)');
      if (key === 'email' && v && !/^[^\s@<>]+@[^\s@<>]+\.[a-z]{2,}$/i.test(v)) problems.push(path + ': بريد إلكتروني غير صالح');
    } else if (Array.isArray(v)) v.forEach((x, i) => walk(x, path + '[' + i + ']'));
    else if (v && typeof v === 'object') Object.entries(v).forEach(([k, x]) => walk(x, path ? path + '.' + k : k));
  };
  walk(data, '');
  return problems;
}
function clean(v) {
  if (typeof v === 'string') return v.replace(CONTROL, '');
  if (Array.isArray(v)) return v.map(clean);
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, clean(x)]));
  return v;
}

/* ---------- Labels ---------- */
const LABELS = {
  settings: 'الإعدادات والتواصل', legal: 'بيانات المنشأة', projects: 'مشاريع الأعمال',
  'i18n.ar': 'النصوص · العربية', 'i18n.en': 'النصوص · English',
  brand: 'اسم العلامة', brandSuffix: 'إضافة للاسم', defaultLang: 'اللغة الافتراضية (ar / en)', email: 'البريد الإلكتروني', bookingEmail: 'بريد استلام الحجوزات', phone: 'الجوال', whatsapp: 'رقم واتساب (استقبال طلبات الفورم + التواصل)', address: 'العنوان',
  analytics: 'أدوات التتبع (تعمل بعد موافقة الزائر)', ga4: 'Google Analytics 4 — Measurement ID (G-XXXXXXXXXX)', clarity: 'Microsoft Clarity — Project ID',
  social: 'روابط التواصل الاجتماعي (https://…)', form: 'نموذج الحجز', accessKey: 'Web3Forms Access Key', endpoint: 'رابط إرسال النموذج (Magmafy OS · Apps Script /exec)', provider: 'المزود',
  name: 'الاسم', company: 'الاسم التجاري', crNumber: 'رقم السجل التجاري', vatNumber: 'الرقم الضريبي (VAT)', street: 'الشارع', zip: 'الرمز البريدي', city: 'المدينة', country: 'الدولة', hosting: 'مزود الاستضافة',
  image: 'الصورة', visible: 'ظاهر في الموقع', url: 'الرابط', tags: 'الوسوم', title: 'العنوان', label: 'التسمية', text: 'النص', languages: 'اللغات', demo: 'العرض الحي'
};
const label = (key) => LABELS[key] || key;

/* ---------- Generic editor ---------- */
function setAt(path, value) {
  let o = state.data;
  for (let i = 0; i < path.length - 1; i++) o = o[path[i]];
  o[path[path.length - 1]] = value;
  markDirty();
}

function fieldFor(value, path, key) {
  if (typeof value === 'string') {
    const long = value.length > 80 || /text|paragraph|intro|banner|^p$/.test(String(key));
    const input = long ? h('textarea', { rows: Math.min(8, Math.max(3, Math.ceil(value.length / 90))), maxlength: String(MAX_TEXT) }) : h('input', { type: /accessKey|token/.test(key) ? 'password' : 'text', maxlength: String(MAX_TEXT), autocomplete: 'off' });
    input.value = value;
    input.addEventListener('input', () => setAt(path, input.value));
    const wrap = h('div', { class: 'f', 'data-search': (path.join('.') + ' ' + value).toLowerCase() }, h('label', {}, label(key)), input);
    if (key === 'image') {
      const file = h('input', { type: 'file', accept: 'image/png,image/jpeg,image/webp,image/avif', class: 'file' });
      const btn = h('button', { type: 'button', class: 'btn btn--ghost', disabled: state.offline }, 'رفع صورة');
      btn.addEventListener('click', () => file.click());
      file.addEventListener('change', async () => {
        const f = file.files[0];
        if (!f) return;
        btn.disabled = true; btn.textContent = 'جاري الرفع…';
        try { const p = await uploadImage(f); input.value = p; setAt(path, p); toast('تم رفع الصورة.'); }
        catch (e) { toast(e.message, true); }
        finally { btn.disabled = false; btn.textContent = 'رفع صورة'; }
      });
      wrap.append(h('div', { class: 'row' }, btn, file));
    }
    return wrap;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    const input = h('input', { type: typeof value === 'number' ? 'number' : 'checkbox' });
    if (typeof value === 'boolean') input.checked = value; else input.value = value;
    input.addEventListener('input', () => setAt(path, typeof value === 'boolean' ? input.checked : Number(input.value)));
    return h('div', { class: 'f', 'data-search': path.join('.').toLowerCase() }, h('label', {}, label(key)), input);
  }
  if (Array.isArray(value)) return arrayEditor(value, path, key);
  if (value && typeof value === 'object') {
    return h('fieldset', { class: 'group' }, h('legend', {}, label(key)), ...Object.entries(value).map(([k, v]) => fieldFor(v, [...path, k], k)));
  }
  return h('p', {}, '—');
}

function arrayEditor(arr, path, key) {
  const box = h('fieldset', { class: 'group group--list' }, h('legend', {}, label(key) + ' (' + arr.length + ')'));
  const rerender = () => box.replaceWith(arrayEditor(arr, path, key));
  arr.forEach((item, i) => {
    const up = h('button', { type: 'button', class: 'mini', 'aria-label': 'لأعلى', disabled: i === 0 }, '↑');
    const down = h('button', { type: 'button', class: 'mini', 'aria-label': 'لأسفل', disabled: i === arr.length - 1 }, '↓');
    const del = h('button', { type: 'button', class: 'mini mini--del', 'aria-label': 'حذف' }, '✕');
    up.addEventListener('click', () => { [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]]; markDirty(); rerender(); });
    down.addEventListener('click', () => { [arr[i + 1], arr[i]] = [arr[i], arr[i + 1]]; markDirty(); rerender(); });
    del.addEventListener('click', () => { if (confirmInline(del)) { arr.splice(i, 1); markDirty(); rerender(); } });
    box.append(h('div', { class: 'item' }, h('div', { class: 'item__bar' }, h('span', {}, '#' + (i + 1)), up, down, del), fieldFor(item, [...path, i], typeof item === 'object' ? key + ' ' + (i + 1) : '')));
  });
  const add = h('button', { type: 'button', class: 'btn btn--ghost' }, '+ إضافة عنصر');
  add.addEventListener('click', () => {
    const tpl = arr.length ? blank(arr[arr.length - 1]) : '';
    if (tpl && typeof tpl === 'object' && 'id' in tpl) tpl.id = 'p' + Date.now().toString(36);
    arr.push(tpl); markDirty(); rerender();
  });
  box.append(add);
  return box;
}
// Two-click delete instead of window.confirm (no blocking dialogs).
function confirmInline(btn) {
  if (btn.dataset.armed) return true;
  btn.dataset.armed = '1'; btn.textContent = 'متأكد؟';
  setTimeout(() => { delete btn.dataset.armed; btn.textContent = '✕'; }, 2500);
  return false;
}
const blank = (v) => (typeof v === 'string' ? '' : typeof v === 'number' ? 0 : typeof v === 'boolean' ? false : Array.isArray(v) ? [] : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, blank(x)])) : v);

/* ---------- Journey section editor (client card, 6 steps, before/after pairs) ---------- */
const STEP_NAMES = ['دراسة السوق', 'محتوى AI', 'معرض 3D أونلاين', 'الرسائل إلى مواعيد', 'مساعد ذكي', 'الإعلانات والنتائج'];

function ensureShowcase() {
  const d = state.data;
  d.showcase = d.showcase || {};
  const s = d.showcase;
  s.client = s.client || { visible: true, thumbBefore: '', thumbAfter: '', ar: {}, en: {} };
  s.steps = Array.isArray(s.steps) && s.steps.length === 6 ? s.steps : ['research', 'ai', 'showroom', 'dms', 'assistant', 'results'].map((id) => ({ id, visible: true }));
  s.compare = Array.isArray(s.compare) ? s.compare : [];
  return s;
}

function toggle(obj, key, text) {
  const cb = h('input', { type: 'checkbox' });
  cb.checked = obj[key] !== false;
  const wrap = h('label', { class: 'switch' }, cb, h('span', {}, text));
  cb.addEventListener('change', () => { obj[key] = cb.checked; markDirty(); wrap.closest('.vcard')?.classList.toggle('is-off', !cb.checked); });
  return wrap;
}

function textField(obj, key, text, { long = false } = {}) {
  const input = long ? h('textarea', { rows: 3, maxlength: String(MAX_TEXT) }) : h('input', { type: 'text', maxlength: String(MAX_TEXT), autocomplete: 'off' });
  input.value = obj[key] || '';
  input.addEventListener('input', () => { obj[key] = input.value; markDirty(); });
  return h('div', { class: 'f', 'data-search': (text + ' ' + (obj[key] || '')).toLowerCase() }, h('label', {}, text), input);
}

function imagePicker(obj, key, title, base) {
  const img = h('img', { alt: '', class: 'pic__img' });
  const sync = () => { if (obj[key]) img.src = '../' + obj[key]; else img.removeAttribute('src'); };
  sync();
  const file = h('input', { type: 'file', accept: 'image/png,image/jpeg,image/webp,image/avif', class: 'file' });
  const btn = h('button', { type: 'button', class: 'btn btn--ghost', disabled: state.offline }, obj[key] ? 'استبدال الصورة' : 'رفع صورة');
  btn.addEventListener('click', () => file.click());
  file.addEventListener('change', async () => {
    const f = file.files[0];
    if (!f) return;
    btn.disabled = true; btn.textContent = 'جاري الضغط والرفع…';
    try { obj[key] = await uploadImage(f, { webp: true, base }); sync(); markDirty(); toast('تم رفع الصورة وتحسينها تلقائيًا.'); }
    catch (e) { toast(e.message, true); }
    finally { btn.disabled = false; btn.textContent = 'استبدال الصورة'; file.value = ''; }
  });
  return h('div', { class: 'pic' }, h('span', { class: 'pic__t' }, title), h('div', { class: 'pic__frame' }, img), btn, file);
}

function focusSlider(obj, key) {
  const input = h('input', { type: 'range', min: '0', max: '100', step: '1', 'aria-label': 'موضع الصورة داخل الإطار' });
  input.value = obj[key] ?? 50;
  input.addEventListener('input', () => { obj[key] = Number(input.value); markDirty(); });
  return h('div', { class: 'f' }, h('label', {}, 'موضع الصورة داخل الإطار (أعلى ← أسفل)'), input);
}

function journeyEditor() {
  const s = ensureShowcase();
  const root = h('div', { class: 'jed' });
  const rerender = () => root.replaceChildren(...build());
  const build = () => {
    const out = [];
    out.push(h('p', { class: 'note' }, 'من هنا تتحكم في سيكشن «رحلة العميل» بالصفحة الرئيسية، وفي استوديو الصور بصفحة المحتوى. أي عنصر تخفيه لا يُحذف وتقدر ترجّعه في أي وقت. اضغط «نشر» لتظهر التعديلات على الموقع.'));
    if (state.offline) out.push(h('p', { class: 'note' }, 'وضع بدون GitHub: رفع الصور غير متاح. ادخل بالتوكن لرفع صور جديدة.'));

    /* client card */
    const c = s.client;
    c.ar = c.ar || {}; c.en = c.en || {};
    out.push(h('fieldset', { class: 'group vcard' + (c.visible === false ? ' is-off' : '') },
      h('legend', {}, 'بطاقة العميل (دار ليفينج)'),
      toggle(c, 'visible', 'إظهار البطاقة'),
      h('div', { class: 'grid2' },
        h('div', {}, h('h4', {}, 'العربية'), ...[['label', 'التسمية (عميل توضيحي)'], ['name', 'الاسم'], ['example', 'عنوان «مثال: …»']].map(([k, l]) => textField(c.ar, k, l)), textField(c.ar, 'desc', 'الوصف', { long: true }), textField(c.ar, 'goal', 'الهدف', { long: true })),
        h('div', { dir: 'ltr' }, h('h4', {}, 'English'), ...[['label', 'Label'], ['name', 'Name'], ['example', 'Example title']].map(([k, l]) => textField(c.en, k, l)), textField(c.en, 'desc', 'Description', { long: true }), textField(c.en, 'goal', 'Goal', { long: true }))),
      h('p', { class: 'muted' }, 'الصورتان الصغيرتان في البطاقة تؤخذان تلقائيًا من أول زوج ظاهر في «قبل وبعد». لتغييرهما ارفع صورة مخصصة:'),
      h('div', { class: 'row' }, imagePicker(c, 'thumbBefore', 'الصورة الصغيرة · قبل (اختياري)', 'client-before'), imagePicker(c, 'thumbAfter', 'الصورة الصغيرة · بعد (اختياري)', 'client-after'))));

    /* steps */
    const stepsBox = h('fieldset', { class: 'group' }, h('legend', {}, 'الخطوات الست (الخدمات)'), h('p', { class: 'muted' }, 'إخفاء خطوة يخفيها من الموقع ويعيد ترقيم الباقي تلقائيًا. الترتيب ثابت لأن لكل خطوة عرضها التفاعلي.'));
    s.steps.forEach((st, i) => {
      const ar = state.data.i18n?.ar?.journey?.steps?.[i], en = state.data.i18n?.en?.journey?.steps?.[i];
      stepsBox.append(h('details', { class: 'vcard' + (st.visible === false ? ' is-off' : '') },
        h('summary', {}, h('b', {}, String(i + 1).padStart(2, '0') + ' · ' + (ar?.title || STEP_NAMES[i]))),
        toggle(st, 'visible', 'إظهار هذه الخطوة في الموقع'),
        h('div', { class: 'grid2' },
          ar ? h('div', {}, h('h4', {}, 'العربية'), textField(ar, 'title', 'العنوان'), textField(ar, 'tag', 'المدة / الوسم'), textField(ar, 'text', 'الوصف', { long: true })) : null,
          en ? h('div', { dir: 'ltr' }, h('h4', {}, 'English'), textField(en, 'title', 'Title'), textField(en, 'tag', 'Tag'), textField(en, 'text', 'Description', { long: true })) : null)));
    });
    out.push(stepsBox);

    /* before / after pairs */
    const box = h('fieldset', { class: 'group' }, h('legend', {}, 'صور قبل وبعد (' + s.compare.length + ')'),
      h('p', { class: 'muted' }, 'تظهر كتابات (تابات) فوق السلايدر بنفس الترتيب. الصور تُضغط وتتحول WebP تلقائيًا عند الرفع. الإطار 4:3، فلو القطعة مقطوعة حرّك «موضع الصورة».'));
    s.compare.forEach((p, i) => {
      p.name = p.name || { ar: '', en: '' };
      const up = h('button', { type: 'button', class: 'mini', 'aria-label': 'لأعلى', disabled: i === 0 }, '↑');
      const down = h('button', { type: 'button', class: 'mini', 'aria-label': 'لأسفل', disabled: i === s.compare.length - 1 }, '↓');
      const del = h('button', { type: 'button', class: 'mini mini--del', 'aria-label': 'حذف' }, '✕');
      up.addEventListener('click', () => { [s.compare[i - 1], s.compare[i]] = [s.compare[i], s.compare[i - 1]]; markDirty(); rerender(); });
      down.addEventListener('click', () => { [s.compare[i + 1], s.compare[i]] = [s.compare[i], s.compare[i + 1]]; markDirty(); rerender(); });
      del.addEventListener('click', () => { if (confirmInline(del)) { s.compare.splice(i, 1); markDirty(); rerender(); } });
      const pair = (key, fkey, title) => {
        const pk = imagePicker(p, key, title, 'ba-' + p.id + '-' + key);
        const sl = focusSlider(p, fkey);
        const img = pk.querySelector('img');
        sl.querySelector('input').addEventListener('input', (e) => { img.style.objectPosition = '50% ' + e.target.value + '%'; });
        img.style.objectPosition = '50% ' + (p[fkey] ?? 50) + '%';
        return h('div', { class: 'pairbox' }, pk, sl);
      };
      box.append(h('div', { class: 'vcard item' + (p.visible === false ? ' is-off' : '') },
        h('div', { class: 'item__bar' }, h('span', {}, '#' + (i + 1) + ' · ' + (p.name.ar || '—')), toggle(p, 'visible', 'ظاهر'), up, down, del),
        h('div', { class: 'grid2' }, textField(p.name, 'ar', 'الاسم بالعربية'), h('div', { dir: 'ltr' }, textField(p.name, 'en', 'Name (English)'))),
        h('div', { class: 'grid2' }, pair('before', 'beforeFocus', 'قبل · صورة الجوال'), pair('after', 'afterFocus', 'بعد · مشهد AI'))));
    });
    const add = h('button', { type: 'button', class: 'btn btn--ghost' }, '+ إضافة زوج صور');
    add.addEventListener('click', () => { s.compare.push({ id: 'p' + Date.now().toString(36), visible: true, name: { ar: '', en: '' }, before: '', after: '', beforeFocus: 50, afterFocus: 50 }); markDirty(); rerender(); });
    box.append(add);
    if (!s.compare.some((p) => p.visible !== false && p.before && p.after)) box.prepend(h('p', { class: 'note' }, 'تنبيه: لا يوجد أي زوج ظاهر بصورتين. سيختفي السلايدر من الموقع.'));
    out.push(box);
    return out;
  };
  rerender();
  return root;
}

/* ---------- Social icons & WhatsApp (footer and contact page) ---------- */
function socialEditor() {
  const st = state.data.settings;
  st.social = st.social || {};
  st.socialVisible = st.socialVisible || {};
  const root = h('div', { class: 'jed' });
  root.append(h('p', { class: 'note' }, 'الأيقونة تظهر في الموقع (الفوتر وصفحة الحجز) فقط لو مفعّلة ولها رابط. أي أيقونة بدون رابط تختفي تلقائيًا. اضغط «نشر» لتظهر التعديلات.'));
  const row = (key, name, obj, field, { placeholder, hint, dir = 'ltr' } = {}) => {
    const input = h('input', { type: 'text', maxlength: '300', autocomplete: 'off', placeholder, dir });
    input.value = obj[field] || '';
    const note = h('small', { class: 'muted' });
    const sync = () => {
      const on = st.socialVisible[key] !== false;
      const filled = !!input.value.trim();
      note.textContent = !filled ? 'بدون رابط: لن تظهر الأيقونة.' : !on ? 'مخفية: لن تظهر الأيقونة.' : hint ? hint(input.value) : 'ظاهرة في الموقع.';
      card.classList.toggle('is-off', !on || !filled);
    };
    input.addEventListener('input', () => { obj[field] = input.value.trim(); markDirty(); sync(); });
    const cb = h('input', { type: 'checkbox' });
    cb.checked = st.socialVisible[key] !== false;
    cb.addEventListener('change', () => { st.socialVisible[key] = cb.checked; markDirty(); sync(); });
    const card = h('div', { class: 'vcard', 'data-search': (name + ' ' + key).toLowerCase() },
      h('label', { class: 'switch' }, cb, h('span', {}, name)),
      h('div', { class: 'f' }, h('label', {}, field === 'whatsapp' ? 'رقم واتساب (استقبال طلبات الفورم + التواصل)' : 'الرابط (https://…)'), input),
      field === 'whatsapp' ? h('p', { class: 'note' }, 'فورم الحجز وكل أزرار التواصل في الموقع تستخدم هذا الرقم. اكتبه بالصيغة الدولية (مثال: ⁦+966509209446⁩). التعديل يظهر في الموقع خلال دقيقة إلى دقيقتين بعد «نشر».') : null, note);
    sync();
    return card;
  };
  const waHint = (v) => { const d = v.replace(/[^\d]/g, ''); return d ? 'ظاهرة، وتفتح: wa.me/' + d : 'بدون رقم.'; };
  root.append(
    row('whatsapp', 'WhatsApp', st, 'whatsapp', { placeholder: '+966509209446', hint: waHint }),
    ...[['instagram', 'Instagram'], ['tiktok', 'TikTok'], ['snapchat', 'Snapchat'], ['x', 'X (Twitter)'], ['linkedin', 'LinkedIn']].map(([k, n]) => row(k, n, st.social, k, { placeholder: 'https://…' })));
  return root;
}

/* ---------- Screens ---------- */
let toastEl;
function toast(msg, err = false) {
  toastEl?.remove();
  toastEl = h('div', { class: 'toast' + (err ? ' toast--err' : ''), role: 'status' }, msg);
  document.body.append(toastEl);
  setTimeout(() => toastEl?.remove(), 4200);
}

function markDirty() {
  state.dirty = true;
  document.querySelector('.save')?.classList.add('is-dirty');
}

function loginScreen(error = '') {
  const owner = h('input', { value: state.owner, autocomplete: 'off', required: true, pattern: '[A-Za-z0-9-]+' });
  const repo = h('input', { value: state.repo, autocomplete: 'off', required: true, pattern: '[A-Za-z0-9._-]+' });
  const branch = h('input', { value: state.branch, autocomplete: 'off', required: true });
  const token = h('input', { type: 'password', autocomplete: 'off', required: true, placeholder: 'github_pat_…' });
  const remember = h('input', { type: 'checkbox', id: 'remember' });
  const err = h('p', { class: 'err', role: 'alert' }, error);
  const go = h('button', { type: 'submit', class: 'btn btn--primary' }, 'دخول');
  const offline = h('button', { type: 'button', class: 'btn btn--ghost' }, 'تعديل بدون GitHub (تنزيل الملف)');
  const form = h('form', { class: 'card login', novalidate: true },
    h('div', { class: 'brand', dir: 'ltr' }, h('img', { src: '../assets/img/logo-mark.webp', width: '28', height: '28', alt: '', class: 'brand__logo' }), h('b', {}, 'Magmafy'), h('small', {}, 'Admin')),
    h('h1', {}, 'إدارة محتوى الموقع'),
    h('p', { class: 'muted' }, 'ادخل بتوكن GitHub له صلاحية على هذا المستودع فقط. التعديلات تظهر على الموقع خلال دقيقة تقريبًا.'),
    h('div', { class: 'grid3' },
      h('div', { class: 'f' }, h('label', {}, 'حساب GitHub'), owner),
      h('div', { class: 'f' }, h('label', {}, 'المستودع'), repo),
      h('div', { class: 'f' }, h('label', {}, 'الفرع'), branch)),
    h('div', { class: 'f' }, h('label', {}, 'التوكن (Fine-grained)'), token),
    h('label', { class: 'check', for: 'remember' }, remember, ' تذكّرني في هذا التبويب فقط (يُحذف عند الإغلاق)'),
    err, go, offline,
    h('details', { class: 'help' },
      h('summary', {}, 'طريقة إنشاء التوكن (دقيقتان)'),
      h('ol', {},
        h('li', {}, 'GitHub ← Settings ← Developer settings ← Personal access tokens ← Fine-grained tokens ← Generate new token.'),
        h('li', {}, 'Repository access: اختر «Only select repositories» ثم هذا المستودع فقط.'),
        h('li', {}, 'Permissions ← Repository ← Contents: «Read and write». ولا شيء غيرها.'),
        h('li', {}, 'حدد تاريخ انتهاء (مثلًا 90 يومًا)، ثم انسخ التوكن والصقه هنا.'))));
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!form.checkValidity() || !/^github_pat_|^ghp_/.test(token.value.trim())) { err.textContent = 'املأ كل الحقول بشكل صحيح.'; return; }
    Object.assign(state, { owner: owner.value.trim(), repo: repo.value.trim(), branch: branch.value.trim(), token: token.value.trim(), offline: false });
    go.disabled = true; go.textContent = 'جاري التحقق…';
    try {
      await loadRemote();
      if (remember.checked) sessionStorage.setItem(SESSION_KEY, JSON.stringify({ owner: state.owner, repo: state.repo, branch: state.branch, token: state.token }));
      editor();
    } catch (ex) {
      state.token = '';
      err.textContent = ex.message;
      go.disabled = false; go.textContent = 'دخول';
    }
  });
  offline.addEventListener('click', async () => {
    try {
      const src = await (await fetch('../' + CONTENT_PATH, { cache: 'no-store' })).text();
      state.data = parseContent(src);
      state.offline = true;
      editor();
    } catch (ex) { err.textContent = 'تعذّر تحميل المحتوى: ' + ex.message; }
  });
  app.replaceChildren(h('main', { class: 'center' }, form));
}

function sectionList() {
  const s = [['journey', 'رحلة العميل · قبل وبعد'], ['social', 'السوشيال والواتساب'], ['settings', LABELS.settings], ['legal', LABELS.legal], ['projects', LABELS.projects]];
  for (const l of Object.keys(state.data.i18n || {})) s.push(['i18n.' + l, LABELS['i18n.' + l] || 'النصوص · ' + l]);
  return s;
}

function editor() {
  const nav = h('nav', { class: 'side' }, h('div', { class: 'brand', dir: 'ltr' }, h('img', { src: '../assets/img/logo-mark.webp', width: '28', height: '28', alt: '', class: 'brand__logo' }), h('b', {}, 'Magmafy'), h('small', {}, 'Admin')));
  const main = h('section', { class: 'content' });
  const search = h('input', { type: 'search', placeholder: 'ابحث عن حقل أو نص…', class: 'search' });
  const save = h('button', { type: 'button', class: 'btn btn--primary save' }, state.offline ? 'تنزيل الملف' : 'نشر');
  const reload = h('button', { type: 'button', class: 'btn btn--ghost', hidden: state.offline }, 'إعادة تحميل');
  const logout = h('button', { type: 'button', class: 'btn btn--ghost' }, 'خروج');
  const view = h('a', { class: 'btn btn--ghost', href: '../index.html', target: '_blank', rel: 'noopener' }, 'عرض الموقع ↗');

  const show = (key) => {
    state.section = key;
    [...nav.querySelectorAll('button')].forEach((b) => b.setAttribute('aria-current', b.dataset.key === key ? 'page' : 'false'));
    if (key === 'social') { main.replaceChildren(h('h2', {}, 'السوشيال والواتساب'), socialEditor()); filter(); return; }
    if (key === 'journey') { main.replaceChildren(h('h2', {}, 'رحلة العميل · قبل وبعد'), journeyEditor()); filter(); return; }
    const path = key.split('.');
    let v = state.data;
    for (const p of path) v = v[p];
    main.replaceChildren(...[h('h2', {}, sectionList().find(([k]) => k === key)[1]),
      key === 'legal' ? h('p', { class: 'note' }, 'بيانات المنشأة: الاسم التجاري، رقم السجل التجاري، الرقم الضريبي (إن وجد)، العنوان الوطني والبريد الإلكتروني. تظهر في صفحة الشروط والأحكام.') : null,
      key === 'settings' ? h('p', { class: 'note' }, 'نموذج الحجز: الزائر يكمل الطلب على واتساب على الرقم المضبوط في «رقم واتساب (استقبال طلبات الفورم + التواصل)». وقبل فتح واتساب تُحفظ نسخة من الطلب في Magmafy OS: الصق رابط Google Apps Script الذي ينتهي بـ /exec في «رابط إرسال النموذج». بدون الرابط يعمل الفورم ويفتح واتساب، لكن بدون نسخة احتياطية.') : null,
      ...(Array.isArray(v) ? [arrayEditor(v, path, key)] : Object.entries(v).map(([k, x]) => fieldFor(x, [...path, k], k)))].filter(Boolean));
    filter();
  };
  const filter = () => {
    const q = search.value.trim().toLowerCase();
    main.querySelectorAll('.f').forEach((f) => { f.hidden = !!q && !f.dataset.search.includes(q); });
    [...main.querySelectorAll('.group')].reverse().forEach((g) => { g.hidden = !!q && !g.querySelector('.f:not([hidden])'); });
  };
  search.addEventListener('input', filter);
  for (const [k, l] of sectionList()) {
    const b = h('button', { type: 'button', 'data-key': k }, l);
    b.addEventListener('click', () => show(k));
    nav.append(b);
  }
  save.addEventListener('click', async () => {
    state.data = clean(state.data);
    state.data.meta = { ...(state.data.meta || {}), updated: new Date().toISOString().slice(0, 10) };
    const problems = validate(state.data);
    if (problems.length) { toast('صحّح التالي: ' + problems.slice(0, 3).join(' · '), true); return; }
    if (state.offline) {
      const url = URL.createObjectURL(new Blob([serialize(state.data)], { type: 'text/javascript' }));
      const a = h('a', { href: url, download: 'site-content.js' });
      document.body.append(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast('تم تنزيل الملف. استبدل به content/site-content.js.');
      state.dirty = false; save.classList.remove('is-dirty');
      return;
    }
    save.disabled = true; save.textContent = 'جاري الحفظ…';
    try {
      const link = await saveRemote();
      state.dirty = false; save.classList.remove('is-dirty');
      toast('تم النشر ✓ ويظهر خلال دقيقة تقريبًا.');
      main.prepend(h('p', { class: 'note note--ok' }, 'تم الحفظ. ', h('a', { href: link, target: '_blank', rel: 'noopener noreferrer' }, 'عرض التعديل على GitHub ↗')));
    } catch (ex) { toast(ex.message, true); }
    finally { save.disabled = false; save.textContent = 'نشر'; }
  });
  reload.addEventListener('click', async () => {
    try { await loadRemote(); state.dirty = false; show(state.section); toast('تمت إعادة التحميل.'); } catch (ex) { toast(ex.message, true); }
  });
  logout.addEventListener('click', () => {
    sessionStorage.removeItem(SESSION_KEY);
    Object.assign(state, { token: '', data: null, sha: null, dirty: false });
    loginScreen();
  });

  app.replaceChildren(h('div', { class: 'layout' },
    nav,
    h('div', { class: 'main' },
      h('header', { class: 'top' }, search, h('div', { class: 'row' }, view, reload, logout, save)),
      main)));
  show(state.section);
}

window.addEventListener('beforeunload', (e) => { if (state.dirty) { e.preventDefault(); e.returnValue = ''; } });

(async function boot() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null');
    if (saved && saved.token) {
      Object.assign(state, saved);
      await loadRemote();
      editor();
      return;
    }
  } catch (_) { sessionStorage.removeItem(SESSION_KEY); }
  loginScreen();
})();
