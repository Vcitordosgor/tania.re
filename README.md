# tania.re

Landing page de **Tania** — votre assistante administrative sur WhatsApp.

## Stack

- HTML5 statique (1 seul fichier : `index.html`)
- Tailwind CSS via CDN
- Police Inter via Google Fonts
- Aucune dépendance npm, aucun build

## Développement local

Ouvrez `index.html` dans votre navigateur, ou servez le dossier :

```sh
python3 -m http.server 8000
# puis http://localhost:8000
```

## Déploiement sur Cloudflare Pages

1. Connectez le repo GitHub `tania.re` à Cloudflare Pages.
2. Configuration du build :
   - **Framework preset** : *None*
   - **Build command** : *(vide)*
   - **Build output directory** : `/`
3. Déployez. Cloudflare publie automatiquement à chaque push sur `main`.

## Contact

- WhatsApp : +262 6 48 34 57 07
- Email : hello@tania.re
