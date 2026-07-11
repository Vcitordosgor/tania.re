# Rapport — SEO Fondations techniques · tania.re

**Branche** : `feat/seo-fondations` (base `main` @ `9ee3be6`) · Date : 2026-07-09
**6 commits · aucun merge (validation Vic requise, merge `--no-ff` manuel)**

## Adaptation au repo (écart au mandat, assumé)
Le mandat suppose un site **Astro** ; ce repo est du **HTML statique pur** (30 pages, zéro build).
Équivalences appliquées : pas d'`astro.config`/`SEO.astro`/`@astrojs/sitemap` → `<head>` en dur
déjà factorisés par gabarit, `sitemap.xml` et `robots.txt` existants à la racine, "build" = aucun
(le site se sert tel quel, donc « le build passe à l'identique » est trivialement vrai).

## État initial (déjà très bon — chantiers SEO antérieurs)
- 30 pages : **title unique** (≤62c) et **meta description unique** partout, 1 seul H1/page,
  canonical absolu partout (30/30 hors 404), OG+Twitter sur 29/30.
- 25 pages avec JSON-LD riche (Article/FAQPage/BreadcrumbList/ItemList…), 0 erreur de parse.
- `robots.txt` conforme (aucun blocage GPTBot/ClaudeBot/PerplexityBot/Bingbot, sitemap déclaré),
  `sitemap.xml` aligné sur les pages réelles.

## Ce qui a été fait (commits)
| Commit | Contenu |
|---|---|
| `feat(seo): hierarchie Hn…` | Footer `<h4>` → `<p class="fcol-t">` (27 pages, style identique) ; 2 meta descriptions légales ramenées ≤155c |
| `feat(seo): JSON-LD…` | **Home** : `@graph` = Organization + WebSite + **SoftwareApplication** (BusinessApplication, Web/WhatsApp) avec **AggregateOffer 0/49/69/89 EUR** (montants lus depuis la page) + **FAQPage** (8 Q/R reprises à l'identique). **Pages légales** : BreadcrumbList. **Org+WebSite** ajoutés aux pages qui n'en avaient pas |
| `feat(seo): llms.txt…` | `llms.txt` : pitch + 25 pages clés `[Titre](URL): description` |
| `feat(seo): image OG…` | **og-image.png 1200×630** régénérée : DA Graphite, logo officiel, Archivo Black + Space Grotesk **locales**, 52 Ko |
| `feat(seo): hierarchie Hn — h4 cartes…` | `<h4>` de mini-cartes → `<h3>` sur 12 pages, sélecteurs CSS inline dupliqués (`X h4, X h3`) → **hiérarchie 100 % propre**, reflow de 2px imperceptible (preuve pixel-diff) |
| `chore(seo): bump cache v13` | Propagation CSS |

## Definition of Done — état
- [x] "Build" : site statique servi tel quel, 30/30 pages HTTP 200, 0 erreur console.
- [x] Titles & descriptions **uniques sur 100 % des pages**, longueurs respectées (script QA).
- [x] JSON-LD : **0 erreur de parse** sur les 30 pages ; types conformes au bloc TANIA
      (SoftwareApplication + AggregateOffer aux montants exacts de la grille affichée).
- [x] `sitemap.xml`, `robots.txt`, `llms.txt`, `og-image.png`, `404.html` accessibles (HTTP 200).
- [x] Hiérarchie Hn : **0 saut** sur les 30 pages.
- [x] Zéro diff visuel : footer/cartes convertis avec styles répliqués (pixel-diff : seul un
      reflow vertical de 2px sur 12 pages internes, invisible).
- [ ] **Lighthouse : NON exécutable ici** — l'environnement bloque le réseau nécessaire à
      `npx lighthouse`. À lancer côté Vic après déploiement. Le site part très favorable :
      0 image raster dans les pages, fonts locales + `font-display:swap`, 0 script tiers.

## Schémas posés (récapitulatif)
- `Organization` + `WebSite` : sur toutes les pages indexables (directement ou via `publisher`).
- `SoftwareApplication` + `AggregateOffer` (Réception 0 € / Essentiel 49 / Duo 69 / Pro 89, EUR) : home.
- `FAQPage` : home (8 Q/R identiques au visible) — les pages FAQ/SEO avaient déjà les leurs.
- `BreadcrumbList` : toutes les pages internes, y compris désormais les 3 légales.

## Champs omis faute de donnée fiable (jamais inventés)
- `Organization.telephone` — pas de numéro confirmé (le wa.me du simulateur reste à valider).
- `Organization.sameAs` — aucun profil social trouvé dans le repo/config.
- `Offer.url` (liens de souscription) — les Payment Links Stripe sont des placeholders (P0 connu).

## Laissé pour v2
- Images OG **par page** (title en overlay) : faisable avec le même pipeline Playwright ;
  v1 = image de marque unique, comme prévu par le mandat.
- `priceValidUntil`/`availability` sur les Offers quand les liens Stripe réels seront posés.
- Note robustesse (déjà au rapport polish) : contenu masqué par `.reveal` sans JS — sans impact
  crawl (le HTML est complet dans le DOM), mais correctif progressive-enhancement recommandé.

## Actions manuelles Vic (hors mandat, rappel)
GSC (propriété Domain + TXT DNS), Bing Webmaster (import GSC), Cloudflare AI Crawl Control
(autoriser GPTBot/OAI-SearchBot/ClaudeBot/PerplexityBot), soumission sitemap + 1 URL au
Rich Results Test (suggestion : `https://tania.re/` — teste Org+WebSite+SoftwareApp+FAQ d'un coup).
