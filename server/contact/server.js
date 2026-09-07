/* Peoplefirst contact-form backend.
 * Receives POST /api/contact from the website, validates, applies basic
 * anti-spam checks, and hands the message to the local Postfix (127.0.0.1:25),
 * which delivers it to info@peoplefirst.ink on this same server.
 */
'use strict';
const http = require('http');
const nodemailer = require('nodemailer');

const PORT = Number(process.env.PORT || 8791);
const TO = process.env.CONTACT_TO || 'info@peoplefirst.ink';
const FROM = process.env.CONTACT_FROM || '"Peoplefirst website" <info@peoplefirst.ink>';
const MAX_BODY = 20 * 1024;           // 20 KB
const RATE_LIMIT = 5;                 // submissions
const RATE_WINDOW = 60 * 60 * 1000;   // per hour, per IP
const MIN_FILL_MS = 3000;             // faster than this is a bot

const transport = nodemailer.createTransport({
  host: '127.0.0.1', port: 25, secure: false,
  tls: { rejectUnauthorized: false }
});

const hits = new Map(); // ip -> [timestamps]
function rateLimited(ip) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter(t => now - t < RATE_WINDOW);
  if (list.length >= RATE_LIMIT) { hits.set(ip, list); return true; }
  list.push(now); hits.set(ip, list); return false;
}
setInterval(() => { const now = Date.now(); for (const [ip, l] of hits) if (!l.some(t => now - t < RATE_WINDOW)) hits.delete(ip); }, RATE_WINDOW).unref();

function json(res, status, obj) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(obj));
}
const clean = (v, max) => String(v == null ? '' : v).replace(/[\r\n\t]+/g, ' ').trim().slice(0, max);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0; const chunks = [];
    req.on('data', c => { size += c.length; if (size > MAX_BODY) { reject(new Error('too large')); req.destroy(); } else chunks.push(c); });
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      const ct = String(req.headers['content-type'] || '');
      try {
        if (ct.includes('application/json')) return resolve(JSON.parse(raw || '{}'));
        const out = {}; for (const [k, v] of new URLSearchParams(raw)) out[k] = v; resolve(out);
      } catch (e) { reject(e); }
    });
    req.on('error', reject);
  });
}

async function handleContact(req, res) {
  const ip = (String(req.headers['x-forwarded-for'] || '').split(',')[0].trim()) || req.socket.remoteAddress || 'unknown';
  let b;
  try { b = await readBody(req); } catch { return json(res, 400, { ok: false, error: 'Bad request' }); }

  // Silent success for obvious bots: honeypot filled or form completed too quickly.
  const elapsed = Date.now() - Number(b.ts || 0);
  if (clean(b.website, 10) || (b.ts && elapsed < MIN_FILL_MS)) return json(res, 200, { ok: true });

  const name = clean(b.name, 120), company = clean(b.company, 120), email = clean(b.email, 200);
  const phone = clean(b.phone, 60), service = clean(b.service, 80) || 'Not sure yet';
  const message = String(b.message || '').trim().slice(0, 5000);

  if (!name || !EMAIL_RE.test(email) || message.length < 10)
    return json(res, 422, { ok: false, error: 'Please give your name, a valid email, and a short message.' });
  if (rateLimited(ip))
    return json(res, 429, { ok: false, error: 'Too many messages from this connection. Please try again later or call us.' });

  const subject = `Website enquiry: ${service} — ${company || name}`;
  const text =
`New enquiry from peoplefirst.ink

Name:      ${name}
Company:   ${company || '-'}
Email:     ${email}
Phone:     ${phone || '-'}
Interest:  ${service}
IP:        ${ip}
Sent:      ${new Date().toISOString()}

Message:
${message}
`;
  try {
    await transport.sendMail({ from: FROM, to: TO, replyTo: `${name} <${email}>`, subject, text });
    console.log(`[contact] sent from ${email} (${ip})`);
    return json(res, 200, { ok: true });
  } catch (err) {
    console.error('[contact] send failed:', err.message);
    return json(res, 502, { ok: false, error: 'We could not send your message right now. Please email us directly.' });
  }
}

http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/api/health') return json(res, 200, { ok: true, service: 'peoplefirst-contact' });
  if (req.method === 'POST' && req.url === '/api/contact') return handleContact(req, res);
  json(res, 404, { ok: false, error: 'Not found' });
}).listen(PORT, '127.0.0.1', () => console.log(`peoplefirst-contact listening on 127.0.0.1:${PORT} -> ${TO}`));
