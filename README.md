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

Le mode de déploiement est contrôlé par `DEPLOYMENT_MODE` :

- `preview` (valeur par défaut) : prévisualisation GitHub Pages, `noindex` et formulaire en démo ;
- `staging` : pré-production IONOS protégée, `noindex`, formulaire SMTP actif et URL HTTPS du sous-dossier requise ;
- `production` : site public indexable, formulaire SMTP actif et URL HTTPS canonique requise.

Le build refuse désormais les combinaisons incohérentes, par exemple un formulaire SMTP actif dans un simple aperçu ou une production sans toutes les traductions anglaises.

## Publication GitHub Pages

Le workflow `.github/workflows/deploy-pages.yml` construit et publie automatiquement `dist/` à chaque push sur la branche `pre-prod`. Dans GitHub, ouvrez **Settings → Pages**, sélectionnez **GitHub Actions** comme source, puis poussez la branche `pre-prod`. La publication se consulte ensuite dans l’onglet **Actions** ; elle prend habituellement quelques minutes.

## Formulaire de contact et IONOS

Le formulaire utilise `api/contact.php` uniquement en production. L’endpoint valide les données côté serveur, limite les tentatives par IP, utilise un champ leurre anti-robots et envoie via SMTP avec une adresse du domaine du client comme expéditeur. L’adresse du visiteur n’est utilisée que dans `Reply-To`.

1. Créez une boîte e-mail IONOS dédiée à l’envoi, par exemple `contact@rusafe.fr`, puis copiez `config/smtp.config.example.php` **hors de la racine web** sous le nom `private-config/rusafe-smtp.php`. Avec l’arborescence IONOS habituelle, ce dossier est placé à côté de `web/`, jamais dedans. Utilisez `smtp.ionos.fr`, le port `465` en SSL/TLS, l’adresse complète de cette boîte comme identifiant et comme expéditeur, puis son mot de passe IONOS.
2. Le script PHP cherche automatiquement ce fichier dans le dossier frère du répertoire web IONOS, y compris lorsque le site est installé dans un sous-dossier de pré-production. Une variable PHP `RUSAFE_SMTP_CONFIG` peut aussi fournir un chemin absolu si l’arborescence IONOS diffère. Ne placez jamais d’identifiants dans `dist/` ni dans Git.
3. Pour la pré-production IONOS protégée, produisez le paquet suivant :

```bash
DEPLOYMENT_MODE=staging PUBLIC_SITE_URL=https://rusafe.fr/preprod-rusafe CONTACT_MODE=live node scripts/build-preprod.mjs
```

4. Produisez le paquet public indexable pour le domaine final, sans changer de code :

```bash
DEPLOYMENT_MODE=production PUBLIC_SITE_URL=https://rusafe.fr CONTACT_MODE=live node scripts/build-preprod.mjs
```

`PUBLIC_SITE_URL` doit être remplacée si le domaine final diffère. Les builds IONOS génèrent `api/contact.php` et un `.htaccess` avec HTTPS, cache, compression, en-têtes de sécurité et une page 404 adaptée au chemin de déploiement. Il ne contient aucun secret. Téléversez ensuite le contenu de `dist/` dans le répertoire web IONOS ; ne téléversez pas `private-config/rusafe-smtp.php` dans ce répertoire. Pour la pré-production protégée, conservez les lignes d’authentification créées par IONOS dans son `.htaccess` et ajoutez-y les règles générées, au lieu d’écraser ce fichier avec une version sans protection. Les mentions légales et la politique de confidentialité comportent les informations restant à compléter par le client avant publication.

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
