# Rapport final — polish visuel tania.re

**Branche** : `chore/polish-visuel-20260709` (base `main` @ `8d74308`) · **Date** : 2026-07-09
**5 commits atomiques · aucun merge (validation Vic requise)**

## Résumé
Site déjà très abouti visuellement (8,5/10). Audit chirurgical → correction des
micro-détails techniques + garde-fou conversion. Zéro régression : 3 viewports × 30 pages
re-capturés, **toujours 0 scroll horizontal, 0 erreur console, 0 lien mort**.

## Commits
| Commit | Catégorie | Contenu |
|---|---|---|
| `ac39c23` | P0 conversion | Fallback `#demo` pour boutons tarifs tant que liens Stripe = placeholder |
| `9908e47` | P1 UX | Page **404 dans la DA** (header flottant, 404 Archivo Black, CTA accueil/guide) |
| `f9c0190` | P2 détail | `::selection` en couleurs DA + `theme-color` sur les 25 pages qui en manquaient |
| `20664db` | P2 social | OG/twitter sur 3 pages légales + `apple-touch-icon` sur les 28 pages restantes |
| `95a9ee2` | chore | Bump cache CSS v11 → v12 |

## Avant / Après (preuves)
| Fix | Avant | Après |
|---|---|---|
| 404 | *(inexistant — erreur Cloudflare générique)* | `docs/audit/apres/404-1440.png` |
| Boutons tarifs | href = `buy.stripe.com/REMPLACER_*` (cassé) | href = `#demo` (vérifié Playwright) |
| Captures complètes | `docs/audit/avant/` (87) | `docs/audit/apres/` (90, +404×3) |
| Diagnostics | `diagnostics-avant.json` | `diagnostics-apres.json` |

Vérifications automatisées identiques avant/après :
`hscroll = 0`, `console errors = 0`, `<img> raster = 0`, meta présentes 29/29.

## Ce qui a été corrigé (détail)
1. **P0 — Boutons tarifs cassés** : `payHref()` route vers `#demo` tant que le lien contient
   `REMPLACER`. Se réactive **automatiquement** dès que les vrais Payment Links sont posés.
   Aucune donnée inventée.
2. **P1 — 404** : `/404.html` (Cloudflare Pages le sert automatiquement), 100% DA.
3. **P2 — `::selection`** : surlignage vert `#4ADE80` / encre `#0B2013` (vérifié).
4. **P2 — `theme-color`** : ajouté aux 25 pages qui l'omettaient (barre navigateur mobile
   verte cohérente).
5. **P2 — OG social** : cgu / mentions / politique reçoivent og:image + twitter card
   (partages sociaux propres). **Aucun contenu légal touché** — head technique uniquement.
6. **P2 — Icônes** : `apple-touch-icon` désormais sur les 29 pages (était sur la home seule).

## Points BLOQUÉS — données Vic requises (non inventées)
1. **Vrais liens Stripe** (Essentiel/Duo/Pro, mensuel **et** annuel). Emplacement :
   `index.html:49-51`. Le fallback protège les visiteurs en attendant.
   ⚠️ Le toggle Annuel change l'affichage du prix mais **pas** le lien — il faudra un
   Payment Link annuel distinct par offre.
2. **Numéro WhatsApp** `wa.me/262693517153` (résultat simulateur, `js/simulator.js:367`) :
   à confirmer réel.
3. **Parcours d'inscription** pour « Activer gratuitement » (Réception) : pointe sur `#demo`
   faute d'URL réelle.

## Propositions DA (aucune action — décision Vic)
1. **Robustesse sans JS** *(recommandé)* : `.reveal{opacity:0}` est inconditionnel → si le JS
   échoue/est désactivé, tout le contenu sous le hero est **invisible**. Correctif propre :
   poser une classe `.js` sur `<html>` via le script, et masquer uniquement `html.js .reveal`.
   Petit diff, gros gain de robustesse. Non fait car touche au comportement d'animation.
2. **Mot « logiciel »** hors page tarifs (hero, capacités, FAQ, à-propos) — usages surtout
   négatifs et volontaires. Chantier copy dédié si Vic veut l'harmoniser (hors visuel).

## P2 restants (mineurs, non traités)
- `manifest` (`site.webmanifest`) référencé sur la home seule — impact quasi nul (PWA non
  utilisée), laissé tel quel pour rester chirurgical.

## Outils
- Playwright (chromium bundle) : captures + diagnostics. Script : `docs/audit/capture.mjs`.
- **Lighthouse : non exécuté** — `npx lighthouse` nécessite un accès réseau bloqué par la
  politique proxy de l'environnement d'audit. À lancer côté Vic si besoin d'un score chiffré ;
  le site est très favorable (0 image raster, fonts auto-hébergées + `font-display:swap`,
  0 script tiers, CSS/JS légers).

## Statut
`git status` propre, tout est commité sur `chore/polish-visuel-20260709`.
**STOP — en attente de validation visuelle de Vic. Aucun merge effectué.**
