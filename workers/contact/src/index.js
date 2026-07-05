// Worker Cloudflare — POST tania.re/api/contact
// Email interne via binding Email Routing `SEB` (obligatoire),
// puis best-effort : auto-réponse + lead dans la base Notion "Deals".
// Anti-spam : honeypot `website` (le time-trap est côté client).

import { EmailMessage } from 'cloudflare:email';

// ===== À PERSONNALISER PAR SITE =====
const MARQUE = 'TANIA';                          // 'TANIA' | 'LABUSE' | '9site4'
const NOTIFY_EMAIL = 'contact@tania.re';          // reçu via Cloudflare Email Routing (contact@tania.re → boîte réelle)
const SENDER_EMAIL = 'contact@tania.re';         // adresse d'envoi sur le domaine
const SITE_NAME = 'Tania';
// ====================================

const PHONE_REGEX = /^[+]?[\d\s().-]{8,20}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const esc = (s) =>
  s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname !== '/api/contact') return json({ ok: false, error: 'not_found' }, 404);
    if (request.method !== 'POST') return json({ ok: false, error: 'method_not_allowed' }, 405);

    let payload;
    try {
      payload = await request.json();
    } catch {
      return json({ ok: false, error: 'invalid_json' }, 400);
    }

    // Honeypot — succès silencieux
    if (payload.website && String(payload.website).trim()) return json({ ok: true }, 200);

    const nom = (payload.nom ?? '').trim();
    const entreprise = (payload.entreprise ?? '').trim();
    const telephone = (payload.telephone ?? '').trim();
    const email = (payload.email ?? '').trim();
    const message = (payload.message ?? '').trim();

    const errors = [];
    if (!nom) errors.push('nom');
    if (!telephone || !PHONE_REGEX.test(telephone)) errors.push('telephone');
    if (!email || !EMAIL_REGEX.test(email)) errors.push('email');
    if (errors.length) return json({ ok: false, error: 'validation', fields: errors }, 400);

    if (!env.SEB) return json({ ok: false, error: 'binding_missing' }, 500);

    const lines = [
      `Nom : ${nom}`,
      entreprise ? `Entreprise : ${entreprise}` : '',
      `Téléphone : ${telephone}`,
      `Email : ${email}`,
      message ? `\nMessage :\n${message}` : '',
    ].filter(Boolean).join('\n');

    const internalHtml = `<div style="font-family:system-ui,sans-serif;line-height:1.6">
      <h2>Nouveau lead — ${esc(nom)}${entreprise ? ` (${esc(entreprise)})` : ''}</h2>
      <p><strong>Téléphone :</strong> ${esc(telephone)}<br>
      <strong>Email :</strong> ${esc(email)}${message ? `<br><br><strong>Message :</strong><br>${esc(message).replace(/\n/g, '<br>')}` : ''}</p>
    </div>`;

    // 1) Email interne — OBLIGATOIRE
    try {
      await sendEmail(env.SEB, {
        from: `${SITE_NAME} <${SENDER_EMAIL}>`,
        to: NOTIFY_EMAIL,
        replyTo: email,
        subject: `Nouveau lead ${SITE_NAME} — ${nom}`,
        text: lines,
        html: internalHtml,
      });
    } catch (err) {
      const detail = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
      console.error('[api/contact] internal email failed', detail);
      return json({ ok: false, error: 'send_failed', detail }, 502);
    }

    // 2) Best-effort : auto-réponse + Notion (ne bloquent jamais le 200)
    const autoReplyTask = sendEmail(env.SEB, {
      from: `${SITE_NAME} <${SENDER_EMAIL}>`,
      to: email,
      replyTo: SENDER_EMAIL,
      subject: `Votre demande a bien été reçue — ${SITE_NAME}`,
      text: `Bonjour ${nom},\n\nMerci pour votre message. Nous revenons vers vous rapidement.\n\nL'équipe ${SITE_NAME}`,
    }).then(() => undefined);

    const notionToken = typeof env.NOTION_TOKEN === 'string' ? env.NOTION_TOKEN : null;
    const notionTask = notionToken
      ? createNotionLead(
          { nom, email, telephone, entreprise: entreprise || undefined, message: message || undefined, marque: MARQUE },
          notionToken
        )
      : Promise.resolve();

    const [autoReplyRes, notionRes] = await Promise.allSettled([autoReplyTask, notionTask]);
    if (autoReplyRes.status === 'rejected') console.error('[api/contact] auto-reply failed', String(autoReplyRes.reason));
    if (notionRes.status === 'rejected') console.error('[api/contact] notion failed', String(notionRes.reason));

    return json({ ok: true }, 200);
  },
};

