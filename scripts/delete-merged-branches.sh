#!/usr/bin/env bash
# Supprime les 51 branches distantes DÉJÀ MERGÉES dans main (nettoyage sûr).
# Généré par diagnostic en lecture seule ; contenu confirmé présent dans main.
# À lancer depuis un terminal autorisé (la suppression est bloquée 403 dans
# l'environnement agent). Ne touche PAS aux branches non mergées ni à main.
set -euo pipefail

branches=(
  chore/fb-domain-verification
  claude/tania-landing-page-XBLXt
  copy/remove-fait-nefaitpas
  feat/contact-form-v2
  feat/da-graphite
  feat/favicon-app-icon
  feat/home-reforme-premium-asymmetric
  feat/home-reforme-resources-refonte-light
  feat/page-abonnement
  feat/real-logo
  feat/tarifs-stripe
  fix/audit-corrections
  fix/audit-v2
  fix/header-dark
  fix/header-fullwidth
  fix/header-taller
  fix/header-tweak
  fix/legal-rgpd
  fix/logo-v2
  fix/responsive-audit
  fix/seo-audit-corrections
  fix/visual-logo-polish
  refonte/home-direction
  refonte/icons-restore
  refonte/match-screenshots
  refonte/simulator-skin
  seo/3-pages-satellites-finales
  seo/artisans-btp-facturation-electronique-reunion
  seo/commerces-restaurants-instituts-facturation-electronique
  seo/e-reporting-clients-particuliers-reunion
  seo/factur-x-facturation-electronique-reunion
  seo/hub-ressources-facturation-electronique
  seo/kit-facturation-electronique-reunion
  seo/modele-facture-micro-entrepreneur-reunion
  seo/page-excel-word-pdf-facturation-electronique
  seo/page-micro-entrepreneur-facturation-electronique
  seo/plateforme-agreee-facturation-electronique-reunion
  seo/prestataires-services-freelances-facturation-electronique
  seo/ressources-outils-facturation-electronique
  seo/seo-confiance-conversion-pages-finales
  ui/capabilities-bento
  ui/capabilities-sober
  ui/home-demo-dedupe
  ui/home-demo-macbook-phone
  ui/home-demo-revert-and-simplify
  ui/home-design-system-pass1
  ui/home-probleme-polish
  ui/trades-lighter
  ui/trades-marquee
  ui/trades-typo
  ui/trim-pills
)

# Garde-fou : jamais main
for b in "${branches[@]}"; do
  if [ "$b" = "main" ]; then echo "REFUS: main dans la liste"; exit 1; fi
done

echo "Suppression de ${#branches[@]} branches distantes mergées..."
git push origin --delete "${branches[@]}"

# Nettoie les refs locales de suivi
git remote prune origin
echo "Terminé."
