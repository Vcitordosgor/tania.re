// Crée un lead dans la base Notion "Deals" (best-effort).
// Ne doit jamais faire échouer la réponse 200 du formulaire.
// Fichier préfixé "_" → importable mais NON routé par Cloudflare Pages Functions.

const NOTION_PAGES_API = 'https://api.notion.com/v1/pages';
const NOTION_VERSION = '2022-06-28';
const DEALS_DB_ID = '1fd7e767-a9b3-4ad4-b987-bdc414cc7b28';

/**
 * @typedef {'TANIA' | 'LABUSE' | '9site4'} Marque
 * @typedef {Object} NotionLeadInput
 * @property {string} nom
 * @property {string} email
 * @property {Marque} marque
 * @property {string} [telephone]
 * @property {string} [entreprise]
 * @property {string} [message]
 * @property {number} [montant]
 */

/**
 * @param {NotionLeadInput} input
 * @param {string} token
 * @returns {Promise<void>}
 */
export async function createNotionLead(input, token) {
  const title = input.entreprise ? `${input.nom} — ${input.entreprise}` : input.nom;

  /** @type {Record<string, unknown>} */
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
  if (typeof input.montant === 'number') properties['Montant estimé'] = { number: input.montant };

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