function json(body, status) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

// ── Notion : crée un lead dans la base "Deals" (best-effort) ──
const NOTION_PAGES_API = 'https://api.notion.com/v1/pages';
const NOTION_VERSION = '2022-06-28';
const DEALS_DB_ID = '1fd7e767-a9b3-4ad4-b987-bdc414cc7b28';

async function createNotionLead(input, token) {
  const title = input.entreprise ? `${input.nom} — ${input.entreprise}` : input.nom;
  const properties = {
    'Nom du deal': { title: [{ text: { content: title.slice(0, 200) } }] },
    Marque: { select: { name: input.marque } },
    Statut: { select: { name: 'Nouveau' } },
    Source: { select: { name: 'Formulaire site' } },
    Email: { email: input.email },
    'Date création': { date: { start: new Date().toISOString().slice(0, 10) } },
  };
  if (input.telephone) properties['Téléphone'] = { phone_number: input.telephone };
  if (input.entreprise) properties['Nom entreprise'] = { rich_text: [{ text: { content: input.entreprise.slice(0, 2000) } }] };
  if (input.message) properties.Message = { rich_text: [{ text: { content: input.message.slice(0, 2000) } }] };

  const res = await fetch(NOTION_PAGES_API, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Notion-Version': NOTION_VERSION,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ parent: { database_id: DEALS_DB_ID }, properties }),
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Notion ${res.status}: ${detail.slice(0, 300)}`);
  }
}

// ── Email : construit un message MIME brut pour le binding send_email ──
async function sendEmail(binding, { from, to, replyTo, subject, text, html }) {
  const raw = buildMime({ from, to, replyTo, subject, text, html });
  await binding.send(new EmailMessage(extractAddr(from), extractAddr(to), raw));
}

function extractAddr(s) {
  const m = /<([^>]+)>/.exec(s);
  return (m ? m[1] : s).trim();
}

function b64(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return (btoa(bin).match(/.{1,76}/g) || ['']).join('\r\n');
}

function encodeSubject(s) {
  const bytes = new TextEncoder().encode(s);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return `=?UTF-8?B?${btoa(bin)}?=`;
}

function buildMime({ from, to, replyTo, subject, text, html }) {
  const uuid = crypto.randomUUID();
  const domain = extractAddr(from).split('@')[1] || 'localhost';
  const headers = [
    `From: ${from}`,
    `To: ${to}`,
    replyTo ? `Reply-To: ${replyTo}` : '',
    `Message-ID: <${uuid}@${domain}>`,
    `Date: ${new Date().toUTCString()}`,
    `Subject: ${encodeSubject(subject)}`,
    'MIME-Version: 1.0',
  ].filter(Boolean);

  if (html) {
    const boundary = `b_${uuid}`;
    return [
      ...headers,
      `Content-Type: multipart/alternative; boundary="${boundary}"`,
      '',
      `--${boundary}`,
      'Content-Type: text/plain; charset=UTF-8',
      'Content-Transfer-Encoding: base64',
      '',
      b64(text),
      `--${boundary}`,
      'Content-Type: text/html; charset=UTF-8',
      'Content-Transfer-Encoding: base64',
      '',
      b64(html),
      `--${boundary}--`,
      '',
    ].join('\r\n');
  }
  return [...headers, 'Content-Type: text/plain; charset=UTF-8', 'Content-Transfer-Encoding: base64', '', b64(text), ''].join('\r\n');
}
