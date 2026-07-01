// Cloudflare Pages Function — POST /api/contact
// Envoie un email interne via le binding Email Routing `SEB`, puis (best-effort)
// une auto-réponse + un lead Notion. Ne bloque jamais le 200 sur les tâches best-effort.
//
// Portage de la logique Astro (src/pages/api/contact.ts) vers Pages Functions.
// Le binding `send_email` natif attend un message MIME brut : le helper sendEmail()
// ci-dessous le construit sans dépendance npm (pas de build sur ce site statique).

import { EmailMessage } from 'cloudflare:email';
import { createNotionLead } from './_notionLead.js';

// ===== À PERSONNALISER PAR SITE =====
const MARQUE = 'TANIA';                    // 'TANIA' | 'LABUSE' | '9site4'
const NOTIFY_EMAIL = 'contact@tania.re';   // où tu reçois les leads (destination vérifiée Email Routing)
const SENDER_EMAIL = 'contact@tania.re';   // sender vérifié dans Email Routing
const SITE_NAME = 'Tania';
// ====================================

const PHONE_REGEX = /^[+]?[\d\s().-]{8,20}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const esc = (s) =>
  s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export async function onRequestPost(context) {
  const { request, env } = context;

  let payload;
  try {
    payload = await request.json();
  } catch {
    return json({ ok: false, error: 'invalid_json' }, 400);
  }

  // Honeypot — silent OK
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

  const seb = env?.SEB;
  if (!seb) return json({ ok: false, error: 'binding_missing' }, 500);

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
    await sendEmail(seb, {
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
  const autoReplyTask = sendEmail(seb, {
    from: `${SITE_NAME} <${SENDER_EMAIL}>`,
    to: email,
    replyTo: SENDER_EMAIL,
    subject: `Votre demande a bien été reçue — ${SITE_NAME}`,
    text: `Bonjour ${nom},\n\nMerci pour votre message. Nous revenons vers vous rapidement.\n\nL'équipe ${SITE_NAME}`,
  }).then(() => undefined);

  const notionToken = typeof env?.NOTION_TOKEN === 'string' ? env.NOTION_TOKEN : null;
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
}

function json(body, status) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

// ── Helper email : construit un MIME brut et l'envoie via le binding send_email ──
async function sendEmail(binding, { from, to, replyTo, subject, text, html }) {
  const fromAddr = extractAddr(from);
  const toAddr = extractAddr(to);
  const raw = buildMime({ from, to, replyTo, subject, text, html });
  const msg = new EmailMessage(fromAddr, toAddr, raw);
  await binding.send(msg);
}

function extractAddr(s) {
  const m = /<([^>]+)>/.exec(s);
  return (m ? m[1] : s).trim();
}

// base64 d'une chaîne UTF-8, découpée en lignes de 76 caractères (RFC 2045)
function b64(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  const encoded = btoa(bin);
  return (encoded.match(/.{1,76}/g) || ['']).join('\r\n');
}

// sujet encodé RFC 2047 (encoded-word) pour supporter les accents
function encodeSubject(s) {
  const bytes = new TextEncoder().encode(s);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return `=?UTF-8?B?${btoa(bin)}?=`;
}

function buildMime({ from, to, replyTo, subject, text, html }) {
  const uuid = (crypto && crypto.randomUUID) ? crypto.randomUUID() : `${Date.now()}.${Math.random().toString(36).slice(2)}`;
  const domain = extractAddr(from).split('@')[1] || 'localhost';
  const date = new Date().toUTCString();

  const headers = [
    `From: ${from}`,
    `To: ${to}`,
    replyTo ? `Reply-To: ${replyTo}` : '',
    `Message-ID: <${uuid}@${domain}>`,
    `Date: ${date}`,
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

  return [
    ...headers,
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    b64(text),
    '',
  ].join('\r\n');
}
