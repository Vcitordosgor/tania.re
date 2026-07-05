# DERIVATIONS — choix juridiques (audit légal Phase 2)

Date : 5 juillet 2026. Périmètre : `mentions-legales.html`, `cgu.html`,
`politique-confidentialite.html`, `rgpd.html`, mention formulaire (`index.html`),
auto-hébergement des polices.

## 1. Auto-hébergement des polices (Google Fonts → local)
- **Constat** : les 29 pages chargeaient Archivo Black + Space Grotesk depuis
  `fonts.googleapis.com`/`fonts.gstatic.com`. Chaque visite transmettait donc
  l'adresse IP du visiteur à Google (US) **sans consentement** — non conforme
  (doctrine CNIL, jurisprudence LG München 3 O 17493/20).
- **Choix** : télécharger les woff2 (sous-ensembles latin + latin-ext, OFL),
  les servir depuis `/fonts/`, déclarer `@font-face` dans `css/fonts.css`.
  Vietnamien retiré (inutile en français) pour alléger.
- **Conséquence** : plus aucun appel tiers → **aucune bannière cookies requise**.

## 2. Pas de bannière de consentement
- **Constat code** : aucun Google Analytics, aucun pixel Meta (`fbq`), aucun
  script tiers, aucun cookie déposé. Le `<meta facebook-domain-verification>`
  est un simple jeton de vérification de domaine (ne dépose pas de cookie).
  Le simulateur utilise `localStorage` (fonctionnel, reste sur l'appareil).
- **Choix** : pas de bannière. Justifié tant qu'aucun traceur d'audience/pub
  n'est ajouté ET que les polices restent auto-hébergées. Si un pixel Meta ou
  GA4 est installé plus tard → bannière de consentement préalable obligatoire.

## 3. Sous-traitants — correction Twilio → Meta
- **Constat** : la politique listait « Twilio (transmission WhatsApp) ».
  Aucune trace de Twilio dans le code ; le produit utilise **WhatsApp Cloud API
  (Meta)** en direct (info produit fournie par l'éditeur).
- **Choix** : remplacer par **Meta Platforms Ireland Ltd**. Ajout des
  sous-traitants réellement actifs : **Stripe** (paiement, présent dans
  `index.html`), **OVHcloud** (hébergement données produit, confirmé éditeur),
  **Cloudflare** (site + Worker + Email Routing), **Notion** (leads — vu dans le
  Worker), **Anthropic** (IA), plateformes agréées.
- **Mise à jour (5 juillet 2026)** : la réception des emails de contact ne passe
  plus par une boîte Gmail. Le Worker envoie désormais la notification vers
  `contact@tania.re`, acheminée par **Cloudflare Email Routing** vers la boîte
  réelle de l'éditeur. **Google/Gmail retiré** de la liste des sous-traitants
  et des transferts hors UE.

## 4. Transferts hors UE + CCT/DPA
- **Choix** : section dédiée nommant explicitement Meta et Anthropic (US),
  encadrés par **Clauses Contractuelles Types (CCT/SCC)** + **DPA**. Stripe,
  Notion, Cloudflare mentionnés au même titre.
- **À la charge de l'éditeur** : signer effectivement ces DPA (obligation
  contractuelle réelle, hors code).

## 5. Durées de conservation (mise en cohérence)
- **Constat** : la politique appliquait « 10 ans » à toutes les données —
  trop large et incohérent avec `rgpd.html`.
- **Choix** (aligné L.123-22 C. com. + doctrine CNIL) :
  - Prospects (formulaire) : **3 ans** après dernier contact.
  - Compte/données perso : supprimées/anonymisées à la résiliation.
  - Factures/pièces comptables : **10 ans**, non rattachées à l'identité.
  CGU §9 et mention formulaire alignées sur ces durées.

## 6. Sous-traitance art. 28 (données des clients facturés)
- **Constat** : la politique présentait Tania comme seul responsable de tout.
  Or, pour les données des clients **de l'utilisateur** (nom, adresse, SIRET),
  l'utilisateur est responsable de traitement et Tania est sous-traitant.
- **Choix** : clause art. 28 ajoutée dans la politique ET dans les CGU §8.

## 7. Fusion rgpd.html → politique + 301
- **Constat** : `rgpd.html` = mode d'emploi opérationnel, doublon partiel de la
  section « droits ».
- **Choix** : contenu fusionné dans
  `politique-confidentialite.html#exercer-vos-droits`. `rgpd.html` devient un
  stub (noindex + canonical + meta-refresh + JS). Redirection **301** ajoutée
  dans `_redirects` (`/rgpd.html` et `/rgpd`). Lien footer « RGPD » repointé sur
  les 29 pages. Entrée `/rgpd` retirée du `sitemap.xml`.

## 8. Adresse LCEN (point ouvert)
- **Demande éditeur** : n'afficher que « Saint-Denis » sans l'adresse exacte.
- **Réserve** : la LCEN art. 6-III impose une **adresse postale complète** pour
  un éditeur professionnel. Adresse réduite affichée + placeholder
  `⚠️ [VIC : à confirmer]`. **Non conforme en l'état** — à trancher par l'éditeur.

## 9. Mention d'information sous le formulaire (CNIL)
- **Constat** : le formulaire de contact (`index.html`) n'avait aucune mention.
- **Choix** : ajout sous le bouton (finalité + destinataire + durée + lien
  politique + droits).

---

## Points restant à la charge de l'éditeur (VIC)
1. **Adresse LCEN** complète à confirmer (§8).
2. **Signer les DPA** Meta / Anthropic / Stripe / OVH / Notion.
3. **Notion** : confirmer s'il reste le CRM ou doit être retiré de la politique.
4. Vérifier l'adresse OVHcloud indiquée (Roubaix par défaut) si datacenter autre.
5. Remplacer les liens Stripe placeholder (`REMPLACER_*`) dans `index.html`.
