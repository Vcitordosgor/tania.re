# Rapport d'audit visuel — tania.re

**Date** : 2026-07-09 · **Branche** : `chore/polish-visuel-20260709` (base `main` @ `8d74308`)
**Méthode** : Playwright, 29 pages × 3 viewports (375/768/1440), captures `docs/audit/avant/`,
diagnostics automatisés (`diagnostics-avant.json`), revue visuelle des pages commerciales.
**Contexte** : site HTML statique (pas de Node/npm). `{URL_LOCALE}` = `http://127.0.0.1:8799`.
`/tarifs` = section `#tarifs` de la home (pas une page dédiée).

## Verdict global : 8,5/10

Site visuellement **solide et cohérent** : DA Graphite Vert Pâle appliquée avec rigueur,
composants uniformes (cartes, ombres dures, CTA), rythme vertical régulier, header carte
flottante propre. Les défauts restants sont **techniques/micro-détails**, pas structurels.

### Résultats automatisés (excellents)
| Contrôle | Résultat |
|---|---|
| Scroll horizontal (3 viewports) | **0** ✅ |
| Erreurs console JS | **0** ✅ |
| Liens internes morts / ancres cassées | **0** ✅ (29 pages) |
| `<img>` raster | **0** — tout en SVG inline + CSS (perf idéale, pas de layout shift) ✅ |
| Titles / meta description | présents et dans les normes sur les 29 pages ✅ |
| `:focus-visible` global | présent (`outline 2px #25D366`) ✅ |

## Notes par page (échantillon commercial)
| Page | Note | Verdict |
|---|---|---|
| Home (/) | 9/10 | Flagship très abouti ; sections cohérentes, mockups pro |
| Tarifs (#tarifs) | 8,5/10 | Grille v2 propre ; bloc Réception + toggle nets |
| Pages SEO (×22) | 8/10 | Gabarit article cohérent ; manque theme-color + OG |
| Pages légales (×4) | 8/10 | Propres ; manque OG social |
| Simulateur (/test) | 8,5/10 | Header unifié, cartes cohérentes |

## Tableau priorisé

| N° | Page(s) | Problème | Preuve | Priorité | Fix prévu |
|----|---------|----------|--------|----------|-----------|
| 1 | Home (tarifs) | Liens Stripe **placeholder** `REMPLACER_*` en prod → bouton « Choisir » vers URL cassée | `index.html:49-51` | **P0** | **BLOQUÉ** (vrais liens = Vic). Fallback : router vers `#demo` tant que placeholder |
| 2 | Global | **Pas de page 404** dans la DA (Cloudflare sert une erreur générique) | absence `404.html` | **P1** | Créer `404.html` en DA (header/footer/styles existants) |
| 3 | 25/29 pages | `theme-color` absent (barre navigateur mobile grise au lieu de vert pâle) | diagnostics | **P2** | Ajouter `<meta name="theme-color" content="#E6F2E8">` où manquant |
| 4 | Global | `::selection` non stylé (surlignage bleu système hors DA) | `css/site.css` | **P2** | Styler la sélection (vert/encre DA) |
| 5 | cgu / mentions / politique | `og:image` + twitter card absents → partages sociaux moches | diagnostics | **P2** | Ajouter les balises OG (sans toucher au contenu légal) |
| 6 | 28 pages | `apple-touch-icon` + `manifest` référencés uniquement sur la home | diagnostics | **P2** | Ajouter les `<link>` icônes aux autres pages |
| 7 | Simulateur | Numéro WhatsApp `wa.me/262693517153` (résultat) à confirmer réel | `js/simulator.js` | **P0?** | **BLOQUÉ** — donnée Vic requise (ne pas inventer) |

## Section « Propositions DA » (aucune action sans accord de Vic)

1. **Robustesse sans JS** : `.reveal{opacity:0}` est inconditionnel → si le JS échoue ou est
   désactivé, tout le `<body>` sous le hero est **invisible**. Proposition : conditionner
   l'état masqué à une classe `.js` posée sur `<html>` par le script (progressive
   enhancement). Touche au comportement d'animation → proposition, pas d'action.
2. **Cohérence « assistant » vs « logiciel »** : le mot « logiciel » subsiste hors page
   tarifs (hero « pas besoin d'un logiciel de plus », capacités « pas de logiciel à ouvrir »,
   FAQ, à-propos). Usages surtout négatifs et volontaires — mais si Vic veut bannir le mot
   partout, c'est un chantier copy dédié (hors périmètre visuel).

## Points BLOQUÉS (données Vic requises)
- Vrais liens Stripe Payment Links (Essentiel/Duo/Pro, mensuel **et** annuel).
- Confirmation du numéro WhatsApp du simulateur.
- URL du parcours d'inscription pour « Activer gratuitement » (pointe sur `#demo`).
