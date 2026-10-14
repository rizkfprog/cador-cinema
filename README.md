# CADOR — version « film »

Refonte cinématographique de cador-gp.com : un récit en 11 actes piloté par le scroll,
autour d'un combiné d'instruments 3D (compteur « ventes » / jauge « ce qui reste »).

## Lancer

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # sortie statique dans dist/
npm run preview    # sert dist/ localement
```

## Déployer (GitHub Pages ou n'importe quel hébergeur statique)

`vite.config.js` utilise `base: './'` : le contenu de `dist/` fonctionne tel quel à la racine
d'un domaine comme dans un sous-dossier. Copier `dist/` dans le dépôt `cadorconsulting.github.io`
(ou brancher une action GitHub Pages sur `npm run build`).

## Structure

Neuf pages, mêmes adresses que le site actuel (`index.html`, `methode-adam-boards.html`,
`point-de-depart.html`, `plan-de-marche.html`, `suivi-mensuel.html`, `automatisation.html`,
`qui-je-suis.html`, `mentions-legales.html`, `confidentialite.html`).

| Fichier | Rôle |
|---|---|
| `partials/*.html` | Fragments partagés, insérés au build par `<!-- @include fichier.html var="…" -->` : `head`, `chrome` (HUD, menu, curseur, décor), `contact`, `footer` |
| `src/core/app.js` | Socle commun : polices, scroll doux, curseur, menu, son (préférence gardée d'une page à l'autre), HUD, révélations, transitions « volets » entre pages, scène WebGL, finale « le plein » |
| `src/main.js` | Accueil : pré-générique, intro « contact moteur », 11 actes scrollés |
| `src/page.js` | Sous-pages : ouverture, frises, grand livre, calculateur de seuil, décomposition du prix, rail des dix étapes, bobine horizontale, acrostiche CADOR, séquence de citations |
| `src/webgl/stage.js` | Scène Three.js (cadrans, aiguilles à ressort, poussière d'or, bloom, aberration chromatique, grain) — chargée à la demande |
| `src/webgl/state.js` | État caméra/cadrans que le scroll anime |
| `src/ui/sound.js` | Design sonore 100 % synthétisé (Web Audio), coupé par défaut |
| `src/data/report.js` | Les quatre « Points du mois » par secteur |
| `src/styles/main.css` · `pages.css` | Direction artistique « film noir financier » |

Chaque sous-page porte `data-scene` sur `<body>` (`gold`, `adam`, `flow`, `none`) pour régler la poussière d'or,
et `data-runtime` pour la durée affichée par le timecode.

## Accessibilité

- `prefers-reduced-motion` : pas de pré-générique, pas de scroll détourné, scène figée.
- Sans WebGL : fond dégradé, tout le contenu reste en place.
- Onglets clavier (flèches, Début/Fin), lien d'évitement, focus visibles, menu fermable par Échap.

## Mode debug (dev uniquement)

`http://localhost:5173/?norafl` force l'horloge GSAP hors `requestAnimationFrame`
(utile dans un onglet masqué) et expose `window.__cador`.
