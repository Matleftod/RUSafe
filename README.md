# R’U SAFE

Maquette HTML/CSS/JavaScript du site vitrine R’U SAFE.

## Organisation actuelle

- Les pages HTML, feuilles de style et scripts à la racine restent les sources de travail.
- `assets/` contient les médias utilisés par ces sources et certains fichiers de travail.
- `assets/videos/` conserve les vidéos sources haute qualité et n’est jamais publié.
- Les fichiers `*.web.mp4` et les variantes WebP des posters, avatars et mockups sont les médias réellement servis.
- Les fichiers `waiting.html`, `*.backup.html` et `documentation-contenu-client.*` sont conservés comme documents de travail, mais exclus du paquet public.
- `dist/` est un dossier généré et ignoré par Git. Il ne doit jamais être modifié manuellement.

## Générer la pré-production

```bash
node scripts/build-preprod.mjs
```

Le script vérifie que chaque fichier attendu existe, recrée `dist/`, puis génère les routes `/fr/` et `/en/` avec leurs liens de langue, leurs balises `hreflang` et les bons chemins vers les assets. Il n’ajoute aucune dépendance au projet.

Le contenu de `dist/` servira de base au déploiement GitHub Pages lors de l’étape dédiée.

Le build par défaut est volontairement une pré-production : il désactive l’envoi réel du formulaire, applique `noindex, nofollow` et bloque les robots dans `robots.txt`. Ce comportement est explicite dans l’interface de contact ; aucune demande n’est simulée.

## Formulaire de contact et IONOS

Le formulaire utilise `api/contact.php` uniquement en production. L’endpoint valide les données côté serveur, limite les tentatives par IP, utilise un champ leurre anti-robots et envoie via SMTP avec une adresse du domaine du client comme expéditeur. L’adresse du visiteur n’est utilisée que dans `Reply-To`.

1. Copiez `config/smtp.config.example.php` dans un emplacement **hors de la racine web** IONOS et renseignez les identifiants SMTP fournis par IONOS.
2. Définissez la variable PHP `RUSAFE_SMTP_CONFIG` avec le chemin absolu de ce fichier. Si l’offre IONOS ne permet pas de variable d’environnement PHP, demandez à IONOS le chemin recommandé pour un fichier de configuration hors webroot ; ne placez pas d’identifiants dans `dist/` ni dans Git.
3. Copiez `api/contact.php` à la racine publiée, à côté du dossier `fr/` et de `en/`.
4. Produisez le paquet indexable pour le domaine final, sans changer de code :

```bash
SITE_INDEXABLE=true PUBLIC_SITE_URL=https://rusafe.fr CONTACT_MODE=live node scripts/build-preprod.mjs
```

`PUBLIC_SITE_URL` doit être remplacée si le domaine final diffère. Ce build génère les canonical, Open Graph, `sitemap.xml` et un `robots.txt` indexable. Il ne contient aucun secret. Les mentions légales et la politique de confidentialité comportent les informations restant à compléter par le client avant publication.

## Architecture FR/EN

- Les pages HTML françaises à la racine restent les sources de référence.
- Chaque page est publiée dans `dist/fr/`.
- Une traduction placée dans `locales/en/` avec le même nom est publiée dans `dist/en/`.
- En l’absence de traduction, le build génère une page anglaise temporaire, affiche un avertissement et la marque `noindex`.
- Les anciennes URL à la racine redirigent vers leur équivalent français afin de ne pas casser les liens de pré-production existants.
- La racine du site redirige vers `/fr/landing.html`.

## Régénérer les médias web

Les vidéos sources restent dans `assets/videos/` et les PNG/JPG originaux restent inchangés. Pour reconstruire toutes les variantes optimisées, avec `ffmpeg` et `cwebp` installés :

```bash
./scripts/optimize-media.sh
```

Les vidéos générées utilisent H.264/AAC en 720p avec démarrage rapide. Les posters et portraits sont redimensionnés en WebP ; les mockups sont convertis en WebP sans perte.

## Fichiers publics actuels

- Entrée : `index.html`, puis `landing.html`
- Pages : accueil, approche, expertise, solutions, partenaires, formation, références et contact
- Styles partagés : `design-system.css`, `site.css`
- Landing : `landing.css`, `script.js`
- Interactions des pages : `site.js`

La liste exhaustive des fichiers publiés est centralisée dans `scripts/build-preprod.mjs`. Tout nouvel asset ou nouvelle page devra être ajouté à ce manifeste.
