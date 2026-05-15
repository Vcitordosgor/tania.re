// Cloudflare Pages Function — placeholder pour la liste d'attente TANIA.
// À compléter : envoi email (Resend / MailChannels) ou stockage KV / D1.
//
// Pour activer plus tard : ajouter les bindings dans Cloudflare Pages
// (Settings → Functions) et compléter la logique d'envoi.

export async function onRequestPost(context) {
  try {
    const { email, phone } = await context.request.json();

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return new Response(JSON.stringify({ error: 'invalid_email' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // TODO : envoyer un email à hello@tania.re ou stocker dans KV/D1.
    // Pour l'instant on log et on renvoie 200.
    console.log('waitlist signup', { email, phone });

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (_e) {
    return new Response(JSON.stringify({ error: 'bad_request' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
