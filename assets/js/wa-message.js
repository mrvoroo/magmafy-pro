// WhatsApp hand-off for the booking wizard: builds the message and the wa.me link.
// Pure functions with no DOM access, so the length cap can be checked in Node too.

/** Longest wa.me URL we hand to the browser. Arabic text grows about 6x when encoded. */
export const MAX_URL = 1800;

/** Digits only: "+966 59-087 3178" -> "966590873178". */
export const waDigits = (v) => String(v || '').replace(/[^\d]/g, '');

/** wa.me link for a number and message (empty when the number is missing or too short). */
export function waUrl(digits, text) {
  if (!/^\d{8,15}$/.test(digits)) return '';
  return 'https://wa.me/' + digits + (text ? '?text=' + encodeURIComponent(text) : '');
}

// One line of visitor text, without WhatsApp formatting characters that would break the bold labels.
const plain = (v) => String(v || '').replace(/[*_~`]/g, '').replace(/\s+/g, ' ').trim();

/**
 * @param {object} m  message labels (content: booking.msg)
 * @param {object} d  { name, business, link, problems: string[], branches, ticket, tried, note, time, page, source }
 * Required lines (title, name, business, problems, branches, ticket, closing) are always kept.
 * If the link is too long: the note is shortened first, then the time, page, link and "tried"
 * lines are dropped, and only then are long name / business values shortened (never removed).
 */
export function buildMessage(m, d, digits, max = MAX_URL) {
  const line = (label, value) => (plain(value) ? '*' + label + ':* ' + plain(value) : null);
  const compose = (o) => [
    '*' + m.title + '*',
    '',
    line(m.name, o.name),
    line(m.business, o.business),
    o.link ? line(m.link, d.link) : null,
    '',
    '*' + m.problems + ':*',
    // "-" rather than "•": every non-ASCII character costs 6–9 characters in the link.
    ...(d.problems || []).map((p) => '- ' + plain(p)),
    '',
    line(m.branches, d.branches),
    line(m.ticket, d.ticket),
    o.tried ? line(m.tried, d.tried) : null,
    o.note ? line(m.note, o.note) : null,
    o.time ? line(m.time, d.time) : null,
    o.page ? line(m.page, [d.page, d.source].filter(Boolean).join(' · ')) : null,
    '',
    m.closing
  ].filter((x) => x !== null).join('\n').replace(/\n{3,}/g, '\n\n').trim();

  const fits = (text) => waUrl(digits, text).length <= max;
  const full = plain(d.note);
  const o = { name: plain(d.name), business: plain(d.business), note: full, time: true, page: true, link: true, tried: true };
  let text = compose(o);
  // 1) shorten the note a word at a time
  let words = full.split(' ');
  while (!fits(text) && words.length && words[0]) {
    words = words.slice(0, -1);
    o.note = words.length ? words.join(' ') + '…' : '';
    text = compose(o);
  }
  // 2) then drop the other optional lines, one at a time
  for (const k of ['time', 'page', 'link', 'tried']) {
    if (fits(text)) break;
    o[k] = false;
    text = compose(o);
  }
  // 3) last resort: shorten (never drop) the longest of name / business, keeping at least 12 characters.
  //    The full values still travel in the Magmafy OS backup.
  const cut = (v) => (v.endsWith('…') ? v.slice(0, -2) : v.slice(0, -1)) + '…';
  while (!fits(text) && (o.name.length > 12 || o.business.length > 12)) {
    const k = o.business.length >= o.name.length ? 'business' : 'name';
    o[k] = cut(o[k]);
    text = compose(o);
  }
  return { text, url: waUrl(digits, text), fits: fits(text) };
}
