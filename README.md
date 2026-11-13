# Magmafy Pro

موقع Magmafy الجديد: تسويق ومواقع ومحتوى بالذكاء الاصطناعي لمحلات ومعارض الأثاث في السعودية.
موقع ثابت (HTML وCSS وJavaScript) بدون خادم وبدون خطوة بناء. العربية هي اللغة الافتراضية، والإنجليزية متاحة من زر اللغة.

The new Magmafy site: AI marketing, websites and content for furniture shops and showrooms in Saudi Arabia.
A static site (HTML, CSS, JavaScript) with no server and no build step. Arabic is the default; English is one click away.

## التشغيل محليًا / Run locally

```
python -m http.server 8080
```

ثم افتح / then open http://localhost:8080

(لا تفتح index.html مباشرة من المجلد؛ الوحدات والنماذج ثلاثية الأبعاد تحتاج خادمًا محليًا.
Don't double-click index.html; ES modules and the 3D models need a local server.)

## الصفحات / Pages

| الصفحة | Page |
|---|---|
| index.html | الرئيسية: عالم 3D، رحلة العميل، الأعمال، الأسئلة / Home |
| research.html | أبحاث السوق: تقرير المدينة، المتسوق الخفي، الشخصيات، المواسم / Market research |
| content.html | المحتوى والإعلانات: استوديو AI، التقويم، الإعلانات، التقارير / Content and ads |
| websites.html | المواقع: كنبة 3D قابلة للتخصيص، مواقع مصغرة، حاسبة النطاق / Websites |
| consulting.html | الاستشارات: اختبار الجاهزية، تسرب العملاء / Consulting |
| portfolio.html | الأعمال: 9 مشاريع تفاعلية / Portfolio |
| booking.html | حجز موعد: Google Meet أو Zoom، السبت متاح والجمعة إجازة / Booking |
| privacy.html, terms.html, accessibility.html | الخصوصية (PDPL) والشروط وسهولة الوصول / Policies |

## تعديل المحتوى / Editing content

- كل النصوص في `content/site-content.js` (العربية والإنجليزية).
- لوحة التحكم: `/admin/`. ادخل بتوكن GitHub من نوع Fine-grained له صلاحية «Contents: Read and write» على هذا المستودع فقط. المستودع الافتراضي `mrvoroo/magmafy-pro` والفرع `main`.
- نموذج الحجز: ضع Web3Forms Access Key في اللوحة تحت «الإعدادات والتواصل ← نموذج الحجز». بدون المفتاح يفتح الحجز بريد الزائر.

- All copy lives in `content/site-content.js` (Arabic and English).
- Admin: `/admin/`, signed in with a fine-grained GitHub token limited to this repo with "Contents: Read and write".
- Booking form: add a free Web3Forms access key in the admin. Without it, booking opens the visitor's email app.

## ملاحظات / Notes

- بدون خدمات خارجية عند التحميل؛ الخطوط والصور والمكتبات (three.js وGSAP) محلية.
- No third-party requests on load; fonts, images, three.js and GSAP are bundled locally.
- `_headers` يعمل على Netlify أو Cloudflare Pages. على GitHub Pages تعمل سياسة CSP الموجودة داخل كل صفحة.

Made by Magmafy
